# 🔐 Como Acessar o Painel Admin

## Acesso ao Painel Admin

O painel administrativo está localizado em: **`/admin`**

### Requisitos

Para acessar o painel admin, você precisa:
1. Estar logado na plataforma
2. Ter a flag `isAdmin = true` no banco de dados

## Como Tornar um Usuário Admin

### Método 1: Via API (Recomendado)

Faça uma requisição POST para `/api/admin/make-admin`:

```bash
curl -X POST http://localhost:3000/api/admin/make-admin \
  -H "Content-Type: application/json" \
  -d '{"email": "seu-email@exemplo.com"}'
```

Ou usando PowerShell:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/admin/make-admin" -Method POST -ContentType "application/json" -Body '{"email":"seu-email@exemplo.com"}'
```

### Método 2: Diretamente no Banco de Dados

#### SQLite (Desenvolvimento Local):
```sql
UPDATE User SET isAdmin = 1 WHERE email = 'seu-email@exemplo.com';
```

#### PostgreSQL (Produção):
```sql
UPDATE "User" SET "isAdmin" = true WHERE email = 'seu-email@exemplo.com';
```

### Método 3: Usando Prisma Studio

1. Execute: `npx prisma studio`
2. Abra a tabela `User`
3. Encontre seu usuário pelo email
4. Edite o campo `isAdmin` para `true`
5. Salve

## Funcionalidades do Painel Admin

- ✅ Visualizar todos os pedidos
- ✅ Atualizar status dos pedidos
- ✅ Ver detalhes completos de cada pedido
- ✅ Gerenciar produção e envio

## Link no Dashboard

Quando você for admin, verá um botão **"Admin"** no header do dashboard que leva diretamente ao painel administrativo.

## Segurança

⚠️ **IMPORTANTE**: 
- A rota `/api/admin/make-admin` não está protegida por padrão
- Em produção, considere adicionar autenticação adicional ou remover esta rota após configurar o primeiro admin
- Ou adicione uma verificação de senha/secret na rota

