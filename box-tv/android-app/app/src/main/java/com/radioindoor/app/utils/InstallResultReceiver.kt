package com.radioindoor.app.utils

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageInstaller
import android.util.Log

/**
 * InstallResultReceiver
 * 
 * BroadcastReceiver para receber resultado da instalação alternativa de APK.
 * Usado quando o método padrão de instalação falha.
 */
class InstallResultReceiver : BroadcastReceiver() {
    
    companion object {
        private const val TAG = "InstallResultReceiver"
    }
    
    override fun onReceive(context: Context, intent: Intent) {
        val status = intent.getIntExtra(PackageInstaller.EXTRA_STATUS, -1)
        
        when (status) {
            PackageInstaller.STATUS_SUCCESS -> {
                Log.d(TAG, "Instalação bem-sucedida")
                // Reiniciar app após pequeno delay
                android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
                    try {
                        val restartIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
                        restartIntent?.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK)
                        context.startActivity(restartIntent)
                    } catch (e: Exception) {
                        Log.e(TAG, "Erro ao reiniciar app: ${e.message}")
                    }
                }, 2000) // 2 segundos
            }
            PackageInstaller.STATUS_FAILURE_ABORTED -> {
                Log.e(TAG, "Instalação abortada pelo usuário")
            }
            PackageInstaller.STATUS_FAILURE_BLOCKED -> {
                Log.e(TAG, "Instalação bloqueada")
            }
            PackageInstaller.STATUS_FAILURE_CONFLICT -> {
                Log.e(TAG, "Conflito na instalação")
            }
            PackageInstaller.STATUS_FAILURE_INCOMPATIBLE -> {
                Log.e(TAG, "APK incompatível")
            }
            PackageInstaller.STATUS_FAILURE_INVALID -> {
                Log.e(TAG, "APK inválido")
            }
            PackageInstaller.STATUS_FAILURE_STORAGE -> {
                Log.e(TAG, "Erro de armazenamento")
            }
            else -> {
                Log.e(TAG, "Instalação falhou com status: $status")
            }
        }
    }
}







