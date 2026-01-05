# ✅ Solução: Dispositivo Não Aparece no Painel

## 🔧 O QUE FOI CORRIGIDO

Implementei o **registro automático** do dispositivo. Agora o app:

1. ✅ **Registra automaticamente** quando inicia
2. ✅ **Envia heartbeat** a cada 1 minuto
3. ✅ **Aparece no painel** em 1-2 minutos

---

## 📋 PASSOS PARA RESOLVER

### 1. Recompilar o App

No Android Studio:
- **Build > Clean Project**
- **Build > Rebuild Project**
- Ou simplesmente **Run** novamente

### 2. Verificar URL da API

**IMPORTANTE:** Edite `ApiClient.kt` com o IP correto:

**Para Emulador:**
```kotlin
private const val BASE_URL = "http://10.0.2.2:3000/api/"
```

**Para Dispositivo Físico:**
```kotlin
private const val BASE_URL = "http://192.168.1.100:3000/api/"
```
(Substitua pelo IP do seu PC)

**Descobrir IP:**
```powershell
ipconfig
```

### 3. Verificar Logs

**No app (via ADB):**
```bash
adb logcat | grep RadioIndoor
```

**Deve mostrar:**
```
RadioIndoor: Device UUID: 550e8400-...
RadioIndoor: Dispositivo registrado com sucesso
RadioIndoor: Heartbeat enviado com sucesso
```

**No backend (terminal):**
Deve mostrar requisições:
```
POST /api/devices/register
POST /api/devices/{uuid}/heartbeat
```

### 4. Verificar no Painel

1. Acesse: `http://localhost:3001`
2. Aguarde 1-2 minutos
3. Dispositivo deve aparecer na lista

---

## 🧪 TESTE RÁPIDO

### 1. Verificar se Backend está Recebendo

```powershell
# Em outro terminal
curl http://localhost:3000/api/devices
```

### 2. Verificar UUID do Dispositivo

```bash
adb logcat | grep "Device UUID"
```

### 3. Registrar Manualmente (Se Necessário)

```bash
curl -X POST http://localhost:3000/api/devices/register \
  -H "Content-Type: application/json" \
  -d "{\"uuid\": \"UUID_DO_LOG\", \"nome\": \"TV Box Teste\"}"
```

---

## 🐛 SE AINDA NÃO APARECER

### Verificar:

1. **Backend rodando?**
   ```powershell
   # Testar
   curl http://localhost:3000/api/devices
   ```

2. **URL da API correta?**
   - Verifique `ApiClient.kt`
   - Use IP do PC, não localhost

3. **App consegue conectar?**
   ```bash
   # Ver logs
   adb logcat | grep "Erro\|Falha"
   ```

4. **Firewall bloqueando?**
   - Desative temporariamente para testar

5. **Banco de dados tem dados?**
   ```sql
   SELECT * FROM devices;
   ```

---

## ✅ CHECKLIST

- [ ] App recompilado com novo código
- [ ] URL da API configurada corretamente
- [ ] Backend rodando
- [ ] Logs mostram "Dispositivo registrado"
- [ ] Logs mostram "Heartbeat enviado"
- [ ] Aguardou 1-2 minutos
- [ ] Painel admin atualizado (F5)

---

**Agora o dispositivo deve aparecer automaticamente! 🎉**






