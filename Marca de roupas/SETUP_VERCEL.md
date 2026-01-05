# 🚀 Setup Rápido - Vercel

## Opção 1: Script Automático (Mais Fácil) ⭐

### Passo 1: Instalar Vercel CLI
```powershell
npm i -g vercel
```

### Passo 2: Editar e Executar Script
1. Abra o arquivo `setup-vercel-quick.ps1`
2. Edite as variáveis no início do arquivo:
   - `$DATABASE_URL` - Cole sua URL do PostgreSQL
   - `$NEXTAUTH_URL` - URL do seu projeto na Vercel
   - Outras variáveis opcionais (se tiver)

3. Execute:
```powershell
.\setup-vercel-quick.ps1
```

Pronto! Todas as variáveis serão configuradas automaticamente.

## Opção 2: Configuração Manual via CLI

### Passo 1: Instalar e Fazer Login
```powershell
npm i -g vercel
vercel login
```

### Passo 2: Configurar Variáveis

```powershell
# DATABASE_URL
echo "postgres://sua-url-aqui" | vercel env add DATABASE_URL production preview development

# NEXTAUTH_URL
echo "https://seu-projeto.vercel.app" | vercel env add NEXTAUTH_URL production preview development

# NEXTAUTH_SECRET (gerar automaticamente)
$secret = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
echo $secret | vercel env add NEXTAUTH_SECRET production preview development
```

## Opção 3: Via Interface Web da Vercel

1. Acesse https://vercel.com
2. Vá em seu projeto → **Settings → Environment Variables**
3. Adicione manualmente cada variável

## ✅ Após Configurar

Apenas faça o deploy normalmente:
- Via Git push (deploy automático)
- Ou via `vercel --prod`

## 📋 Variáveis Obrigatórias

- `DATABASE_URL` - URL do PostgreSQL
- `NEXTAUTH_URL` - URL do seu projeto
- `NEXTAUTH_SECRET` - Chave secreta (pode ser gerada automaticamente)

## 📋 Variáveis Opcionais

- `OPENAI_API_KEY` - Para geração de estampas com IA
- `MERCADOPAGO_ACCESS_TOKEN` - Para pagamentos
- `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` - Para login com Google

