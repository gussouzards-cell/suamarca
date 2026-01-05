# App Android - Rádio Indoor

## Configuração e Build

### 1. Pré-requisitos

- Android Studio Arctic Fox ou superior
- Android SDK 23+ (Android 6.0+)
- Gradle 8.0+

### 2. Configurar URL da API

Edite o arquivo:
```
app/src/main/java/com/radioindoor/app/data/api/ApiClient.kt
```

Altere a constante `BASE_URL`:
```kotlin
private const val BASE_URL = "http://SEU_IP:3000/api/"
```

**Importante:** Use o IP da máquina onde o backend está rodando, não `localhost`.

### 3. Build do APK

#### Opção 1: Via Android Studio

1. Abra o projeto no Android Studio
2. Build > Generate Signed Bundle / APK
3. Selecione **APK**
4. Crie uma keystore (ou use debug para testes)
5. Selecione **release** build variant
6. Clique em Finish

#### Opção 2: Via linha de comando

```bash
cd android-app
./gradlew assembleRelease
```

O APK estará em: `app/build/outputs/apk/release/app-release.apk`

### 4. Instalação na TV Box

#### Via ADB:

```bash
adb install app-release.apk
```

#### Via USB/Pen Drive:

1. Copie o APK para um pen drive
2. Conecte na TV Box
3. Instale via gerenciador de arquivos

### 5. Configurar Kiosk Mode

#### Método 1: Via Configurações

1. Vá em **Configurações > Apps > Rádio Indoor**
2. Procure opção **"App padrão"** ou **"Launcher padrão"**
3. Selecione **Rádio Indoor**

#### Método 2: Via ADB

```bash
adb shell pm set-home-activity com.radioindoor.app/.MainActivity
```

#### Método 3: Via ADB (Lock Task Mode)

```bash
adb shell dpm set-device-owner com.radioindoor.app/.DeviceAdminReceiver
```

**Nota:** Método 3 requer Device Admin, que não está implementado neste projeto básico.

### 6. Testar Auto Start

```bash
# Reiniciar TV Box via ADB
adb reboot

# Ou desligar e ligar manualmente
```

O app deve iniciar automaticamente após o boot.

### 7. Verificar Logs

```bash
# Logs gerais
adb logcat

# Logs do app
adb logcat | grep RadioIndoor

# Logs do serviço de streaming
adb logcat | grep StreamingService
```

### 8. Permissões

O app solicita permissões automaticamente. Certifique-se de permitir:
- ✅ Internet
- ✅ Acesso à rede
- ✅ Notificações (Android 13+)
- ✅ Iniciar ao iniciar o sistema

### 9. Troubleshooting

#### App não inicia automaticamente
- Verifique se BootReceiver está no manifest
- Verifique permissão RECEIVE_BOOT_COMPLETED
- Teste manualmente:
  ```bash
  adb shell am broadcast -a android.intent.action.BOOT_COMPLETED
  ```

#### Streaming não funciona
- Verifique URL da API
- Verifique se backend está acessível da TV Box
- Verifique logs: `adb logcat | grep StreamingService`

#### Kiosk Mode não funciona
- Alguns dispositivos requerem configuração adicional
- Tente definir como launcher padrão manualmente
- Verifique se Lock Task Mode está ativo nos logs

#### Horário não sincroniza
- Sincronização NTP apenas valida, não ajusta (requer root)
- Em dispositivos root, pode usar comandos adicionais

### 10. Estrutura do Código

```
app/src/main/java/com/radioindoor/app/
├── MainActivity.kt              # Activity principal (Kiosk Mode)
├── BootReceiver.kt             # Auto Start
├── RadioIndoorApplication.kt   # Application class
├── service/
│   └── StreamingForegroundService.kt  # Serviço de streaming
├── data/
│   ├── ConfigRepository.kt    # Gerenciamento de configuração
│   ├── api/
│   │   └── ApiClient.kt        # Cliente Retrofit
│   └── model/
│       └── DeviceConfig.kt     # Modelo de dados
└── utils/
    ├── DeviceManager.kt        # Gerenciamento de UUID
    └── NtpTimeSyncManager.kt   # Sincronização NTP
```

### 11. Personalização

#### Alterar intervalo de atualização de configuração

Edite `StreamingForegroundService.kt`:
```kotlin
private const val CONFIG_UPDATE_INTERVAL = 5 * 60 * 1000L // 5 minutos
```

#### Alterar intervalo de heartbeat

Edite `RadioIndoorApplication.kt`:
```kotlin
delay(60000) // 1 minuto
```

#### Adicionar logo na tela

1. Adicione imagem em `res/drawable/logo.png`
2. Descomente código em `activity_main.xml`
3. Descomente código em `MainActivity.kt`

### 12. Build Release Assinado

Para produção, use um certificado válido:

1. Gere keystore:
```bash
keytool -genkey -v -keystore radio-indoor.keystore -alias radio-indoor -keyalg RSA -keysize 2048 -validity 10000
```

2. Configure em `app/build.gradle.kts`:
```kotlin
android {
    signingConfigs {
        create("release") {
            storeFile = file("radio-indoor.keystore")
            storePassword = "sua_senha"
            keyAlias = "radio-indoor"
            keyPassword = "sua_senha"
        }
    }
    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("release")
        }
    }
}
```

---

**Pronto para uso em produção!**







