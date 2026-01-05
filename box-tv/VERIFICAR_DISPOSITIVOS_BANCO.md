# 🔍 Verificar Dispositivos no Banco de Dados

Guia para verificar se os dispositivos estão sendo registrados corretamente.

---

## 📊 VERIFICAR DISPOSITIVOS

### Via SQL (PostgreSQL)

```sql
-- Listar todos os dispositivos
SELECT uuid, nome, status, last_heartbeat, created_at 
FROM devices 
ORDER BY last_heartbeat DESC;
```

**Ou via psql:**
```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d radio_indoor -c "SELECT * FROM devices;"
```

### Via API

```powershell
curl http://localhost:3000/api/devices
```

### Via Painel Admin

1. Acesse: `http://localhost:3001`
2. Veja a lista de dispositivos

---

## 🔍 O QUE VERIFICAR

### Se NÃO há dispositivos:

1. **App não está registrando:**
   - Verificar URL da API no `ApiClient.kt`
   - Verificar logs: `adb logcat | grep RadioIndoor`
   - Verificar se backend está rodando

2. **App está registrando mas falhando:**
   - Verificar logs do backend
   - Verificar erros de conexão
   - Verificar se banco está acessível

### Se HÁ dispositivos mas não aparecem no painel:

1. **Verificar CORS no backend**
2. **Verificar URL da API no painel**
3. **Atualizar página do painel (F5)**

---

## 🧪 TESTE COMPLETO

### 1. Verificar Banco

```sql
SELECT COUNT(*) FROM devices;
SELECT uuid, nome, last_heartbeat FROM devices;
```

### 2. Verificar API

```powershell
curl http://localhost:3000/api/devices
```

### 3. Verificar Logs do App

```bash
adb logcat | grep RadioIndoor
```

### 4. Verificar Logs do Backend

No terminal do backend, deve mostrar requisições.

---

## 📋 INTERPRETAÇÃO DOS RESULTADOS

### Banco vazio (`0 rows`):
- App não está registrando
- Verificar URL da API
- Verificar logs do app

### Banco com dados mas painel vazio:
- Problema de CORS
- Problema de URL no painel
- Atualizar página

### Banco com dados e painel mostra:
- ✅ Tudo funcionando!

---

**Verifique o banco e me diga o resultado! 🔍**






