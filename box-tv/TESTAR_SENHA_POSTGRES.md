# 🔐 Testar Senha do PostgreSQL

O erro indica que a senha está incorreta. Vamos testar e corrigir.

## 🔍 TESTAR SENHA

### Método 1: Testar no psql

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres
```

Quando pedir a senha, tente:
- `47527016` (a que você me disse)
- Ou deixe em branco e pressione Enter

### Método 2: Verificar se consegue conectar

Se conseguir conectar no psql, a senha está correta.

Se não conseguir, a senha pode ser diferente.

## 🔧 SOLUÇÕES

### Solução 1: Redefinir Senha

Se você esqueceu a senha ou ela está diferente:

1. **Editar pg_hba.conf:**
   - Localização: `C:\Program Files\PostgreSQL\18\data\pg_hba.conf`
   - Encontre a linha:
     ```
     host    all             all             127.0.0.1/32            md5
     ```
   - Mude `md5` para `trust` (temporariamente):
     ```
     host    all             all             127.0.0.1/32            trust
     ```

2. **Reiniciar PostgreSQL:**
   ```powershell
   Restart-Service postgresql-x64-18
   ```

3. **Conectar sem senha:**
   ```powershell
   & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres
   ```

4. **Alterar senha:**
   ```sql
   ALTER USER postgres WITH PASSWORD '47527016';
   ```

5. **Reverter pg_hba.conf:**
   - Volte `trust` para `md5`

6. **Reiniciar novamente:**
   ```powershell
   Restart-Service postgresql-x64-18
   ```

### Solução 2: Verificar Senha no Instalador

Se você instalou recentemente, a senha pode ser a que você digitou durante a instalação.

Tente lembrar qual senha você usou quando instalou o PostgreSQL.

### Solução 3: Usar Autenticação Windows

Se você instalou como usuário Windows, pode tentar:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d postgres
```

E deixar senha em branco.

## ✅ DEPOIS DE CORRIGIR

Atualize o arquivo `.env`:

```env
DB_PASSWORD=senha_correta_aqui
```

E reinicie o backend.






