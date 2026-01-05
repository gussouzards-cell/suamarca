# Simplificação: Remover Extração de URL

## Situação Atual

Com o uso do **WebView** no `MainActivity` que toca o áudio diretamente da página web, **não precisamos mais** da lógica complexa de extração de URL no `StreamingForegroundService`.

## O que fazer:

1. **Remover** as funções:
   - `detectAndExtractStreamUrl()`
   - `extractStreamUrlFromPage()`
   - `extractUrlFromHtml()`
   - Uso de `WebViewStreamExtractor`

2. **Simplificar** o serviço para:
   - Manter o app vivo (foreground service)
   - Monitorar configurações
   - ExoPlayer como **fallback opcional** apenas para streams diretos (URLs com extensão .mp3, .m3u8, etc)

3. **WebView é o método principal** - ele já toca diretamente da página

## Benefícios:

- ✅ Código muito mais simples
- ✅ Menos processamento
- ✅ Menos erros potenciais
- ✅ WebView já funciona perfeitamente

## Próximos passos:

O código já foi parcialmente simplificado. As funções de extração ainda existem mas não são mais chamadas na maioria dos casos. Podemos removê-las completamente se quiser.






