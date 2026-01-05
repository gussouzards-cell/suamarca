package com.radioindoor.app.data

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import com.radioindoor.app.data.api.ApiClient
import com.radioindoor.app.data.model.DeviceConfig
import com.radioindoor.app.utils.DeviceManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * ConfigRepository
 * 
 * Gerencia a busca e cache de configurações remotas.
 * Persiste última configuração localmente para fallback offline.
 */
class ConfigRepository(private val context: Context) {

    private val apiClient = ApiClient.create()
    private val prefs: SharedPreferences = 
        context.getSharedPreferences("radio_indoor_prefs", Context.MODE_PRIVATE)
    
    companion object {
        private const val TAG = "ConfigRepository"
        private const val KEY_STREAMING_URL = "streaming_url"
        private const val KEY_VOLUME = "volume"
        private const val KEY_STATUS = "status"
        private const val KEY_PLAYER_TYPE = "player_type"
    }

    /**
     * Busca configuração da API e atualiza cache local
     */
    suspend fun fetchConfigFromApi(): DeviceConfig? = withContext(Dispatchers.IO) {
        try {
            val uuid = DeviceManager.getDeviceUuid(context)
            val response = apiClient.getDeviceConfig(uuid)
            
            if (response.isSuccessful && response.body() != null) {
                val apiConfig = response.body()!!
                val config = DeviceConfig(
                    streamingUrl = apiConfig.streamingUrl,
                    volume = apiConfig.volume,
                    status = apiConfig.status,
                    playerType = apiConfig.playerType ?: "webView"
                )
                saveConfigLocally(config)
                Log.d(TAG, "Configuração atualizada da API: ${config.streamingUrl}, player: ${config.playerType}")
                return@withContext config
            } else {
                Log.w(TAG, "Falha ao buscar configuração: ${response.code()}")
                return@withContext null
            }
        } catch (e: Exception) {
            Log.e(TAG, "Erro ao buscar configuração da API: ${e.message}")
            return@withContext null
        }
    }

    /**
     * Obtém configuração (cache local ou busca da API)
     */
    suspend fun getConfig(): DeviceConfig? = withContext(Dispatchers.IO) {
        // Primeiro tenta buscar da API
        val apiConfig = fetchConfigFromApi()
        if (apiConfig != null) {
            return@withContext apiConfig
        }
        
        // Se falhar, retorna cache local
        val cachedConfig = loadConfigFromLocal()
        if (cachedConfig != null) {
            Log.d(TAG, "Usando configuração em cache")
            return@withContext cachedConfig
        }
        
        // Se não houver cache, retorna configuração padrão
        Log.w(TAG, "Nenhuma configuração disponível, usando padrão")
        return@withContext DeviceConfig(
            streamingUrl = "",
            volume = 50,
            status = "inactive",
            playerType = "webView"
        )
    }
    
    /**
     * Obtém configuração apenas do cache local (sem buscar da API)
     */
    suspend fun getCachedConfig(): DeviceConfig? = withContext(Dispatchers.IO) {
        loadConfigFromLocal()
    }

    /**
     * Salva configuração localmente
     */
    private fun saveConfigLocally(config: DeviceConfig) {
        prefs.edit().apply {
            putString(KEY_STREAMING_URL, config.streamingUrl)
            putInt(KEY_VOLUME, config.volume)
            putString(KEY_STATUS, config.status)
            putString(KEY_PLAYER_TYPE, config.playerType)
            commit()
        }
    }

    /**
     * Carrega configuração do cache local
     */
    private fun loadConfigFromLocal(): DeviceConfig? {
        val url = prefs.getString(KEY_STREAMING_URL, null) ?: return null
        val volume = prefs.getInt(KEY_VOLUME, 50)
        val status = prefs.getString(KEY_STATUS, "inactive") ?: "inactive"
        val playerType = prefs.getString(KEY_PLAYER_TYPE, "webView") ?: "webView"
        
        return DeviceConfig(
            streamingUrl = url,
            volume = volume,
            status = status,
            playerType = playerType
        )
    }
}

