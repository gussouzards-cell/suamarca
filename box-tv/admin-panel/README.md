# Painel Administrativo - Rádio Indoor

Interface web desenvolvida com Next.js para gerenciamento de TV Boxes.

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar URL da API

Crie arquivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

**Importante:** Use o IP da máquina onde o backend está rodando, não `localhost`.

### 3. Executar

#### Desenvolvimento:

```bash
npm run dev
```

Acesse: `http://localhost:3001`

#### Produção:

```bash
npm run build
npm start
```

#### Com PM2:

```bash
npm install -g pm2
pm2 start npm --name radio-indoor-admin -- start
```

## Funcionalidades

### Dashboard

- Lista todos os dispositivos
- Status online/offline em tempo real
- Último contato de cada dispositivo
- Atualização automática a cada 30 segundos

### Gerenciamento de Dispositivos

- **Visualizar:**
  - UUID do dispositivo
  - Nome
  - Status (ativo/inativo)
  - Volume
  - URL de streaming
  - Último heartbeat

- **Editar:**
  - Nome do dispositivo
  - URL de streaming
  - Volume (0-100%)
  - Status (ativo/inativo)

### Status Online/Offline

Dispositivos são marcados como:
- **Online:** Último heartbeat há menos de 2 minutos
- **Offline:** Último heartbeat há mais de 2 minutos ou nunca

## Login

**Credenciais padrão:**
- Usuário: `admin`
- Senha: `admin`

**⚠️ IMPORTANTE:** Em produção, implemente autenticação real!

## Estrutura do Projeto

```
admin-panel/
├── app/
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx            # Página inicial
│   └── globals.css         # Estilos globais
├── components/
│   ├── Login.tsx           # Componente de login
│   ├── DeviceList.tsx      # Lista de dispositivos
│   ├── DeviceCard.tsx      # Card de dispositivo
│   └── DeviceEditModal.tsx # Modal de edição
└── lib/
    ├── api.ts              # Cliente Axios
    └── auth.ts             # Gerenciamento de autenticação
```

## Personalização

### Alterar intervalo de atualização

Edite `components/DeviceList.tsx`:

```typescript
const interval = setInterval(fetchDevices, 30000) // 30 segundos
```

### Alterar tempo de offline

Edite `components/DeviceCard.tsx`:

```typescript
setIsOnline(diffMinutes < 2) // 2 minutos
```

### Alterar porta

Edite `package.json`:

```json
{
  "scripts": {
    "dev": "next dev -p 3001"
  }
}
```

## Build para Produção

### 1. Build estático:

```bash
npm run build
```

### 2. Executar:

```bash
npm start
```

### 3. Ou usar PM2:

```bash
pm2 start npm --name radio-indoor-admin -- start
```

## Deploy

### Vercel:

1. Conecte repositório
2. Configure variáveis de ambiente
3. Deploy automático

### Docker:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## Segurança

### Recomendações:

1. **Autenticação:**
   - Implementar JWT
   - Proteger rotas

2. **HTTPS:**
   - Usar certificado SSL
   - Configurar reverse proxy

3. **Validação:**
   - Validar inputs
   - Sanitizar dados

## Troubleshooting

### Erro de conexão com API

- Verifique `NEXT_PUBLIC_API_URL` no `.env.local`
- Verifique se backend está rodando
- Verifique CORS no backend

### Página em branco

- Verifique console do navegador
- Verifique logs do servidor
- Verifique se build foi bem-sucedido

### Dispositivos não aparecem

- Verifique se backend está retornando dados
- Verifique console do navegador
- Verifique logs da API

---

**Painel administrativo pronto para uso!**







