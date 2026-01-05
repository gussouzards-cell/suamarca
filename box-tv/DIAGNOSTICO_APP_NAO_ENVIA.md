# 🔍 Diagnóstico: App Não Está Enviando para API

## ❌ PROBLEMA IDENTIFICADO

**Banco de dados está vazio** - Nenhum dispositivo registrado.

Isso significa que o app Android **não está conseguindo** se comunicar com a API.

---

## 🔧 SOLUÇÕES

### 1. Verificar URL da API

**Edite:** `android-app/app/src/main/java/com/radioindoor/app/data/api/ApiClient.kt`

**Para EMULADOR:**
```kotlin
private const val BASE_URL = "http://10.0.2.2:3000/api/"
```

**Para DISPOSITIVO FÍSICO (TV Box):**
```kotlin
private const val BASE_URL = "http://192.168.1.11:3000/api/"
```
(Use o IP do seu PC: `192.168.1.11`)

### 2. Verificar se App Está Rodando

**Você está usando:**
- [ ] Emulador Android Studio
- [ ] TV Box física
- [ ] Dispositivo físico via USB

### 3. Verificar Logs do App

**Conecte o dispositivo/emulador e execute:**

```bash
# Logs gerais do app
adb logcat | grep RadioIndoor

# Logs de erro
adb logcat | grep -i error

# Logs de API
adb logcat | grep ApiClient
```

**O que procurar:**
- ✅ `"Device UUID: ..."` - UUID gerado
- ✅ `"Dispositivo registrado com sucesso"` - Registro OK
- ❌ `"Erro ao registrar dispositivo"` - Problema
- ❌ `"Falha ao conectar"` - URL errada ou backend offline

### 4. Verificar Logs do Backend

No terminal onde o backend está rodando, você deve ver:
```
POST /api/devices/register
```

**Se NÃO aparecer:** O app não está conseguindo conectar.

### 5. Testar Conectividade

**Do dispositivo para o servidor:**

**Se for emulador:**
```bash
adb shell ping 10.0.2.2
```

**Se for dispositivo físico:**
```bash
adb shell ping 192.168.1.11
```

### 6. Testar API Manualmente

**Registrar dispositivo manualmente (teste):**
```powershell
curl -X POST http://localhost:3000/api/devices/register `
  -H "Content-Type: application/json" `
  -d '{\"uuid\": \"teste-manual-123\", \"nome\": \"Teste Manual\"}'
```

Depois verifique:
```powershell
curl http://localhost:3000/api/devices
```

---

## 🎯 PASSOS PARA RESOLVER

### Passo 1: Confirmar Tipo de Dispositivo

Você está usando:
- **Emulador?** → URL: `http://10.0.2.2:3000/api/`
- **TV Box física?** → URL: `http://192.168.1.11:3000/api/`

### Passo 2: Configurar URL Correta

Edite `ApiClient.kt` com a URL correta.

### Passo 3: Recompilar App

- Build > Clean Project
- Build > Rebuild Project
- Run novamente

### Passo 4: Verificar Logs

```bash
adb logcat | grep RadioIndoor
```

### Passo 5: Aguardar 1-2 Minutos

O app registra quando inicia e envia heartbeat a cada 1 minuto.

### Passo 6: Verificar Banco

```sql
SELECT * FROM devices;
```

---

## 🐛 PROBLEMAS COMUNS

### Problema: "Erro ao conectar"

**Causa:** URL errada ou backend offline

**Solução:**
- Verificar URL no `ApiClient.kt`
- Verificar se backend está rodando
- Testar: `curl http://localhost:3000/api/devices`

### Problema: "Timeout"

**Causa:** Firewall ou rede

**Solução:**
- Desativar firewall temporariamente
- Verificar se estão na mesma rede
- Verificar IP do PC

### Problema: "404 Not Found"

**Causa:** URL da API incorreta

**Solução:**
- Verificar se termina com `/api/`
- Verificar porta (3000)
- Verificar IP correto

---

## ✅ CHECKLIST

- [ ] URL da API configurada corretamente
- [ ] Tipo de dispositivo identificado (emulador/físico)
- [ ] App recompilado após mudar URL
- [ ] Backend rodando
- [ ] Logs do app verificados
- [ ] Logs do backend verificados
- [ ] Conectividade testada (ping)
- [ ] Aguardou 1-2 minutos após iniciar app

---

**Me diga: você está usando emulador ou TV Box física? Isso vai definir a URL correta! 🔍**






