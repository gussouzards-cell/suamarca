# 🔧 Fix: Erro "No Next.js version detected" na Vercel

## Problema
A Vercel não está detectando o Next.js no seu projeto.

## Soluções

### Solução 1: Configurar Root Directory na Vercel (Interface Web)

1. No painel da Vercel, vá em **Settings → General**
2. Procure por **Root Directory**
3. Deixe vazio ou remova qualquer valor (não configure no vercel.json)
4. Salve e faça um novo deploy

**Nota**: O `rootDirectory` deve ser configurado apenas na interface web da Vercel, não no arquivo `vercel.json`.

### Solução 2: Verificar Estrutura do Repositório

Certifique-se de que o `package.json` está na raiz do repositório (não dentro de uma subpasta).

A estrutura correta deve ser:
```
suamarca/
├── package.json  ← Deve estar aqui
├── next.config.js
├── app/
├── components/
└── ...
```

### Solução 3: Forçar Detecção do Framework

1. No painel da Vercel, vá em **Settings → General**
2. Em **Framework Preset**, selecione manualmente: **Next.js**
3. Em **Build Command**, deixe: `npm run build`
4. Em **Output Directory**, deixe vazio
5. Em **Install Command**, deixe: `npm install`
6. Salve e faça um novo deploy

### Solução 4: Verificar package.json

Certifique-se de que o `package.json` tem:
- `"next"` em `dependencies` (não em `devDependencies`)
- Versão do Next.js especificada (ex: `"next": "^14.0.4"`)

### Solução 5: Limpar Cache e Redepoly

1. No painel da Vercel, vá em **Deployments**
2. Clique nos três pontos do último deploy
3. Selecione **Redeploy**
4. Marque **Use existing Build Cache** como desmarcado
5. Clique em **Redeploy**

## Verificação Rápida

Execute localmente para garantir que está tudo OK:
```bash
npm install
npm run build
```

Se funcionar localmente, o problema é apenas de configuração na Vercel.

## Configuração Recomendada na Vercel

- **Framework Preset**: Next.js
- **Root Directory**: `.` (vazio ou ponto)
- **Build Command**: `npm run build`
- **Output Directory**: (deixe vazio)
- **Install Command**: `npm install`
- **Node.js Version**: 18.x ou 20.x

