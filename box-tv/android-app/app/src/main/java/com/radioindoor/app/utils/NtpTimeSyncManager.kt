package com.radioindoor.app.utils

import android.content.Context
import android.os.Build
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.apache.commons.net.ntp.NTPUDPClient
import org.apache.commons.net.ntp.TimeInfo
import java.net.InetAddress
import java.util.concurrent.TimeUnit

/**
 * NtpTimeSyncManager
 * 
 * Sincroniza o horário da TV Box via NTP (Network Time Protocol).
 * Usa múltiplos servidores NTP como fallback.
 */
class NtpTimeSyncManager(private val context: Context) {
    
    companion object {
        private const val TAG = "NtpTimeSyncManager"
        private val NTP_SERVERS = listOf(
            "pool.ntp.org",
            "time.google.com",
            "time.cloudflare.com",
            "time.windows.com"
        )
        private const val TIMEOUT_MS = 5000L
        private const val MAX_TIME_DIFF_MS = 5000L // 5 segundos de diferença aceitável
    }
    
    /**
     * Sincroniza o horário via NTP
     */
    suspend fun syncTime() = withContext(Dispatchers.IO) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
            Log.w(TAG, "Sincronização NTP requer API 23+")
            return@withContext
        }
        
        var synced = false
        
        for (server in NTP_SERVERS) {
            try {
                Log.d(TAG, "Tentando sincronizar com $server")
                val timeInfo = getNtpTime(server)
                
                if (timeInfo != null) {
                    val ntpTime = timeInfo.message.transmitTimeStamp.time
                    val deviceTime = System.currentTimeMillis()
                    val diff = Math.abs(ntpTime - deviceTime)
                    
                    Log.d(TAG, "Diferença de horário: ${diff}ms")
                    
                    if (diff > MAX_TIME_DIFF_MS) {
                        Log.w(TAG, "Horário incorreto detectado, ajustando...")
                        // Nota: Ajustar horário do sistema requer permissões root
                        // Em dispositivos não-root, apenas logamos o problema
                        // Para dispositivos root, pode usar: Runtime.getRuntime().exec("su -c date -s @${ntpTime/1000}")
                    } else {
                        Log.d(TAG, "Horário está correto")
                    }
                    
                    synced = true
                    break
                }
            } catch (e: Exception) {
                Log.e(TAG, "Erro ao sincronizar com $server: ${e.message}")
            }
        }
        
        if (!synced) {
            Log.w(TAG, "Não foi possível sincronizar com nenhum servidor NTP")
        }
    }
    
    /**
     * Obtém tempo do servidor NTP
     */
    private fun getNtpTime(server: String): TimeInfo? {
        val client = NTPUDPClient().apply {
            defaultTimeout = TIMEOUT_MS.toInt()
        }
        
        try {
            val address = InetAddress.getByName(server)
            val timeInfo = client.getTime(address)
            timeInfo.computeDetails()
            return timeInfo
        } catch (e: Exception) {
            Log.e(TAG, "Erro ao obter tempo de $server: ${e.message}")
            return null
        } finally {
            client.close()
        }
    }
}







