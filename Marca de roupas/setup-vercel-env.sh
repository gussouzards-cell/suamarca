#!/bin/bash

# Script para configurar variáveis de ambiente na Vercel
# Execute: bash setup-vercel-env.sh

echo "🚀 Configurando variáveis de ambiente na Vercel..."

# Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI não está instalado."
    echo "Instale com: npm i -g vercel"
    exit 1
fi

# Verificar se está logado
if ! vercel whoami &> /dev/null; then
    echo "🔐 Fazendo login na Vercel..."
    vercel login
fi

echo ""
echo "📋 Configure as variáveis de ambiente:"
echo ""

# DATABASE_URL
read -p "Digite a DATABASE_URL (postgres://...): " DATABASE_URL
vercel env add DATABASE_URL production preview development <<< "$DATABASE_URL"

# NEXTAUTH_URL
read -p "Digite a NEXTAUTH_URL (https://seu-projeto.vercel.app): " NEXTAUTH_URL
vercel env add NEXTAUTH_URL production preview development <<< "$NEXTAUTH_URL"

# NEXTAUTH_SECRET
read -p "Digite a NEXTAUTH_SECRET (ou pressione Enter para gerar): " NEXTAUTH_SECRET
if [ -z "$NEXTAUTH_SECRET" ]; then
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    echo "✅ NEXTAUTH_SECRET gerado: $NEXTAUTH_SECRET"
fi
vercel env add NEXTAUTH_SECRET production preview development <<< "$NEXTAUTH_SECRET"

# Variáveis opcionais
read -p "Deseja configurar OPENAI_API_KEY? (s/n): " config_openai
if [ "$config_openai" = "s" ]; then
    read -p "Digite a OPENAI_API_KEY: " OPENAI_API_KEY
    vercel env add OPENAI_API_KEY production preview development <<< "$OPENAI_API_KEY"
fi

read -p "Deseja configurar MERCADOPAGO_ACCESS_TOKEN? (s/n): " config_mp
if [ "$config_mp" = "s" ]; then
    read -p "Digite o MERCADOPAGO_ACCESS_TOKEN: " MERCADOPAGO_ACCESS_TOKEN
    vercel env add MERCADOPAGO_ACCESS_TOKEN production preview development <<< "$MERCADOPAGO_ACCESS_TOKEN"
fi

echo ""
echo "✅ Variáveis de ambiente configuradas!"
echo "🚀 Agora você pode fazer o deploy normalmente."

