package com.radioindoor.app.data.model

/**
 * DeviceConfig
 * 
 * Modelo de dados para configuração do dispositivo.
 */
data class DeviceConfig(
    val streamingUrl: String?,
    val volume: Int,
    val status: String, // "active" ou "inactive"
    val playerType: String = "webView" // "exoPlayer" ou "webView"
)



