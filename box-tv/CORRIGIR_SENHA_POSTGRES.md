# 🔐 Corrigir Senha do PostgreSQL

O erro indica que a senha está incorreta. Vamos corrigir.

## 🔍 PASSO 1: Testar Senha Manualmente

Teste se consegue conectar com a senha:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres
```

Quando pedir a senha, tente:
- `47527016` (a que você me disse)
- Ou deixe em branco e pressione Enter

**Se conectar:** A senha está correta, mas pode haver problema no .env  
**Se não conectar:** A senha está diferente

## 🔧 PASSO 2: Redefinir Senha (Se Necessário)

Se a senha não funcionar, vamos redefini-la:

### 2.1. Editar pg_hba.conf

1. **Localize o arquivo:**
   ```
   C:\Program Files\PostgreSQL\18\data\pg_hba.conf
   ```

2. **Abra como Administrador** (botão direito > Abrir como administrador)

3. **Encontre a linha:**
   ```
   host    all             all             127.0.0.1/32            md5
   ```

4. **Mude `md5` para `trust`** (temporariamente):
   ```
   host    all             all             127.0.0.1/32            trust
   ```

5. **Salve o arquivo**

### 2.2. Reiniciar PostgreSQL

```powershell
Restart-Service postgresql-x64-18
```

### 2.3. Conectar Sem Senha

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres
```

Agora não vai pedir senha!

### 2.4. Alterar Senha

```sql
ALTER USER postgres WITH PASSWORD '47527016';
```

### 2.5. Reverter pg_hba.conf

1. Volte ao arquivo `pg_hba.conf`
2. Mude `trust` de volta para `md5`:
   ```
   host    all             all             127.0.0.1/32            md5
   ```
3. Salve

### 2.6. Reiniciar Novamente

```powershell
Restart-Service postgresql-x64-18
```

### 2.7. Testar Nova Senha

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres
```

Digite a senha: `47527016`

Se conectar, está funcionando! ✅

## ✅ PASSO 3: Atualizar .env

O arquivo `.env` já está criado com a senha. Se você redefiniu a senha, ele já deve estar correto.

Verifique se o arquivo `backend\.env` tem:
```env
DB_PASSWORD=47527016
```

## 🚀 PASSO 4: Testar Backend

Depois de corrigir a senha:

```powershell
cd backend
npm run start:dev
```

Deve conectar sem erros!

---

## 💡 DICA: Verificar Senha Atual

Se você não lembra qual senha usou durante a instalação, a única forma é redefinir usando o método acima.






