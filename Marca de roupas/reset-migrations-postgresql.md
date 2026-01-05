# 🔄 Resetar Migrations para PostgreSQL

## Problema
As migrations existentes foram criadas para SQLite e não são compatíveis com PostgreSQL.

## Solução: Resetar e Recriar Migrations

### Opção 1: Resetar Localmente (Recomendado)

```bash
# 1. Remover pasta de migrations antigas
rm -rf prisma/migrations

# 2. Criar nova migration inicial para PostgreSQL
npx prisma migrate dev --name init_postgresql
```

### Opção 2: Na Vercel (Produção)

A Vercel vai criar as migrations automaticamente na primeira vez, mas você pode forçar:

1. Remova a pasta `prisma/migrations` do repositório
2. Faça commit
3. Na Vercel, o Prisma vai criar as migrations automaticamente durante o build

## ⚠️ IMPORTANTE

Se você já tem dados no banco de produção, NÃO faça reset. Nesse caso, você precisa:
1. Manter as migrations antigas
2. Criar uma nova migration que adapte o schema para PostgreSQL
3. Ou usar `prisma db push` em vez de migrations

