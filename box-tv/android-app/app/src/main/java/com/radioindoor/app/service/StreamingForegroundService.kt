package com.radioindoor.app.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.datasource.DefaultHttpDataSource
import androidx.media3.datasource.HttpDataSource
import androidx.media3.exoplayer.source.MediaSource
import androidx.media3.exoplayer.source.ProgressiveMediaSource
import androidx.media3.exoplayer.hls.HlsMediaSource
import androidx.media3.datasource.DefaultDataSource
import com.radioindoor.app.MainActivity
import com.radioindoor.app.R
import com.radioindoor.app.data.ConfigRepository
import com.radioindoor.app.data.model.DeviceConfig
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/**
 * StreamingForegroundService
 * 
 * Serviço em foreground que mantém o app vivo e monitora configurações.
 * O streaming real é feito pelo WebView no MainActivity.
 * Este serviço garante que o app continue rodando em background.
 */
class StreamingForegroundService : Service() {

    private var wakeLock: PowerManager.WakeLock? = null
    private var exoPlayer: ExoPlayer? = null
    private var configRepository: ConfigRepository? = null
    private var currentConfig: DeviceConfig? = null
    private var isPlaying = false
    private var retryCount = 0
    private val maxRetries = 5
    
    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private var configUpdateJob: Job? = null
    private var retryJob: Job? = null

    companion object {
        private const val TAG = "StreamingService"
        private const val CHANNEL_ID = "radio_indoor_channel"
        private const val NOTIFICATION_ID = 1
        private const val CONFIG_UPDATE_INTERVAL = 10 * 1000L // 10 segundos (atualização rápida)
        private const val RETRY_DELAY_BASE = 5000L // 5 segundos base
    }

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "Service onCreate")
        
        createNotificationChannel()
        acquireWakeLock()
        // ExoPlayer será inicializado apenas se necessário (playerType = "exoPlayer")
        configRepository = ConfigRepository(this)
        
        // Iniciar atualização periódica de configuração
        startConfigUpdateLoop()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(TAG, "Service onStartCommand")
        
        startForeground(NOTIFICATION_ID, createNotification())
        loadConfigAndStartStreaming()
        
        return START_STICKY // Reinicia automaticamente se for morto
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        Log.d(TAG, "Service onDestroy")
        releaseWakeLock()
        stopStreaming()
        exoPlayer?.release()
        exoPlayer = null
        configUpdateJob?.cancel()
        retryJob?.cancel()
        super.onDestroy()
    }

    /**
     * Cria o canal de notificação (Android O+)
     */
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Rádio Indoor",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Serviço de streaming de rádio"
                setShowBadge(false)
            }
            
            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
        }
    }

    /**
     * Cria a notificação para foreground service
     */
    private fun createNotification(): Notification {
        val intent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Rádio Indoor")
            .setContentText("Transmitindo...")
            .setSmallIcon(R.drawable.ic_notification)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build()
    }

    /**
     * Adquire WakeLock para manter o serviço ativo
     */
    private fun acquireWakeLock() {
        val powerManager = getSystemService(POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK,
            "RadioIndoor::WakeLock"
        ).apply {
            acquire(10 * 60 * 60 * 1000L) // 10 horas
        }
    }

    /**
     * Libera WakeLock
     */
    private fun releaseWakeLock() {
        wakeLock?.let {
            if (it.isHeld) {
                it.release()
            }
        }
        wakeLock = null
    }

    /**
     * Inicializa ExoPlayer
     */
    private fun initializeExoPlayer() {
        exoPlayer = ExoPlayer.Builder(this).build().apply {
            // Configurar para áudio apenas
            volume = 1.0f
            
            // Listener para eventos do player
            addListener(object : Player.Listener {
                override fun onPlayerError(error: androidx.media3.common.PlaybackException) {
                    val errorMessage = error.message ?: "Unknown error"
                    val cause = error.cause?.message ?: ""
                    Log.e(TAG, "❌ Player error: $errorMessage")
                    Log.e(TAG, "❌ Cause: $cause")
                    
                    // Se for erro de formato não reconhecido, o WebView já está tocando
                    // Então apenas logar o erro mas não fazer retry (WebView é o método principal)
                    if (errorMessage.contains("UnrecognizedInputFormatException", ignoreCase = true) ||
                        errorMessage.contains("could read the stream", ignoreCase = true)) {
                        Log.d(TAG, "⚠️ ExoPlayer não conseguiu tocar, mas o WebView deve estar tocando")
                        // Não fazer retry - o WebView é o método principal agora
                        return
                    }
                    
                    this@StreamingForegroundService.handleStreamingError()
                }

                override fun onPlaybackStateChanged(playbackState: Int) {
                    when (playbackState) {
                        Player.STATE_READY -> {
                            Log.d(TAG, "Player ready")
                            this@StreamingForegroundService.isPlaying = true
                            this@StreamingForegroundService.retryCount = 0
                        }
                        Player.STATE_ENDED -> {
                            Log.d(TAG, "Player ended")
                            this@StreamingForegroundService.handleStreamingError()
                        }
                        Player.STATE_IDLE -> {
                            Log.d(TAG, "Player idle")
                        }
                    }
                }
            })
        }
    }

    /**
     * Cria HttpDataSourceFactory com headers customizados
     */
    private fun createHttpDataSourceFactory(): HttpDataSource.Factory {
        // User-Agent que simula um navegador Chrome real para evitar bloqueios
        val userAgent = "Mozilla/5.0 (Linux; Android ${android.os.Build.VERSION.RELEASE}; ${android.os.Build.MODEL}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
        
        val headers = mutableMapOf<String, String>().apply {
            put("User-Agent", userAgent)
            put("Accept", "*/*")
            put("Accept-Language", "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7")
            put("Accept-Encoding", "identity")
            put("Connection", "keep-alive")
            put("Cache-Control", "no-cache")
            put("Pragma", "no-cache")
            put("Icy-MetaData", "1")
            put("Range", "bytes=0-")
            // Headers adicionais que podem ajudar
            put("Sec-Fetch-Dest", "audio")
            put("Sec-Fetch-Mode", "no-cors")
            put("Sec-Fetch-Site", "cross-site")
        }
        
        Log.d(TAG, "Headers configurados: $headers")
        
        return DefaultHttpDataSource.Factory()
            .setUserAgent(userAgent)
            .setConnectTimeoutMs(30000)
            .setReadTimeoutMs(30000)
            .setAllowCrossProtocolRedirects(true)
            .setDefaultRequestProperties(headers)
    }

    /**
     * Carrega configuração e inicia streaming
     */
    private fun loadConfigAndStartStreaming() {
        serviceScope.launch {
            try {
                currentConfig = configRepository?.getConfig()
                
                if (currentConfig?.status == "active" && !currentConfig?.streamingUrl.isNullOrEmpty()) {
                    val url = currentConfig!!.streamingUrl!!
                    val playerType = currentConfig!!.playerType ?: "webView"
                    
                    Log.d(TAG, "🎯 URL recebida da configuração: $url")
                    Log.d(TAG, "🎵 Player escolhido: $playerType")
                    
                    // IMPORTANTE: ExoPlayer NUNCA deve tocar quando playerType é "webView"
                    // Garantir que ExoPlayer está parado e liberado se for WebView
                    if (playerType != "exoPlayer") {
                        Log.d(TAG, "🌐 Usando WebView - Garantindo que ExoPlayer está DESABILITADO")
                        // Parar e liberar ExoPlayer se estiver rodando
                        exoPlayer?.let {
                            try {
                                it.stop()
                                it.release()
                                Log.d(TAG, "✅ ExoPlayer parado e liberado")
                            } catch (e: Exception) {
                                Log.w(TAG, "⚠️ Erro ao parar ExoPlayer: ${e.message}")
                            }
                        }
                        exoPlayer = null
                        isPlaying = false
                        // WebView no MainActivity gerencia o streaming
                        return@launch
                    }
                    
                    // Iniciar ExoPlayer APENAS se playerType for explicitamente "exoPlayer"
                    if (playerType == "exoPlayer") {
                        Log.d(TAG, "▶️ Iniciando ExoPlayer")
                        if (exoPlayer == null) {
                            initializeExoPlayer()
                        }
                        startStreaming(url)
                        setVolume(currentConfig!!.volume)
                    }
                } else {
                    Log.w(TAG, "Configuração inativa ou URL vazia")
                    // Tentar novamente após delay
                    delay(30000) // 30 segundos
                    loadConfigAndStartStreaming()
                }
            } catch (e: Exception) {
                Log.e(TAG, "Erro ao carregar configuração: ${e.message}")
                handleStreamingError()
            }
        }
    }

    /**
     * REMOVIDO: detectAndExtractStreamUrl
     * Não é mais necessário - WebView toca diretamente da página
     */

    /**
     * REMOVIDO: extractStreamUrlFromPage
     * Não é mais necessário - WebView toca diretamente da página
     */

    /**
     * REMOVIDO: extractUrlFromHtml
     * Não é mais necessário - WebView toca diretamente da página
     */

    /**
     * Inicia o streaming de áudio com ExoPlayer
     * Chamado apenas quando playerType = "exoPlayer"
     */
    private fun startStreaming(url: String) {
        Log.d(TAG, "▶️ [START] Iniciando streaming com ExoPlayer: $url")
        exoPlayer?.let { player ->
            try {
                // Criar DataSourceFactory com headers customizados
                val httpDataSourceFactory = createHttpDataSourceFactory()
                val dataSourceFactory = DefaultDataSource.Factory(this, httpDataSourceFactory)
                
                // Detectar tipo de stream e criar MediaSource apropriado
                val mediaItem = MediaItem.fromUri(url)
                val mediaSource = createMediaSource(url, dataSourceFactory, mediaItem)
                
                player.setMediaSource(mediaSource)
                player.prepare()
                player.play()
                Log.d(TAG, "✅ ExoPlayer iniciado com sucesso")
            } catch (e: Exception) {
                Log.e(TAG, "❌ Erro ao iniciar ExoPlayer: ${e.message}")
                handleStreamingError()
            }
        } ?: run {
            Log.e(TAG, "❌ ExoPlayer não inicializado")
        }
    }

    /**
     * REMOVIDO: extractStreamUrlFromPage e extractUrlFromHtml
     * Não são mais necessárias - WebView toca diretamente da página
     */

    /**
     * Cria MediaSource apropriado baseado no tipo de stream
     * Tenta detectar automaticamente o formato
     */
    private fun createMediaSource(
        url: String,
        dataSourceFactory: DefaultDataSource.Factory,
        mediaItem: MediaItem
    ): MediaSource {
        // Verificar se é HLS explícito - APENAS usar HLS se realmente for um arquivo M3U8
        if (url.contains(".m3u8", ignoreCase = true) || url.contains("/hls/", ignoreCase = true)) {
            Log.d(TAG, "🎵 Detectado HLS explícito (.m3u8 ou /hls/)")
            return HlsMediaSource.Factory(dataSourceFactory)
                .setAllowChunklessPreparation(true)
                .createMediaSource(mediaItem)
        }
        
        // Para TODOS os outros casos, usar ProgressiveMediaSource
        // O ExoPlayer consegue detectar automaticamente o formato (MP3, AAC, OGG, etc.)
        Log.d(TAG, "🎵 Usando ProgressiveMediaSource (detecção automática de formato)")
        return ProgressiveMediaSource.Factory(dataSourceFactory)
            .createMediaSource(mediaItem)
    }

    /**
     * Para o streaming
     */
    private fun stopStreaming() {
        Log.d(TAG, "⏹️ Parando streaming")
        exoPlayer?.let { player ->
            try {
                player.stop()
                player.clearMediaItems()
                Log.d(TAG, "✅ ExoPlayer parado")
            } catch (e: Exception) {
                Log.e(TAG, "Erro ao parar ExoPlayer: ${e.message}")
            }
        }
    }

    /**
     * Define o volume
     */
    private fun setVolume(volume: Int) {
        exoPlayer?.volume = (volume / 100.0f).coerceIn(0f, 1f)
    }

    /**
     * Trata erros de streaming com retry exponencial
     */
    private fun handleStreamingError() {
        if (retryCount >= maxRetries) {
            Log.e(TAG, "Máximo de tentativas atingido")
            retryCount = 0
            // Aguardar mais tempo antes de tentar novamente
            serviceScope.launch {
                delay(60000) // 1 minuto
                loadConfigAndStartStreaming()
            }
            return
        }

        retryCount++
        val delay = RETRY_DELAY_BASE * (1 shl retryCount) // Exponencial: 5s, 10s, 20s, 40s, 80s
        
        Log.d(TAG, "Tentando reconectar em ${delay}ms (tentativa $retryCount/$maxRetries)")
        
        retryJob?.cancel()
        retryJob = serviceScope.launch {
            delay(delay)
            currentConfig?.let { config ->
                val playerType = config.playerType ?: "webView"
                if (config.status == "active" && !config.streamingUrl.isNullOrEmpty() && playerType == "exoPlayer") {
                    // Apenas tentar retry se estiver usando ExoPlayer
                    startStreaming(config.streamingUrl!!)
                } else {
                    loadConfigAndStartStreaming()
                }
            } ?: loadConfigAndStartStreaming()
        }
    }

    /**
     * Loop de atualização de configuração a cada 5 minutos
     */
    private fun startConfigUpdateLoop() {
        configUpdateJob?.cancel()
        configUpdateJob = serviceScope.launch {
            while (true) {
                delay(CONFIG_UPDATE_INTERVAL)
                updateConfig()
            }
        }
    }

    /**
     * Atualiza configuração remotamente
     */
    private fun updateConfig() {
        serviceScope.launch {
            try {
                val newConfig = configRepository?.fetchConfigFromApi()
                newConfig?.let { config ->
                    val playerType = config.playerType ?: "webView"
                    val oldPlayerType = currentConfig?.playerType ?: "webView"
                    
                    // IMPORTANTE: Se playerType não for "exoPlayer", garantir que ExoPlayer está DESABILITADO
                    if (playerType != "exoPlayer") {
                        // Parar e liberar ExoPlayer completamente
                        exoPlayer?.let {
                            try {
                                it.stop()
                                it.release()
                                Log.d(TAG, "🛑 [UPDATE] ExoPlayer parado e liberado (usando WebView)")
                            } catch (e: Exception) {
                                Log.w(TAG, "⚠️ Erro ao parar ExoPlayer: ${e.message}")
                            }
                        }
                        exoPlayer = null
                        isPlaying = false
                        
                        // WebView gerencia tudo - apenas atualizar volume se necessário
                        if (config.volume != currentConfig?.volume) {
                            Log.d(TAG, "🔊 [UPDATE] Volume mudou: ${currentConfig?.volume}% → ${config.volume}%")
                            // Volume será controlado pelo WebView via JavaScript
                        }
                        
                        currentConfig = config
                        Log.d(TAG, "✅ [UPDATE] Configuração sincronizada (WebView)")
                        return@launch
                    }
                    
                    // A partir daqui, apenas código para ExoPlayer (playerType == "exoPlayer")
                    
                    // Se o player mudou, reiniciar o player apropriado
                    if (playerType != oldPlayerType) {
                        Log.d(TAG, "🔄 [UPDATE] Player mudou: $oldPlayerType → $playerType")
                        stopStreaming()
                        if (playerType == "exoPlayer") {
                            if (exoPlayer == null) {
                                initializeExoPlayer()
                            }
                        }
                    }
                    
                    // Se a URL mudou, reiniciar streaming (apenas se for ExoPlayer)
                    if (config.streamingUrl != currentConfig?.streamingUrl && !config.streamingUrl.isNullOrEmpty()) {
                        Log.d(TAG, "🔄 [UPDATE] URL mudou: ${config.streamingUrl}")
                        stopStreaming()
                        startStreaming(config.streamingUrl!!)
                    }
                    
                    // Atualizar volume se mudou IMEDIATAMENTE
                    if (config.volume != currentConfig?.volume) {
                        Log.d(TAG, "🔊 [UPDATE] Volume mudou: ${currentConfig?.volume}% → ${config.volume}%")
                        setVolume(config.volume)
                    }
                    
                    // Status - controlar ExoPlayer
                    if (config.status == "inactive" && isPlaying) {
                        Log.d(TAG, "⏸️ [UPDATE] Status mudou para inativo, pausando ExoPlayer")
                        exoPlayer?.pause()
                        isPlaying = false
                    } else if (config.status == "active" && !isPlaying && !config.streamingUrl.isNullOrEmpty()) {
                        Log.d(TAG, "▶️ [UPDATE] Status mudou para ativo, retomando ExoPlayer")
                        startStreaming(config.streamingUrl!!)
                    }
                    
                    currentConfig = config
                    Log.d(TAG, "✅ [UPDATE] Configuração sincronizada com sucesso")
                }
            } catch (e: Exception) {
                Log.e(TAG, "Erro ao atualizar configuração: ${e.message}")
            }
        }
    }
}
