# Módulo de Atualização OTA

Módulo responsável por fornecer informações de atualização para o app Android.

## Endpoint

### `GET /api/update/check`

Retorna informações sobre a versão mais recente do app.

**Response:**
```json
{
  "latest_version": 2,
  "apk_url": "http://servidor.com/downloads/app-release.apk",
  "force_update": false
}
```

**Campos:**
- `latest_version` (number): versionCode da versão mais recente
- `apk_url` (string): URL do APK para download
- `force_update` (boolean): Se true, atualização é obrigatória

## Configuração

### Via Variável de Ambiente

```env
APK_URL=http://seu-servidor.com/app-release.apk
```

### Via Código

Edite `update.service.ts`:

```typescript
async getUpdateInfo() {
  return {
    latest_version: 2,
    apk_url: process.env.APK_URL || 'http://localhost:3000/downloads/app-release.apk',
    force_update: false,
  };
}
```

## Próximos Passos

Para produção, considere:

1. **Banco de Dados:** Armazenar versões em tabela
2. **Validação:** Verificar se versão é válida
3. **Histórico:** Manter histórico de versões
4. **Rollback:** Suporte a rollback de versões
5. **Checksum:** Adicionar MD5/SHA256 do APK







