# Sua Marca

Plataforma SaaS para criação de marcas de roupas com IA e produção sob demanda.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Prisma
- NextAuth
- OpenAI
- Mercado Pago

## Configuração

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente (crie um arquivo `.env`):
```
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="seu-secret-aqui"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
OPENAI_API_KEY="..."
MERCADOPAGO_ACCESS_TOKEN="..."
```

3. Configure o banco de dados:
```bash
npx prisma migrate dev
npx prisma generate
```

4. Execute o projeto:
```bash
npm run dev
```


