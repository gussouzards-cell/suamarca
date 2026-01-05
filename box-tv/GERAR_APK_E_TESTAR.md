# 📱 Gerar APK e Testar no Android Studio

Guia completo para testar o app e gerar APK para TV Box.

---

## 🧪 PARTE 1: TESTAR NO ANDROID STUDIO

### ✅ Sim, você pode testar no Android Studio!

### Passo 1: Abrir Projeto

1. **Abrir Android Studio**
2. **File > Open**
3. **Selecione a pasta:** `android-app`
4. **Aguarde sincronização do Gradle** (pode demorar alguns minutos na primeira vez)

### Passo 2: Configurar URL da API

**IMPORTANTE:** Para testar no emulador, use IP especial:

1. **Edite:** `app/src/main/java/com/radioindoor/app/data/api/ApiClient.kt`

2. **Para emulador Android:**
   ```kotlin
   // Emulador usa 10.0.2.2 para acessar localhost do PC
   private const val BASE_URL = "http://10.0.2.2:3000/api/"
   ```

3. **Para dispositivo físico (via USB ou rede):**
   ```kotlin
   // Use o IP da sua máquina na rede local
   private const val BASE_URL = "http://192.168.1.100:3000/api/"
   ```
   (Substitua pelo IP do seu PC)

### Passo 3: Criar AVD (Android Virtual Device)

1. **Tools > Device Manager**
2. **Create Device**
3. **Escolha:** TV (Android TV)
   - Ou Phone/Tablet (para testar)
4. **Selecione sistema:**
   - Recomendado: **Android 9.0 (API 28)** ou superior
   - Download se necessário
5. **Finish**

### Passo 4: Executar App

1. **Selecione o AVD** na barra superior
2. **Clique no botão Run** (▶️) ou pressione `Shift + F10`
3. **Aguarde instalação e inicialização**

### Passo 5: Verificar Logs

**Logcat** (aba inferior):
```
RadioIndoor: Application onCreate
RadioIndoor: Device UUID: ...
StreamingService: Service onCreate
```

---

## 📦 PARTE 2: GERAR APK PARA TV BOX

### Opção 1: Via Android Studio (Recomendado)

#### 1. Configurar URL da API para Produção

Edite `ApiClient.kt`:
```kotlin
// Use IP do servidor onde backend está rodando
private const val BASE_URL = "http://192.168.1.100:3000/api/"
```
(Substitua pelo IP real do seu servidor)

#### 2. Build > Generate Signed Bundle / APK

1. **Build > Generate Signed Bundle / APK**
2. **Selecione:** APK
3. **Next**

#### 3. Criar ou Usar Keystore

**Se não tem keystore:**
1. **Create new...**
2. **Caminho:** Escolha onde salvar (ex: `android-app/radio-indoor.keystore`)
3. **Senha:** Crie uma senha forte
4. **Alias:** `radio-indoor`
5. **Validade:** 25 anos (recomendado)
6. **OK**

**Se já tem keystore:**
1. **Choose existing...**
2. Selecione o arquivo `.keystore` ou `.jks`

#### 4. Selecionar Build Variant

- **release** (para produção)
- **debug** (apenas para testes)

#### 5. Finish

O APK estará em:
```
android-app/app/build/outputs/apk/release/app-release.apk
```

---

### Opção 2: Via Linha de Comando

#### 1. Configurar URL da API

Edite `ApiClient.kt` com IP do servidor.

#### 2. Gerar APK Release

```powershell
cd android-app
./gradlew assembleRelease
```

**No Windows:**
```powershell
cd android-app
.\gradlew.bat assembleRelease
```

APK estará em:
```
app/build/outputs/apk/release/app-release.apk
```

#### 3. Assinar APK (Opcional)

Se quiser assinar:
```powershell
# Criar keystore primeiro
keytool -genkey -v -keystore radio-indoor.keystore -alias radio-indoor -keyalg RSA -keysize 2048 -validity 10000

# Assinar APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore radio-indoor.keystore app-release-unsigned.apk radio-indoor
```

---

## 🔧 CONFIGURAÇÕES IMPORTANTES

### 1. URL da API

**Para Emulador:**
```kotlin
private const val BASE_URL = "http://10.0.2.2:3000/api/"
```

**Para Dispositivo Físico (mesma rede):**
```kotlin
private const val BASE_URL = "http://192.168.1.100:3000/api/"
```

**Para Produção (servidor remoto):**
```kotlin
private const val BASE_URL = "http://seu-servidor.com:3000/api/"
```

### 2. Descobrir IP do PC

**Windows:**
```powershell
ipconfig
# Procure por "IPv4 Address"
```

**Linux/macOS:**
```bash
ifconfig
# ou
ip addr
```

### 3. Verificar Conectividade

**Do emulador/dispositivo:**
```bash
# Via ADB
adb shell ping 10.0.2.2  # Para emulador
adb shell ping 192.168.1.100  # Para dispositivo físico
```

---

## 📋 CHECKLIST ANTES DE GERAR APK

- [ ] URL da API configurada corretamente
- [ ] Backend está rodando e acessível
- [ ] Banco de dados criado (`radio_indoor`)
- [ ] Versão incrementada (se necessário)
- [ ] Testado no emulador/dispositivo

---

## 🚀 INSTALAR APK NA TV BOX

### Via ADB

```bash
# Conectar TV Box
adb connect IP_DA_TV_BOX:5555

# Instalar
adb install app-release.apk

# Configurar Kiosk
adb shell pm set-home-activity com.radioindoor.app/.MainActivity
```

### Via USB/Pen Drive

1. Copie APK para pen drive
2. Conecte na TV Box
3. Instale via gerenciador de arquivos

---

## 🐛 TROUBLESHOOTING

### Erro: "Cannot resolve symbol"

**Solução:**
- File > Invalidate Caches / Restart
- Build > Clean Project
- Build > Rebuild Project

### Erro: "Gradle sync failed"

**Solução:**
- Verifique conexão com internet
- File > Settings > Build > Gradle
- Use Gradle wrapper

### App não conecta à API no emulador

**Solução:**
- Use `10.0.2.2` ao invés de `localhost`
- Verifique se backend está rodando
- Verifique firewall do Windows

### App não conecta em dispositivo físico

**Solução:**
- Use IP da máquina (não localhost)
- Verifique se estão na mesma rede Wi-Fi
- Desative firewall temporariamente para testar

---

## 📝 RESUMO RÁPIDO

### Testar no Android Studio:
```
1. Abrir projeto android-app
2. Configurar URL: http://10.0.2.2:3000/api/ (emulador)
3. Criar AVD (TV ou Phone)
4. Run (▶️)
```

### Gerar APK:
```
1. Configurar URL: http://IP_DO_SERVIDOR:3000/api/
2. Build > Generate Signed Bundle / APK
3. Criar/Usar keystore
4. Selecionar release
5. APK em: app/build/outputs/apk/release/
```

---

**Pronto para testar e gerar APK! 🚀**

