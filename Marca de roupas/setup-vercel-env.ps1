# Script PowerShell para configurar variáveis de ambiente na Vercel
# Execute: .\setup-vercel-env.ps1

Write-Host "🚀 Configurando variáveis de ambiente na Vercel..." -ForegroundColor Cyan

# Verificar se Vercel CLI está instalado
try {
    $vercelVersion = vercel --version 2>$null
    Write-Host "✅ Vercel CLI encontrado: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI não está instalado." -ForegroundColor Red
    Write-Host "Instale com: npm i -g vercel" -ForegroundColor Yellow
    exit 1
}

# Verificar se está logado
try {
    vercel whoami 2>$null | Out-Null
    Write-Host "✅ Logado na Vercel" -ForegroundColor Green
} catch {
    Write-Host "🔐 Fazendo login na Vercel..." -ForegroundColor Yellow
    vercel login
}

Write-Host ""
Write-Host "📋 Configure as variáveis de ambiente:" -ForegroundColor Cyan
Write-Host ""

# DATABASE_URL
$DATABASE_URL = Read-Host "Digite a DATABASE_URL (postgres://...)"
vercel env add DATABASE_URL production preview development
Write-Host $DATABASE_URL | vercel env add DATABASE_URL production preview development

# NEXTAUTH_URL
$NEXTAUTH_URL = Read-Host "Digite a NEXTAUTH_URL (https://seu-projeto.vercel.app)"
Write-Host $NEXTAUTH_URL | vercel env add NEXTAUTH_URL production preview development

# NEXTAUTH_SECRET
$generateSecret = Read-Host "Gerar NEXTAUTH_SECRET automaticamente? (s/n)"
if ($generateSecret -eq "s" -or $generateSecret -eq "S") {
    $bytes = New-Object byte[] 32
    [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
    $NEXTAUTH_SECRET = [Convert]::ToBase64String($bytes)
    Write-Host "✅ NEXTAUTH_SECRET gerado: $NEXTAUTH_SECRET" -ForegroundColor Green
} else {
    $NEXTAUTH_SECRET = Read-Host "Digite a NEXTAUTH_SECRET"
}
Write-Host $NEXTAUTH_SECRET | vercel env add NEXTAUTH_SECRET production preview development

# Variáveis opcionais
$configOpenAI = Read-Host "Deseja configurar OPENAI_API_KEY? (s/n)"
if ($configOpenAI -eq "s" -or $configOpenAI -eq "S") {
    $OPENAI_API_KEY = Read-Host "Digite a OPENAI_API_KEY"
    Write-Host $OPENAI_API_KEY | vercel env add OPENAI_API_KEY production preview development
}

$configMP = Read-Host "Deseja configurar MERCADOPAGO_ACCESS_TOKEN? (s/n)"
if ($configMP -eq "s" -or $configMP -eq "S") {
    $MERCADOPAGO_ACCESS_TOKEN = Read-Host "Digite o MERCADOPAGO_ACCESS_TOKEN"
    Write-Host $MERCADOPAGO_ACCESS_TOKEN | vercel env add MERCADOPAGO_ACCESS_TOKEN production preview development
}

Write-Host ""
Write-Host "✅ Variáveis de ambiente configuradas!" -ForegroundColor Green
Write-Host "🚀 Agora você pode fazer o deploy normalmente." -ForegroundColor Cyan

