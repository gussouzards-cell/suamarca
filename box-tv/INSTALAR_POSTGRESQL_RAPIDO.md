# ⚡ Instalação Rápida do PostgreSQL - Windows

Guia rápido para quem tem pressa.

---

## 🚀 INSTALAÇÃO RÁPIDA (5 minutos)

### 1. Download
- Acesse: https://www.postgresql.org/download/windows/
- Baixe: **PostgreSQL 15** ou **16** (Windows x86-64)

### 2. Instalar
- Execute o instalador como **Administrador**
- Clique **Next** em todas as telas
- **IMPORTANTE:** Anote a senha do usuário `postgres`!
- Porta: `5432` (padrão)
- Aguarde instalação

### 3. Verificar
```powershell
psql --version
```

### 4. Criar Banco
```powershell
psql -U postgres
```
Digite a senha que você criou.

```sql
CREATE DATABASE radio_indoor;
\q
```

### 5. Configurar Backend
Edite `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
DB_NAME=radio_indoor
```

**✅ Pronto!**

---

## 🔧 Se "psql não é reconhecido"

Adicione ao PATH:
```
C:\Program Files\PostgreSQL\15\bin
```

Ou use caminho completo:
```powershell
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres
```

---

## 📋 Comandos Úteis

```powershell
# Conectar
psql -U postgres

# Listar bancos
\l

# Criar banco
CREATE DATABASE radio_indoor;

# Sair
\q
```

---

**Para guia completo, veja: `INSTALAR_POSTGRESQL_WINDOWS.md`**







