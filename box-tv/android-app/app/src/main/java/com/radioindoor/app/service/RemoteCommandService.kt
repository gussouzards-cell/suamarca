package com.radioindoor.app.service

import android.content.Context
import android.content.Intent
import android.media.AudioManager
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import android.util.Log
import android.view.WindowManager
import androidx.lifecycle.LifecycleService
import androidx.lifecycle.lifecycleScope
import com.radioindoor.app.data.api.ApiClient
import com.radioindoor.app.data.api.RemoteCommandApi
import com.radioindoor.app.utils.DeviceManager
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.io.BufferedReader
import java.io.InputStreamReader
import java.util.concurrent.TimeUnit

/**
 * RemoteCommandService
 * 
 * Serviço que verifica periodicamente por comandos remotos pendentes
 * e os executa no dispositivo Android.
 */
class RemoteCommandService : LifecycleService() {

    private val TAG = "RemoteCommandService"
    private lateinit var apiClient: RemoteCommandApi
    private var checkJob: kotlinx.coroutines.Job? = null
    private val deviceUuid: String by lazy { DeviceManager.getDeviceUuid(this) }

    companion object {
        private const val CHECK_INTERVAL_SECONDS = 5L // Verificar a cada 5 segundos
        private const val NOTIFICATION_ID = 1002 // ID único para notificação
        private const val NOTIFICATION_CHANNEL_ID = "remote_command_service_channel"
    }

    override fun onCreate() {
        super.onCreate()
        try {
            Log.d(TAG, "🚀 Service onCreate - Iniciando RemoteCommandService")
            Log.d(TAG, "📱 Device UUID: $deviceUuid")
            
            // Criar canal de notificação (Android 8+)
            try {
                createNotificationChannel()
                Log.d(TAG, "✅ Canal de notificação criado")
            } catch (e: Exception) {
                Log.e(TAG, "❌ Erro ao criar canal de notificação: ${e.message}", e)
            }
            
            // Iniciar como foreground service (obrigatório para Android 8+)
            try {
                startForeground(NOTIFICATION_ID, createNotification())
                Log.d(TAG, "✅ Foreground service iniciado")
            } catch (e: Exception) {
                Log.e(TAG, "❌ Erro ao iniciar foreground service: ${e.message}", e)
                // Tentar continuar mesmo se falhar
            }
            
            try {
                apiClient = ApiClient.createRemoteCommandApi()
                Log.d(TAG, "✅ API Client criado")
            } catch (e: Exception) {
                Log.e(TAG, "❌ Erro ao criar API Client: ${e.message}", e)
                throw e // Este é crítico
            }
            
            try {
                startCommandChecker()
                Log.d(TAG, "✅ Verificador de comandos iniciado (intervalo: ${CHECK_INTERVAL_SECONDS}s)")
            } catch (e: Exception) {
                Log.e(TAG, "❌ Erro ao iniciar verificador de comandos: ${e.message}", e)
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ ERRO CRÍTICO no onCreate do RemoteCommandService: ${e.message}", e)
            e.printStackTrace()
            // Não deixar o serviço crashar completamente
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        super.onStartCommand(intent, flags, startId)
        try {
            Log.d(TAG, "Service onStartCommand")
            
            // Garantir que está como foreground
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    startForeground(NOTIFICATION_ID, createNotification())
                    Log.d(TAG, "✅ Foreground service confirmado no onStartCommand")
                }
            } catch (e: Exception) {
                Log.e(TAG, "❌ Erro ao confirmar foreground service: ${e.message}", e)
                // Continuar mesmo se falhar - não é crítico
            }
            
            return START_STICKY
        } catch (e: Exception) {
            Log.e(TAG, "❌ ERRO CRÍTICO no onStartCommand: ${e.message}", e)
            e.printStackTrace()
            return START_STICKY // Tentar continuar
        }
    }
    
    /**
     * Cria o canal de notificação (Android 8+)
     */
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = android.app.NotificationChannel(
                NOTIFICATION_CHANNEL_ID,
                "Serviço de Comandos Remotos",
                android.app.NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Serviço que executa comandos remotos no dispositivo"
                setShowBadge(false)
            }
            
            val notificationManager = getSystemService(android.app.NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
        }
    }
    
    /**
     * Cria a notificação para o foreground service
     */
    private fun createNotification(): android.app.Notification {
        val notificationIntent = Intent(this, com.radioindoor.app.MainActivity::class.java)
        val pendingIntent = android.app.PendingIntent.getActivity(
            this,
            0,
            notificationIntent,
            android.app.PendingIntent.FLAG_IMMUTABLE or android.app.PendingIntent.FLAG_UPDATE_CURRENT
        )
        
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            android.app.Notification.Builder(this, NOTIFICATION_CHANNEL_ID)
                .setContentTitle("Comandos Remotos Ativos")
                .setContentText("Aguardando comandos remotos...")
                .setSmallIcon(android.R.drawable.ic_menu_manage)
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .setPriority(android.app.Notification.PRIORITY_LOW)
                .build()
        } else {
            @Suppress("DEPRECATION")
            android.app.Notification.Builder(this)
                .setContentTitle("Comandos Remotos Ativos")
                .setContentText("Aguardando comandos remotos...")
                .setSmallIcon(android.R.drawable.ic_menu_manage)
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .setPriority(android.app.Notification.PRIORITY_LOW)
                .build()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.d(TAG, "Service onDestroy")
        checkJob?.cancel()
    }

    /**
     * Inicia verificação periódica de comandos
     */
    private fun startCommandChecker() {
        checkJob?.cancel()
        checkJob = lifecycleScope.launch {
            Log.d(TAG, "🔄 Loop de verificação de comandos iniciado")
            var checkCount = 0
            while (true) {
                try {
                    checkCount++
                    if (checkCount % 12 == 0) { // Log a cada minuto (12 * 5s = 60s)
                        Log.d(TAG, "⏰ Verificando comandos... (verificação #$checkCount)")
                    }
                    checkAndExecuteCommands()
                } catch (e: Exception) {
                    Log.e(TAG, "❌ Erro no loop de verificação: ${e.message}", e)
                }
                delay(TimeUnit.SECONDS.toMillis(CHECK_INTERVAL_SECONDS))
            }
        }
    }

    /**
     * Verifica e executa comandos pendentes
     */
    private suspend fun checkAndExecuteCommands() {
        try {
            Log.d(TAG, "🔍 Verificando comandos pendentes para dispositivo: $deviceUuid")
            val response = apiClient.getPendingCommands(deviceUuid)
            
            Log.d(TAG, "📡 Resposta da API - Status: ${response.code()}, Sucesso: ${response.isSuccessful}")
            
            if (response.isSuccessful) {
                val commands = response.body()
                if (commands != null) {
                    Log.d(TAG, "📥 ${commands.size} comando(s) pendente(s) encontrado(s)")
                    
                    if (commands.isNotEmpty()) {
                        for (command in commands) {
                            Log.d(TAG, "📋 Comando encontrado: ID=${command.id}, Tipo=${command.command_type}, Status=${command.status}")
                            executeCommand(command)
                        }
                    } else {
                        Log.d(TAG, "✅ Nenhum comando pendente")
                    }
                } else {
                    Log.w(TAG, "⚠️ Resposta vazia da API")
                }
            } else {
                val errorBody = response.errorBody()?.string()
                Log.e(TAG, "❌ Erro na resposta da API: ${response.code()} - $errorBody")
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ Erro ao buscar comandos: ${e.message}", e)
            e.printStackTrace()
        }
    }

    /**
     * Executa um comando remoto
     */
    private suspend fun executeCommand(command: com.radioindoor.app.data.model.RemoteCommand) {
        try {
            Log.d(TAG, "▶️ Executando comando: ${command.command_type}")
            
            // Marcar como executando
            apiClient.updateCommandStatus(command.id, mapOf(
                "status" to "executing"
            ))
            
            val result = when (command.command_type) {
                "restart" -> executeRestart()
                "reboot" -> executeReboot()
                "shutdown" -> executeShutdown()
                "set_volume" -> executeSetVolume(command.parameters?.get("volume") as? Number)
                "set_streaming_url" -> executeSetStreamingUrl(command.parameters?.get("url") as? String)
                "set_brightness" -> executeSetBrightness(command.parameters?.get("brightness") as? Number)
                "play" -> executePlay()
                "pause" -> executePause()
                "stop" -> executeStop()
                "update_config" -> executeUpdateConfig(command.parameters)
                "screenshot" -> executeScreenshot()
                "execute_shell" -> executeShell(command.parameters?.get("command") as? String)
                "clear_cache" -> executeClearCache()
                "force_stop" -> executeForceStop()
                "enable_wifi" -> executeEnableWifi(true)
                "disable_wifi" -> executeEnableWifi(false)
                "enable_bluetooth" -> executeEnableBluetooth(true)
                "disable_bluetooth" -> executeEnableBluetooth(false)
                "set_airplane_mode" -> executeSetAirplaneMode(command.parameters?.get("enabled") as? Boolean ?: false)
                "lock_screen" -> executeLockScreen()
                "unlock_screen" -> executeUnlockScreen()
                "set_kiosk_mode" -> executeSetKioskMode(true)
                "exit_kiosk_mode" -> executeSetKioskMode(false)
                "connect_wifi" -> executeConnectWifi(
                    command.parameters?.get("ssid") as? String,
                    command.parameters?.get("password") as? String,
                    command.parameters?.get("security_type") as? String ?: "WPA2"
                )
                "disconnect_wifi" -> executeDisconnectWifi()
                "list_wifi_networks" -> executeListWifiNetworks()
                "get_wifi_info" -> executeGetWifiInfo()
                else -> {
                    Log.w(TAG, "⚠️ Tipo de comando desconhecido: ${command.command_type}")
                    "Comando desconhecido"
                }
            }
            
            // Marcar como concluído
            try {
                val updateResponse = apiClient.updateCommandStatus(command.id, mapOf(
                    "status" to "completed",
                    "result" to (result ?: "")
                ))
                if (updateResponse.isSuccessful) {
                    Log.d(TAG, "✅ Comando ${command.command_type} executado com sucesso e status atualizado")
                } else {
                    Log.w(TAG, "⚠️ Comando executado mas falha ao atualizar status: ${updateResponse.code()}")
                }
            } catch (updateEx: Exception) {
                Log.e(TAG, "❌ Erro ao atualizar status para completed: ${updateEx.message}")
            }
            
        } catch (e: Exception) {
            Log.e(TAG, "❌ Erro ao executar comando '${command.command_type}': ${e.message}", e)
            e.printStackTrace()
            try {
                val updateResponse = apiClient.updateCommandStatus(command.id, mapOf(
                    "status" to "failed",
                    "error_message" to (e.message ?: "Erro desconhecido")
                ))
                if (updateResponse.isSuccessful) {
                    Log.d(TAG, "✅ Status do comando atualizado para 'failed'")
                } else {
                    Log.w(TAG, "⚠️ Falha ao atualizar status para 'failed': ${updateResponse.code()}")
                }
            } catch (ex: Exception) {
                Log.e(TAG, "❌ Erro ao atualizar status do comando: ${ex.message}", ex)
            }
        }
    }

    // ========== Implementação dos Comandos ==========

    private fun executeRestart(): String {
        Log.d(TAG, "🔄 Reiniciando app...")
        val intent = packageManager.getLaunchIntentForPackage(packageName)
        intent?.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
        startActivity(intent)
        return "App reiniciado"
    }

    private fun executeReboot(): String {
        Log.d(TAG, "🔄 Reiniciando dispositivo...")
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
            powerManager.reboot(null)
        } else {
            executeShell("reboot")
        }
        return "Dispositivo reiniciando"
    }

    private fun executeShutdown(): String {
        Log.d(TAG, "🔌 Desligando dispositivo...")
        // Usar shell command para desligar (mais confiável e funciona em todas as versões)
        // Nota: Pode requerer permissões root ou WRITE_SECURE_SETTINGS
        return executeShell("reboot -p")
    }

    private fun executeSetVolume(volume: Number?): String {
        if (volume == null) return "Volume não especificado"
        val volumeInt = volume.toInt().coerceIn(0, 100)
        Log.d(TAG, "🔊 Definindo volume: $volumeInt%")
        
        val audioManager = getSystemService(Context.AUDIO_SERVICE) as AudioManager
        val maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC)
        val volumeLevel = (maxVolume * volumeInt / 100).coerceIn(0, maxVolume)
        audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, volumeLevel, 0)
        
        return "Volume definido para $volumeInt%"
    }

    private fun executeSetStreamingUrl(url: String?): String {
        if (url == null) return "URL não especificada"
        Log.d(TAG, "🎵 Definindo URL de streaming: $url")
        
        // Atualizar configuração via API
        lifecycleScope.launch {
            try {
                val apiClient = ApiClient.createDeviceApi()
                apiClient.updateDevice(deviceUuid, mapOf("streaming_url" to url))
                Log.d(TAG, "✅ URL de streaming atualizada")
            } catch (e: Exception) {
                Log.e(TAG, "Erro ao atualizar URL: ${e.message}")
            }
        }
        
        return "URL de streaming atualizada: $url"
    }

    private fun executeSetBrightness(brightness: Number?): String {
        if (brightness == null) return "Brilho não especificado"
        val brightnessInt = brightness.toInt().coerceIn(0, 100)
        Log.d(TAG, "💡 Definindo brilho: $brightnessInt%")
        
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                // Android 6+ requer permissão WRITE_SETTINGS
                if (Settings.System.canWrite(this)) {
                    // Converter de 0-100 para 0-255 (escala do Android)
                    val brightnessValue = (brightnessInt * 255 / 100).coerceIn(0, 255)
                    
                    // Desabilitar modo automático
                    Settings.System.putInt(
                        contentResolver,
                        Settings.System.SCREEN_BRIGHTNESS_MODE,
                        Settings.System.SCREEN_BRIGHTNESS_MODE_MANUAL
                    )
                    
                    // Definir brilho
                    Settings.System.putInt(
                        contentResolver,
                        Settings.System.SCREEN_BRIGHTNESS,
                        brightnessValue
                    )
                    
                    Log.d(TAG, "✅ Brilho definido para $brightnessInt% ($brightnessValue/255)")
                    return "Brilho definido para $brightnessInt%"
                } else {
                    Log.w(TAG, "⚠️ Permissão WRITE_SETTINGS não concedida")
                    return "Permissão WRITE_SETTINGS necessária. Configure nas configurações do sistema."
                }
            } else {
                // Android 5 e abaixo
                val brightnessValue = (brightnessInt * 255 / 100).coerceIn(0, 255)
                Settings.System.putInt(
                    contentResolver,
                    Settings.System.SCREEN_BRIGHTNESS_MODE,
                    Settings.System.SCREEN_BRIGHTNESS_MODE_MANUAL
                )
                Settings.System.putInt(
                    contentResolver,
                    Settings.System.SCREEN_BRIGHTNESS,
                    brightnessValue
                )
                return "Brilho definido para $brightnessInt%"
            }
        } catch (e: Exception) {
            Log.e(TAG, "Erro ao definir brilho: ${e.message}", e)
            return "Erro ao definir brilho: ${e.message}"
        }
    }

    private fun executePlay(): String {
        Log.d(TAG, "▶️ Reproduzindo...")
        val intent = Intent("com.radioindoor.app.ACTION_PLAY")
        sendBroadcast(intent)
        return "Reprodução iniciada"
    }

    private fun executePause(): String {
        Log.d(TAG, "⏸️ Pausando...")
        val intent = Intent("com.radioindoor.app.ACTION_PAUSE")
        sendBroadcast(intent)
        return "Reprodução pausada"
    }

    private fun executeStop(): String {
        Log.d(TAG, "⏹️ Parando...")
        val intent = Intent("com.radioindoor.app.ACTION_STOP")
        sendBroadcast(intent)
        return "Reprodução parada"
    }

    private fun executeUpdateConfig(parameters: Map<String, Any>?): String {
        if (parameters == null) return "Parâmetros não especificados"
        Log.d(TAG, "⚙️ Atualizando configuração: $parameters")
        
        lifecycleScope.launch {
            try {
                val apiClient = ApiClient.createDeviceApi()
                apiClient.updateDevice(deviceUuid, parameters)
                Log.d(TAG, "✅ Configuração atualizada")
            } catch (e: Exception) {
                Log.e(TAG, "Erro ao atualizar configuração: ${e.message}")
            }
        }
        
        return "Configuração atualizada"
    }

    private fun executeScreenshot(): String {
        Log.d(TAG, "📸 Capturando screenshot...")
        // Implementação de screenshot requer permissões especiais
        return "Screenshot não implementado (requer permissões especiais)"
    }

    private fun executeShell(command: String?): String {
        if (command == null) return "Comando não especificado"
        Log.d(TAG, "💻 Executando comando shell: $command")
        
        return try {
            val process = Runtime.getRuntime().exec(command)
            val reader = BufferedReader(InputStreamReader(process.inputStream))
            val output = reader.readText()
            process.waitFor()
            "Comando executado: $output"
        } catch (e: Exception) {
            "Erro ao executar comando: ${e.message}"
        }
    }

    private fun executeClearCache(): String {
        Log.d(TAG, "🗑️ Limpando cache...")
        // Usar shell command para limpar cache (mais confiável)
        // Nota: 'pm clear' limpa dados e cache, 'pm clear --cache-only' limpa apenas cache (Android 7+)
        val packageName = packageName
        return try {
            val result = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                // Android 7+ - limpar apenas cache
                executeShell("pm clear --cache-only $packageName")
            } else {
                // Android 6 e abaixo - limpar cache via método alternativo
                executeShell("pm trim-caches $packageName 0")
            }
            
            if (result.contains("Success") || result.contains("Cache")) {
                Log.d(TAG, "✅ Cache limpo com sucesso")
                return "Cache limpo com sucesso"
            } else {
                Log.w(TAG, "⚠️ Resultado da limpeza: $result")
                return "Limpeza de cache executada: $result"
            }
        } catch (e: Exception) {
            Log.e(TAG, "Erro ao limpar cache: ${e.message}", e)
            return "Erro ao limpar cache: ${e.message}. Pode requerer permissões root."
        }
    }

    private fun executeForceStop(): String {
        Log.d(TAG, "🛑 Forçando parada do app...")
        return try {
            val packageName = packageName
            
            // Método 1: Tentar via ActivityManager
            try {
                val activityManager = getSystemService(Context.ACTIVITY_SERVICE) as android.app.ActivityManager
                activityManager.killBackgroundProcesses(packageName)
                Log.d(TAG, "✅ Processos em background finalizados")
            } catch (e: Exception) {
                Log.w(TAG, "Erro ao usar ActivityManager: ${e.message}")
            }
            
            // Método 2: Usar shell command para forçar parada completa
            val result = executeShell("am force-stop $packageName")
            
            // Parar o próprio serviço
            stopSelf()
            
            Log.d(TAG, "✅ App forçado a parar: $result")
            "App forçado a parar"
        } catch (e: Exception) {
            Log.e(TAG, "Erro ao forçar parada: ${e.message}", e)
            "Erro ao forçar parada: ${e.message}"
        }
    }

    private fun executeEnableWifi(enabled: Boolean): String {
        Log.d(TAG, "${if (enabled) "📶" else "📵"} ${if (enabled) "Habilitando" else "Desabilitando"} WiFi...")
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            // Android 10+ requer ação do usuário
            return "WiFi requer ação do usuário no Android 10+"
        } else {
            val wifiManager = applicationContext.getSystemService(Context.WIFI_SERVICE) as android.net.wifi.WifiManager
            wifiManager.isWifiEnabled = enabled
            return "WiFi ${if (enabled) "habilitado" else "desabilitado"}"
        }
    }

    private fun executeEnableBluetooth(enabled: Boolean): String {
        Log.d(TAG, "${if (enabled) "📶" else "📵"} ${if (enabled) "Habilitando" else "Desabilitando"} Bluetooth...")
        val bluetoothAdapter = android.bluetooth.BluetoothAdapter.getDefaultAdapter()
        if (bluetoothAdapter != null) {
            if (enabled) {
                bluetoothAdapter.enable()
            } else {
                bluetoothAdapter.disable()
            }
            return "Bluetooth ${if (enabled) "habilitado" else "desabilitado"}"
        }
        return "Bluetooth não disponível"
    }

    private fun executeSetAirplaneMode(enabled: Boolean): String {
        Log.d(TAG, "✈️ Modo avião: ${if (enabled) "ativado" else "desativado"}")
        Settings.Global.putInt(contentResolver, Settings.Global.AIRPLANE_MODE_ON, if (enabled) 1 else 0)
        val intent = Intent(Intent.ACTION_AIRPLANE_MODE_CHANGED)
        intent.putExtra("state", enabled)
        sendBroadcast(intent)
        return "Modo avião ${if (enabled) "ativado" else "desativado"}"
    }

    private fun executeLockScreen(): String {
        Log.d(TAG, "🔒 Bloqueando tela...")
        val devicePolicyManager = getSystemService(Context.DEVICE_POLICY_SERVICE) as android.app.admin.DevicePolicyManager
        // Requer Device Admin
        return "Bloqueio de tela requer Device Admin"
    }

    private fun executeUnlockScreen(): String {
        Log.d(TAG, "🔓 Desbloqueando tela...")
        // Requer Device Admin
        return "Desbloqueio de tela requer Device Admin"
    }

    private fun executeSetKioskMode(enabled: Boolean): String {
        Log.d(TAG, "🖥️ Modo Kiosk: ${if (enabled) "ativado" else "desativado"}")
        val intent = Intent(this, com.radioindoor.app.MainActivity::class.java)
        if (enabled) {
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            startActivity(intent)
        }
        return "Modo Kiosk ${if (enabled) "ativado" else "desativado"}"
    }

    // ========== Comandos WiFi ==========

    private fun executeConnectWifi(ssid: String?, password: String?, securityType: String): String {
        if (ssid.isNullOrEmpty()) {
            return "SSID não especificado"
        }
        
        Log.d(TAG, "📶 Conectando a rede WiFi: $ssid")
        
        return try {
            val wifiManager = applicationContext.getSystemService(Context.WIFI_SERVICE) as android.net.wifi.WifiManager
            
            // Verificar se WiFi está habilitado
            if (!wifiManager.isWifiEnabled) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    return "WiFi está desabilitado. Habilite manualmente primeiro."
                } else {
                    wifiManager.isWifiEnabled = true
                    Thread.sleep(2000) // Aguardar WiFi habilitar
                }
            }
            
            // Criar configuração de rede
            val wifiConfig = android.net.wifi.WifiConfiguration().apply {
                SSID = "\"$ssid\""
                
                when (securityType.uppercase()) {
                    "OPEN", "NONE" -> {
                        allowedKeyManagement.set(android.net.wifi.WifiConfiguration.KeyMgmt.NONE)
                    }
                    "WPA", "WPA2", "WPA3" -> {
                        if (password.isNullOrEmpty()) {
                            return "Senha necessária para rede $securityType"
                        }
                        allowedKeyManagement.set(android.net.wifi.WifiConfiguration.KeyMgmt.WPA_PSK)
                        preSharedKey = "\"$password\""
                    }
                    "WEP" -> {
                        if (password.isNullOrEmpty()) {
                            return "Senha necessária para rede WEP"
                        }
                        allowedKeyManagement.set(android.net.wifi.WifiConfiguration.KeyMgmt.NONE)
                        allowedAuthAlgorithms.set(android.net.wifi.WifiConfiguration.AuthAlgorithm.OPEN)
                        allowedAuthAlgorithms.set(android.net.wifi.WifiConfiguration.AuthAlgorithm.SHARED)
                        if (password.length == 10 || password.length == 26) {
                            // Senha hexadecimal
                            wepKeys[0] = password
                        } else {
                            // Senha ASCII
                            wepKeys[0] = "\"$password\""
                        }
                        wepTxKeyIndex = 0
                    }
                    else -> {
                        // Assumir WPA2 por padrão
                        if (!password.isNullOrEmpty()) {
                            allowedKeyManagement.set(android.net.wifi.WifiConfiguration.KeyMgmt.WPA_PSK)
                            preSharedKey = "\"$password\""
                        }
                    }
                }
            }
            
            // Adicionar e conectar à rede
            val networkId = wifiManager.addNetwork(wifiConfig)
            if (networkId == -1) {
                // Rede pode já existir, tentar encontrar
                val existingNetworks = wifiManager.configuredNetworks
                val existingNetwork = existingNetworks?.find { it.SSID == "\"$ssid\"" }
                if (existingNetwork != null) {
                    wifiManager.enableNetwork(existingNetwork.networkId, true)
                    return "Conectando à rede existente: $ssid"
                }
                return "Erro ao adicionar rede WiFi. Verifique se a rede já existe."
            }
            
            // Conectar à rede
            val success = wifiManager.enableNetwork(networkId, true)
            if (success) {
                Log.d(TAG, "✅ Conectando à rede WiFi: $ssid")
                return "Conectando à rede WiFi: $ssid"
            } else {
                return "Falha ao conectar à rede WiFi: $ssid"
            }
            
        } catch (e: Exception) {
            Log.e(TAG, "Erro ao conectar WiFi: ${e.message}", e)
            return "Erro ao conectar WiFi: ${e.message}"
        }
    }

    private fun executeDisconnectWifi(): String {
        Log.d(TAG, "📵 Desconectando WiFi...")
        
        return try {
            val wifiManager = applicationContext.getSystemService(Context.WIFI_SERVICE) as android.net.wifi.WifiManager
            val wifiInfo = wifiManager.connectionInfo
            
            if (wifiInfo != null && wifiInfo.networkId != -1) {
                wifiManager.disconnect()
                Log.d(TAG, "✅ WiFi desconectado")
                return "WiFi desconectado"
            } else {
                return "Nenhuma rede WiFi conectada"
            }
        } catch (e: Exception) {
            Log.e(TAG, "Erro ao desconectar WiFi: ${e.message}", e)
            return "Erro ao desconectar WiFi: ${e.message}"
        }
    }

    private fun executeListWifiNetworks(): String {
        Log.d(TAG, "📋 Listando redes WiFi disponíveis...")
        
        return try {
            val wifiManager = applicationContext.getSystemService(Context.WIFI_SERVICE) as android.net.wifi.WifiManager
            
            if (!wifiManager.isWifiEnabled) {
                return "WiFi está desabilitado"
            }
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                // Android 10+ requer permissão de localização e uso de WifiNetworkSuggestion
                return "Listagem de redes WiFi requer Android 9 ou inferior, ou configuração manual"
            }
            
            // Para Android 9 e abaixo
            val scanResults = wifiManager.scanResults
            if (scanResults.isNullOrEmpty()) {
                return "Nenhuma rede WiFi encontrada. Iniciando scan..."
            }
            
            val networks = scanResults.mapIndexed { index, result ->
                val security = when {
                    result.capabilities.contains("WPA3") -> "WPA3"
                    result.capabilities.contains("WPA2") -> "WPA2"
                    result.capabilities.contains("WPA") -> "WPA"
                    result.capabilities.contains("WEP") -> "WEP"
                    else -> "Open"
                }
                "${index + 1}. SSID: ${result.SSID}, Signal: ${result.level}dBm, Security: $security"
            }
            
            val result = "Redes WiFi encontradas (${networks.size}):\n${networks.joinToString("\n")}"
            Log.d(TAG, result)
            return result
            
        } catch (e: Exception) {
            Log.e(TAG, "Erro ao listar redes WiFi: ${e.message}", e)
            return "Erro ao listar redes WiFi: ${e.message}"
        }
    }

    private fun executeGetWifiInfo(): String {
        Log.d(TAG, "ℹ️ Obtendo informações da rede WiFi...")
        
        return try {
            val wifiManager = applicationContext.getSystemService(Context.WIFI_SERVICE) as android.net.wifi.WifiManager
            val wifiInfo = wifiManager.connectionInfo
            
            if (wifiInfo == null || wifiInfo.networkId == -1) {
                return "Nenhuma rede WiFi conectada"
            }
            
            val ssid = wifiInfo.ssid?.replace("\"", "") ?: "Desconhecido"
            val bssid = wifiInfo.bssid ?: "Desconhecido"
            val ipAddress = android.text.format.Formatter.formatIpAddress(wifiInfo.ipAddress)
            val linkSpeed = "${wifiInfo.linkSpeed} Mbps"
            val rssi = "${wifiInfo.rssi} dBm"
            
            val info = """
                |SSID: $ssid
                |BSSID: $bssid
                |IP Address: $ipAddress
                |Link Speed: $linkSpeed
                |Signal Strength: $rssi
                |Network ID: ${wifiInfo.networkId}
            """.trimMargin()
            
            Log.d(TAG, "✅ Informações WiFi:\n$info")
            return info
            
        } catch (e: Exception) {
            Log.e(TAG, "Erro ao obter informações WiFi: ${e.message}", e)
            return "Erro ao obter informações WiFi: ${e.message}"
        }
    }
}

