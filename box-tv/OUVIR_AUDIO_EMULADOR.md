# 🔊 Ouvir Áudio no Emulador Android

Guia para ouvir o streaming de áudio no emulador Android Studio.

---

## ✅ SIM, VOCÊ CONSEGUE OUVIR!

O emulador Android **reproduz áudio normalmente** e você pode ouvir pelo computador.

---

## 🔧 CONFIGURAÇÕES

### 1. Verificar Volume do Emulador

**No emulador:**
- Use os botões de volume do emulador
- Ou vá em **Settings > Sound** no emulador
- Aumente o volume

### 2. Verificar Volume do PC

- Verifique o volume do Windows
- Verifique se não está mudo

### 3. Verificar Configuração do Emulador

**No Android Studio:**
1. **Tools > Device Manager**
2. Clique nos **3 pontos** ao lado do emulador
3. **Edit**
4. **Show Advanced Settings**
5. Verifique:
   - **Audio:** Deve estar habilitado
   - **Audio Playback:** Deve estar configurado

---

## 🐛 SE NÃO ESTÁ OUVINDO

### Problema 1: Volume Baixo ou Mudo

**Solução:**
- Aumente volume no emulador
- Aumente volume no PC
- Verifique se não está mudo

### Problema 2: Áudio Desabilitado no Emulador

**Solução:**
1. **Tools > Device Manager**
2. **Edit** o emulador
3. **Show Advanced Settings**
4. Verifique se **Audio** está habilitado

### Problema 3: App Não Está Tocando

**Solução:**
- Verifique se URL de streaming está configurada
- Verifique logs: `adb logcat | grep StreamingService`
- Verifique se status está "active" no painel admin

### Problema 4: Driver de Áudio

**Solução:**
- Reinicie o emulador
- Reinicie o Android Studio
- Verifique drivers de áudio do PC

---

## 🧪 TESTE RÁPIDO

### 1. Testar Áudio do Emulador

**No emulador:**
- Abra um app de música
- Ou acesse um site com áudio
- Deve tocar normalmente

### 2. Testar App Rádio Indoor

1. Configure URL de streaming no painel admin
2. Status: **Ativo**
3. Aguarde alguns segundos
4. Deve começar a tocar

### 3. Verificar Logs

```bash
adb logcat | grep StreamingService
```

Deve mostrar:
```
StreamingService: Iniciando streaming: https://...
StreamingService: Player ready
```

---

## 📋 CHECKLIST

- [ ] Volume do emulador aumentado
- [ ] Volume do PC aumentado
- [ ] Áudio habilitado no emulador
- [ ] URL de streaming configurada
- [ ] Status do dispositivo: **Ativo**
- [ ] Logs mostram "Player ready"
- [ ] Aguardou alguns segundos após ativar

---

## 💡 DICAS

### Dica 1: Usar Fone de Ouvido

Se não ouvir pelo PC, conecte fone de ouvido no PC.

### Dica 2: Verificar Configuração de Áudio do Windows

- Verifique se o dispositivo de áudio está correto
- Teste com outro app (YouTube, etc.)

### Dica 3: Testar URL de Streaming

Teste a URL em outro player primeiro:
- VLC Media Player
- Navegador (Chrome, Firefox)

Se funcionar no VLC, deve funcionar no app.

---

## 🎯 RESUMO

**SIM, você consegue ouvir!**

O emulador reproduz áudio normalmente. Se não estiver ouvindo:
1. Verifique volume (emulador + PC)
2. Verifique se áudio está habilitado no emulador
3. Verifique se app está tocando (logs)
4. Configure URL de streaming no painel admin

---

**Configure a URL de streaming no painel admin e você deve ouvir! 🎵**






