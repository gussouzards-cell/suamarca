package com.radioindoor.app.data.model

import com.google.gson.annotations.SerializedName

/**
 * DeviceConfigResponse
 * 
 * Resposta da API para configuração do dispositivo.
 */
data class DeviceConfigResponse(
    @SerializedName("streaming_url")
    val streamingUrl: String?,
    
    @SerializedName("volume")
    val volume: Int,
    
    @SerializedName("status")
    val status: String,
    
    @SerializedName("player_type")
    val playerType: String? = "webView" // "exoPlayer" ou "webView"
)



