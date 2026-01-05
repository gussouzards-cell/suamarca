# Guia de Instalação Completo - Rádio Indoor

Este guia passo a passo ajudará você a instalar e configurar todo o sistema.

---

## 📋 Pré-requisitos

### Servidor (Backend + Painel Admin)

- Node.js 18+ instalado
- PostgreSQL 12+ instalado e rodando
- Acesso à internet
- Portas 3000 (backend) e 3001 (painel) disponíveis

### TV Box

- Android 6.0+ (API 23+)
- Acesso à internet
- ADB habilitado (para instalação)

---

## 🚀 INSTALAÇÃO PASSO A PASSO

### ETAPA 1: Configurar Backend

#### 1.1. Instalar PostgreSQL

**Windows:**
- Baixe em: https://www.postgresql.org/download/windows/
- Instale e anote a senha do usuário `postgres`

**Linux:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

#### 1.2. Criar banco de dados

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar banco
CREATE DATABASE radio_indoor;

# Sair
\q
```

#### 1.3. Configurar Backend

```bash
cd backend
npm install
```

#### 1.4. Configurar variáveis de ambiente

Crie arquivo `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha_postgres
DB_NAME=radio_indoor
PORT=3000
NODE_ENV=development
ADMIN_PANEL_URL=http://localhost:3001
```

#### 1.5. Iniciar Backend

```bash
npm run start:dev
```

**Verificar:** Acesse `http://localhost:3000/api/devices` - deve retornar `[]`

---

### ETAPA 2: Configurar Painel Administrativo

#### 2.1. Instalar dependências

```bash
cd admin-panel
npm install
```

#### 2.2. Configurar URL da API

Crie arquivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

**Importante:** Se o backend estiver em outra máquina, use o IP:
```env
NEXT_PUBLIC_API_URL=http://192.168.1.100:3000/api
```

#### 2.3. Iniciar Painel

```bash
npm run dev
```

**Verificar:** Acesse `http://localhost:3001` - deve mostrar tela de login

---

### ETAPA 3: Preparar App Android

#### 3.1. Abrir projeto no Android Studio

1. Abra Android Studio
2. File > Open > Selecione pasta `android-app`
3. Aguarde sincronização do Gradle

#### 3.2. Configurar URL da API

Edite: `app/src/main/java/com/radioindoor/app/data/api/ApiClient.kt`

```kotlin
// Altere para o IP do seu servidor
private const val BASE_URL = "http://192.168.1.100:3000/api/"
```

**⚠️ IMPORTANTE:** 
- Use o IP da máquina onde o backend está rodando
- Não use `localhost` ou `127.0.0.1`
- A TV Box precisa conseguir acessar este IP

#### 3.3. Build do APK

**Opção 1: Build Debug (para testes)**

```bash
cd android-app
./gradlew assembleDebug
```

APK estará em: `app/build/outputs/apk/debug/app-debug.apk`

**Opção 2: Build Release (para produção)**

1. Android Studio: Build > Generate Signed Bundle / APK
2. Selecione APK
3. Crie keystore (ou use existente)
4. Selecione release
5. Build

---

### ETAPA 4: Instalar na TV Box

#### 4.1. Habilitar ADB na TV Box

1. Vá em Configurações > Sobre
2. Clique 7 vezes em "Número da compilação"
3. Volte e vá em "Opções do desenvolvedor"
4. Ative "Depuração USB"

#### 4.2. Conectar TV Box ao computador

- Via USB (se suportado)
- Ou via rede (ADB over network)

**ADB via rede:**
```bash
# Na TV Box, anote o IP
# No computador:
adb connect IP_DA_TV_BOX:5555
```

#### 4.3. Instalar APK

```bash
adb install app-release.apk
```

Ou copie APK para pen drive e instale manualmente.

#### 4.4. Configurar como Launcher Padrão

**Via ADB:**
```bash
adb shell pm set-home-activity com.radioindoor.app/.MainActivity
```

**Ou manualmente:**
1. Vá em Configurações > Apps > Rádio Indoor
2. Procure "App padrão" ou "Launcher padrão"
3. Selecione Rádio Indoor

#### 4.5. Testar

```bash
# Reiniciar TV Box
adb reboot

# Ou desligar e ligar manualmente
```

O app deve iniciar automaticamente após o boot.

---

## ✅ VERIFICAÇÃO

### 1. Verificar Backend

```bash
# Testar endpoint
curl http://localhost:3000/api/devices

# Deve retornar: []
```

### 2. Verificar Painel Admin

- Acesse `http://localhost:3001`
- Login: `admin` / `admin`
- Deve mostrar lista vazia de dispositivos

### 3. Verificar TV Box

```bash
# Ver logs
adb logcat | grep RadioIndoor

# Deve mostrar:
# - BootReceiver iniciado
# - StreamingForegroundService iniciado
# - Tentativa de buscar configuração da API
```

### 4. Registrar Dispositivo

Quando a TV Box iniciar, ela tentará buscar configuração. Se o dispositivo não existir, você pode registrá-lo manualmente:

```bash
curl -X POST http://localhost:3000/api/devices/register \
  -H "Content-Type: application/json" \
  -d '{
    "uuid": "UUID_DA_TV_BOX",
    "nome": "TV Box Sala 1"
  }'
```

**Para obter UUID da TV Box:**
```bash
adb shell cat /data/data/com.radioindoor.app/shared_prefs/device_prefs.xml
```

Ou verifique logs:
```bash
adb logcat | grep "Device UUID"
```

---

## 🔧 CONFIGURAÇÃO INICIAL

### 1. Configurar Primeira TV Box

1. Acesse painel admin: `http://localhost:3001`
2. Faça login: `admin` / `admin`
3. Quando a TV Box aparecer na lista:
   - Clique em "Editar Configuração"
   - Configure:
     - **Nome:** Ex: "TV Box Sala 1"
     - **URL de Streaming:** Ex: "https://exemplo.com/stream.mp3"
     - **Volume:** 50%
     - **Status:** Ativo
   - Clique em "Salvar"

4. A TV Box deve começar a tocar o streaming automaticamente (atualiza a cada 5 minutos)

### 2. Testar Streaming

- Verifique se a URL de streaming está acessível
- Verifique logs: `adb logcat | grep StreamingService`
- Deve mostrar: "Iniciando streaming: [URL]"

---

## 🐛 TROUBLESHOOTING

### Backend não inicia

- Verifique se PostgreSQL está rodando
- Verifique credenciais no `.env`
- Verifique se porta 3000 está livre

### Painel não conecta ao backend

- Verifique `NEXT_PUBLIC_API_URL` no `.env.local`
- Verifique se backend está rodando
- Verifique CORS no backend

### TV Box não conecta ao backend

- Verifique IP no `ApiClient.kt`
- Verifique se TV Box e servidor estão na mesma rede
- Teste ping: `adb shell ping IP_DO_SERVIDOR`
- Verifique firewall do servidor

### App não inicia automaticamente

- Verifique permissões: `adb shell dumpsys package com.radioindoor.app | grep permission`
- Verifique BootReceiver: `adb shell dumpsys package com.radioindoor.app | grep receiver`
- Teste manualmente: `adb shell am broadcast -a android.intent.action.BOOT_COMPLETED`

### Streaming não funciona

- Verifique URL de streaming
- Verifique logs: `adb logcat | grep StreamingService`
- Verifique se ExoPlayer está funcionando
- Teste URL em outro player

---

## 📊 MONITORAMENTO

### Ver status dos dispositivos

Acesse painel admin e veja:
- Status online/offline
- Último heartbeat
- Configuração atual

### Ver logs

**Backend:**
```bash
# Logs no console onde backend está rodando
```

**TV Box:**
```bash
# Logs gerais
adb logcat

# Logs do app
adb logcat | grep RadioIndoor

# Logs do serviço
adb logcat | grep StreamingService
```

---

## 🚀 PRÓXIMOS PASSOS

1. **Produção:**
   - Configure HTTPS
   - Implemente autenticação real
   - Use certificado SSL válido
   - Configure backup do banco

2. **Escalabilidade:**
   - Configure load balancer
   - Use banco de dados dedicado
   - Configure monitoramento

3. **Segurança:**
   - Implemente JWT
   - Configure firewall
   - Use VPN se necessário

---

**Sistema instalado e pronto para uso! 🎉**







