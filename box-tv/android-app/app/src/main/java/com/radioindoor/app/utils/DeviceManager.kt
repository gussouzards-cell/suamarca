package com.radioindoor.app.utils

import android.content.Context
import android.content.SharedPreferences
import android.provider.Settings
import java.util.UUID

/**
 * DeviceManager
 * 
 * Gerencia identificação única do dispositivo (UUID).
 * Gera e persiste UUID no primeiro uso.
 */
object DeviceManager {
    
    private const val PREFS_NAME = "device_prefs"
    private const val KEY_UUID = "device_uuid"
    
    /**
     * Obtém ou gera UUID único do dispositivo
     */
    fun getDeviceUuid(context: Context): String {
        val prefs: SharedPreferences = 
            context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        
        var uuid = prefs.getString(KEY_UUID, null)
        
        if (uuid == null) {
            // Gerar novo UUID
            uuid = UUID.randomUUID().toString()
            prefs.edit().putString(KEY_UUID, uuid).apply()
        }
        
        return uuid
    }
}







