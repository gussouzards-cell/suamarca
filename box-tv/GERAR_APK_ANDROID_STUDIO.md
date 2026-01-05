# 📦 Gerar APK no Android Studio

Guia completo passo a passo para gerar APK do app Rádio Indoor.

---

## 🎯 OPÇÕES DE APK

### 1. **APK Debug** (Desenvolvimento)
- ✅ Mais rápido de gerar
- ✅ Não precisa assinatura
- ❌ Não pode publicar na Play Store
- ✅ Ideal para testes

### 2. **APK Release** (Produção)
- ✅ Otimizado
- ✅ Assinado (seguro)
- ✅ Pode publicar na Play Store
- ⚠️ Precisa configurar assinatura

---

## 🚀 MÉTODO 1: APK DEBUG (Mais Rápido)

### Passo 1: Abrir o Projeto

1. Abra o **Android Studio**
2. Abra o projeto: `android-app`

### Passo 2: Gerar APK Debug

**Opção A: Via Menu**
1. **Build > Build Bundle(s) / APK(s) > Build APK(s)**
2. Aguarde a compilação
3. Quando terminar, clique em **locate** ou **Show in Explorer**

**Opção B: Via Terminal (Gradle)**
```bash
cd android-app
./gradlew assembleDebug
```

**Windows (PowerShell):**
```powershell
cd android-app
.\gradlew.bat assembleDebug
```

### Passo 3: Localizar o APK

O APK estará em:
```
android-app/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🔐 MÉTODO 2: APK RELEASE (Produção)

### Passo 1: Criar Keystore (Assinatura)

**Primeira vez apenas!**

1. **Build > Generate Signed Bundle / APK**
2. Selecione **APK** (não Bundle)
3. Clique em **Create new...**

**Preencha os dados:**
- **Key store path:** Escolha onde salvar (ex: `C:\Users\Saba\Desktop\box-tv\radio-indoor-key.jks`)
- **Password:** Crie uma senha forte (anote!)
- **Key alias:** `radio-indoor-key`
- **Key password:** Mesma senha ou diferente (anote!)
- **Validity:** 25 anos (padrão)
- **Certificate:**
  - First and Last Name: Seu nome
  - Organizational Unit: Sua empresa/unidade
  - Organization: Sua organização
  - City: Sua cidade
  - State: Seu estado
  - Country Code: BR (Brasil)

4. Clique em **OK**

### Passo 2: Gerar APK Release

1. **Build > Generate Signed Bundle / APK**
2. Selecione **APK**
3. Selecione o **keystore** criado
4. Digite a **password**
5. Selecione **release** em **Build Variants**
6. Marque **V1 (Jar Signature)** e **V2 (Full APK Signature)**
7. Clique em **Next**
8. Selecione **release** em **Flavors**
9. Clique em **Finish**

### Passo 3: Localizar o APK

O APK estará em:
```
android-app/app/build/outputs/apk/release/app-release.apk
```

---

## 📋 RESUMO RÁPIDO

### APK Debug (Teste)
```
Build > Build Bundle(s) / APK(s) > Build APK(s)
```
**Localização:** `android-app/app/build/outputs/apk/debug/app-debug.apk`

### APK Release (Produção)
```
Build > Generate Signed Bundle / APK > APK
```
**Localização:** `android-app/app/build/outputs/apk/release/app-release.apk`

---

## 🧪 TESTAR O APK

### 1. Instalar no Emulador

**Via Android Studio:**
- Arraste o APK para o emulador

**Via ADB:**
```bash
adb install app-debug.apk
```

### 2. Instalar na TV Box

**Opção A: USB**
1. Conecte TV Box via USB
2. Copie APK para TV Box
3. Instale via gerenciador de arquivos

**Opção B: Rede**
1. Compartilhe APK na rede
2. Acesse via TV Box
3. Baixe e instale

**Opção C: Pendrive**
1. Copie APK para pendrive
2. Conecte na TV Box
3. Instale via gerenciador de arquivos

---

## ⚙️ CONFIGURAÇÕES IMPORTANTES

### 1. Verificar IP da API

Antes de gerar, verifique se o IP está correto:
```
android-app/app/src/main/java/com/radioindoor/app/data/api/ApiClient.kt
```

Linha 47:
```kotlin
private const val BASE_URL = "http://192.168.1.11:3000/api/"
```

### 2. Verificar Version Code

**Arquivo:** `android-app/app/build.gradle.kts`

```kotlin
android {
    defaultConfig {
        versionCode = 1  // Incremente para cada nova versão
        versionName = "1.0.0"
    }
}
```

**Importante:** Incremente `versionCode` a cada nova versão!

---

## 🐛 PROBLEMAS COMUNS

### Problema 1: "Keystore file not set"

**Solução:**
- Crie um keystore primeiro (Método 2, Passo 1)
- Ou use APK Debug (Método 1)

### Problema 2: "Build failed"

**Solução:**
- Verifique erros no **Build** tab
- Limpe o projeto: **Build > Clean Project**
- Rebuild: **Build > Rebuild Project**

### Problema 3: "APK não instala na TV Box"

**Solução:**
- Verifique se TV Box permite instalação de fontes desconhecidas
- **Settings > Security > Unknown Sources** (habilitar)

### Problema 4: "App não conecta na API"

**Solução:**
- Verifique se IP está correto em `ApiClient.kt`
- Verifique se backend está rodando
- Verifique se TV Box e servidor estão na mesma rede

---

## 💡 DICAS

### Dica 1: Nomear APK

Após gerar, renomeie para facilitar:
```
app-debug.apk → RadioIndoor-v1.0.0-debug.apk
app-release.apk → RadioIndoor-v1.0.0-release.apk
```

### Dica 2: Backup do Keystore

**IMPORTANTE:** Faça backup do arquivo `.jks` (keystore)!
- Sem ele, não consegue atualizar o app
- Guarde em local seguro
- Anote as senhas

### Dica 3: Versionamento

Sempre incremente `versionCode`:
- v1.0.0 → versionCode = 1
- v1.0.1 → versionCode = 2
- v1.1.0 → versionCode = 3
- v2.0.0 → versionCode = 4

---

## 📱 INSTALAR NA TV BOX

### Método 1: Via ADB (USB)

```bash
adb connect IP_DA_TV_BOX
adb install app-release.apk
```

### Método 2: Via Pendrive

1. Copie APK para pendrive
2. Conecte na TV Box
3. Abra gerenciador de arquivos
4. Navegue até pendrive
5. Clique no APK
6. Instale

### Método 3: Via Rede

1. Compartilhe pasta com APK
2. Acesse via TV Box (SMB/FTP)
3. Baixe APK
4. Instale

---

## ✅ CHECKLIST ANTES DE GERAR

- [ ] IP da API configurado corretamente
- [ ] Backend está rodando
- [ ] Version Code atualizado (se nova versão)
- [ ] Testado no emulador (opcional)
- [ ] Keystore criado (se APK Release)

---

## 🎯 RESUMO ULTRA-RÁPIDO

### Debug (Teste):
```
Build > Build Bundle(s) / APK(s) > Build APK(s)
```

### Release (Produção):
```
Build > Generate Signed Bundle / APK > APK
```

**Pronto! Seu APK está em:**
- Debug: `android-app/app/build/outputs/apk/debug/`
- Release: `android-app/app/build/outputs/apk/release/`

---

**Agora é só instalar na TV Box! 🚀**






