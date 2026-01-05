package com.radioindoor.app.data.model

/**
 * RegisterDeviceRequest
 * 
 * Request para registrar dispositivo na API.
 */
data class RegisterDeviceRequest(
    val uuid: String,
    val nome: String? = null,
    val ip_address: String? = null,
    val mac_address: String? = null
)

