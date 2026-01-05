# Estrutura do Projeto - Rádio Indoor

## 📁 Organização

```
box-tv/
├── android-app/              # App Android (Kotlin)
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/com/radioindoor/app/
│   │   │   │   ├── MainActivity.kt              # Kiosk Mode
│   │   │   │   ├── BootReceiver.kt             # Auto Start
│   │   │   │   ├── RadioIndoorApplication.kt    # Application
│   │   │   │   ├── service/
│   │   │   │   │   └── StreamingForegroundService.kt  # Streaming
│   │   │   │   ├── data/
│   │   │   │   │   ├── ConfigRepository.kt      # Config remota
│   │   │   │   │   ├── api/
│   │   │   │   │   │   └── ApiClient.kt         # Retrofit
│   │   │   │   │   └── model/
│   │   │   │   │       └── DeviceConfig.kt      # Modelo
│   │   │   │   └── utils/
│   │   │   │       ├── DeviceManager.kt         # UUID
│   │   │   │       └── NtpTimeSyncManager.kt    # NTP Sync
│   │   │   ├── res/                             # Recursos Android
│   │   │   └── AndroidManifest.xml
│   │   └── build.gradle.kts
│   ├── build.gradle.kts
│   ├── settings.gradle.kts
│   └── README.md
│
├── backend/                   # API REST (NestJS)
│   ├── src/
│   │   ├── main.ts            # Entry point
│   │   ├── app.module.ts      # Módulo principal
│   │   └── devices/
│   │       ├── devices.controller.ts    # Endpoints
│   │       ├── devices.service.ts       # Lógica
│   │       ├── devices.module.ts        # Módulo
│   │       ├── entities/
│   │       │   └── device.entity.ts    # Entidade DB
│   │       └── dto/
│   │           ├── create-device.dto.ts
│   │           └── update-device.dto.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── admin-panel/               # Painel Web (Next.js)
│   ├── app/
│   │   ├── layout.tsx         # Layout
│   │   ├── page.tsx           # Home
│   │   └── globals.css        # Estilos
│   ├── components/
│   │   ├── Login.tsx          # Login
│   │   ├── DeviceList.tsx     # Lista
│   │   ├── DeviceCard.tsx     # Card
│   │   └── DeviceEditModal.tsx # Modal
│   ├── lib/
│   │   ├── api.ts             # Axios client
│   │   └── auth.ts            # Auth
│   ├── package.json
│   ├── next.config.js
│   └── README.md
│
├── README.md                  # Documentação principal
├── INSTALL.md                 # Guia de instalação
└── QUICKSTART.md              # Início rápido
```

## 🔄 Fluxo de Dados

### 1. Inicialização da TV Box

```
Boot → BootReceiver → MainActivity → StreamingForegroundService
                                    ↓
                            ConfigRepository → API
                                    ↓
                            ExoPlayer → Streaming
```

### 2. Atualização de Configuração

```
Painel Admin → PUT /api/devices/{uuid}
                    ↓
              Backend (PostgreSQL)
                    ↓
TV Box (a cada 5 min) → GET /api/devices/{uuid}/config
                    ↓
              StreamingForegroundService
                    ↓
              Atualiza streaming/volume
```

### 3. Heartbeat

```
TV Box (a cada 1 min) → POST /api/devices/{uuid}/heartbeat
                            ↓
                      Backend atualiza last_heartbeat
                            ↓
                      Painel Admin mostra status online
```

## 📊 Componentes Principais

### Android App

| Componente | Responsabilidade |
|------------|------------------|
| `MainActivity` | Kiosk Mode, Lock Task |
| `BootReceiver` | Auto Start no boot |
| `StreamingForegroundService` | Streaming 24/7, retry |
| `ConfigRepository` | Busca/cache de config |
| `ApiClient` | Comunicação com API |
| `DeviceManager` | Gerenciamento de UUID |
| `NtpTimeSyncManager` | Sincronização de horário |

### Backend

| Componente | Responsabilidade |
|------------|------------------|
| `DevicesController` | Endpoints REST |
| `DevicesService` | Lógica de negócio |
| `Device` (Entity) | Modelo de dados |
| TypeORM | ORM para PostgreSQL |

### Painel Admin

| Componente | Responsabilidade |
|------------|------------------|
| `DeviceList` | Lista dispositivos |
| `DeviceCard` | Card individual |
| `DeviceEditModal` | Edição de config |
| `api.ts` | Cliente HTTP |

## 🔌 Integrações

### Android → Backend

- **Retrofit** para HTTP
- **Gson** para JSON
- Endpoints:
  - `GET /api/devices/{uuid}/config`
  - `POST /api/devices/{uuid}/heartbeat`

### Painel → Backend

- **Axios** para HTTP
- Endpoints:
  - `GET /api/devices`
  - `GET /api/devices/{uuid}`
  - `PUT /api/devices/{uuid}`

### Backend → Database

- **TypeORM** + **PostgreSQL**
- Tabela: `devices`

## 🎯 Pontos de Configuração

### Android

1. **URL da API:** `ApiClient.kt` → `BASE_URL`
2. **Intervalo de config:** `StreamingForegroundService.kt` → `CONFIG_UPDATE_INTERVAL`
3. **Intervalo de heartbeat:** `RadioIndoorApplication.kt` → `delay(60000)`

### Backend

1. **Database:** `.env` → `DB_*`
2. **Porta:** `.env` → `PORT`
3. **CORS:** `main.ts` → `ADMIN_PANEL_URL`

### Painel Admin

1. **URL da API:** `.env.local` → `NEXT_PUBLIC_API_URL`
2. **Porta:** `package.json` → `dev` script

## 📝 Arquivos Importantes

### Configuração

- `android-app/app/src/main/java/.../ApiClient.kt` - URL da API
- `backend/.env` - Configurações do backend
- `admin-panel/.env.local` - Configurações do painel

### Documentação

- `README.md` - Visão geral
- `INSTALL.md` - Instalação completa
- `QUICKSTART.md` - Início rápido
- `android-app/README.md` - App Android
- `backend/README.md` - Backend
- `admin-panel/README.md` - Painel Admin

---

**Estrutura organizada e pronta para desenvolvimento!**







