# Guia de Configuração - Sua Marca

## Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL instalado e rodando
- Contas/configurações:
  - Google OAuth (para login com Google)
  - OpenAI API (para geração de estampas)
  - Mercado Pago (para pagamentos)

## Passo a Passo

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e preencha com suas credenciais:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

- `DATABASE_URL`: URL de conexão do PostgreSQL
- `NEXTAUTH_SECRET`: Gere uma string aleatória (pode usar `openssl rand -base64 32`)
- `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`: Obtenha em [Google Cloud Console](https://console.cloud.google.com/)
- `OPENAI_API_KEY`: Obtenha em [OpenAI](https://platform.openai.com/)
- `MERCADOPAGO_ACCESS_TOKEN`: Obtenha em [Mercado Pago Developers](https://www.mercadopago.com.br/developers)

### 3. Configurar banco de dados

```bash
# Gerar cliente Prisma
npx prisma generate

# Criar migrações
npx prisma migrate dev --name init

# (Opcional) Popular com dados iniciais
# Acesse http://localhost:3000/api/products/seed via POST request
```

### 4. Criar usuário admin (opcional)

Após criar sua conta, você pode tornar-se admin executando no banco:

```sql
UPDATE "User" SET "isAdmin" = true WHERE email = 'seu-email@exemplo.com';
```

### 5. Executar o projeto

```bash
npm run dev
```

Acesse http://localhost:3000

## Estrutura do Projeto

- `app/`: Páginas e rotas (App Router do Next.js)
- `components/`: Componentes React reutilizáveis
- `lib/`: Utilitários e configurações
- `prisma/`: Schema do banco de dados
- `public/`: Arquivos estáticos

## Funcionalidades Principais

1. **Autenticação**: Login com e-mail ou Google
2. **Criação de Marca**: Com assistência de IA
3. **Geração de Estampas**: Via OpenAI DALL-E
4. **Upload de Estampas**: Suporte a PNG, JPG, SVG
5. **Mockups**: Preview realista com canvas
6. **Produtos**: Sistema de catálogo
7. **Carrinho e Checkout**: Integração com Mercado Pago
8. **Pedidos**: Acompanhamento de status
9. **Admin**: Painel administrativo

## Próximos Passos

- Configurar armazenamento em nuvem para estampas (ex: AWS S3, Cloudinary)
- Implementar sistema de carrinho persistente no banco
- Adicionar mais produtos ao catálogo
- Configurar webhooks do Mercado Pago
- Adicionar testes
- Configurar CI/CD

