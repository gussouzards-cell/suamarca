package com.radioindoor.app.utils

import android.app.DownloadManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageInstaller
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.util.Log
import androidx.core.content.FileProvider
import android.content.pm.PackageInfo
import com.radioindoor.app.data.api.ApiClient
import com.radioindoor.app.data.model.UpdateInfo
import com.radioindoor.app.data.model.UpdateInfoResponse
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.io.File
import java.io.FileInputStream
import java.security.MessageDigest

/**
 * UpdateManager
 * 
 * Gerencia atualizações OTA (Over-The-Air) do aplicativo.
 * Verifica versão na API, baixa APK e instala automaticamente.
 */
class UpdateManager(private val context: Context) {

    private val apiClient = ApiClient.create()
    private val updateScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    
    private var downloadId: Long = -1
    private var downloadReceiver: BroadcastReceiver? = null
    private var isChecking = false
    private var isDownloading = false
    
    companion object {
        private const val TAG = "UpdateManager"
        private const val CHECK_INTERVAL = 6 * 60 * 60 * 1000L // 6 horas
        private const val DOWNLOAD_DIR = "RadioIndoorUpdates"
        private const val APK_FILE_NAME = "update.apk"
        private const val MAX_RETRIES = 3
        private var retryCount = 0
    }

    /**
     * Inicia verificação periódica de atualizações
     */
    fun startPeriodicCheck() {
        updateScope.launch {
            while (true) {
                delay(CHECK_INTERVAL)
                checkForUpdate()
            }
        }
        
        // Verificar imediatamente ao iniciar
        checkForUpdate()
    }

    /**
     * Verifica se há atualização disponível
     */
    fun checkForUpdate() {
        if (isChecking || isDownloading) {
            Log.d(TAG, "Já está verificando ou baixando atualização")
            return
        }

        isChecking = true
        updateScope.launch {
            try {
                Log.d(TAG, "Verificando atualização...")
                // Obter versão atual do app via PackageManager
                val packageInfo: PackageInfo = context.packageManager.getPackageInfo(context.packageName, 0)
                val currentVersion = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                    packageInfo.longVersionCode.toInt()
                } else {
                    @Suppress("DEPRECATION")
                    packageInfo.versionCode
                }
                val response = apiClient.checkUpdate()

                if (response.isSuccessful && response.body() != null) {
                    val updateInfoResponse = response.body()!!
                    val updateInfo = updateInfoResponse.toUpdateInfo()
                    
                    Log.d(TAG, "Versão atual: $currentVersion, Versão disponível: ${updateInfo.latest_version}")
                    
                    if (updateInfo.latest_version > currentVersion) {
                        Log.d(TAG, "Nova versão disponível: ${updateInfo.latest_version}")
                        
                        if (updateInfo.force_update) {
                            Log.w(TAG, "Atualização obrigatória detectada")
                        }
                        
                        downloadUpdate(updateInfo)
                    } else {
                        Log.d(TAG, "App está atualizado")
                        retryCount = 0
                    }
                } else {
                    Log.w(TAG, "Falha ao verificar atualização: ${response.code()}")
                    handleCheckError()
                }
            } catch (e: Exception) {
                Log.e(TAG, "Erro ao verificar atualização: ${e.message}")
                handleCheckError()
            } finally {
                isChecking = false
            }
        }
    }

    /**
     * Baixa o APK de atualização
     */
    private fun downloadUpdate(updateInfo: UpdateInfo) {
        if (isDownloading) {
            Log.w(TAG, "Download já em andamento")
            return
        }

        isDownloading = true
        retryCount = 0

        updateScope.launch {
            try {
                val downloadManager = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
                
                // Criar diretório de download
                val downloadDir = File(context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), DOWNLOAD_DIR)
                if (!downloadDir.exists()) {
                    downloadDir.mkdirs()
                }
                
                // Remover APK anterior se existir
                val apkFile = File(downloadDir, APK_FILE_NAME)
                if (apkFile.exists()) {
                    apkFile.delete()
                }

                // Configurar request de download
                val request = DownloadManager.Request(Uri.parse(updateInfo.apk_url)).apply {
                    setTitle("Atualizando Rádio Indoor")
                    setDescription("Baixando versão ${updateInfo.latest_version}")
                    setDestinationUri(Uri.fromFile(apkFile))
                    setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                    setAllowedOverMetered(true)
                    setAllowedOverRoaming(false)
                }

                // Registrar receiver para quando download completar
                registerDownloadReceiver(apkFile, updateInfo)

                // Iniciar download
                downloadId = downloadManager.enqueue(request)
                Log.d(TAG, "Download iniciado: $downloadId")
                
            } catch (e: Exception) {
                Log.e(TAG, "Erro ao iniciar download: ${e.message}")
                isDownloading = false
                handleDownloadError(updateInfo)
            }
        }
    }

    /**
     * Registra receiver para detectar quando download completa
     */
    private fun registerDownloadReceiver(apkFile: File, updateInfo: UpdateInfo) {
        downloadReceiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context, intent: Intent) {
                val id = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1)
                
                if (id == downloadId) {
                    Log.d(TAG, "Download completado: $id")
                    
                    val downloadManager = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
                    val query = DownloadManager.Query().setFilterById(id)
                    val cursor = downloadManager.query(query)
                    
                    if (cursor.moveToFirst()) {
                        val status = cursor.getInt(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_STATUS))
                        
                        if (status == DownloadManager.STATUS_SUCCESSFUL) {
                            // Validar e instalar APK
                            validateAndInstall(apkFile, updateInfo)
                        } else {
                            Log.e(TAG, "Download falhou com status: $status")
                            handleDownloadError(updateInfo)
                        }
                    }
                    
                    cursor.close()
                    unregisterDownloadReceiver()
                }
            }
        }
        
        context.registerReceiver(
            downloadReceiver,
            IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE)
        )
    }

    /**
     * Remove registro do receiver
     */
    private fun unregisterDownloadReceiver() {
        downloadReceiver?.let {
            try {
                context.unregisterReceiver(it)
            } catch (e: Exception) {
                Log.e(TAG, "Erro ao remover receiver: ${e.message}")
            }
        }
        downloadReceiver = null
    }

    /**
     * Valida e instala o APK
     */
    private fun validateAndInstall(apkFile: File, updateInfo: UpdateInfo) {
        updateScope.launch {
            try {
                // Validar arquivo
                if (!apkFile.exists() || !apkFile.canRead()) {
                    Log.e(TAG, "APK não encontrado ou não pode ser lido")
                    handleDownloadError(updateInfo)
                    return@launch
                }

                // Validar tamanho mínimo (1MB)
                if (apkFile.length() < 1024 * 1024) {
                    Log.e(TAG, "APK muito pequeno, possivelmente corrompido")
                    handleDownloadError(updateInfo)
                    return@launch
                }

                Log.d(TAG, "APK validado, iniciando instalação...")
                
                // Instalar APK
                installApk(apkFile)
                
            } catch (e: Exception) {
                Log.e(TAG, "Erro ao validar/instalar APK: ${e.message}")
                handleDownloadError(updateInfo)
            }
        }
    }

    /**
     * Instala o APK
     */
    private fun installApk(apkFile: File) {
        try {
            val intent = Intent(Intent.ACTION_VIEW).apply {
                val uri = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                    // Android 7.0+ requer FileProvider
                    FileProvider.getUriForFile(
                        context,
                        "${context.packageName}.fileprovider",
                        apkFile
                    )
                } else {
                    Uri.fromFile(apkFile)
                }
                
                setDataAndType(uri, "application/vnd.android.package-archive")
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_GRANT_READ_URI_PERMISSION
            }

            Log.d(TAG, "Iniciando instalação do APK")
            context.startActivity(intent)
            
            // Após instalação, o app será reiniciado automaticamente
            // O BootReceiver ou MainActivity retomará o streaming
            
        } catch (e: Exception) {
            Log.e(TAG, "Erro ao instalar APK: ${e.message}")
            // Tentar método alternativo se disponível
            tryAlternativeInstall(apkFile)
        }
    }

    /**
     * Método alternativo de instalação (fallback)
     */
    private fun tryAlternativeInstall(apkFile: File) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                val packageInstaller = context.packageManager.packageInstaller
                val sessionParams = PackageInstaller.SessionParams(PackageInstaller.SessionParams.MODE_FULL_INSTALL)
                val sessionId = packageInstaller.createSession(sessionParams)
                val session = packageInstaller.openSession(sessionId)
                
                val inputStream = FileInputStream(apkFile)
                val outputStream = session.openWrite("update", 0, -1)
                
                inputStream.copyTo(outputStream)
                session.fsync(outputStream)
                inputStream.close()
                outputStream.close()
                
                val intent = Intent(context, InstallResultReceiver::class.java)
                val pendingIntent = android.app.PendingIntent.getBroadcast(
                    context,
                    0,
                    intent,
                    android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
                )
                
                session.commit(pendingIntent.intentSender)
                session.close()
                
                Log.d(TAG, "Instalação alternativa iniciada")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Erro no método alternativo: ${e.message}")
            isDownloading = false
        }
    }

    /**
     * Trata erros na verificação
     */
    private fun handleCheckError() {
        retryCount++
        if (retryCount < MAX_RETRIES) {
            val delay = retryCount * 60000L // 1, 2, 3 minutos
            Log.d(TAG, "Tentando novamente em ${delay}ms (tentativa $retryCount/$MAX_RETRIES)")
            updateScope.launch {
                delay(delay)
                checkForUpdate()
            }
        } else {
            Log.e(TAG, "Máximo de tentativas atingido")
            retryCount = 0
        }
    }

    /**
     * Trata erros no download
     */
    private fun handleDownloadError(updateInfo: UpdateInfo) {
        isDownloading = false
        retryCount++
        
        if (retryCount < MAX_RETRIES) {
            val delay = retryCount * 5 * 60 * 1000L // 5, 10, 15 minutos
            Log.d(TAG, "Tentando baixar novamente em ${delay}ms (tentativa $retryCount/$MAX_RETRIES)")
            updateScope.launch {
                delay(delay)
                downloadUpdate(updateInfo)
            }
        } else {
            Log.e(TAG, "Máximo de tentativas de download atingido")
            retryCount = 0
            
            // Se for atualização obrigatória, tentar novamente após mais tempo
            if (updateInfo.force_update) {
                updateScope.launch {
                    delay(60 * 60 * 1000L) // 1 hora
                    checkForUpdate()
                }
            }
        }
    }

    /**
     * Limpa recursos
     */
    fun cleanup() {
        unregisterDownloadReceiver()
    }
}


