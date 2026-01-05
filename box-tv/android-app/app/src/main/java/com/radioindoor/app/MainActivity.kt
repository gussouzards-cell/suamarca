package com.radioindoor.app

import android.app.ActivityManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.view.KeyEvent
import android.view.View
import android.view.WindowManager
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import android.net.wifi.WifiManager
import android.os.Handler
import android.os.Looper
import android.widget.TextView
import android.webkit.WebView
import android.webkit.WebSettings
import android.webkit.WebViewClient
import android.webkit.WebChromeClient
import android.webkit.JavascriptInterface
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import java.net.NetworkInterface
import com.radioindoor.app.data.ConfigRepository
import com.radioindoor.app.service.StreamingForegroundService
import com.radioindoor.app.service.RemoteCommandService
import com.radioindoor.app.utils.DeviceManager
import com.radioindoor.app.utils.NtpTimeSyncManager
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/**
 * MainActivity - Kiosk Mode
 * 
 * Esta Activity atua como launcher padrão e inicia o modo Kiosk.
 * Não possui UI visível (tela preta) ou pode exibir apenas um logo.
 */
class MainActivity : AppCompatActivity() {

    private lateinit var ntpTimeSyncManager: NtpTimeSyncManager
    private lateinit var configRepository: ConfigRepository
    private val updateHandler = Handler(Looper.getMainLooper())
    private var updateRunnable: Runnable? = null

    // Views
    private lateinit var deviceUuidText: TextView
    private lateinit var deviceNameText: TextView
    private lateinit var deviceModelText: TextView
    private lateinit var deviceMacText: TextView
    private lateinit var playerStatusText: TextView
    private lateinit var streamingUrlText: TextView
    private lateinit var volumeText: TextView
    private lateinit var webViewPlayer: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        try {
            android.util.Log.d("MainActivity", "🚀 onCreate iniciado")
            
            // Configurar UI
            setupKioskUI()
            android.util.Log.d("MainActivity", "✅ UI configurada")
            
            // Inicializar views
            initializeViews()
            android.util.Log.d("MainActivity", "✅ Views inicializadas")
            
            // Inicializar repositório
            configRepository = ConfigRepository(this)
            android.util.Log.d("MainActivity", "✅ ConfigRepository inicializado")
            
            // Carregar dados do dispositivo
            loadDeviceInfo()
            android.util.Log.d("MainActivity", "✅ Dados do dispositivo carregados")
            
            // Sincronizar horário via NTP (em coroutine) - não bloquear se falhar
            try {
                ntpTimeSyncManager = NtpTimeSyncManager(this)
                lifecycleScope.launch {
                    try {
                        ntpTimeSyncManager.syncTime()
                    } catch (e: Exception) {
                        android.util.Log.w("MainActivity", "⚠️ Erro ao sincronizar NTP (não crítico): ${e.message}")
                    }
                }
            } catch (e: Exception) {
                android.util.Log.w("MainActivity", "⚠️ Erro ao inicializar NTP (não crítico): ${e.message}")
            }
            
            // Ativar Lock Task Mode (Kiosk Mode) - não bloquear se falhar
            try {
                startLockTask()
                android.util.Log.d("MainActivity", "✅ Lock Task Mode ativado")
            } catch (e: Exception) {
                android.util.Log.w("MainActivity", "⚠️ Erro ao ativar Lock Task Mode (não crítico): ${e.message}")
            }
            
            // Iniciar serviço de streaming - não bloquear se falhar
            try {
                startStreamingService()
                android.util.Log.d("MainActivity", "✅ StreamingService iniciado")
            } catch (e: Exception) {
                android.util.Log.e("MainActivity", "❌ Erro ao iniciar StreamingService: ${e.message}", e)
            }
            
            // Iniciar serviço de comandos remotos - não bloquear se falhar
            try {
                startRemoteCommandService()
            } catch (e: Exception) {
                android.util.Log.e("MainActivity", "❌ Erro ao iniciar RemoteCommandService: ${e.message}", e)
            }
            
            // Iniciar atualização periódica da UI
            try {
                startStatusUpdate()
                android.util.Log.d("MainActivity", "✅ Status update iniciado")
            } catch (e: Exception) {
                android.util.Log.e("MainActivity", "❌ Erro ao iniciar status update: ${e.message}", e)
            }
            
            // Garantir que este app seja o launcher padrão - não crítico
            try {
                ensureDefaultLauncher()
            } catch (e: Exception) {
                android.util.Log.w("MainActivity", "⚠️ Erro ao garantir launcher padrão (não crítico): ${e.message}")
            }
            
            android.util.Log.d("MainActivity", "✅ onCreate concluído com sucesso")
        } catch (e: Exception) {
            android.util.Log.e("MainActivity", "❌ ERRO CRÍTICO no onCreate: ${e.message}", e)
            e.printStackTrace()
            // Não deixar o app crashar - mostrar erro na tela se possível
            try {
                // Tentar mostrar erro básico
                setContentView(android.R.layout.simple_list_item_1)
                val textView = findViewById<android.widget.TextView>(android.R.id.text1)
                textView?.text = "Erro ao iniciar app. Verifique os logs."
            } catch (ex: Exception) {
                android.util.Log.e("MainActivity", "❌ Erro ao mostrar mensagem de erro: ${ex.message}")
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        updateRunnable?.let { updateHandler.removeCallbacks(it) }
        
        // Limpar WebView para evitar vazamentos de memória
        webViewPlayer.destroy()
    }
    
    override fun onPause() {
        super.onPause()
        // NÃO pausar o WebView para manter o áudio tocando
        // webViewPlayer.onPause() // Comentado para manter áudio tocando
    }
    
    override fun onResume() {
        super.onResume()
        webViewPlayer.onResume()
        // Reativar Lock Task sempre que a activity voltar ao foco
        if (!isInLockTaskMode()) {
            startLockTask()
        }
        
        // Verificar se o áudio está tocando e reiniciar se necessário
        checkAndRestartAudio()
    }


    override fun onBackPressed() {
        // Bloquear botão BACK em Kiosk Mode
        // Não fazer nada
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        // Bloquear HOME, BACK e APP_SWITCH
        when (keyCode) {
            KeyEvent.KEYCODE_HOME,
            KeyEvent.KEYCODE_BACK,
            KeyEvent.KEYCODE_APP_SWITCH -> {
                return true // Bloquear
            }
        }
        return super.onKeyDown(keyCode, event)
    }

    /**
     * Configura a UI para Kiosk Mode
     */
    private fun setupKioskUI() {
        try {
            // Esconder barra de status e navegação
            WindowCompat.setDecorFitsSystemWindows(window, false)
            val insetsController = WindowCompat.getInsetsController(window, window.decorView)
            insetsController?.apply {
                hide(WindowInsetsCompat.Type.statusBars())
                hide(WindowInsetsCompat.Type.navigationBars())
                systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            }

            // Manter tela ligada
            window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
            
            // Carregar layout
            setContentView(R.layout.activity_main)
            android.util.Log.d("MainActivity", "✅ Layout carregado")
        } catch (e: Exception) {
            android.util.Log.e("MainActivity", "❌ Erro ao configurar UI: ${e.message}", e)
            throw e // Este é crítico - sem layout o app não funciona
        }
    }

    /**
     * Inicializa as views
     */
    private fun initializeViews() {
        try {
            deviceUuidText = findViewById(R.id.deviceUuidText)
            deviceNameText = findViewById(R.id.deviceNameText)
            deviceModelText = findViewById(R.id.deviceModelText)
            deviceMacText = findViewById(R.id.deviceMacText)
            playerStatusText = findViewById(R.id.playerStatusText)
            streamingUrlText = findViewById(R.id.streamingUrlText)
            volumeText = findViewById(R.id.volumeText)
            webViewPlayer = findViewById(R.id.webViewPlayer)
            
            // Configurar WebView
            setupWebView()
            
            // Iniciar monitoramento do áudio
            startAudioMonitoring()
        } catch (e: Exception) {
            android.util.Log.e("MainActivity", "❌ Erro ao inicializar views: ${e.message}", e)
            throw e // Este é crítico - se as views não inicializarem, o app não funciona
        }
    }
    
    /**
     * Configura o WebView para exibir o player
     */
    private fun setupWebView() {
        try {
            webViewPlayer.settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                mediaPlaybackRequiresUserGesture = false // Permitir play automático
                allowFileAccess = true
                allowContentAccess = true
                setSupportZoom(false)
                builtInZoomControls = false
                displayZoomControls = false
                loadWithOverviewMode = true
                useWideViewPort = true
                // Manter áudio tocando mesmo quando a página não está visível
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                }
            }
        } catch (e: Exception) {
            android.util.Log.e("MainActivity", "❌ Erro ao configurar WebView: ${e.message}", e)
            throw e // Este é crítico
        }
        
        // WebViewClient para controlar navegação
        webViewPlayer.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                android.util.Log.d("MainActivity", "📄 Página carregada: $url")
                
                // Tentar clicar no play automaticamente após a página carregar
                // Apenas UMA tentativa para evitar duplicação
                lifecycleScope.launch {
                    delay(2000) // Aguardar 2 segundos para a página carregar completamente
                    executePlayScript()
                }
            }
        }
        
        // Adicionar listener para eventos de áudio
        webViewPlayer.addJavascriptInterface(object {
            @JavascriptInterface
            fun onAudioPlaying() {
                android.util.Log.d("MainActivity", "✅ Áudio começou a tocar")
            }
            
            @JavascriptInterface
            fun onAudioPaused() {
                android.util.Log.w("MainActivity", "⚠️ Áudio pausado, tentando reiniciar...")
                retryPlay()
            }
        }, "AndroidAudioListener")
        
        // WebChromeClient para logs do console
        webViewPlayer.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(consoleMessage: android.webkit.ConsoleMessage?): Boolean {
                android.util.Log.d("MainActivity", "🌐 Console: ${consoleMessage?.message()}")
                return true
            }
        }
    }

    /**
     * Carrega informações do dispositivo
     */
    private fun loadDeviceInfo() {
        val uuid = DeviceManager.getDeviceUuid(this)
        val model = android.os.Build.MODEL
        val manufacturer = android.os.Build.MANUFACTURER
        val macAddress = getMacAddress()

        deviceUuidText.text = "UUID: $uuid"
        deviceModelText.text = "Modelo: $manufacturer $model"
        deviceMacText.text = "MAC Address: $macAddress"
        deviceNameText.text = "Nome: -" // Será atualizado quando buscar da API
    }

    /**
     * Obtém endereço MAC do dispositivo
     */
    private fun getMacAddress(): String {
        return try {
            // Tentar obter via WifiManager (método mais confiável)
            val wifiManager = applicationContext.getSystemService(Context.WIFI_SERVICE) as? WifiManager
            val wifiInfo = wifiManager?.connectionInfo
            val mac = wifiInfo?.macAddress
            
            if (!mac.isNullOrEmpty() && mac != "02:00:00:00:00:00") {
                mac
            } else {
                // Fallback: obter de NetworkInterface
                getMacAddressFromNetworkInterface()
            }
        } catch (e: Exception) {
            // Fallback: obter de NetworkInterface
            getMacAddressFromNetworkInterface()
        }
    }

    /**
     * Obtém MAC Address via NetworkInterface (fallback)
     */
    private fun getMacAddressFromNetworkInterface(): String {
        return try {
            val interfaces = NetworkInterface.getNetworkInterfaces()
            while (interfaces.hasMoreElements()) {
                val networkInterface = interfaces.nextElement()
                val mac = networkInterface.hardwareAddress
                if (mac != null && mac.isNotEmpty()) {
                    val macString = mac.joinToString(":") { String.format("%02X", it) }
                    if (macString != "02:00:00:00:00:00") {
                        return macString
                    }
                }
            }
            "Não disponível"
        } catch (e: Exception) {
            "Não disponível"
        }
    }

    /**
     * Obtém endereço IP do dispositivo
     */
    private fun getIpAddress(): String {
        return try {
            val interfaces = NetworkInterface.getNetworkInterfaces()
            while (interfaces.hasMoreElements()) {
                val networkInterface = interfaces.nextElement()
                val addresses = networkInterface.inetAddresses
                while (addresses.hasMoreElements()) {
                    val address = addresses.nextElement()
                    if (!address.isLoopbackAddress && address is java.net.Inet4Address) {
                        return address.hostAddress ?: "Não disponível"
                    }
                }
            }
            "Não disponível"
        } catch (e: Exception) {
            "Não disponível"
        }
    }

    /**
     * Inicia atualização periódica do status
     */
    private fun startStatusUpdate() {
        updateRunnable = object : Runnable {
            override fun run() {
                updateStatus()
                updateHandler.postDelayed(this, 3000) // Atualizar a cada 3 segundos (mais rápido)
            }
        }
        updateHandler.post(updateRunnable!!)
    }

    /**
     * Atualiza status do player e configuração
     */
    private fun updateStatus() {
        lifecycleScope.launch {
            try {
                val uuid = DeviceManager.getDeviceUuid(this@MainActivity)
                val apiClient = com.radioindoor.app.data.api.ApiClient.create()
                
                // Buscar informações completas do dispositivo (nome, IP, MAC)
                try {
                    val deviceInfoResponse = apiClient.getDeviceInfo(uuid)
                    if (deviceInfoResponse.isSuccessful && deviceInfoResponse.body() != null) {
                        val deviceInfo = deviceInfoResponse.body()!!
                        
                        // Atualizar nome se mudou
                        val newNome = deviceInfo.nome ?: "-"
                        val expectedText = "Nome: $newNome"
                        val currentText = deviceNameText.text.toString()
                        if (currentText != expectedText) {
                            deviceNameText.text = expectedText
                            android.util.Log.d("MainActivity", "📝 Nome atualizado na tela: '$currentText' → '$expectedText'")
                        }
                        
                        // Atualizar IP se mudou
                        deviceInfo.ip_address?.let { ip ->
                            val currentIp = getIpAddress()
                            if (currentIp != ip) {
                                android.util.Log.d("MainActivity", "🌐 IP atualizado no servidor: $ip (local: $currentIp)")
                            }
                        }
                        
                        // Atualizar MAC se mudou
                        deviceInfo.mac_address?.let { mac ->
                            val currentMac = getMacAddress()
                            if (currentMac != mac && mac != "Não disponível") {
                                android.util.Log.d("MainActivity", "📡 MAC atualizado no servidor: $mac (local: $currentMac)")
                            }
                        }
                    }
                } catch (e: Exception) {
                    android.util.Log.w("MainActivity", "Erro ao buscar informações do dispositivo: ${e.message}")
                }
                
                // Buscar configuração
                val config = configRepository.getCachedConfig() ?: configRepository.getConfig()
                
                // Atualizar UI com configuração
                config?.let {
                    if (it.status == "active") {
                        playerStatusText.text = "Status: 🟢 TOCANDO (${it.playerType})"
                        playerStatusText.setTextColor(0xFF4CAF50.toInt())
                    } else {
                        playerStatusText.text = "Status: 🔴 PAUSADO (${it.playerType})"
                        playerStatusText.setTextColor(0xFFFF5722.toInt())
                    }
                    
                    streamingUrlText.text = "URL: ${it.streamingUrl ?: "Não configurado"}"
                    volumeText.text = "Volume: ${it.volume}%"
                    
                    // Carregar URL no WebView apenas se playerType for "webView"
                    val playerType = it.playerType ?: "webView"
                    if (playerType == "webView") {
                        // Mostrar WebView e carregar URL
                        webViewPlayer.visibility = View.VISIBLE
                        it.streamingUrl?.let { url ->
                            // IMPORTANTE: Só carregar se a URL mudou E status está ativo
                            // Isso evita recarregar a página e tocar múltiplas vezes
                            val currentUrl = webViewPlayer.url
                            if (currentUrl != url && url.isNotEmpty() && it.status == "active") {
                                android.util.Log.d("MainActivity", "🌐 Carregando URL no WebView: $url")
                                // Parar qualquer áudio anterior antes de carregar nova URL
                                webViewPlayer.stopLoading()
                                webViewPlayer.loadUrl(url)
                            } else if (currentUrl == url && it.status == "active") {
                                // URL já está carregada - apenas garantir que está tocando
                                android.util.Log.d("MainActivity", "✅ URL já está carregada: $url")
                            }
                        }
                    } else {
                        // Se for exoPlayer, esconder WebView e deixar o serviço tocar
                        android.util.Log.d("MainActivity", "🎵 Usando ExoPlayer - WebView desabilitado")
                        webViewPlayer.visibility = View.GONE
                        // Parar qualquer áudio do WebView
                        webViewPlayer.stopLoading()
                        // Limpar a URL do WebView para garantir que não toca
                        webViewPlayer.loadUrl("about:blank")
                    }
                } ?: run {
                    playerStatusText.text = "Status: ⚠️ Aguardando configuração"
                    playerStatusText.setTextColor(0xFFFFC107.toInt())
                }

                // Verificar se serviço está rodando
                val isServiceRunning = isServiceRunning(StreamingForegroundService::class.java)
                if (!isServiceRunning && config?.status == "active") {
                    playerStatusText.text = "Status: ⚠️ Serviço não está rodando"
                    playerStatusText.setTextColor(0xFFFFC107.toInt())
                }
            } catch (e: Exception) {
                playerStatusText.text = "Status: ❌ Erro ao atualizar"
                playerStatusText.setTextColor(0xFFFF5722.toInt())
            }
        }
    }

    /**
     * Verifica se um serviço está rodando
     */
    private fun isServiceRunning(serviceClass: Class<*>): Boolean {
        val activityManager = getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val services = activityManager.getRunningServices(Integer.MAX_VALUE)
        return services.any { it.service.className == serviceClass.name }
    }

    /**
     * Verifica se está em Lock Task Mode
     */
    private fun isInLockTaskMode(): Boolean {
        val activityManager = getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            activityManager.isInLockTaskMode
        } else {
            false
        }
    }

    /**
     * Garante que este app seja o launcher padrão
     */
    private fun ensureDefaultLauncher() {
        val intent = Intent(Intent.ACTION_MAIN).apply {
            addCategory(Intent.CATEGORY_HOME)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        
        val resolveInfo = packageManager.resolveActivity(intent, 0)
        val currentHome = resolveInfo?.activityInfo?.packageName
        
        if (currentHome != null && currentHome != packageName) {
            // Se não for o launcher padrão, tentar definir
            // Nota: Isso requer permissões especiais ou configuração manual
        }
    }

    /**
     * Inicia o serviço de streaming
     */
    private fun startStreamingService() {
        val serviceIntent = Intent(this, StreamingForegroundService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent)
        } else {
            startService(serviceIntent)
        }
    }
    
    /**
     * Inicia o serviço de comandos remotos
     */
    private fun startRemoteCommandService() {
        try {
            val serviceIntent = Intent(this, RemoteCommandService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(serviceIntent)
                android.util.Log.d("MainActivity", "✅ RemoteCommandService iniciado como foreground service")
            } else {
                startService(serviceIntent)
                android.util.Log.d("MainActivity", "✅ RemoteCommandService iniciado")
            }
        } catch (e: Exception) {
            android.util.Log.e("MainActivity", "❌ Erro ao iniciar RemoteCommandService: ${e.message}", e)
        }
    }
    
    /**
     * Inicia monitoramento do áudio no WebView
     * DESABILITADO para evitar duplicação - o WebView gerencia o áudio automaticamente
     */
    private fun startAudioMonitoring() {
        // Monitoramento desabilitado para evitar múltiplas tentativas de play
        // O WebView já gerencia o áudio automaticamente quando a página carrega
        android.util.Log.d("MainActivity", "ℹ️ Monitoramento de áudio desabilitado (WebView gerencia automaticamente)")
    }
    
    /**
     * Verifica se o áudio está tocando e reinicia se necessário
     */
    private fun checkAndRestartAudio() {
        lifecycleScope.launch {
            try {
                // Verificar se há um elemento de áudio na página
                val checkScript = """
                    (function() {
                        var audio = document.querySelector('audio, video');
                        if (audio) {
                            // Verificar se está pausado
                            if (audio.paused) {
                                console.log('⚠️ Áudio pausado, tentando reiniciar...');
                                audio.play().catch(function(e) {
                                    console.log('❌ Erro ao reiniciar áudio: ' + e.message);
                                });
                                return 'paused';
                            } else {
                                return 'playing';
                            }
                        }
                        return 'no-audio';
                    })();
                """.trimIndent()
                
                webViewPlayer.evaluateJavascript(checkScript) { result ->
                    if (result == "\"paused\"") {
                        android.util.Log.w("MainActivity", "⚠️ Áudio pausado detectado, tentando reiniciar...")
                        // Tentar clicar no play novamente
                        retryPlay()
                    } else if (result == "\"playing\"") {
                        android.util.Log.d("MainActivity", "✅ Áudio tocando normalmente")
                    }
                }
            } catch (e: Exception) {
                android.util.Log.e("MainActivity", "❌ Erro ao verificar áudio: ${e.message}")
            }
        }
    }
    
    /**
     * Executa o script de play
     * IMPORTANTE: Verifica se o áudio já está tocando antes de tentar tocar novamente
     */
    private fun executePlayScript() {
        try {
            // Primeiro verificar se já está tocando
            val checkScript = """
                (function() {
                    var audio = document.querySelector('audio, video');
                    if (audio && !audio.paused) {
                        return 'already-playing';
                    }
                    return 'not-playing';
                })();
            """.trimIndent()
            
            webViewPlayer.evaluateJavascript(checkScript) { result ->
                if (result == "\"already-playing\"") {
                    android.util.Log.d("MainActivity", "✅ Áudio já está tocando - não executar play novamente")
                    return@evaluateJavascript
                }
                
                // Só executar play se não estiver tocando
                val playScript = """
                    (function() {
                        // Verificar novamente se já está tocando (race condition)
                        var audio = document.querySelector('audio, video');
                        if (audio && !audio.paused) {
                            console.log('✅ Áudio já está tocando');
                            return 'already-playing';
                        }
                        
                        // Procurar por botão de play (múltiplos seletores)
                        var playButton = document.querySelector('#play-pause, .play-pause, .play, [class*="play"], button[class*="play"], [id*="play"], [id*="Play"]');
                        if (playButton) {
                            console.log('🎵 Botão de play encontrado, clicando...');
                            playButton.click();
                            return 'button-clicked';
                        }
                        
                        // Procurar por elemento com onclick que contenha play
                        var playElements = document.querySelectorAll('[onclick*="play"], [onclick*="Play"]');
                        if (playElements.length > 0) {
                            console.log('🎵 Elemento com onclick encontrado, clicando...');
                            playElements[0].click();
                            return 'onclick-clicked';
                        }
                        
                        // Procurar por audio/video element e chamar play()
                        if (audio) {
                            console.log('🎵 Elemento audio/video encontrado, iniciando play...');
                            audio.play().then(function() {
                                if (window.AndroidAudioListener) {
                                    window.AndroidAudioListener.onAudioPlaying();
                                }
                            }).catch(function(e) {
                                console.log('❌ Erro ao tocar áudio: ' + e.message);
                            });
                            
                            // Adicionar listener para detectar quando pausar
                            audio.addEventListener('pause', function() {
                                if (window.AndroidAudioListener) {
                                    window.AndroidAudioListener.onAudioPaused();
                                }
                            });
                            
                            return 'audio-played';
                        }
                        
                        // Procurar por função play() global
                        if (typeof window.play === 'function') {
                            console.log('🎵 Função play() encontrada, chamando...');
                            window.play();
                            return 'function-called';
                        }
                        
                        console.log('⚠️ Nenhum método de play encontrado');
                        return 'no-method';
                    })();
                """.trimIndent()
                
                webViewPlayer.evaluateJavascript(playScript) { playResult ->
                    android.util.Log.d("MainActivity", "🎵 Resultado do script de play: $playResult")
                }
            }
        } catch (e: Exception) {
            android.util.Log.e("MainActivity", "❌ Erro ao executar script de play: ${e.message}")
        }
    }
    
    /**
     * Tenta reiniciar o play
     */
    private fun retryPlay() {
        lifecycleScope.launch {
            delay(1000) // Aguardar 1 segundo
            executePlayScript()
        }
    }
}


