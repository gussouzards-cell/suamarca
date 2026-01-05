# 🔍 Verificar se Android está Enviando para API

Guia para verificar se o app está se comunicando corretamente com a API.

---

## 📊 STATUS ATUAL

### ✅ Backend
- **Status:** Rodando na porta 3000
- **IP do PC:** `192.168.1.11`
- **API respondendo:** Sim (retorna `[]`)

### ⚠️ URL no App Android
- **Configurada:** `http://10.0.2.2:3000/api/`
- **Tipo:** URL para **EMULADOR**

---

## 🔧 CORRIGIR URL DA API

### Se você está usando EMULADOR:
```kotlin
// Está correto!
private const val BASE_URL = "http://10.0.2.2:3000/api/"
```

### Se você está usando DISPOSITIVO FÍSICO (TV Box):
```kotlin
// Precisa mudar para IP do seu PC
private const val BASE_URL = "http://192.168.1.11:3000/api/"
```

**Edite:** `android-app/app/src/main/java/com/radioindoor/app/data/api/ApiClient.kt`

---

## 🧪 COMO VERIFICAR SE ESTÁ ENVIANDO

### 1. Verificar Logs do App

**Via ADB:**
```bash
adb logcat | grep RadioIndoor
```

**O que procurar:**
- ✅ `"Device UUID: ..."` - UUID gerado
- ✅ `"Dispositivo registrado com sucesso"` - Registro OK
- ✅ `"Heartbeat enviado com sucesso"` - Heartbeat OK
- ❌ `"Erro ao registrar dispositivo"` - Problema
- ❌ `"Falha ao enviar heartbeat"` - Problema

### 2. Verificar Logs do Backend

No terminal onde o backend está rodando, você deve ver:
```
POST /api/devices/register 201
POST /api/devices/{uuid}/heartbeat 200
```

### 3. Verificar no Banco de Dados

```sql
SELECT * FROM devices;
```

Deve mostrar dispositivos registrados.

### 4. Testar API Manualmente

**Listar dispositivos:**
```powershell
curl http://localhost:3000/api/devices
```

**Registrar manualmente (teste):**
```powershell
curl -X POST http://localhost:3000/api/devices/register `
  -H "Content-Type: application/json" `
  -d '{\"uuid\": \"teste-123\", \"nome\": \"Teste\"}'
```

---

## 🔍 DIAGNÓSTICO PASSO A PASSO

### Passo 1: Verificar URL

**Edite:** `ApiClient.kt`

**Para Emulador:**
```kotlin
private const val BASE_URL = "http://10.0.2.2:3000/api/"
```

**Para Dispositivo Físico:**
```kotlin
private const val BASE_URL = "http://192.168.1.11:3000/api/"
```

### Passo 2: Recompilar App

- Build > Clean Project
- Build > Rebuild Project
- Run novamente

### Passo 3: Verificar Logs

```bash
# Logs do app
adb logcat | grep RadioIndoor

# Deve mostrar:
# - Device UUID
# - Dispositivo registrado
# - Heartbeat enviado
```

### Passo 4: Verificar Backend

No terminal do backend, deve aparecer:
```
POST /api/devices/register
POST /api/devices/{uuid}/heartbeat
```

### Passo 5: Verificar no Painel

1. Acesse: `http://localhost:3001`
2. Aguarde 1-2 minutos
3. Dispositivo deve aparecer

---

## 🐛 PROBLEMAS COMUNS

### Problema 1: URL Errada

**Sintoma:** Logs mostram erro de conexão

**Solução:** 
- Emulador: `http://10.0.2.2:3000/api/`
- Físico: `http://192.168.1.11:3000/api/`

### Problema 2: Backend Não Acessível

**Sintoma:** Timeout ou conexão recusada

**Solução:**
- Verificar se backend está rodando
- Verificar firewall
- Testar: `curl http://localhost:3000/api/devices`

### Problema 3: Dispositivo Não Registra

**Sintoma:** Logs mostram "Falha ao registrar"

**Solução:**
- Verificar se backend está rodando
- Verificar URL da API
- Verificar logs do backend

---

## ✅ CHECKLIST

- [ ] URL da API correta no `ApiClient.kt`
- [ ] Backend rodando em `http://localhost:3000`
- [ ] App recompilado após mudar URL
- [ ] Logs mostram "Dispositivo registrado"
- [ ] Logs mostram "Heartbeat enviado"
- [ ] Backend recebe requisições (ver terminal)
- [ ] Dispositivo aparece no painel

---

**Verifique a URL e teste novamente! 🔍**






