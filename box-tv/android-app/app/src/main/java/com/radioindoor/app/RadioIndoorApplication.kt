package com.radioindoor.app

import android.app.Application
import android.util.Log
import com.radioindoor.app.data.api.ApiClient
import com.radioindoor.app.data.ConfigRepository
import com.radioindoor.app.utils.DeviceManager
import com.radioindoor.app.utils.UpdateManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/**
 * RadioIndoorApplication
 * 
 * Application class para inicialização global.
 */
class RadioIndoorApplication : Application() {
    
    private val applicationScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private lateinit var updateManager: UpdateManager
    
    override fun onCreate() {
        super.onCreate()
        Log.d("RadioIndoor", "Application onCreate")
        
        // Inicializar UpdateManager
        updateManager = UpdateManager(this)
        updateManager.startPeriodicCheck()
        
        // Registrar dispositivo na API (se necessário)
        registerDeviceIfNeeded()
        
        // Iniciar heartbeat periódico
        startHeartbeatLoop()
    }
    
    override fun onTerminate() {
        super.onTerminate()
        updateManager.cleanup()
    }
    
    /**
     * Registra dispositivo na API se ainda não estiver registrado
     */
    private fun registerDeviceIfNeeded() {
        applicationScope.launch {
            try {
                val uuid = DeviceManager.getDeviceUuid(this@RadioIndoorApplication)
                Log.d("RadioIndoor", "Device UUID: $uuid")
                
                // Obter IP e MAC
                val ipAddress = getLocalIpAddress()
                val macAddress = getMacAddress()
                
                // Registrar dispositivo na API
                val apiService = ApiClient.create()
                val registerRequest = com.radioindoor.app.data.model.RegisterDeviceRequest(
                    uuid = uuid,
                    nome = "TV Box ${android.os.Build.MODEL}",
                    ip_address = ipAddress,
                    mac_address = macAddress
                )
                
                val response = apiService.registerDevice(registerRequest)
                
                if (response.isSuccessful) {
                    Log.d("RadioIndoor", "Dispositivo registrado com sucesso")
                } else {
                    Log.w("RadioIndoor", "Falha ao registrar dispositivo: ${response.code()}")
                    // Se já existe (409), não é erro
                    if (response.code() == 409) {
                        Log.d("RadioIndoor", "Dispositivo já estava registrado")
                    }
                }
            } catch (e: Exception) {
                Log.e("RadioIndoor", "Erro ao registrar dispositivo: ${e.message}")
            }
        }
    }
    
    /**
     * Obtém endereço IP local do dispositivo
     */
    private fun getLocalIpAddress(): String? {
        return try {
            val interfaces = java.net.NetworkInterface.getNetworkInterfaces()
            while (interfaces.hasMoreElements()) {
                val networkInterface = interfaces.nextElement()
                val addresses = networkInterface.inetAddresses
                while (addresses.hasMoreElements()) {
                    val address = addresses.nextElement()
                    if (!address.isLoopbackAddress && address is java.net.Inet4Address) {
                        return address.hostAddress
                    }
                }
            }
            null
        } catch (e: Exception) {
            Log.e("RadioIndoor", "Erro ao obter IP: ${e.message}")
            null
        }
    }
    
    /**
     * Obtém endereço MAC do dispositivo
     */
    private fun getMacAddress(): String? {
        return try {
            // Tentar obter via WifiManager
            val wifiManager = applicationContext.getSystemService(android.content.Context.WIFI_SERVICE) as? android.net.wifi.WifiManager
            val wifiInfo = wifiManager?.connectionInfo
            val mac = wifiInfo?.macAddress
            
            if (!mac.isNullOrEmpty() && mac != "02:00:00:00:00:00") {
                mac
            } else {
                // Fallback: obter de NetworkInterface
                val interfaces = java.net.NetworkInterface.getNetworkInterfaces()
                while (interfaces.hasMoreElements()) {
                    val networkInterface = interfaces.nextElement()
                    val macBytes = networkInterface.hardwareAddress
                    if (macBytes != null && macBytes.isNotEmpty()) {
                        val macString = macBytes.joinToString(":") { String.format("%02X", it) }
                        if (macString != "02:00:00:00:00:00") {
                            return macString
                        }
                    }
                }
                null
            }
        } catch (e: Exception) {
            Log.e("RadioIndoor", "Erro ao obter MAC: ${e.message}")
            null
        }
    }
    
    /**
     * Loop de heartbeat a cada 1 minuto
     */
    private fun startHeartbeatLoop() {
        applicationScope.launch {
            while (true) {
                delay(60000) // 1 minuto
                sendHeartbeat()
            }
        }
    }
    
    /**
     * Envia heartbeat para API
     */
    private suspend fun sendHeartbeat() {
        try {
            val uuid = DeviceManager.getDeviceUuid(this)
            val apiService = ApiClient.create()
            val response = apiService.sendHeartbeat(uuid)
            
            if (response.isSuccessful) {
                Log.d("RadioIndoor", "Heartbeat enviado com sucesso")
            } else {
                Log.w("RadioIndoor", "Falha ao enviar heartbeat: ${response.code()}")
            }
        } catch (e: Exception) {
            Log.e("RadioIndoor", "Erro ao enviar heartbeat: ${e.message}")
        }
    }
}

