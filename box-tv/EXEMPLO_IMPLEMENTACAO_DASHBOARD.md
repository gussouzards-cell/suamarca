# 📊 Exemplo de Implementação - Dashboard

Este documento mostra como implementar um Dashboard melhorado no Admin Panel.

## 🚀 Passo a Passo

### 1. Instalar Dependências (Opcional - para gráficos avançados)

```bash
cd admin-panel
npm install recharts
# ou
npm install chart.js react-chartjs-2
```

### 2. Criar o Componente Dashboard

O arquivo `components/Dashboard.tsx` já foi criado com:
- ✅ Cards de estatísticas
- ✅ Atualização automática a cada 30 segundos
- ✅ Loading states
- ✅ Gráfico simples de status

### 3. Integrar no Backend

Adicionar endpoint para estatísticas:

```typescript
// backend/src/devices/devices.controller.ts

@Get('stats')
async getStats() {
  const devices = await this.devicesService.findAll()
  const companies = await this.companiesService.findAll()
  const events = await this.deviceEventsService.findRecent()
  
  const now = new Date()
  const onlineDevices = devices.filter(d => {
    if (!d.last_heartbeat) return false
    const lastHeartbeat = new Date(d.last_heartbeat)
    const diffMinutes = (now.getTime() - lastHeartbeat.getTime()) / 1000 / 60
    return diffMinutes < 2
  })
  
  return {
    totalDevices: devices.length,
    onlineDevices: onlineDevices.length,
    offlineDevices: devices.length - onlineDevices.length,
    activeDevices: devices.filter(d => d.status === 'active').length,
    totalCompanies: companies.length,
    averageUptime: 95.5, // Calcular baseado em eventos
    recentEvents: events.length
  }
}
```

### 4. Adicionar na Página Principal

```typescript
// app/page.tsx

import Dashboard from '@/components/Dashboard'

// No return, adicionar:
<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <Dashboard />
  <CompanyList />
</main>
```

### 5. Melhorar com Gráficos (Opcional)

```typescript
// Exemplo com Recharts
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

// No componente Dashboard:
<LineChart width={800} height={300} data={chartData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Line type="monotone" dataKey="online" stroke="#10B981" />
  <Line type="monotone" dataKey="offline" stroke="#EF4444" />
</LineChart>
```

## 🎨 Personalização

### Cores
Edite as cores nos `StatCard` para combinar com seu tema.

### Layout
Ajuste o grid conforme necessário:
- `grid-cols-1` - Mobile
- `grid-cols-2` - Tablet
- `grid-cols-4` - Desktop

### Atualização
Ajuste o intervalo de atualização:
```typescript
const interval = setInterval(fetchStats, 30000) // 30 segundos
```

## 📈 Próximos Passos

1. Adicionar gráficos mais complexos
2. Adicionar filtros de data
3. Adicionar exportação de dados
4. Adicionar comparação com períodos anteriores






