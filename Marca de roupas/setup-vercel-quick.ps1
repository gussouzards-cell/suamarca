# Script RÁPIDO para configurar variáveis de ambiente na Vercel
# Execute: .\setup-vercel-quick.ps1
# 
# IMPORTANTE: Substitua os valores abaixo com suas credenciais reais

Write-Host "🚀 Configurando variáveis de ambiente na Vercel..." -ForegroundColor Cyan

# ============================================
# CONFIGURE AQUI SUAS VARIÁVEIS
# ============================================

$DATABASE_URL = "postgres://38e14f06aaed86c30cf0d49dda4bd2555ca575d2b2e247b23b62012dbccbb6c5:sk_4zOUDBN7Xf0_I8hqzi4UP@db.prisma.io:5432/postgres?sslmode=require"

# Substitua pelo URL do seu projeto na Vercel
$NEXTAUTH_URL = "https://seu-projeto.vercel.app"

# Gera NEXTAUTH_SECRET automaticamente
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
$NEXTAUTH_SECRET = [Convert]::ToBase64String($bytes)

# Opcionais (deixe vazio se não tiver)
$OPENAI_API_KEY = ""
$MERCADOPAGO_ACCESS_TOKEN = ""
$GOOGLE_CLIENT_ID = ""
$GOOGLE_CLIENT_SECRET = ""

# ============================================
# FIM DA CONFIGURAÇÃO
# ============================================

Write-Host ""
Write-Host "📋 Configurando variáveis..." -ForegroundColor Yellow

# Solicitar NEXTAUTH_URL se não foi configurado
if ([string]::IsNullOrWhiteSpace($NEXTAUTH_URL)) {
    $NEXTAUTH_URL = Read-Host "Digite a NEXTAUTH_URL (https://seu-projeto.vercel.app)"
}

# Verificar Vercel CLI
try {
    vercel --version | Out-Null
} catch {
    Write-Host "❌ Vercel CLI não está instalado. Instale com: npm i -g vercel" -ForegroundColor Red
    exit 1
}

# Verificar login
try {
    vercel whoami | Out-Null
} catch {
    Write-Host "🔐 Fazendo login na Vercel..." -ForegroundColor Yellow
    vercel login
}

# Configurar variáveis obrigatórias
Write-Host "✅ Configurando DATABASE_URL..." -ForegroundColor Green
$DATABASE_URL | vercel env add DATABASE_URL production preview development

Write-Host "✅ Configurando NEXTAUTH_URL..." -ForegroundColor Green
$NEXTAUTH_URL | vercel env add NEXTAUTH_URL production preview development

Write-Host "✅ Configurando NEXTAUTH_SECRET..." -ForegroundColor Green
Write-Host "   Secret gerado: $NEXTAUTH_SECRET" -ForegroundColor Gray
$NEXTAUTH_SECRET | vercel env add NEXTAUTH_SECRET production preview development

# Configurar variáveis opcionais se fornecidas
if ($OPENAI_API_KEY) {
    Write-Host "✅ Configurando OPENAI_API_KEY..." -ForegroundColor Green
    $OPENAI_API_KEY | vercel env add OPENAI_API_KEY production preview development
}

if ($MERCADOPAGO_ACCESS_TOKEN) {
    Write-Host "✅ Configurando MERCADOPAGO_ACCESS_TOKEN..." -ForegroundColor Green
    $MERCADOPAGO_ACCESS_TOKEN | vercel env add MERCADOPAGO_ACCESS_TOKEN production preview development
}

if ($GOOGLE_CLIENT_ID) {
    Write-Host "✅ Configurando GOOGLE_CLIENT_ID..." -ForegroundColor Green
    $GOOGLE_CLIENT_ID | vercel env add GOOGLE_CLIENT_ID production preview development
}

if ($GOOGLE_CLIENT_SECRET) {
    Write-Host "✅ Configurando GOOGLE_CLIENT_SECRET..." -ForegroundColor Green
    $GOOGLE_CLIENT_SECRET | vercel env add GOOGLE_CLIENT_SECRET production preview development
}

Write-Host ""
Write-Host "✅ Todas as variáveis foram configuradas!" -ForegroundColor Green
Write-Host "🚀 Agora você pode fazer o deploy na Vercel normalmente." -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Dica: Salve o NEXTAUTH_SECRET gerado em local seguro:" -ForegroundColor Yellow
Write-Host "   $NEXTAUTH_SECRET" -ForegroundColor Gray

