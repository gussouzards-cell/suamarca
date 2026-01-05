# 📊 Sistema de Eventos e Logs - TV Box

Sistema completo de rastreamento de eventos para cada TV Box, incluindo reinícios, quedas de internet, desligamentos e muito mais.

---

## 🎯 FUNCIONALIDADES

O sistema registra automaticamente os seguintes eventos:

### 📝 Tipos de Eventos

1. **REGISTERED** - Dispositivo registrado pela primeira vez
2. **CONNECTED** - Dispositivo conectou ao servidor
3. **DISCONNECTED** - Dispositivo desconectou (internet caiu ou foi desligado)
4. **RECONNECTED** - Dispositivo reconectou após desconexão
5. **RESTARTED** - Dispositivo reiniciou
6. **STATUS_CHANGED** - Status mudou (active/inactive)
7. **CONFIG_UPDATED** - Configuração atualizada (URL, volume, etc.)
8. **HEARTBEAT_MISSED** - Heartbeat não recebido (possível problema)

---

## 🏗️ ARQUITETURA

### Backend

#### 1. Entidade `DeviceEvent`
- Armazena todos os eventos de cada dispositivo
- Campos: `id`, `device_uuid`, `event_type`, `description`, `metadata`, `created_at`

#### 2. Serviço `DeviceEventsService`
- Cria eventos
- Busca eventos por dispositivo
- Busca eventos por tipo
- Conta eventos
- Limpa eventos antigos

#### 3. Detecção Automática
- **DevicesService** detecta automaticamente:
  - Registro de novos dispositivos
  - Reconexões (quando dispositivo volta após desconexão)
  - Mudanças de status
  - Mudanças de configuração

#### 4. Scheduler
- **DevicesSchedulerService** verifica dispositivos desconectados a cada 2 minutos
- Registra eventos de desconexão automaticamente

---

## 📡 ENDPOINTS DA API

### `GET /api/devices/:uuid/events`

Lista eventos de um dispositivo.

**Query Parameters:**
- `limit` (opcional): Número máximo de eventos (padrão: 100)
- `offset` (opcional): Offset para paginação (padrão: 0)

**Response:**
```json
[
  {
    "id": "uuid",
    "device_uuid": "550e8400-...",
    "event_type": "disconnected",
    "description": "Dispositivo desconectado (sem heartbeat há 15 minutos)...",
    "metadata": {
      "minutes_since_heartbeat": 15,
      "last_heartbeat": "2024-01-01T10:00:00.000Z"
    },
    "created_at": "2024-01-01T10:15:00.000Z"
  }
]
```

### `GET /api/devices/:uuid/events/count`

Conta eventos de um dispositivo.

**Response:**
```json
{
  "count": 42
}
```

---

## 🖥️ PAINEL ADMIN

### Visualizar Eventos

1. Acesse o painel admin: `http://localhost:3001`
2. Clique em **"Ver Eventos"** no card do dispositivo
3. Visualize o histórico completo de eventos

### Informações Exibidas

- **Tipo de evento** com ícone e cor
- **Data e hora** do evento
- **Descrição** detalhada
- **Metadados** (dados adicionais em JSON)

### Cores dos Eventos

- 🔵 **Azul** - Registrado
- 🟢 **Verde** - Conectado
- 🔴 **Vermelho** - Desconectado
- 🟡 **Amarelo** - Reconectado
- 🟣 **Roxo** - Reiniciado
- ⚙️ **Índigo** - Status Alterado
- 🔧 **Cinza** - Config Atualizada
- ⚠️ **Laranja** - Heartbeat Perdido

---

## 🔄 DETECÇÃO AUTOMÁTICA

### Como Funciona

1. **Registro:**
   - Quando dispositivo registra pela primeira vez → `REGISTERED`

2. **Conexão/Reconexão:**
   - Quando dispositivo envia heartbeat após estar desconectado → `RECONNECTED`
   - Quando dispositivo conecta pela primeira vez → `CONNECTED`

3. **Desconexão:**
   - Scheduler verifica a cada 2 minutos
   - Se dispositivo não enviou heartbeat há mais de 5 minutos → `DISCONNECTED`

4. **Mudanças de Configuração:**
   - Quando status muda → `STATUS_CHANGED`
   - Quando URL muda → `CONFIG_UPDATED`
   - Quando volume muda → `CONFIG_UPDATED`

---

## 📊 EXEMPLOS DE EVENTOS

### Desconexão
```json
{
  "event_type": "disconnected",
  "description": "Dispositivo desconectado (sem heartbeat há 15 minutos). Possível queda de internet ou desligamento.",
  "metadata": {
    "minutes_since_heartbeat": 15,
    "last_heartbeat": "2024-01-01T10:00:00.000Z"
  }
}
```

### Reconexão
```json
{
  "event_type": "reconnected",
  "description": "Dispositivo reconectou após 15 minutos sem comunicação",
  "metadata": {
    "previous_heartbeat": "2024-01-01T10:00:00.000Z"
  }
}
```

### Mudança de Status
```json
{
  "event_type": "status_changed",
  "description": "Status alterado de \"inactive\" para \"active\"",
  "metadata": {
    "old_status": "inactive",
    "new_status": "active"
  }
}
```

### Atualização de Configuração
```json
{
  "event_type": "config_updated",
  "description": "URL de streaming atualizada",
  "metadata": {
    "old_url": "https://old-stream.com/radio.mp3",
    "new_url": "https://new-stream.com/radio.mp3"
  }
}
```

---

## ⚙️ CONFIGURAÇÃO

### Instalar Dependências

```bash
cd backend
npm install @nestjs/schedule
```

### Banco de Dados

A tabela `device_events` é criada automaticamente pelo TypeORM.

**Estrutura:**
```sql
CREATE TABLE device_events (
  id UUID PRIMARY KEY,
  device_uuid VARCHAR NOT NULL,
  event_type VARCHAR NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Scheduler

O scheduler verifica desconexões a cada 2 minutos. Para alterar:

**Arquivo:** `backend/src/devices/devices-scheduler.service.ts`

```typescript
@Cron(CronExpression.EVERY_2_MINUTES) // Altere aqui
```

---

## 🧹 MANUTENÇÃO

### Limpar Eventos Antigos

Para limpar eventos com mais de 90 dias:

```typescript
await eventsService.deleteOldEvents(90);
```

Ou criar um endpoint:

```typescript
@Delete('events/cleanup')
async cleanupOldEvents(@Query('days') days: number = 90) {
  const deleted = await this.eventsService.deleteOldEvents(days);
  return { deleted };
}
```

---

## 📈 ESTATÍSTICAS

### Consultas Úteis

**Eventos de desconexão nos últimos 7 dias:**
```sql
SELECT * FROM device_events
WHERE event_type = 'disconnected'
AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

**Dispositivos com mais desconexões:**
```sql
SELECT device_uuid, COUNT(*) as disconnect_count
FROM device_events
WHERE event_type = 'disconnected'
GROUP BY device_uuid
ORDER BY disconnect_count DESC;
```

**Tempo médio de desconexão:**
```sql
-- Análise mais complexa, requer lógica adicional
```

---

## 🐛 TROUBLESHOOTING

### Eventos não aparecem

1. Verifique se backend está rodando
2. Verifique se tabela `device_events` existe
3. Verifique logs do backend
4. Verifique se scheduler está ativo

### Scheduler não funciona

1. Verifique se `@nestjs/schedule` está instalado
2. Verifique se `ScheduleModule` está importado em `AppModule`
3. Verifique logs do backend

### Eventos duplicados

- O sistema evita eventos duplicados verificando o último evento antes de criar novo
- Se ainda houver duplicatas, verifique a lógica em `DevicesService`

---

## ✅ CHECKLIST

- [ ] Backend instalado e rodando
- [ ] `@nestjs/schedule` instalado
- [ ] Tabela `device_events` criada
- [ ] Scheduler ativo (verificar logs)
- [ ] Painel admin atualizado
- [ ] Testar visualização de eventos

---

## 🎯 PRÓXIMOS PASSOS

1. **Alertas:** Notificações quando dispositivo desconecta
2. **Gráficos:** Visualização de eventos ao longo do tempo
3. **Exportação:** Exportar eventos para CSV/Excel
4. **Filtros:** Filtrar eventos por tipo, data, etc.
5. **Estatísticas:** Dashboard com métricas de disponibilidade

---

**Sistema de eventos implementado e funcionando! 🎉**






