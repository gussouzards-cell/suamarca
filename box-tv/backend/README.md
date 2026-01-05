# Backend API - Rádio Indoor

API REST desenvolvida com NestJS para gerenciamento de TV Boxes.

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar banco de dados

#### Criar banco PostgreSQL:

```sql
CREATE DATABASE radio_indoor;
```

#### Configurar variáveis de ambiente:

Copie `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_NAME=radio_indoor
PORT=3000
NODE_ENV=development
ADMIN_PANEL_URL=http://localhost:3001
```

### 3. Executar

#### Desenvolvimento:

```bash
npm run start:dev
```

#### Produção:

```bash
npm run build
npm run start:prod
```

#### Com PM2:

```bash
npm install -g pm2
pm2 start dist/main.js --name radio-indoor-api
pm2 save
pm2 startup
```

## Endpoints

### `POST /api/devices/register`

Registra uma nova TV Box.

**Request:**
```json
{
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "nome": "TV Box Sala 1"
}
```

**Response:**
```json
{
  "id": "uuid",
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "nome": "TV Box Sala 1",
  "streaming_url": null,
  "volume": 50,
  "status": "inactive",
  "last_heartbeat": null,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### `GET /api/devices/{uuid}/config`

Retorna configuração do dispositivo.

**Response:**
```json
{
  "streaming_url": "https://exemplo.com/stream.mp3",
  "volume": 50,
  "status": "active"
}
```

### `POST /api/devices/{uuid}/heartbeat`

Atualiza último contato do dispositivo.

**Response:**
```json
{
  "success": true
}
```

### `PUT /api/devices/{uuid}`

Atualiza configuração do dispositivo.

**Request:**
```json
{
  "streaming_url": "https://nova-url.com/stream.mp3",
  "volume": 75,
  "status": "active",
  "nome": "Novo Nome"
}
```

**Response:**
```json
{
  "id": "uuid",
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "nome": "Novo Nome",
  "streaming_url": "https://nova-url.com/stream.mp3",
  "volume": 75,
  "status": "active",
  "last_heartbeat": "2024-01-01T00:00:00.000Z",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### `GET /api/devices`

Lista todos os dispositivos.

**Response:**
```json
[
  {
    "id": "uuid",
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "nome": "TV Box Sala 1",
    "streaming_url": "https://exemplo.com/stream.mp3",
    "volume": 50,
    "status": "active",
    "last_heartbeat": "2024-01-01T00:00:00.000Z",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### `GET /api/devices/{uuid}`

Obtém um dispositivo específico.

## Estrutura do Banco de Dados

### Tabela `devices`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID único |
| uuid | VARCHAR (unique) | UUID do dispositivo |
| nome | VARCHAR (nullable) | Nome do dispositivo |
| streaming_url | VARCHAR (nullable) | URL do streaming |
| volume | INTEGER | Volume (0-100) |
| status | VARCHAR | Status (active/inactive) |
| last_heartbeat | TIMESTAMP (nullable) | Último contato |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Data de atualização |

## Migrations

Em desenvolvimento, o TypeORM cria as tabelas automaticamente (`synchronize: true`).

Para produção, desabilite `synchronize` e use migrations:

```bash
npm run migration:run
```

## Segurança

### Recomendações para produção:

1. **Autenticação:**
   - Implementar JWT
   - Proteger endpoints sensíveis

2. **HTTPS:**
   - Usar certificado SSL válido
   - Configurar reverse proxy (nginx)

3. **Validação:**
   - Validar todos os inputs
   - Sanitizar dados

4. **Rate Limiting:**
   - Implementar rate limiting
   - Prevenir abuso

5. **CORS:**
   - Configurar CORS adequadamente
   - Permitir apenas origens confiáveis

## Troubleshooting

### Erro de conexão com banco

- Verifique credenciais no `.env`
- Verifique se PostgreSQL está rodando
- Verifique firewall/portas

### Erro de CORS

- Configure `ADMIN_PANEL_URL` no `.env`
- Verifique se URL do painel está correta

### Porta já em uso

- Altere `PORT` no `.env`
- Ou mate o processo na porta 3000

## Logs

Logs são exibidos no console. Para produção, configure logging adequado:

```typescript
// main.ts
import { Logger } from '@nestjs/common';

const logger = new Logger('Bootstrap');
logger.log(`🚀 Backend rodando em http://localhost:${port}`);
```

---

**API REST pronta para gerenciar TV Boxes!**







