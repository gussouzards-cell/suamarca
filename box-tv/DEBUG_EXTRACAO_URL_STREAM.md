# 🔍 Debug: Extração de URL de Stream

Guia para debugar a extração automática de URL de stream de páginas web.

---

## 🐛 PROBLEMA ATUAL

A função `detectAndExtractStreamUrl` está sendo chamada, mas:
- Os logs não aparecem
- A URL não está sendo extraída
- O app tenta reproduzir a página HTML diretamente

---

## ✅ LOGS ESPERADOS

Após recompilar, você deve ver nos logs:

```
🎯 URL recebida da configuração: https://radioindoor.com.br/radio/...
🔄 Chamando detectAndExtractStreamUrl...
🔍 [DETECT] Iniciando detecção de URL: ...
⚠️ [DETECT] URL parece ser página web (contém /radio/ sem extensão de áudio)
📥 Fazendo requisição para extrair stream de: ...
📄 HTML recebido (X caracteres)
✅ [DETECT] URL extraída: ...
🎯 URL FINAL para streaming: ...
```

---

## 🔍 VERIFICAR

### 1. Se os logs aparecem

**Se NÃO aparecem:**
- A função não está sendo executada
- Pode haver problema com coroutines
- Verificar se `serviceScope.launch` está funcionando

**Se aparecem mas falha:**
- Verificar erro específico nos logs
- Verificar se HTML está sendo recebido
- Verificar se padrões regex estão encontrando a URL

### 2. Testar URL manualmente

Abra a URL no navegador:
```
https://radioindoor.com.br/radio/f875245e0fbfe1815493a52ab098f847
```

**Inspecione o HTML:**
- Pressione F12 (DevTools)
- Procure por tags `<audio>`, `<video>`, ou JavaScript
- Procure por URLs que contenham "stream", "mp3", "m3u8", etc.

### 3. Verificar padrões de regex

Os padrões procuram por:
- `src="URL"` em tags audio/video
- `data-src="URL"` ou `data-url="URL"`
- URLs em JSON: `"url": "..."` ou `"stream": "..."`
- URLs diretas no texto
- Variáveis JavaScript: `var stream = "..."`

---

## 🔧 AJUSTAR PADRÕES

Se os padrões não estão encontrando a URL, adicione padrões específicos:

**Arquivo:** `StreamingForegroundService.kt`

**Função:** `extractStreamUrlFromPage`

**Adicionar padrão específico:**
```kotlin
// Padrão específico para radioindoor.com.br
Pattern.compile("radioindoor\\.com\\.br[^\\s\"'<>]*stream[^\\s\"'<>]*", Pattern.CASE_INSENSITIVE)
```

---

## 📋 CHECKLIST

- [ ] Logs aparecem no Logcat
- [ ] Função detectAndExtractStreamUrl é chamada
- [ ] HTML é recebido (verificar tamanho)
- [ ] Padrões regex encontram URL
- [ ] URL extraída é válida
- [ ] URL extraída funciona no VLC/navegador

---

## 💡 DICA

Se não conseguir extrair automaticamente:
1. Inspecione o HTML da página manualmente
2. Encontre a URL do stream
3. Adicione padrão específico no código
4. Ou configure a URL direta do stream no painel admin

---

**Após recompilar, verifique os logs para ver o processo completo!**






