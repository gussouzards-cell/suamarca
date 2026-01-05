# 📱 Verificar App no Emulador

Guia para verificar se o app está funcionando no emulador Android.

---

## ✅ URL ESTÁ CORRETA

Para emulador, a URL está correta:
```kotlin
private const val BASE_URL = "http://10.0.2.2:3000/api/"
```

`10.0.2.2` é o IP especial do emulador para acessar `localhost` do PC.

---

## 🔍 VERIFICAR SE APP ESTÁ ENVIANDO

### 1. Verificar Logs do App

**No Android Studio:**
- Aba **Logcat** (parte inferior)
- Filtro: `RadioIndoor`

**Ou via ADB:**
```bash
adb logcat | grep RadioIndoor
```

**O que deve aparecer:**
```
RadioIndoor: Application onCreate
RadioIndoor: Device UUID: 550e8400-...
RadioIndoor: Dispositivo registrado com sucesso
RadioIndoor: Heartbeat enviado com sucesso
```

**Se aparecer erro:**
```
RadioIndoor: Erro ao registrar dispositivo: ...
RadioIndoor: Falha ao enviar heartbeat: ...
```

### 2. Verificar Logs do Backend

No terminal onde o backend está rodando, você deve ver:
```
POST /api/devices/register 201
POST /api/devices/{uuid}/heartbeat 200
```

**Se NÃO aparecer:** O app não está conseguindo conectar.

### 3. Testar Conectividade do Emulador

```bash
# Testar se emulador consegue acessar o PC
adb shell ping -c 3 10.0.2.2
```

### 4. Testar API do Emulador

```bash
# Testar se consegue acessar a API
adb shell curl http://10.0.2.2:3000/api/devices
```

---

## 🐛 PROBLEMAS COMUNS NO EMULADOR

### Problema 1: Backend Não Está Rodando

**Sintoma:** Logs mostram "Connection refused" ou timeout

**Solução:**
```powershell
cd backend
npm run start:dev
```

Verifique se aparece: `🚀 Backend rodando em http://localhost:3000`

### Problema 2: App Não Está Rodando

**Sintoma:** Nenhum log aparece

**Solução:**
- Execute o app no emulador
- Verifique se o app iniciou
- Veja a tela do emulador

### Problema 3: Erro de Permissão

**Sintoma:** Logs mostram erro de permissão

**Solução:**
- Verificar AndroidManifest.xml
- Verificar se permissões estão concedidas

### Problema 4: URL Errada (Improvável)

**Sintoma:** Timeout ou 404

**Solução:**
- Verificar se URL é exatamente: `http://10.0.2.2:3000/api/`
- Verificar se termina com `/api/`

---

## 🧪 TESTE COMPLETO

### Passo 1: Verificar Backend

```powershell
# Testar API
curl http://localhost:3000/api/devices
```

Deve retornar: `[]`

### Passo 2: Executar App no Emulador

1. Android Studio
2. Selecione o emulador
3. Clique em **Run** (▶️)
4. Aguarde app iniciar

### Passo 3: Verificar Logs

**No Android Studio (Logcat):**
- Filtro: `RadioIndoor`
- Procure por: `"Device UUID"`, `"registrado"`, `"Heartbeat"`

**No terminal do backend:**
- Deve aparecer requisições POST

### Passo 4: Aguardar 1-2 Minutos

O app:
- Registra quando inicia
- Envia heartbeat a cada 1 minuto

### Passo 5: Verificar Banco

```sql
SELECT * FROM devices;
```

### Passo 6: Verificar Painel

1. Acesse: `http://localhost:3001`
2. Dispositivo deve aparecer

---

## 📋 CHECKLIST

- [ ] Backend rodando em `http://localhost:3000`
- [ ] App executado no emulador
- [ ] Logs do app mostram "Device UUID"
- [ ] Logs do app mostram "Dispositivo registrado"
- [ ] Backend recebe requisições (ver terminal)
- [ ] Aguardou 1-2 minutos
- [ ] Banco tem dispositivos: `SELECT * FROM devices;`
- [ ] Painel mostra dispositivo

---

## 🚨 SE NADA FUNCIONAR

### 1. Reiniciar Tudo

```powershell
# Parar backend (Ctrl+C)
# Parar app no emulador
# Reiniciar backend
cd backend
npm run start:dev

# Reiniciar app no emulador
```

### 2. Verificar Logs Completos

```bash
# Todos os logs do app
adb logcat | grep -i radio

# Logs de erro
adb logcat | grep -i error
```

### 3. Testar Registro Manual

```powershell
# Registrar manualmente
curl -X POST http://localhost:3000/api/devices/register `
  -H "Content-Type: application/json" `
  -d '{\"uuid\": \"teste-emulador-123\", \"nome\": \"Emulador Teste\"}'

# Verificar
curl http://localhost:3000/api/devices
```

---

**Execute o app no emulador e me diga o que aparece nos logs! 🔍**






