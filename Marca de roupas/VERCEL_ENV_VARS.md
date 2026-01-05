# 🔐 Variáveis de Ambiente para Vercel

## ⚠️ ERRO: DATABASE_URL não encontrada

Se você está vendo o erro `Environment variable not found: DATABASE_URL`, você precisa configurar as variáveis de ambiente na Vercel.

## 📋 Variáveis Obrigatórias

### 1. DATABASE_URL (OBRIGATÓRIA)

Você precisa criar um banco de dados PostgreSQL e configurar a connection string.

#### Opção A: Vercel Postgres (Mais Fácil)

1. No painel da Vercel, vá em **Storage**
2. Clique em **Create Database**
3. Selecione **Postgres**
4. Escolha um nome e região (recomendado: `gru1` - São Paulo)
5. A Vercel criará automaticamente a variável `POSTGRES_PRISMA_URL`
6. **IMPORTANTE**: Você precisa criar uma variável `DATABASE_URL` apontando para a mesma URL:
   - Copie o valor de `POSTGRES_PRISMA_URL`
   - Vá em **Settings → Environment Variables**
   - Adicione uma nova variável:
     - **Key**: `DATABASE_URL`
     - **Value**: (cole o valor de `POSTGRES_PRISMA_URL`)
     - **Environment**: Production, Preview, Development (marque todos)

#### Opção B: Supabase (Gratuito)

1. Acesse https://supabase.com
2. Crie um novo projeto
3. Vá em **Settings → Database**
4. Copie a **Connection String** (URI)
5. Formato: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`
6. Na Vercel, vá em **Settings → Environment Variables**
7. Adicione:
   - **Key**: `DATABASE_URL`
   - **Value**: (cole a connection string)
   - **Environment**: Production, Preview, Development

#### Opção C: Neon (Gratuito)

1. Acesse https://neon.tech
2. Crie um novo projeto
3. Copie a connection string
4. Na Vercel, adicione como `DATABASE_URL`

### 2. NEXTAUTH_URL (OBRIGATÓRIA)

1. Na Vercel, vá em **Settings → Environment Variables**
2. Adicione:
   - **Key**: `NEXTAUTH_URL`
   - **Value**: `https://seu-projeto.vercel.app` (substitua pelo URL do seu projeto)
   - **Environment**: Production, Preview, Development

### 3. NEXTAUTH_SECRET (OBRIGATÓRIA)

Gere uma chave secreta:

**No Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Ou use Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

1. Na Vercel, adicione:
   - **Key**: `NEXTAUTH_SECRET`
   - **Value**: (cole a chave gerada)
   - **Environment**: Production, Preview, Development

## 📋 Variáveis Opcionais (mas recomendadas)

### OPENAI_API_KEY
- Obtenha em https://platform.openai.com/
- Necessária para geração de estampas e logos com IA

### MERCADOPAGO_ACCESS_TOKEN
- Obtenha em https://www.mercadopago.com.br/developers
- Necessária para processar pagamentos

### GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET
- Obtenha em https://console.cloud.google.com/
- Necessário para login com Google

## ⚠️ IMPORTANTE: Atualizar Schema para PostgreSQL

Antes de fazer deploy, você precisa atualizar o `prisma/schema.prisma`:

1. Edite `prisma/schema.prisma`
2. Altere de:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
   
   Para:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. Crie uma nova migration:
   ```bash
   npx prisma migrate dev --name switch_to_postgresql
   ```

4. Commit e push:
   ```bash
   git add prisma/
   git commit -m "Switch to PostgreSQL for Vercel"
   git push
   ```

## ✅ Checklist Antes do Deploy

- [ ] Banco de dados PostgreSQL criado
- [ ] `DATABASE_URL` configurada na Vercel
- [ ] `NEXTAUTH_URL` configurada na Vercel
- [ ] `NEXTAUTH_SECRET` configurada na Vercel
- [ ] Schema do Prisma atualizado para PostgreSQL
- [ ] Migration criada e commitada
- [ ] Variáveis opcionais configuradas (se necessário)

## 🚀 Após Configurar

1. Faça um novo deploy na Vercel
2. As migrations serão executadas automaticamente durante o build
3. Verifique os logs do deploy para confirmar que tudo funcionou

