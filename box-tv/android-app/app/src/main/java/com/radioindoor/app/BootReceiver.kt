package com.radioindoor.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.radioindoor.app.service.StreamingForegroundService

/**
 * BootReceiver
 * 
 * Inicia automaticamente o app quando o dispositivo é ligado ou reiniciado.
 * Também inicia o serviço de streaming automaticamente.
 */
class BootReceiver : BroadcastReceiver() {
    companion object {
        private const val TAG = "BootReceiver"
    }

    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            Intent.ACTION_BOOT_COMPLETED,
            Intent.ACTION_MY_PACKAGE_REPLACED,
            Intent.ACTION_PACKAGE_REPLACED -> {
                Log.d(TAG, "📱 Dispositivo iniciado/reiniciado - Iniciando app automaticamente")
                
                try {
                    // Iniciar MainActivity
                    val mainIntent = Intent(context, MainActivity::class.java).apply {
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
                        addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
                    }
                    context.startActivity(mainIntent)
                    
                    // Aguardar um pouco antes de iniciar o serviço
                    android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
                        // Iniciar serviço de streaming
                        val serviceIntent = Intent(context, StreamingForegroundService::class.java)
                        context.startForegroundService(serviceIntent)
                        Log.d(TAG, "✅ Serviço de streaming iniciado automaticamente")
                    }, 2000) // 2 segundos de delay
                    
                    Log.d(TAG, "✅ App iniciado automaticamente após boot")
                } catch (e: Exception) {
                    Log.e(TAG, "❌ Erro ao iniciar app automaticamente: ${e.message}")
                    e.printStackTrace()
                }
            }
        }
    }
}
