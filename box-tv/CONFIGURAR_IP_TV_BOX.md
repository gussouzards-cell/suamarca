# 🔧 Configurar IP para TV Box Real

Guia para alterar o IP da API antes de gerar o APK para TV Box real.

---

## 📍 ONDE ESTÁ O IP?

O IP da API está configurado em:
- **`android-app/app/src/main/java/com/radioindoor/app/data/api/ApiClient.kt`**

---

## 🔄 COMO ALTERAR O IP

### Passo 1: Descobrir o IP do Servidor

**No Windows (PowerShell):**
```powershell
ipconfig
```

Procure por **IPv4 Address** na interface de rede ativa:
```
Adaptador Ethernet Ethernet:
   IPv4 Address. . . . . . . . . . . : 192.168.1.100
```

**Exemplo:** `192.168.1.100`

### Passo 2: Alterar no Código

Abra o arquivo:
```
android-app/app/src/main/java/com/radioindoor/app/data/api/ApiClient.kt
```

**Encontre a linha:**
```kotlin
private const val BASE_URL = "http://192.168.1.100:3000/api/"
```

**Altere para o IP do seu servidor:**
```kotlin
private const val BASE_URL = "http://SEU_IP_AQUI:3000/api/"
```

**Exemplo:**
```kotlin
private const val BASE_URL = "http://192.168.1.100:3000/api/"
```

---

## ✅ CHECKLIST ANTES DE GERAR APK

- [ ] Descobriu o IP do servidor (`ipconfig`)
- [ ] Alterou `BASE_URL` no `ApiClient.kt`
- [ ] Verificou se o backend está rodando na porta 3000
- [ ] Testou se consegue acessar `http://SEU_IP:3000/api/devices` no navegador
- [ ] TV Box e servidor estão na mesma rede Wi-Fi

---

## 🧪 TESTAR ANTES DE GERAR APK

### 1. Testar no Navegador

Abra no navegador:
```
http://SEU_IP:3000/api/devices
```

Deve retornar JSON (mesmo que vazio `[]`).

### 2. Testar no Emulador (Opcional)

Se quiser testar no emulador primeiro:
- Use `http://10.0.2.2:3000/api/` (localhost do emulador)
- Ou use o IP real se estiver na mesma rede

---

## 📱 CONFIGURAÇÕES PARA TV BOX

### IPs Comuns de Rede Local

- **192.168.1.x** (mais comum)
- **192.168.0.x**
- **10.0.0.x**
- **172.16.x.x**

### Exemplo Completo

Se seu servidor está em `192.168.1.100`:

```kotlin
private const val BASE_URL = "http://192.168.1.100:3000/api/"
```

---

## 🔒 SEGURANÇA DE REDE

O arquivo `network_security_config.xml` já está configurado para permitir:
- ✅ Comunicação HTTP com IPs locais
- ✅ Emulador (10.0.2.2)
- ✅ Redes locais (192.168.x.x, 10.x.x.x, 172.16.x.x)

**Não precisa alterar nada neste arquivo!**

---

## 🚀 GERAR APK

Após configurar o IP:

1. **Build > Generate Signed Bundle / APK**
2. Selecione **APK**
3. Configure a assinatura
4. Selecione **release** ou **debug**
5. Gere o APK

---

## 🐛 PROBLEMAS COMUNS

### Problema 1: App não conecta na API

**Solução:**
- Verifique se IP está correto
- Verifique se backend está rodando
- Verifique se TV Box e servidor estão na mesma rede
- Teste no navegador: `http://SEU_IP:3000/api/devices`

### Problema 2: IP muda frequentemente

**Solução:**
- Configure IP fixo no servidor (DHCP reservation)
- Ou use hostname se tiver DNS local

### Problema 3: Firewall bloqueando

**Solução:**
- Libere porta 3000 no firewall do Windows
- Verifique se backend está acessível

---

## 💡 DICA: IP Fixo no Servidor

Para evitar mudanças de IP:

1. **Windows:**
   - Configurações > Rede > Propriedades do adaptador
   - Configurar IP manual (ex: 192.168.1.100)

2. **Ou no roteador:**
   - Configure DHCP Reservation
   - Reserve IP para MAC Address do servidor

---

## 📋 RESUMO

1. **Descubra o IP:** `ipconfig` no PowerShell
2. **Altere o código:** `ApiClient.kt` → `BASE_URL`
3. **Teste:** Acesse `http://SEU_IP:3000/api/devices` no navegador
4. **Gere APK:** Build > Generate Signed Bundle / APK

**Pronto! Seu APK vai conectar na TV Box! 🎉**






