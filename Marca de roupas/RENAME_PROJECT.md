# ⚠️ IMPORTANTE: Renomear Projeto para Deploy na Vercel

## Problema

O diretório atual `Marca de roupas` tem espaços, o que causa erro na Vercel:
```
Error: A Serverless Function has an invalid name: "'Marca de roupas/___next_launcher.cjs'"
```

## ✅ Solução: Renomear o Diretório

### Passo a Passo:

1. **Feche o terminal e o VS Code/Cursor**

2. **No Windows Explorer, renomeie o diretório:**
   - De: `C:\Users\Saba\Desktop\Marca de roupas`
   - Para: `C:\Users\Saba\Desktop\marca-de-roupas`

3. **Abra o projeto no novo diretório:**
   ```powershell
   cd C:\Users\Saba\Desktop\marca-de-roupas
   ```

4. **Verifique se o Git ainda funciona:**
   ```powershell
   git status
   ```

5. **Faça um novo deploy na Vercel**

## 🔄 Alternativa: Renomear na Vercel

Se você não quiser renomear o diretório local:

1. No painel da Vercel, vá em **Settings → General**
2. Em **Project Name**, altere para `marca-de-roupas` (sem espaços)
3. Em **Root Directory**, deixe vazio ou configure como `.`
4. Salve e faça um novo deploy

## ⚠️ Nota Importante

O Git não se importa com o nome do diretório local - ele usa o nome do repositório remoto. Então renomear o diretório local não afeta o Git, apenas resolve o problema na Vercel.

