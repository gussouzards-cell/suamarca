# Quick Start - Rádio Indoor

Guia rápido para começar em 5 minutos.

## 🚀 Início Rápido

### 1. Backend (2 minutos)

```bash
cd backend
npm install
cp .env.example .env
# Edite .env com suas credenciais PostgreSQL
npm run start:dev
```

### 2. Painel Admin (1 minuto)

```bash
cd admin-panel
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api" > .env.local
npm run dev
```

Acesse: http://localhost:3001
Login: `admin` / `admin`

### 3. App Android (2 minutos)

1. Abra `android-app` no Android Studio
2. Edite `ApiClient.kt` - altere `BASE_URL` para IP do servidor
3. Build > Generate Signed Bundle / APK
4. Instale na TV Box
5. Configure como launcher padrão

## ✅ Pronto!

Sistema funcionando. Configure primeira TV Box no painel admin.

---

**Para instalação completa, veja [INSTALL.md](INSTALL.md)**







