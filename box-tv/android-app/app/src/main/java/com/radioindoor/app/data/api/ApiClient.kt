package com.radioindoor.app.data.api

import com.radioindoor.app.data.model.DeviceConfigResponse
import com.radioindoor.app.data.model.RegisterDeviceRequest
import com.radioindoor.app.data.model.UpdateInfoResponse
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.PATCH
import retrofit2.http.Path
import retrofit2.http.Query
import com.radioindoor.app.data.model.RemoteCommand
import java.util.concurrent.TimeUnit

/**
 * ApiClient
 * 
 * Cliente Retrofit para comunicação com a API REST.
 */
interface ApiService {
    
    @POST("devices/register")
    suspend fun registerDevice(
        @Body body: RegisterDeviceRequest
    ): Response<Unit>
    
    @GET("devices/{uuid}/config")
    suspend fun getDeviceConfig(
        @Path("uuid") uuid: String
    ): Response<DeviceConfigResponse>
    
    @GET("devices/{uuid}")
    suspend fun getDeviceInfo(
        @Path("uuid") uuid: String
    ): Response<com.radioindoor.app.data.model.DeviceInfo>
    
    @POST("devices/{uuid}/heartbeat")
    suspend fun sendHeartbeat(
        @Path("uuid") uuid: String
    ): Response<Unit>
    
    @GET("update/check")
    suspend fun checkUpdate(): Response<UpdateInfoResponse>
    
    @PUT("devices/{uuid}")
    suspend fun updateDevice(
        @Path("uuid") uuid: String,
        @Body body: Map<String, Any>
    ): Response<Unit>
}

interface RemoteCommandApi {
    @GET("remote-commands/pending/{deviceUuid}")
    suspend fun getPendingCommands(
        @Path("deviceUuid") deviceUuid: String
    ): Response<List<RemoteCommand>>
    
    @PATCH("remote-commands/{id}/status")
    suspend fun updateCommandStatus(
        @Path("id") id: String,
        @Body body: Map<String, Any>
    ): Response<RemoteCommand>
}

interface DeviceApi {
    @PUT("devices/{uuid}")
    suspend fun updateDevice(
        @Path("uuid") uuid: String,
        @Body body: Map<String, Any>
    ): Response<Unit>
}

object ApiClient {
    
    // ⚠️ IMPORTANTE: Altere este IP para o IP do seu servidor na rede local
    // Exemplo: "http://192.168.1.100:3000/api/"
    // Para emulador: "http://10.0.2.2:3000/api/"
    // Para TV Box real: "http://SEU_IP_LOCAL:3000/api/"
    // 
    // 📝 COMO DESCOBRIR SEU IP:
    // Windows: ipconfig (procure por "IPv4")
    // Linux/Mac: ifconfig ou ip addr
    // 
    // IP atual detectado: 192.168.1.11
    // Se seu IP for diferente, altere abaixo:
    private const val BASE_URL = "http://192.168.1.11:3000/api/" // ✅ IP configurado para dispositivo físico
    
    fun create(): ApiService {
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
        
        val client = OkHttpClient.Builder()
            .addInterceptor(loggingInterceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
        
        val retrofit = Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        
        return retrofit.create(ApiService::class.java)
    }
    
    fun createRemoteCommandApi(): RemoteCommandApi {
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
        
        val client = OkHttpClient.Builder()
            .addInterceptor(loggingInterceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
        
        val retrofit = Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        
        return retrofit.create(RemoteCommandApi::class.java)
    }
    
    fun createDeviceApi(): DeviceApi {
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
        
        val client = OkHttpClient.Builder()
            .addInterceptor(loggingInterceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
        
        val retrofit = Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        
        return retrofit.create(DeviceApi::class.java)
    }
}

