package com.radioindoor.app.data.model

import com.google.gson.annotations.SerializedName

data class RemoteCommand(
    @SerializedName("id")
    val id: String,
    
    @SerializedName("device_uuid")
    val device_uuid: String,
    
    @SerializedName("command_type")
    val command_type: String,
    
    @SerializedName("parameters")
    val parameters: Map<String, Any>?,
    
    @SerializedName("status")
    val status: String,
    
    @SerializedName("result")
    val result: String?,
    
    @SerializedName("error_message")
    val error_message: String?,
    
    @SerializedName("created_at")
    val created_at: String
)






