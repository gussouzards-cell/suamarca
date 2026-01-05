# 🔧 Corrigir Erro 403 no Streaming

Guia para resolver erro 403 (Forbidden) ao tentar reproduzir streaming.

---

## 🐛 PROBLEMA

**Erro:** `Response code: 403` ao tentar reproduzir streaming.

Isso indica que o servidor está bloqueando a requisição.

---

## ✅ SOLUÇÕES IMPLEMENTADAS

### 1. Headers Customizados

O código já foi atualizado para enviar:
- User-Agent que simula navegador Chrome
- Headers comuns de streaming
- Headers de segurança (Sec-Fetch-*)

### 2. Verificar se Funcionou

Após recompilar, verifique nos logs:
```
Headers configurados: {...}
```

---

## 🔍 POSSÍVEIS CAUSAS

### Causa 1: Servidor Bloqueia por IP/Região

**Solução:**
- Verificar se o servidor permite acesso do seu IP
- Testar a URL em um navegador primeiro
- Verificar se há restrições geográficas

### Causa 2: Servidor Requer Autenticação

**Solução:**
- Verificar se a URL requer token ou autenticação
- Adicionar token nos headers se necessário:
```kotlin
put("Authorization", "Bearer SEU_TOKEN")
```

### Causa 3: Servidor Bloqueia User-Agent

**Solução:**
- Testar diferentes User-Agents
- Usar User-Agent de um navegador real que funciona

### Causa 4: Servidor Requer Referer

**Solução:**
- Adicionar header Referer:
```kotlin
put("Referer", "https://radioindoor.com.br/")
```

---

## 🧪 TESTAR URL

### 1. Testar no Navegador

Abra a URL no navegador:
```
https://radioindoor.com.br/radio/f875245e0fbfe1815493a52ab098f847
```

**Se funcionar no navegador:**
- O problema é com os headers do app
- Verificar se headers estão sendo enviados corretamente

**Se não funcionar no navegador:**
- O problema é com a URL ou servidor
- Verificar se URL está correta
- Verificar se servidor está acessível

### 2. Testar com VLC

Abra a URL no VLC Media Player:
- Se funcionar: URL está OK, problema é no app
- Se não funcionar: URL ou servidor tem problema

---

## 🔧 ADICIONAR HEADERS ADICIONAIS

Se ainda não funcionar, adicione mais headers em `createHttpDataSourceFactory()`:

```kotlin
put("Referer", "https://radioindoor.com.br/")
put("Origin", "https://radioindoor.com.br")
put("X-Requested-With", "XMLHttpRequest")
```

---

## 📋 CHECKLIST

- [ ] Headers customizados implementados
- [ ] User-Agent simula navegador
- [ ] URL testada no navegador
- [ ] URL testada no VLC
- [ ] Logs mostram headers configurados
- [ ] Servidor acessível do seu IP

---

## 💡 DICA

Se o servidor requer autenticação ou token:
1. Obter token da API do servidor
2. Adicionar no header Authorization
3. Atualizar código para incluir token

---

**Após recompilar, verifique os logs para confirmar que os headers estão sendo enviados!**






