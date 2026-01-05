# 📁 Como Renomear a Pasta - Passo a Passo

## ✅ Sim, você pode renomear diretamente na pasta!

### Passo a Passo:

1. **Feche o Cursor/VS Code e o terminal** (importante!)

2. **Abra o Windows Explorer** (Explorador de Arquivos)

3. **Navegue até:**
   ```
   C:\Users\Saba\Desktop
   ```

4. **Clique com o botão direito na pasta:**
   ```
   Marca de roupas
   ```

5. **Selecione "Renomear"**

6. **Digite o novo nome (sem espaços):**
   ```
   marca-de-roupas
   ```
   ou
   ```
   suamarca
   ```

7. **Pressione Enter**

8. **Abra o Cursor/VS Code novamente** e abra a pasta renomeada

9. **No terminal, verifique se está tudo OK:**
   ```powershell
   git status
   ```

10. **Pronto! Agora faça um novo deploy na Vercel**

## ⚠️ Importante

- **Feche o Cursor/VS Code antes de renomear** - caso contrário pode dar erro
- O Git não se importa com o nome da pasta - tudo continuará funcionando
- Todos os arquivos e histórico do Git permanecem intactos

## ✅ Depois de Renomear

Quando abrir o projeto novamente, tudo deve funcionar normalmente. O Git vai continuar funcionando porque ele usa o repositório remoto, não o nome da pasta local.

