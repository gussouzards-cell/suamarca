# 🔧 Fix: Erro de Migrations SQLite vs PostgreSQL

## Problema
As migrations foram criadas para SQLite, mas agora estamos usando PostgreSQL na Vercel.

## Solução Aplicada

### 1. Removidas migrations SQLite antigas
As migrations SQLite foram removidas do repositório.

### 2. Atualizado script de build
O `package.json` agora usa `prisma db push` em vez de `prisma migrate deploy`:
- `prisma db push` sincroniza o schema diretamente com o banco
- Não precisa de migrations pré-existentes
- Funciona perfeitamente quando mudamos de provider

### 3. O que acontece agora

Durante o build na Vercel:
1. `prisma generate` - Gera o Prisma Client
2. `prisma db push` - Sincroniza o schema com o banco PostgreSQL
3. `next build` - Faz o build do Next.js

## ⚠️ Importante

- `prisma db push` é ideal para desenvolvimento e quando mudamos de provider
- Para produção com dados importantes, considere criar migrations PostgreSQL manualmente depois
- O `--accept-data-loss` é necessário apenas se houver conflitos (banco vazio não tem problema)

## Próximos Passos

1. Faça deploy na Vercel
2. O schema será criado automaticamente no PostgreSQL
3. Se quiser usar migrations depois, execute:
   ```bash
   npx prisma migrate dev --name init_postgresql
   ```

