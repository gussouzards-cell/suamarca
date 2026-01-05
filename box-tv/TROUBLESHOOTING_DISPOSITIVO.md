# 🔧 Troubleshooting - Dispositivo Não Aparece no Painel

Guia para resolver quando o dispositivo não aparece no painel admin.

---

## 🔍 DIAGNÓSTICO

### 1. Verificar se Backend está Rodando

```powershell
# Testar API
curl http://localhost:3000/api/devices
```

Deve retornar: `[]` ou lista de dispositivos.

### 2. Verificar URL da API no App

**Edite:** `android-app/app/src/main/java/com/radioindoor/app/data/api/ApiClient.kt`

**Para Emulador:**
```kotlin
private const val BASE_URL = "http://10.0.2.2:3000/api/"
```

**Para Dispositivo Físico (mesma rede):**
```kotlin
private const val BASE_URL = "http://192.168.1.100:3000/api/"
```
(Substitua pelo IP do seu PC)

**Descobrir IP do PC:**
```powershell
ipconfig
# Procure por "IPv4 Address"
```

### 3. Verificar Logs do App

**Via ADB:**
```bash
# Logs do app
adb logcat | grep RadioIndoor

# Logs de API
adb logcat | grep ApiClient

# Logs de registro
adb logcat | grep "Device UUID"
adb logcat | grep "registrado"
```

**O que procurar:**
- `"Device UUID: ..."` - UUID gerado
- `"Dispositivo registrado com sucesso"` - Registro OK
- `"Falha ao registrar dispositivo"` - Erro de registro
- `"Heartbeat enviado com sucesso"` - Heartbeat OK

### 4. Verificar Logs do Backend

No terminal onde o backend está rodando, você deve ver:
```
POST /api/devices/register
POST /api/devices/{uuid}/heartbeat
```

### 5. Testar Registro Manual

**Obter UUID do dispositivo:**
```bash
adb logcat | grep "Device UUID"
# Ou
adb shell cat /data/data/com.radioindoor.app/shared_prefs/device_prefs.xml
```

**Registrar manualmente via API:**
```bash
curl -X POST http://localhost:3000/api/devices/register \
  -H "Content-Type: application/json" \
  -d "{\"uuid\": \"UUID_DO_DISPOSITIVO\", \"nome\": \"TV Box Teste\"}"
```

### 6. Verificar Conectividade

**Do dispositivo para o servidor:**
```bash
# Via ADB
adb shell ping IP_DO_SERVIDOR

# Testar API
adb shell curl http://IP_DO_SERVIDOR:3000/api/devices
```

---

## ✅ SOLUÇÕES

### Solução 1: URL da API Incorreta

**Problema:** App não consegue conectar ao backend.

**Solução:**
1. Edite `ApiClient.kt`
2. Use IP correto (não localhost)
3. Recompile e reinstale o app

### Solução 2: Backend Não Está Rodando

**Problema:** Backend parado ou porta errada.

**Solução:**
```powershell
cd backend
npm run start:dev
```

Verifique se está em: `http://localhost:3000`

### Solução 3: Firewall Bloqueando

**Problema:** Firewall do Windows bloqueando porta 3000.

**Solução:**
1. Windows Defender Firewall
2. Permitir app através do firewall
3. Adicionar porta 3000

### Solução 4: Dispositivo Não Registrado

**Problema:** App não está registrando automaticamente.

**Solução:**
- O código agora registra automaticamente
- Se não funcionar, registre manualmente (veja acima)

### Solução 5: CORS no Backend

**Problema:** Backend bloqueando requisições.

**Solução:**
Verifique `backend/src/main.ts`:
```typescript
app.enableCors({
  origin: process.env.ADMIN_PANEL_URL || 'http://localhost:3001',
  credentials: true,
});
```

---

## 🧪 TESTE COMPLETO

### Passo a Passo:

1. **Backend rodando:**
   ```powershell
   cd backend
   npm run start:dev
   ```

2. **Testar API:**
   ```powershell
   curl http://localhost:3000/api/devices
   ```

3. **App rodando** (emulador ou dispositivo)

4. **Ver logs:**
   ```bash
   adb logcat | grep RadioIndoor
   ```

5. **Verificar no painel:**
   - Acesse: `http://localhost:3001`
   - Dispositivo deve aparecer em 1-2 minutos

---

## 📋 CHECKLIST

- [ ] Backend rodando em `http://localhost:3000`
- [ ] URL da API correta no `ApiClient.kt`
- [ ] App instalado e rodando
- [ ] Logs mostram "Dispositivo registrado"
- [ ] Logs mostram "Heartbeat enviado"
- [ ] Backend recebe requisições (ver terminal)
- [ ] Painel admin acessível
- [ ] Dispositivo aparece na lista

---

## 🚨 SE NADA FUNCIONAR

1. **Registrar manualmente:**
   - Obter UUID dos logs
   - Registrar via curl (veja acima)

2. **Verificar banco de dados:**
   ```sql
   SELECT * FROM devices;
   ```

3. **Reiniciar tudo:**
   - Parar backend
   - Parar app
   - Reiniciar backend
   - Reiniciar app

---

**Problema resolvido! 🎉**






