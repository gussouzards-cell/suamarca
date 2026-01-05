# Rádio Indoor - Sistema Completo

Solução completa de Rádio Indoor composta por:

1. **App Android (Kotlin)** - Para TV Box em Kiosk Mode
2. **Backend API (NestJS)** - API REST para gerenciamento
3. **Painel Administrativo (Next.js)** - Interface web para controle

---

## 📱 PARTE 1 - APP ANDROID TV BOX

### Características

- ✅ Kiosk Mode (Single App)
- ✅ Auto Start no boot
- ✅ Streaming de áudio 24/7 com ExoPlayer
- ✅ Foreground Service persistente
- ✅ Configuração remota via API
- ✅ Sincronização NTP de horário
- ✅ Retry automático de streaming
- ✅ Heartbeat periódico

### Requisitos

- Android Studio Arctic Fox ou superior
- Android SDK 23+ (Android 6.0+)
- Gradle 8.0+

### Configuração

1. **Abrir projeto no Android Studio:**
   ```bash
   cd android-app
   ```

2. **Configurar URL da API:**
   Edite `app/src/main/java/com/radioindoor/app/data/api/ApiClient.kt`:
   ```kotlin
   private const val BASE_URL = "http://SEU_IP:3000/api/"
   ```

3. **Build do APK:**
   - Build > Generate Signed Bundle / APK
   - Selecione APK
   - Crie uma keystore (ou use debug)
   - Selecione release build variant
   - Clique em Finish

### Instalação na TV Box

1. **Habilitar Kiosk Mode:**
   - Instale o APK na TV Box
   - Vá em Configurações > Apps > Rádio Indoor
   - Defina como app padrão (Launcher)
   - Ou use ADB:
     ```bash
     adb shell pm set-home-activity com.radioindoor.app/.MainActivity
     ```

2. **Permissões:**
   - O app solicita permissões automaticamente
   - Certifique-se de permitir todas as permissões

3. **Teste:**
   - Reinicie a TV Box
   - O app deve iniciar automaticamente
   - O streaming deve começar após buscar configuração da API

### Estrutura do Projeto

```
android-app/
├── app/
│   ├── src/main/
│   │   ├── java/com/radioindoor/app/
│   │   │   ├── MainActivity.kt          # Kiosk Mode
│   │   │   ├── BootReceiver.kt          # Auto Start
│   │   │   ├── service/
│   │   │   │   └── StreamingForegroundService.kt  # Streaming
│   │   │   ├── data/
│   │   │   │   ├── ConfigRepository.kt   # Config remota
│   │   │   │   └── api/
│   │   │   │       └── ApiClient.kt      # Retrofit
│   │   │   └── utils/
│   │   │       ├── DeviceManager.kt      # UUID
│   │   │       └── NtpTimeSyncManager.kt # NTP Sync
│   │   └── AndroidManifest.xml
│   └── build.gradle.kts
```

---

## 🔧 PARTE 2 - BACKEND API (NestJS)

### Características

- ✅ API REST completa
- ✅ PostgreSQL como banco de dados
- ✅ Endpoints para dispositivos
- ✅ Heartbeat tracking
- ✅ CORS habilitado

### Requisitos

- Node.js 18+
- PostgreSQL 12+
- npm ou yarn

### Configuração

1. **Instalar dependências:**
   ```bash
   cd backend
   npm install
   ```

2. **Configurar banco de dados:**
   - Crie um banco PostgreSQL:
     ```sql
     CREATE DATABASE radio_indoor;
     ```
   - Copie `.env.example` para `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edite `.env` com suas credenciais:
     ```
     DB_HOST=localhost
     DB_PORT=5432
     DB_USER=postgres
     DB_PASSWORD=sua_senha
     DB_NAME=radio_indoor
     PORT=3000
     ```

3. **Executar migrations (auto-sync em dev):**
   - O TypeORM criará as tabelas automaticamente em modo desenvolvimento

4. **Iniciar servidor:**
   ```bash
   npm run start:dev
   ```

### Endpoints da API

#### `POST /api/devices/register`
Registra uma nova TV Box.

**Body:**
```json
{
  "uuid": "uuid-do-dispositivo",
  "nome": "Nome do dispositivo (opcional)"
}
```

#### `GET /api/devices/{uuid}/config`
Retorna configuração do dispositivo.

**Response:**
```json
{
  "streaming_url": "https://exemplo.com/stream.mp3",
  "volume": 50,
  "status": "active"
}
```

#### `POST /api/devices/{uuid}/heartbeat`
Atualiza último contato do dispositivo.

#### `PUT /api/devices/{uuid}`
Atualiza configuração do dispositivo.

**Body:**
```json
{
  "streaming_url": "https://nova-url.com/stream.mp3",
  "volume": 75,
  "status": "active",
  "nome": "Novo nome"
}
```

#### `GET /api/devices`
Lista todos os dispositivos (para painel admin).

#### `GET /api/devices/{uuid}`
Obtém um dispositivo específico.

---

## 🌐 PARTE 3 - PAINEL ADMINISTRATIVO (Next.js)

### Características

- ✅ Interface web moderna
- ✅ Lista de dispositivos
- ✅ Status online/offline
- ✅ Edição de configurações
- ✅ Atualização em tempo real

### Requisitos

- Node.js 18+
- npm ou yarn

### Configuração

1. **Instalar dependências:**
   ```bash
   cd admin-panel
   npm install
   ```

2. **Configurar URL da API:**
   - Crie arquivo `.env.local`:
     ```
     NEXT_PUBLIC_API_URL=http://localhost:3000/api
     ```
   - Ou edite `next.config.js` se necessário

3. **Iniciar servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Acessar:**
   - Abra `http://localhost:3001` no navegador
   - Login padrão: `admin` / `admin`

### Build para Produção

```bash
npm run build
npm start
```

### Funcionalidades

- **Dashboard:** Lista todos os dispositivos
- **Status Online/Offline:** Baseado no último heartbeat
- **Edição de Configuração:**
  - URL de streaming
  - Volume (0-100%)
  - Status (ativo/inativo)
  - Nome do dispositivo
- **Atualização Automática:** Atualiza lista a cada 30 segundos

---

## 🚀 DEPLOYMENT

### Backend (Produção)

1. **Build:**
   ```bash
   cd backend
   npm run build
   ```

2. **Executar:**
   ```bash
   npm run start:prod
   ```

3. **Usar PM2 (recomendado):**
   ```bash
   npm install -g pm2
   pm2 start dist/main.js --name radio-indoor-api
   ```

### Painel Admin (Produção)

1. **Build:**
   ```bash
   cd admin-panel
   npm run build
   ```

2. **Executar:**
   ```bash
   npm start
   ```

3. **Ou usar PM2:**
   ```bash
   pm2 start npm --name radio-indoor-admin -- start
   ```

### App Android

1. Gere APK release assinado
2. Instale nas TV Boxes
3. Configure como launcher padrão
4. Configure URL da API no código

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### Android App
- [x] Kiosk Mode (Lock Task)
- [x] Auto Start (BootReceiver)
- [x] Foreground Service
- [x] ExoPlayer para streaming
- [x] Retry automático
- [x] Configuração remota
- [x] Cache offline
- [x] Sincronização NTP
- [x] Heartbeat periódico
- [x] WakeLock

### Backend
- [x] API REST completa
- [x] PostgreSQL
- [x] Endpoints de dispositivos
- [x] Heartbeat tracking
- [x] CORS configurado

### Painel Admin
- [x] Interface web
- [x] Lista de dispositivos
- [x] Status online/offline
- [x] Edição de configurações
- [x] Atualização automática

---

## 🔒 SEGURANÇA

### Recomendações

1. **Backend:**
   - Implementar autenticação JWT
   - Usar HTTPS em produção
   - Validar inputs
   - Rate limiting

2. **Painel Admin:**
   - Implementar autenticação real
   - Usar HTTPS
   - Proteger rotas

3. **Android:**
   - Assinar APK com certificado válido
   - Usar ProGuard/R8
   - Validar certificados SSL

---

## 🐛 TROUBLESHOOTING

### App Android não inicia automaticamente
- Verifique se BootReceiver está registrado no manifest
- Verifique permissões RECEIVE_BOOT_COMPLETED
- Teste manualmente: `adb shell am broadcast -a android.intent.action.BOOT_COMPLETED`

### Streaming não funciona
- Verifique URL da API no ApiClient.kt
- Verifique se backend está rodando
- Verifique logs: `adb logcat | grep StreamingService`

### Kiosk Mode não funciona
- Configure app como launcher padrão
- Verifique se Lock Task Mode está ativo
- Alguns dispositivos requerem permissões especiais

### Backend não conecta ao banco
- Verifique credenciais no .env
- Verifique se PostgreSQL está rodando
- Verifique firewall/portas

---

## 📝 NOTAS IMPORTANTES

1. **URL da API:** Altere `BASE_URL` no `ApiClient.kt` antes de gerar APK
2. **Kiosk Mode:** Alguns dispositivos podem requerer configuração adicional
3. **NTP Sync:** Ajuste de horário requer root em alguns dispositivos
4. **Heartbeat:** Dispositivos offline por mais de 2 minutos são marcados como offline
5. **Streaming:** URLs devem ser válidas e acessíveis pela TV Box

---

## 📞 SUPORTE

Para problemas ou dúvidas:
- Verifique os logs do Android: `adb logcat`
- Verifique logs do backend no console
- Verifique console do navegador no painel admin

---

## 📄 LICENÇA

Este projeto é fornecido como está, para uso interno/corporativo.

---

**Desenvolvido para TV Boxes Android em modo Kiosk - Rádio Indoor 24/7**







