# 🎯 Exemplos Práticos de Uso

Exemplos reais de como usar o sistema no dia a dia.

---

## 📋 CENÁRIO 1: Primeira Instalação Completa

### Situação
Você acabou de baixar o projeto e quer colocar uma TV Box para funcionar.

### Passo a Passo

#### 1. Preparar Servidor (Backend + Painel)

```bash
# Terminal 1 - Backend
cd backend
npm install
# Criar .env com credenciais PostgreSQL
npm run start:dev

# Terminal 2 - Painel
cd admin-panel
npm install
# Criar .env.local com URL da API
npm run dev
```

#### 2. Configurar Banco de Dados

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar banco
CREATE DATABASE radio_indoor;

# Sair
\q
```

#### 3. Configurar App Android

1. Abrir Android Studio
2. Abrir projeto `android-app`
3. Editar `ApiClient.kt`:
   ```kotlin
   private const val BASE_URL = "http://192.168.1.50:3000/api/"
   ```
   (Substitua pelo IP do seu servidor)

4. Build APK:
   - Build > Generate Signed Bundle / APK
   - APK > release > Finish

#### 4. Instalar na TV Box

```bash
# Conectar TV Box
adb connect IP_DA_TV_BOX:5555

# Instalar
adb install app-release.apk

# Configurar Kiosk
adb shell pm set-home-activity com.radioindoor.app/.MainActivity

# Reiniciar
adb reboot
```

#### 5. Configurar Primeira Vez

1. Acessar painel: `http://localhost:3001`
2. Login: `admin` / `admin`
3. Aguardar TV Box aparecer (1-2 minutos)
4. Clicar em "Editar Configuração"
5. Preencher:
   - Nome: "TV Box Sala Principal"
   - URL: `https://stream.example.com/radio.mp3`
   - Volume: 50%
   - Status: Ativo
6. Salvar

#### 6. Verificar Funcionamento

```bash
# Ver logs
adb logcat | grep StreamingService

# Deve mostrar:
# "Iniciando streaming: https://..."
# "Player ready"
```

**✅ Pronto! TV Box está tocando rádio!**

---

## 📋 CENÁRIO 2: Adicionar Segunda TV Box

### Situação
Você já tem uma TV Box funcionando e quer adicionar outra.

### Passo a Passo

#### 1. Instalar APK na Nova TV Box

```bash
adb connect IP_NOVA_TV_BOX:5555
adb install app-release.apk
adb shell pm set-home-activity com.radioindoor.app/.MainActivity
adb reboot
```

#### 2. Identificar na Lista

1. Acessar painel admin
2. Aguardar nova TV Box aparecer
3. Ela aparecerá com UUID (ex: "550e8400-...")

#### 3. Configurar

1. Clicar em "Editar Configuração"
2. Nome: "TV Box Sala 2"
3. URL: (pode ser mesma ou diferente)
4. Volume: 50%
5. Status: Ativo
6. Salvar

**✅ Segunda TV Box configurada!**

---

## 📋 CENÁRIO 3: Mudar Volume Remotamente

### Situação
Volume está muito alto, precisa diminuir sem ir até a TV Box.

### Passo a Passo

1. Acessar painel admin
2. Encontrar TV Box na lista
3. Clicar em "Editar Configuração"
4. Alterar Volume: 50% → 30%
5. Clicar em "Salvar"
6. Aguardar até 5 minutos (atualização automática)

**Ou forçar atualização imediata:**

```bash
# Reiniciar app na TV Box
adb shell am force-stop com.radioindoor.app
adb shell am start -n com.radioindoor.app/.MainActivity
```

**✅ Volume alterado remotamente!**

---

## 📋 CENÁRIO 4: Mudar Rádio (URL de Streaming)

### Situação
Quer trocar a rádio que está tocando.

### Passo a Passo

1. Encontrar nova URL de streaming:
   - Exemplo: `https://stream.radios.com/radio123.mp3`
   - Testar no VLC primeiro para garantir que funciona

2. No painel admin:
   - Editar configuração da TV Box
   - Alterar URL de Streaming
   - Salvar

3. Em até 5 minutos:
   - App detecta mudança de URL
   - Para streaming atual
   - Inicia novo streaming

**✅ Rádio trocada!**

---

## 📋 CENÁRIO 5: Pausar Todas as TV Boxes

### Situação
Fim de semana, precisa pausar todas.

### Opção 1: Via Painel (Manual)

1. Acessar painel admin
2. Para cada TV Box:
   - Editar Configuração
   - Status: Inativo
   - Salvar

### Opção 2: Via API (Script)

```bash
# Listar todas
curl http://localhost:3000/api/devices > devices.json

# Para cada UUID (substitua {uuid}):
curl -X PUT http://localhost:3000/api/devices/{uuid} \
  -H "Content-Type: application/json" \
  -d '{"status": "inactive"}'
```

**✅ Todas pausadas!**

---

## 📋 CENÁRIO 6: Publicar Atualização do App

### Situação
Você melhorou o app e quer atualizar todas as TV Boxes automaticamente.

### Passo a Passo

#### 1. Incrementar Versão

Editar `android-app/app/build.gradle.kts`:

```kotlin
versionCode = 2  // Era 1, agora é 2
versionName = "1.0.1"
```

#### 2. Build Novo APK

```bash
cd android-app
./gradlew assembleRelease
```

APK estará em: `app/build/outputs/apk/release/app-release.apk`

#### 3. Hospedar APK

**Opção A: Servidor Local**

```bash
# Criar pasta de downloads
mkdir -p backend/public/downloads

# Copiar APK
cp app-release.apk backend/public/downloads/app-release-v2.apk

# Servir estáticos (adicionar no NestJS)
```

**Opção B: Servidor Web**

- Fazer upload para servidor web
- Exemplo: `http://seu-servidor.com/downloads/app-release-v2.apk`

#### 4. Atualizar Backend

Editar `backend/src/update/update.service.ts`:

```typescript
async getUpdateInfo() {
  return {
    latest_version: 2, // ← Nova versão
    apk_url: 'http://seu-ip:3000/downloads/app-release-v2.apk',
    force_update: false,
  };
}
```

#### 5. Aguardar ou Forçar

**Aguardar:** TV Boxes verificam a cada 6 horas

**Forçar imediato:**
```bash
# Reiniciar app em cada TV Box
adb shell am force-stop com.radioindoor.app
adb shell am start -n com.radioindoor.app/.MainActivity
```

**✅ Atualização publicada!**

---

## 📋 CENÁRIO 7: Diagnosticar Problema

### Situação
TV Box não está tocando rádio, precisa descobrir o problema.

### Passo a Passo

#### 1. Verificar Status no Painel

- TV Box aparece como online ou offline?
- Último contato foi quando?

#### 2. Verificar Logs

```bash
# Logs gerais
adb logcat | grep RadioIndoor

# Logs de streaming
adb logcat | grep StreamingService

# Logs de configuração
adb logcat | grep ConfigRepository

# Logs de API
adb logcat | grep ApiClient
```

#### 3. Verificar Conectividade

```bash
# Ping no servidor
adb shell ping IP_DO_SERVIDOR

# Testar API
adb shell curl http://IP_DO_SERVIDOR:3000/api/devices/{uuid}/config
```

#### 4. Verificar Configuração

```bash
# Ver cache local
adb shell cat /data/data/com.radioindoor.app/shared_prefs/radio_indoor_prefs.xml
```

#### 5. Verificar Permissões

```bash
# Listar permissões
adb shell dumpsys package com.radioindoor.app | grep permission
```

#### 6. Testar Manualmente

```bash
# Reiniciar app
adb shell am force-stop com.radioindoor.app
adb shell am start -n com.radioindoor.app/.MainActivity

# Verificar se serviço iniciou
adb shell dumpsys activity services | grep StreamingService
```

**✅ Problema identificado e resolvido!**

---

## 📋 CENÁRIO 8: Configurar Múltiplas TV Boxes com URLs Diferentes

### Situação
Você tem 5 TV Boxes e quer cada uma tocar uma rádio diferente.

### Passo a Passo

1. **Preparar URLs:**
   ```
   TV Box 1: https://stream1.com/radio.mp3
   TV Box 2: https://stream2.com/radio.mp3
   TV Box 3: https://stream3.com/radio.mp3
   TV Box 4: https://stream4.com/radio.mp3
   TV Box 5: https://stream5.com/radio.mp3
   ```

2. **No painel admin:**
   - Para cada TV Box:
     - Editar Configuração
     - Nome: "TV Box Sala X"
     - URL: URL correspondente
     - Volume: 50%
     - Status: Ativo
     - Salvar

3. **Verificar:**
   ```bash
   # Para cada TV Box
   adb logcat | grep "Iniciando streaming"
   ```

**✅ Cada TV Box tocando rádio diferente!**

---

## 📋 CENÁRIO 9: Atualização Obrigatória (Force Update)

### Situação
Você descobriu um bug crítico e precisa atualizar todas as TV Boxes imediatamente.

### Passo a Passo

#### 1. Build APK com Correção

```bash
# Incrementar versão
# Build APK
./gradlew assembleRelease
```

#### 2. Hospedar APK

```bash
# Upload para servidor
cp app-release.apk servidor/downloads/app-release-v3.apk
```

#### 3. Configurar como Obrigatória

Editar `backend/src/update/update.service.ts`:

```typescript
async getUpdateInfo() {
  return {
    latest_version: 3,
    apk_url: 'http://servidor/downloads/app-release-v3.apk',
    force_update: true, // ← OBRIGATÓRIA
  };
}
```

#### 4. Forçar Verificação

```bash
# Em cada TV Box
adb shell am force-stop com.radioindoor.app
adb shell am start -n com.radioindoor.app/.MainActivity
```

**Com `force_update: true`:**
- App tenta atualizar imediatamente
- Se falhar, retenta após 1 hora
- Continua tentando até atualizar

**✅ Atualização obrigatória ativada!**

---

## 📋 CENÁRIO 10: Monitorar Todas as TV Boxes

### Situação
Você quer ver status de todas as TV Boxes de uma vez.

### Opção 1: Via Painel

1. Acessar painel admin
2. Ver lista completa
3. Status online/offline visível
4. Último contato de cada uma

### Opção 2: Via API + Script

```bash
# Listar todas
curl http://localhost:3000/api/devices | jq '.[] | {nome, status, last_heartbeat}'
```

### Opção 3: Dashboard Personalizado

Criar script que consulta API e mostra:

```bash
#!/bin/bash
# monitor.sh

echo "=== Status das TV Boxes ==="
curl -s http://localhost:3000/api/devices | jq -r '.[] | "\(.nome // .uuid): \(.status) - Último: \(.last_heartbeat // "Nunca")"'
```

**✅ Monitoramento completo!**

---

## 💡 DICAS ÚTEIS

### Dica 1: Testar URL de Streaming Antes

Sempre teste a URL no VLC ou navegador antes de configurar:

```bash
# Testar no VLC
vlc https://stream.example.com/radio.mp3

# Ou no navegador
# Abrir URL diretamente
```

### Dica 2: Usar Nomes Descritivos

Nomeie as TV Boxes de forma clara:
- ✅ "TV Box Sala Principal"
- ✅ "TV Box Recepção"
- ❌ "TV Box 1"
- ❌ "Dispositivo"

### Dica 3: Manter Logs

Salve logs importantes:

```bash
# Salvar logs em arquivo
adb logcat | grep RadioIndoor > logs.txt
```

### Dica 4: Backup de Configurações

Antes de mudanças grandes, faça backup:

```bash
# Exportar configurações
curl http://localhost:3000/api/devices > backup-devices.json
```

### Dica 5: Testar em Uma TV Box Primeiro

Antes de aplicar em todas:
1. Teste em uma TV Box
2. Verifique se funciona
3. Depois aplique nas outras

---

**Exemplos práticos prontos para usar! 🚀**







