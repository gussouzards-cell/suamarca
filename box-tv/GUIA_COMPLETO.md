# 📚 Guia Completo - Sistema Rádio Indoor

Guia passo a passo para entender e usar todo o sistema criado.

---

## 📖 ÍNDICE

1. [Visão Geral do Sistema](#visão-geral)
2. [Arquitetura e Componentes](#arquitetura)
3. [Instalação Completa](#instalação)
4. [Como Usar Cada Parte](#como-usar)
5. [Fluxo de Funcionamento](#fluxo)
6. [Exemplos Práticos](#exemplos)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 VISÃO GERAL DO SISTEMA

### O que foi criado?

Um sistema completo de **Rádio Indoor** com 3 componentes principais:

1. **📱 App Android** - Roda nas TV Boxes em modo Kiosk
2. **🔧 Backend API** - Gerencia dispositivos e configurações
3. **🌐 Painel Web** - Interface para administrar tudo

### O que o sistema faz?

- TV Boxes tocam rádio 24/7 automaticamente
- Você controla tudo remotamente pelo painel web
- Sistema se atualiza sozinho (OTA)
- Funciona sem intervenção manual

---

## 🏗️ ARQUITETURA E COMPONENTES

### 1. APP ANDROID (TV Box)

**Localização:** `android-app/`

**O que faz:**
- Inicia sozinho quando TV Box liga
- Toca streaming de rádio continuamente
- Busca configurações remotamente
- Se atualiza automaticamente

**Componentes principais:**

```
MainActivity.kt
├── Kiosk Mode (bloqueia saída do app)
├── Inicia serviços
└── Tela preta (headless)

BootReceiver.kt
└── Auto Start (inicia no boot)

StreamingForegroundService.kt
├── ExoPlayer (toca áudio)
├── Retry automático
└── WakeLock (não deixa dormir)

ConfigRepository.kt
├── Busca config da API
└── Cache local (fallback)

UpdateManager.kt
├── Verifica atualizações
├── Baixa APK
└── Instala automaticamente
```

### 2. BACKEND API

**Localização:** `backend/`

**O que faz:**
- Gerencia dispositivos (TV Boxes)
- Armazena configurações
- Fornece informações de atualização

**Endpoints principais:**

```
POST   /api/devices/register        - Registra TV Box
GET    /api/devices/{uuid}/config   - Pega configuração
POST   /api/devices/{uuid}/heartbeat - Atualiza status
PUT    /api/devices/{uuid}          - Atualiza config
GET    /api/devices                 - Lista todas
GET    /api/update/check            - Verifica atualização
```

### 3. PAINEL ADMINISTRATIVO

**Localização:** `admin-panel/`

**O que faz:**
- Mostra todas as TV Boxes
- Permite editar configurações
- Mostra status online/offline

**Componentes:**

```
Login.tsx          - Tela de login
DeviceList.tsx     - Lista de dispositivos
DeviceCard.tsx     - Card individual
DeviceEditModal.tsx - Editar configuração
```

---

## 🚀 INSTALAÇÃO COMPLETA

### PASSO 1: Preparar Ambiente

#### 1.1. Instalar Node.js

**Windows:**
- Baixe: https://nodejs.org/
- Instale (versão 18+)
- Abra PowerShell e teste:
  ```powershell
  node --version
  npm --version
  ```

**Linux/macOS:**
```bash
# Verificar se já tem
node --version

# Se não tiver, instale:
# Ubuntu/Debian:
sudo apt install nodejs npm

# macOS:
brew install node
```

#### 1.2. Instalar PostgreSQL

**Windows:**
- Baixe: https://www.postgresql.org/download/windows/
- Instale
- Anote a senha do usuário `postgres`

**Linux:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

#### 1.3. Criar Banco de Dados

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar banco
CREATE DATABASE radio_indoor;

# Sair
\q
```

#### 1.4. Instalar Android Studio

- Baixe: https://developer.android.com/studio
- Instale
- Configure Android SDK (API 23+)

---

### PASSO 2: Configurar Backend

#### 2.1. Instalar Dependências

```bash
cd backend
npm install
```

#### 2.2. Configurar Variáveis de Ambiente

Crie arquivo `.env` na pasta `backend/`:

```env
# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
DB_NAME=radio_indoor

# Servidor
PORT=3000
NODE_ENV=development

# Painel Admin
ADMIN_PANEL_URL=http://localhost:3001

# OTA Update (opcional)
APK_URL=http://seu-ip:3000/downloads/app-release.apk
```

**⚠️ IMPORTANTE:** Substitua `sua_senha_aqui` pela senha do PostgreSQL!

#### 2.3. Iniciar Backend

```bash
npm run start:dev
```

**Verificar:** Abra navegador em `http://localhost:3000/api/devices`
- Deve retornar: `[]` (array vazio)

---

### PASSO 3: Configurar Painel Admin

#### 3.1. Instalar Dependências

```bash
cd admin-panel
npm install
```

#### 3.2. Configurar URL da API

Crie arquivo `.env.local` na pasta `admin-panel/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

**Se backend estiver em outra máquina:**
```env
NEXT_PUBLIC_API_URL=http://192.168.1.100:3000/api
```

#### 3.3. Iniciar Painel

```bash
npm run dev
```

**Acessar:** `http://localhost:3001`

**Login padrão:**
- Usuário: `admin`
- Senha: `admin`

---

### PASSO 4: Preparar App Android

#### 4.1. Abrir Projeto

1. Abra Android Studio
2. File > Open
3. Selecione pasta `android-app`
4. Aguarde sincronização do Gradle

#### 4.2. Configurar URL da API

Edite: `app/src/main/java/com/radioindoor/app/data/api/ApiClient.kt`

```kotlin
// Linha 35 - Altere para IP do seu servidor
private const val BASE_URL = "http://192.168.1.100:3000/api/"
```

**⚠️ IMPORTANTE:**
- Use IP da máquina onde backend está rodando
- NÃO use `localhost` ou `127.0.0.1`
- A TV Box precisa conseguir acessar este IP

**Como descobrir seu IP:**

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

#### 4.3. Build do APK

**Opção 1: Via Android Studio**

1. Build > Generate Signed Bundle / APK
2. Selecione **APK**
3. Crie keystore (ou use debug)
4. Selecione **release**
5. Finish

**Opção 2: Via Linha de Comando**

```bash
cd android-app
./gradlew assembleRelease
```

APK estará em: `app/build/outputs/apk/release/app-release.apk`

---

### PASSO 5: Instalar na TV Box

#### 5.1. Habilitar ADB

**Na TV Box:**
1. Configurações > Sobre
2. Clique 7 vezes em "Número da compilação"
3. Volte > "Opções do desenvolvedor"
4. Ative "Depuração USB"

#### 5.2. Conectar TV Box

**Via USB:**
- Conecte cabo USB
- Autorize depuração na TV Box

**Via Rede (ADB over Network):**
```bash
# Na TV Box, anote o IP
# No computador:
adb connect IP_DA_TV_BOX:5555
```

#### 5.3. Instalar APK

```bash
adb install app-release.apk
```

**Ou manualmente:**
- Copie APK para pen drive
- Conecte na TV Box
- Instale via gerenciador de arquivos

#### 5.4. Configurar Kiosk Mode

**Via ADB:**
```bash
adb shell pm set-home-activity com.radioindoor.app/.MainActivity
```

**Ou manualmente:**
1. Configurações > Apps > Rádio Indoor
2. "App padrão" ou "Launcher padrão"
3. Selecione Rádio Indoor

#### 5.5. Testar

```bash
# Reiniciar TV Box
adb reboot
```

O app deve iniciar automaticamente!

---

## 📱 COMO USAR CADA PARTE

### 1. USANDO O PAINEL ADMINISTRATIVO

#### Acessar Painel

1. Abra navegador: `http://localhost:3001`
2. Login: `admin` / `admin`

#### Ver Dispositivos

- Lista mostra todas as TV Boxes
- **Verde** = Online (último contato < 2 min)
- **Cinza** = Offline

#### Configurar Primeira TV Box

1. Quando TV Box aparecer na lista:
   - Clique em **"Editar Configuração"**
2. Preencha:
   - **Nome:** Ex: "TV Box Sala 1"
   - **URL de Streaming:** Ex: `https://exemplo.com/stream.mp3`
   - **Volume:** 50%
   - **Status:** Ativo
3. Clique em **"Salvar"**

**Onde encontrar URLs de streaming?**
- Rádios online: https://www.internet-radio.com/
- Shoutcast: https://www.shoutcast.com/
- Icecast: https://dir.xiph.org/

#### Atualizar Configuração

1. Clique em **"Editar Configuração"** no card
2. Altere o que precisar
3. Clique em **"Salvar"**
4. TV Box atualiza em até 5 minutos

#### Pausar/Retomar Rádio

1. Edite configuração
2. **Status:** Inativo (pausa) ou Ativo (retoma)
3. Salve

---

### 2. USANDO O APP ANDROID

#### O que acontece automaticamente:

1. **Ao ligar TV Box:**
   - App inicia sozinho
   - Busca configuração da API
   - Inicia streaming

2. **Durante uso:**
   - Atualiza configuração a cada 5 min
   - Envia heartbeat a cada 1 min
   - Verifica atualização a cada 6 horas

3. **Se streaming cair:**
   - Reconecta automaticamente
   - Retry exponencial (5s, 10s, 20s...)

#### Ver Logs

```bash
# Logs gerais
adb logcat

# Logs do app
adb logcat | grep RadioIndoor

# Logs de streaming
adb logcat | grep StreamingService

# Logs de atualização
adb logcat | grep UpdateManager
```

#### Forçar Verificação de Atualização

```bash
# Reiniciar app
adb shell am force-stop com.radioindoor.app
adb shell am start -n com.radioindoor.app/.MainActivity
```

---

### 3. USANDO O BACKEND API

#### Testar Endpoints Manualmente

**Listar dispositivos:**
```bash
curl http://localhost:3000/api/devices
```

**Registrar dispositivo:**
```bash
curl -X POST http://localhost:3000/api/devices/register \
  -H "Content-Type: application/json" \
  -d '{
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "nome": "TV Box Teste"
  }'
```

**Verificar atualização:**
```bash
curl http://localhost:3000/api/update/check
```

#### Configurar Atualização OTA

Edite `backend/src/update/update.service.ts`:

```typescript
async getUpdateInfo() {
  return {
    latest_version: 2, // ← Incremente quando tiver nova versão
    apk_url: process.env.APK_URL || 'http://seu-ip:3000/downloads/app-release.apk',
    force_update: false, // ← true para obrigar atualização
  };
}
```

**Para publicar atualização:**

1. Incremente `versionCode` no `build.gradle.kts`:
   ```kotlin
   versionCode = 2  // Era 1, agora é 2
   versionName = "1.0.1"
   ```

2. Gere novo APK:
   ```bash
   ./gradlew assembleRelease
   ```

3. Faça upload do APK para servidor web

4. Atualize `latest_version` no backend

5. App atualiza automaticamente em até 6 horas

---

## 🔄 FLUXO DE FUNCIONAMENTO

### Fluxo Completo

```
1. TV Box Liga
   ↓
2. BootReceiver detecta boot
   ↓
3. MainActivity inicia (Kiosk Mode)
   ↓
4. StreamingForegroundService inicia
   ↓
5. ConfigRepository busca config da API
   ↓
6. ExoPlayer toca streaming
   ↓
7. A cada 5 min: atualiza config
   ↓
8. A cada 1 min: envia heartbeat
   ↓
9. A cada 6 horas: verifica atualização
```

### Fluxo de Atualização OTA

```
1. UpdateManager verifica API
   ↓
2. API retorna latest_version > atual?
   ↓
3. SIM → DownloadManager baixa APK
   ↓
4. Valida APK (tamanho, existência)
   ↓
5. Instala APK automaticamente
   ↓
6. App reinicia
   ↓
7. Streaming retoma normalmente
```

### Fluxo de Configuração Remota

```
1. Admin edita no painel web
   ↓
2. Painel envia PUT /api/devices/{uuid}
   ↓
3. Backend salva no PostgreSQL
   ↓
4. TV Box busca GET /api/devices/{uuid}/config
   ↓
5. ConfigRepository atualiza cache
   ↓
6. StreamingForegroundService aplica mudanças
   ↓
7. ExoPlayer ajusta volume/URL
```

---

## 💡 EXEMPLOS PRÁTICOS

### Exemplo 1: Configurar Primeira TV Box

**Cenário:** Você acabou de instalar o app na TV Box.

**Passos:**

1. **Verificar se TV Box apareceu:**
   - Acesse painel: `http://localhost:3001`
   - Veja se aparece na lista (pode demorar 1 minuto)

2. **Se não aparecer, obter UUID:**
   ```bash
   adb logcat | grep "Device UUID"
   # Ou
   adb shell cat /data/data/com.radioindoor.app/shared_prefs/device_prefs.xml
   ```

3. **Registrar manualmente (se necessário):**
   ```bash
   curl -X POST http://localhost:3000/api/devices/register \
     -H "Content-Type: application/json" \
     -d '{
       "uuid": "UUID_DA_TV_BOX",
       "nome": "TV Box Sala 1"
     }'
   ```

4. **Configurar no painel:**
   - Clique em "Editar Configuração"
   - URL: `https://stream.example.com/radio.mp3`
   - Volume: 50%
   - Status: Ativo
   - Salvar

5. **Verificar:**
   ```bash
   adb logcat | grep StreamingService
   # Deve mostrar: "Iniciando streaming: https://..."
   ```

### Exemplo 2: Mudar Volume Remotamente

**Cenário:** Volume está muito alto, precisa diminuir.

**Passos:**

1. Acesse painel admin
2. Clique em "Editar Configuração" da TV Box
3. Altere Volume: 50% → 30%
4. Clique em "Salvar"
5. Em até 5 minutos, volume muda automaticamente

### Exemplo 3: Publicar Nova Versão

**Cenário:** Você fez melhorias no app e quer atualizar todas as TV Boxes.

**Passos:**

1. **Incrementar versão:**
   - Edite `android-app/app/build.gradle.kts`
   ```kotlin
   versionCode = 2  // Era 1
   versionName = "1.0.1"
   ```

2. **Build novo APK:**
   ```bash
   cd android-app
   ./gradlew assembleRelease
   ```

3. **Hospedar APK:**
   - Faça upload para servidor web
   - Exemplo: `http://seu-ip:3000/downloads/app-release-v2.apk`

4. **Atualizar backend:**
   - Edite `backend/src/update/update.service.ts`
   ```typescript
   latest_version: 2,
   apk_url: 'http://seu-ip:3000/downloads/app-release-v2.apk',
   ```

5. **Reiniciar backend:**
   ```bash
   # Backend reinicia automaticamente em dev mode
   # Ou em produção:
   pm2 restart radio-indoor-api
   ```

6. **Aguardar:**
   - TV Boxes verificam a cada 6 horas
   - Ou reinicie manualmente para atualizar imediatamente

### Exemplo 4: Pausar Todas as TV Boxes

**Cenário:** Fim de semana, precisa pausar todas.

**Passos:**

1. Acesse painel admin
2. Para cada TV Box:
   - Clique em "Editar Configuração"
   - Status: Inativo
   - Salvar

**Ou via API (script):**
```bash
# Listar todas
curl http://localhost:3000/api/devices > devices.json

# Para cada UUID, pausar:
curl -X PUT http://localhost:3000/api/devices/{uuid} \
  -H "Content-Type: application/json" \
  -d '{"status": "inactive"}'
```

---

## 🐛 TROUBLESHOOTING

### Problema: Backend não inicia

**Sintomas:**
- Erro ao rodar `npm run start:dev`
- Erro de conexão com banco

**Soluções:**

1. **Verificar PostgreSQL:**
   ```bash
   # Linux
   sudo systemctl status postgresql
   
   # Verificar se está rodando
   psql -U postgres -c "SELECT version();"
   ```

2. **Verificar credenciais:**
   - Abra `.env`
   - Confirme DB_USER, DB_PASSWORD, DB_NAME

3. **Verificar porta:**
   ```bash
   # Ver se porta 3000 está livre
   netstat -an | grep 3000
   ```

### Problema: Painel não conecta ao backend

**Sintomas:**
- Erro "Erro de conexão" no painel
- Lista vazia mesmo com dispositivos

**Soluções:**

1. **Verificar URL da API:**
   - Abra `.env.local`
   - Confirme `NEXT_PUBLIC_API_URL`

2. **Verificar CORS:**
   - Backend deve permitir origem do painel
   - Verifique `backend/src/main.ts`

3. **Testar API diretamente:**
   ```bash
   curl http://localhost:3000/api/devices
   ```

### Problema: TV Box não conecta ao backend

**Sintomas:**
- Logs mostram erro de conexão
- Configuração não atualiza

**Soluções:**

1. **Verificar IP no ApiClient.kt:**
   - Deve ser IP do servidor, não localhost

2. **Testar conectividade:**
   ```bash
   # Na TV Box (via ADB)
   adb shell ping IP_DO_SERVIDOR
   ```

3. **Verificar firewall:**
   - Porta 3000 deve estar aberta
   - Backend deve aceitar conexões externas

### Problema: Streaming não funciona

**Sintomas:**
- App inicia mas não toca áudio
- Logs mostram erro no ExoPlayer

**Soluções:**

1. **Verificar URL de streaming:**
   - Teste URL em outro player (VLC)
   - URL deve ser acessível da TV Box

2. **Verificar logs:**
   ```bash
   adb logcat | grep StreamingService
   ```

3. **Verificar permissões:**
   - App precisa de INTERNET
   - Verifique no AndroidManifest.xml

### Problema: App não inicia automaticamente

**Sintomas:**
- TV Box liga mas app não abre
- Precisa abrir manualmente

**Soluções:**

1. **Verificar BootReceiver:**
   ```bash
   adb shell dumpsys package com.radioindoor.app | grep receiver
   ```

2. **Testar manualmente:**
   ```bash
   adb shell am broadcast -a android.intent.action.BOOT_COMPLETED
   ```

3. **Verificar permissões:**
   - RECEIVE_BOOT_COMPLETED deve estar no manifest

### Problema: Atualização OTA não funciona

**Sintomas:**
- App não atualiza automaticamente
- Download falha

**Soluções:**

1. **Verificar endpoint:**
   ```bash
   curl http://localhost:3000/api/update/check
   ```

2. **Verificar URL do APK:**
   - APK deve estar acessível
   - Teste URL no navegador

3. **Verificar permissões:**
   - REQUEST_INSTALL_PACKAGES
   - "Instalar de fontes desconhecidas" habilitado

4. **Ver logs:**
   ```bash
   adb logcat | grep UpdateManager
   ```

---

## 📊 MONITORAMENTO

### Ver Status das TV Boxes

**Via Painel:**
- Acesse `http://localhost:3001`
- Veja status online/offline em tempo real

**Via API:**
```bash
curl http://localhost:3000/api/devices | jq
```

### Ver Logs em Tempo Real

```bash
# Todos os logs
adb logcat

# Apenas do app
adb logcat | grep RadioIndoor

# Streaming
adb logcat | grep StreamingService

# Atualizações
adb logcat | grep UpdateManager

# Configuração
adb logcat | grep ConfigRepository
```

### Verificar Versão do App

```bash
adb shell dumpsys package com.radioindoor.app | grep versionCode
```

---

## 🎓 CONCEITOS IMPORTANTES

### VersionCode vs VersionName

- **versionCode:** Número inteiro (1, 2, 3...) - usado para comparar versões
- **versionName:** String ("1.0.0", "1.0.1") - apenas para exibição

**Para OTA:** Sempre incremente `versionCode`!

### UUID do Dispositivo

- Gerado automaticamente no primeiro uso
- Persistido localmente
- Usado para identificar TV Box na API
- Não muda mesmo após atualização

### Kiosk Mode

- App funciona como launcher padrão
- Bloqueia botões HOME, BACK
- Não permite sair do app
- Ideal para uso corporativo

### Foreground Service

- Serviço que roda em primeiro plano
- Não é morto pelo Android
- Mostra notificação (mínima)
- Ideal para streaming contínuo

---

## 🚀 PRÓXIMOS PASSOS

### Melhorias Sugeridas

1. **Autenticação Real:**
   - Implementar JWT no backend
   - Proteger endpoints

2. **HTTPS:**
   - Certificado SSL
   - Comunicação segura

3. **Validação de APK:**
   - Checksum MD5/SHA256
   - Verificar assinatura

4. **Notificações:**
   - Alertas de atualização
   - Status de dispositivos

5. **Dashboard:**
   - Gráficos de uso
   - Estatísticas

---

## 📞 RESUMO RÁPIDO

### Comandos Essenciais

```bash
# Iniciar backend
cd backend && npm run start:dev

# Iniciar painel
cd admin-panel && npm run dev

# Build APK
cd android-app && ./gradlew assembleRelease

# Instalar na TV Box
adb install app-release.apk

# Ver logs
adb logcat | grep RadioIndoor
```

### URLs Importantes

- Backend: `http://localhost:3000`
- API: `http://localhost:3000/api`
- Painel: `http://localhost:3001`
- Login: `admin` / `admin`

### Arquivos de Configuração

- Backend: `backend/.env`
- Painel: `admin-panel/.env.local`
- App: `android-app/app/src/main/java/.../ApiClient.kt`

---

**Sistema completo explicado! Agora você sabe usar tudo! 🎉**







