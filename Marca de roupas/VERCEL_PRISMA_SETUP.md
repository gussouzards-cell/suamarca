# 🔧 Configuração Prisma Accelerate na Vercel

## Variáveis Recebidas

Você recebeu estas variáveis do Prisma Accelerate/Vercel Postgres:

1. `PRISMA_DATABASE_URL` (URL direta do PostgreSQL)
2. `POSTGRES_URL` (URL do PostgreSQL)
3. `PRISMA_DATABASE_URL` (URL do Prisma Accelerate - com `prisma+postgres://`)

## ⚠️ IMPORTANTE: O Prisma precisa de `DATABASE_URL`

O Prisma procura por `DATABASE_URL` no schema, não `PRISMA_DATABASE_URL`.

## 📋 Configuração na Vercel

### Opção 1: Usar URL Direta do PostgreSQL (Recomendado para Migrations)

1. No painel da Vercel, vá em **Settings → Environment Variables**
2. Adicione:
   - **Key**: `DATABASE_URL`
   - **Value**: `postgres://38e14f06aaed86c30cf0d49dda4bd2555ca575d2b2e247b23b62012dbccbb6c5:sk_4zOUDBN7Xf0_I8hqzi4UP@db.prisma.io:5432/postgres?sslmode=require`
   - **Environment**: Production, Preview, Development (marque todos)

### Opção 2: Usar Prisma Accelerate (Para Produção - Mais Rápido)

Se você quiser usar o Prisma Accelerate (recomendado para produção):

1. Adicione `DATABASE_URL` com a URL do Accelerate:
   - **Key**: `DATABASE_URL`
   - **Value**: `prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza180ek9VREJON1hmMF9JOGhxemk0VVAiLCJhcGlfa2V5IjoiMDFLRTgzUVNCWkJXMjZYMDM3RUpCVldSQ0YiLCJ0ZW5hbnRfaWQiOiIzOGUxNGYwNmFhZWQ4NmMzMGNmMGQ0OWRkYTRiZDI1NTVjYTU3NWQyYjJlMjQ3YjIzYjYyMDEyZGJjY2JiNmM1IiwiaW50ZXJuYWxfc2VjcmV0IjoiZmQyOTc0NDUtZDM5MC00YjhkLWEwOWEtYzEyMzllMDcwOTgzIn0.GBOv28YfagHkHVrR5f_lYxGwZQQS1cAwLoWZW_jhZeE`
   - **Environment**: Production, Preview, Development

2. **IMPORTANTE**: Para migrations, você ainda precisa da URL direta. Adicione também:
   - **Key**: `DIRECT_URL` ou `POSTGRES_URL_NON_POOLING`
   - **Value**: `postgres://38e14f06aaed86c30cf0d49dda4bd2555ca575d2b2e247b23b62012dbccbb6c5:sk_4zOUDBN7Xf0_I8hqzi4UP@db.prisma.io:5432/postgres?sslmode=require`

### ⚠️ Problema com Migrations e Prisma Accelerate

Se você usar a URL do Accelerate (`prisma+postgres://`) como `DATABASE_URL`, as migrations podem falhar porque o Accelerate não suporta migrations diretamente.

**Solução**: Use a URL direta do PostgreSQL para `DATABASE_URL` durante o build, e configure o Accelerate apenas para runtime (se necessário).

## ✅ Configuração Recomendada

### Para Build e Migrations (Use URL Direta):

1. **DATABASE_URL**: 
   ```
   postgres://38e14f06aaed86c30cf0d49dda4bd2555ca575d2b2e247b23b62012dbccbb6c5:sk_4zOUDBN7Xf0_I8hqzi4UP@db.prisma.io:5432/postgres?sslmode=require
   ```

### Outras Variáveis Obrigatórias:

2. **NEXTAUTH_URL**: 
   ```
   https://seu-projeto.vercel.app
   ```
   (Substitua pelo URL do seu projeto na Vercel)

3. **NEXTAUTH_SECRET**: 
   Gere uma chave secreta:
   ```powershell
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
   ```

## 📝 Checklist

- [ ] `DATABASE_URL` configurada com URL direta do PostgreSQL
- [ ] `NEXTAUTH_URL` configurada
- [ ] `NEXTAUTH_SECRET` configurada
- [ ] Schema do Prisma atualizado para PostgreSQL
- [ ] Migration criada e commitada
- [ ] Novo deploy feito

## 🚀 Próximos Passos

1. Configure as variáveis na Vercel conforme acima
2. Certifique-se de que o schema está em PostgreSQL (não SQLite)
3. Faça um novo deploy
4. As migrations serão executadas automaticamente durante o build

