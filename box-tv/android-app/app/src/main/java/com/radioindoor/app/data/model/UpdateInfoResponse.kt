package com.radioindoor.app.data.model

import com.google.gson.annotations.SerializedName

/**
 * UpdateInfoResponse
 * 
 * Resposta da API para verificação de atualização.
 */
data class UpdateInfoResponse(
    @SerializedName("latest_version")
    val latest_version: Int,
    
    @SerializedName("apk_url")
    val apk_url: String,
    
    @SerializedName("force_update")
    val force_update: Boolean
) {
    fun toUpdateInfo(): UpdateInfo {
        return UpdateInfo(
            latest_version = latest_version,
            apk_url = apk_url,
            force_update = force_update
        )
    }
}







