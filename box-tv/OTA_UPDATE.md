# Sistema de OTA Update - Rádio Indoor

Sistema completo de atualização Over-The-Air (OTA) para o app Android TV Box.

## 📋 Funcionalidades

- ✅ Verificação automática de atualizações a cada 6 horas
- ✅ Download automático de APK via DownloadManager
- ✅ Validação de APK antes da instalação
- ✅ Instalação automática (sem root)
- ✅ Retry automático em caso de falha
- ✅ Suporte a atualizações obrigatórias (force_update)
- ✅ Logs detalhados
- ✅ Reinício automático após atualização

## 🔧 Configuração

### Backend

O endpoint `/api/update/check` retorna:

```json
{
  "latest_version": 2,
  "apk_url": "http://servidor.com/downloads/app-release.apk",
  "force_update": false
}
```

**Configurar URL do APK:**

Edite `backend/src/update/update.service.ts`:

```typescript
return {
  latest_version: 2, // versionCode da versão mais recente
  apk_url: process.env.APK_URL || 'http://seu-servidor.com/app-release.apk',
  force_update: false, // true para obrigar atualização
};
```

Ou configure via variável de ambiente:

```env
APK_URL=http://seu-servidor.com/app-release.apk
```

### Android App

O sistema de OTA está integrado automaticamente no `RadioIndoorApplication`.

**Verificação:**
- A cada 6 horas automaticamente
- Imediatamente ao iniciar o app

**Configuração de intervalo:**

Edite `UpdateManager.kt`:

```kotlin
private const val CHECK_INTERVAL = 6 * 60 * 60 * 1000L // 6 horas
```

## 📦 Preparar APK para Distribuição

### 1. Build do APK Release

```bash
cd android-app
./gradlew assembleRelease
```

APK estará em: `app/build/outputs/apk/release/app-release.apk`

### 2. Hospedar APK

Coloque o APK em um servidor web acessível pelas TV Boxes:

- Servidor HTTP/HTTPS
- CDN
- Cloud Storage (S3, Google Cloud Storage, etc.)

**Exemplo com servidor simples:**

```bash
# Usando Python
cd backend
mkdir -p public/downloads
cp ../android-app/app/build/outputs/apk/release/app-release.apk public/downloads/app-release.apk

# Servir arquivos estáticos (adicionar no NestJS)
```

### 3. Configurar URL no Backend

```typescript
// update.service.ts
apk_url: 'http://seu-ip:3000/downloads/app-release.apk'
```

## 🔄 Fluxo de Atualização

```
1. App inicia → UpdateManager verifica atualização
2. API retorna latest_version > versionCode atual
3. DownloadManager baixa APK
4. Validação do APK (tamanho, existência)
5. Instalação automática
6. App reinicia automaticamente
7. Streaming retoma normalmente
```

## 📝 Logs

### Verificar logs de atualização:

```bash
adb logcat | grep UpdateManager
```

### Logs importantes:

- `"Verificando atualização..."` - Início da verificação
- `"Nova versão disponível: X"` - Atualização encontrada
- `"Download iniciado: ID"` - Download começou
- `"Download completado"` - Download finalizado
- `"APK validado, iniciando instalação..."` - Instalação iniciada
- `"Instalação bem-sucedida"` - Atualização concluída

## ⚙️ Permissões

O app requer as seguintes permissões para OTA:

- `REQUEST_INSTALL_PACKAGES` - Instalar APKs
- `DOWNLOAD_WITHOUT_NOTIFICATION` - Download em background
- `WRITE_EXTERNAL_STORAGE` (Android 12 e abaixo)

**Nota:** Em Android 8.0+, o usuário precisa permitir "Instalar apps de fontes desconhecidas" manualmente na primeira vez, ou o app pode solicitar via `REQUEST_INSTALL_PACKAGES`.

## 🛡️ Segurança

### Validação de APK

O sistema valida:
- ✅ Arquivo existe e pode ser lido
- ✅ Tamanho mínimo (1MB) para evitar APKs corrompidos

### Recomendações:

1. **Assinar APK:** Use certificado válido para assinar APKs
2. **HTTPS:** Use HTTPS para servir APKs
3. **Checksum:** Implemente verificação de checksum/MD5
4. **Validação de assinatura:** Valide assinatura do APK antes de instalar

## 🔄 Retry e Fallback

### Retry Automático

- **Verificação:** Até 3 tentativas (1, 2, 3 minutos)
- **Download:** Até 3 tentativas (5, 10, 15 minutos)
- **Atualização obrigatória:** Retenta após 1 hora se falhar

### Fallback

Se o método padrão de instalação falhar, tenta:
- PackageInstaller API (Android 5.0+)
- Método alternativo de instalação

## 📊 Monitoramento

### Verificar versão atual do app:

```bash
adb shell dumpsys package com.radioindoor.app | grep versionCode
```

### Forçar verificação de atualização:

```bash
# Reiniciar app
adb shell am force-stop com.radioindoor.app
adb shell am start -n com.radioindoor.app/.MainActivity
```

## 🐛 Troubleshooting

### Atualização não verifica

- Verifique logs: `adb logcat | grep UpdateManager`
- Verifique se API está acessível
- Verifique URL da API no `ApiClient.kt`

### Download não inicia

- Verifique permissões
- Verifique espaço em disco
- Verifique conectividade

### Instalação falha

- Verifique permissão "Instalar de fontes desconhecidas"
- Verifique se APK está válido
- Verifique logs de instalação

### App não reinicia após atualização

- Verifique se BootReceiver está configurado
- Verifique se app é launcher padrão
- Reinicie manualmente se necessário

## 🔐 Atualização Obrigatória

Para forçar atualização:

```typescript
// update.service.ts
return {
  latest_version: 2,
  apk_url: '...',
  force_update: true, // ← Atualização obrigatória
};
```

Quando `force_update: true`:
- App tenta atualizar imediatamente
- Se falhar, retenta após 1 hora
- Continua tentando até atualizar

## 📈 Próximos Passos

1. **Implementar checksum/MD5** para validação de APK
2. **Adicionar progresso de download** na UI (opcional)
3. **Notificações** de atualização disponível
4. **Histórico de versões** no backend
5. **Rollback automático** em caso de falha

---

**Sistema OTA pronto para uso em produção! 🚀**







