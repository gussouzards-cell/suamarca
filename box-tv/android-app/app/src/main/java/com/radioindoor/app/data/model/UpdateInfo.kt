package com.radioindoor.app.data.model

/**
 * UpdateInfo
 * 
 * Modelo de dados para informações de atualização OTA.
 */
data class UpdateInfo(
    val latest_version: Int,
    val apk_url: String,
    val force_update: Boolean
)







