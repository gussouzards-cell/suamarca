# 🚀 Deploy na Vercel - Guia Completo

## ✅ O que já está configurado

- ✅ `vercel.json` com configurações de build
- ✅ Scripts no `package.json` para executar migrations
- ✅ Migrations do Prisma commitadas no repositório
- ✅ `.gitignore` configurado corretamente

## 📋 Passo a Passo

### 1. Criar Conta na Vercel

1. Acesse https://vercel.com
2. Faça login com sua conta GitHub
3. Importe o repositório `gussouzards-cell/suamarca`

### 2. Configurar Banco de Dados PostgreSQL

#### Opção A: Vercel Postgres (Mais Fácil)

1. No painel da Vercel, vá em **Storage**
2. Clique em **Create Database**
3. Selecione **Postgres**
4. Escolha um nome e região (recomendado: `gru1` - São Paulo)
5. A Vercel criará automaticamente a variável `POSTGRES_PRISMA_URL`
6. Copie também a `POSTGRES_URL_NON_POOLING` (necessária para migrations)

#### Opção B: Banco Externo

**Supabase (Recomendado - Gratuito):**
1. Acesse https://supabase.com
2. Crie um novo projeto
3. Vá em **Settings → Database**
4. Copie a **Connection String** (URI)
5. Formato: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

**Neon (Alternativa):**
1. Acesse https://neon.tech
2. Crie um novo projeto
3. Copie a connection string

### 3. Atualizar Schema do Prisma para PostgreSQL

⚠️ **IMPORTANTE**: Antes de fazer deploy, você precisa atualizar o schema para PostgreSQL:

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

### 4. Configurar Variáveis de Ambiente na Vercel

No painel da Vercel, vá em **Settings → Environment Variables** e adicione:

#### Obrigatórias:
```
DATABASE_URL=postgresql://usuario:senha@host:porta/database?sslmode=require
NEXTAUTH_URL=https://seu-projeto.vercel.app
NEXTAUTH_SECRET=sua-chave-secreta-aleatoria
```

#### Opcionais (mas recomendadas):
```
OPENAI_API_KEY=sk-...
MERCADOPAGO_ACCESS_TOKEN=seu-token
GOOGLE_CLIENT_ID=seu-client-id
GOOGLE_CLIENT_SECRET=seu-client-secret
```

**Para gerar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 5. Fazer Deploy

1. Na Vercel, clique em **Deploy**
2. A Vercel irá:
   - Instalar dependências (`npm install`)
   - Executar `postinstall` (gera Prisma Client)
   - Executar `build` (migrations + build Next.js)
   - Fazer deploy

### 6. Verificar Deploy

Após o deploy:
1. Acesse a URL fornecida pela Vercel
2. Teste criar uma conta
3. Verifique os logs em **Deployments → [seu deploy] → Logs**

## 🔧 Troubleshooting

### Erro: "Migration failed"
- Verifique se `DATABASE_URL` está correto
- Certifique-se de que o banco está acessível
- Execute migrations manualmente: `npx prisma migrate deploy`

### Erro: "Cannot find module '@prisma/client'"
- Verifique se `postinstall` está no `package.json`
- Veja os logs do build na Vercel

### Erro: "NEXTAUTH_SECRET is not set"
- Adicione a variável de ambiente na Vercel
- Gere uma nova chave secreta

### Banco de dados não conecta
- Verifique se a connection string está correta
- Certifique-se de que o banco permite conexões externas
- Para Supabase/Neon, verifique as configurações de firewall

## 📝 Notas Importantes

1. **SQLite vs PostgreSQL**: O projeto está configurado para SQLite localmente. Para produção na Vercel, use PostgreSQL.

2. **Migrations**: As migrations estão no repositório e serão executadas automaticamente durante o build.

3. **Variáveis de Ambiente**: Nunca commite o arquivo `.env`. Configure tudo no painel da Vercel.

4. **Região**: Configure a região como `gru1` (São Paulo) no `vercel.json` para melhor performance no Brasil.

## 🎉 Pronto!

Após seguir estes passos, sua aplicação estará rodando na Vercel com Prisma configurado!

