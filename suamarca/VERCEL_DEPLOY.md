# Deploy na Vercel - Sua Marca

## Pré-requisitos

1. Conta na Vercel (https://vercel.com)
2. Repositório no GitHub (já configurado)
3. Banco de dados PostgreSQL (recomendado para produção)

## Passo a Passo

### 1. Criar Banco de Dados PostgreSQL

Opções recomendadas:
- **Vercel Postgres** (integrado com Vercel)
- **Supabase** (gratuito até 500MB)
- **Neon** (gratuito até 512MB)
- **Railway** (gratuito com limites)

### 2. Configurar Variáveis de Ambiente na Vercel

No painel da Vercel, vá em **Settings → Environment Variables** e adicione:

#### Obrigatórias:
```
DATABASE_URL=postgresql://usuario:senha@host:porta/database?sslmode=require
NEXTAUTH_URL=https://seu-dominio.vercel.app
NEXTAUTH_SECRET=sua-chave-secreta-aqui
```

#### Opcionais (mas recomendadas):
```
OPENAI_API_KEY=sua-chave-openai
MERCADOPAGO_ACCESS_TOKEN=seu-token-mercadopago
GOOGLE_CLIENT_ID=seu-client-id-google
GOOGLE_CLIENT_SECRET=seu-client-secret-google
```

### 3. Atualizar Schema do Prisma

Se estiver usando PostgreSQL na Vercel, você precisa atualizar o `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 4. Fazer Deploy

1. Conecte seu repositório GitHub à Vercel
2. A Vercel detectará automaticamente o Next.js
3. Configure as variáveis de ambiente
4. Clique em **Deploy**

### 5. Executar Migrations

Após o primeiro deploy, execute as migrations:

```bash
npx prisma migrate deploy
```

Ou configure um script no `package.json` para rodar automaticamente no build.

## Configuração Automática

O projeto já está configurado com:
- ✅ `vercel.json` com comandos de build
- ✅ Script `postinstall` para gerar Prisma Client
- ✅ Script `build` que executa migrations

## Troubleshooting

### Erro: "Cannot find module '@prisma/client'"
- Execute `npm install` novamente
- Verifique se `prisma generate` está rodando no build

### Erro: "Migration failed"
- Verifique se o `DATABASE_URL` está correto
- Certifique-se de que o banco está acessível
- Execute `prisma migrate deploy` manualmente

### Erro: "NEXTAUTH_SECRET is not set"
- Adicione a variável de ambiente na Vercel
- Gere uma nova chave: `openssl rand -base64 32`

## Suporte

Para mais informações, consulte:
- [Documentação da Vercel](https://vercel.com/docs)
- [Prisma com Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

