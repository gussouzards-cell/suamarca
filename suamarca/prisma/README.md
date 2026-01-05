# Prisma - Configuração para Vercel

## Para Deploy na Vercel

A Vercel requer que as migrations estejam no repositório. As migrations já estão commitadas e serão executadas automaticamente durante o build.

## Configuração do Banco de Dados

### Opção 1: Vercel Postgres (Recomendado)
1. No painel da Vercel, vá em **Storage**
2. Crie um novo **Postgres Database**
3. Copie a `DATABASE_URL` fornecida
4. Adicione como variável de ambiente no projeto

### Opção 2: Banco Externo (Supabase, Neon, Railway)
1. Crie um banco PostgreSQL em qualquer provedor
2. Copie a connection string
3. Adicione como `DATABASE_URL` nas variáveis de ambiente da Vercel

## Atualizar Schema para PostgreSQL

Se estiver usando PostgreSQL na Vercel, atualize o `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Depois execute:
```bash
npx prisma migrate dev --name switch_to_postgresql
```

## Migrations Automáticas

O projeto está configurado para executar migrations automaticamente durante o build na Vercel através do script `build` no `package.json`.

