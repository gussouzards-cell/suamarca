package com.radioindoor.app.data.model

import com.google.gson.annotations.SerializedName

data class DeviceInfo(
    @SerializedName("id")
    val id: String,
    
    @SerializedName("uuid")
    val uuid: String,
    
    @SerializedName("nome")
    val nome: String?,
    
    @SerializedName("ip_address")
    val ip_address: String?,
    
    @SerializedName("mac_address")
    val mac_address: String?,
    
    @SerializedName("streaming_url")
    val streaming_url: String?,
    
    @SerializedName("volume")
    val volume: Int,
    
    @SerializedName("status")
    val status: String
)






