# 🔧 Fix: Erro de Nome do Projeto na Vercel

## Problema

O erro indica que o nome do diretório do projeto tem espaços:
```
Error: A Serverless Function has an invalid name: "'Marca de roupas/___next_launcher.cjs'". 
They must be less than 128 characters long and must not contain any space.
```

## Solução

### Opção 1: Renomear o Diretório (Recomendado)

1. Feche o terminal/IDE
2. Renomeie o diretório de `Marca de roupas` para `marca-de-roupas` (sem espaços)
3. Abra o projeto no novo diretório
4. Faça um novo deploy

### Opção 2: Configurar na Vercel

1. No painel da Vercel, vá em **Settings → General**
2. Em **Project Name**, altere para um nome sem espaços (ex: `marca-de-roupas`)
3. Salve e faça um novo deploy

### Opção 3: Usar Git (Se o repositório já está conectado)

Se você já conectou o repositório GitHub:
1. A Vercel usa o nome do repositório, não o diretório local
2. Verifique se o nome do repositório no GitHub não tem espaços
3. Se tiver, renomeie o repositório no GitHub

## Nota

O nome do diretório local não afeta o deploy se você estiver usando Git. O problema pode ser o nome do repositório no GitHub ou a configuração do projeto na Vercel.

