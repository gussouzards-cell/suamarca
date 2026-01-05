# 🐘 Guia de Instalação do PostgreSQL no Windows

Guia passo a passo para instalar PostgreSQL no seu PC Windows.

---

## 📋 PRÉ-REQUISITOS

- Windows 10 ou superior
- Acesso de administrador
- Conexão com internet (para download)

---

## 🚀 INSTALAÇÃO PASSO A PASSO

### PASSO 1: Download do PostgreSQL

1. **Acesse o site oficial:**
   - Vá para: https://www.postgresql.org/download/windows/
   - Ou diretamente: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

2. **Escolha a versão:**
   - Recomendado: **PostgreSQL 15** ou **PostgreSQL 16**
   - Clique em **"Download"**

3. **Selecione o instalador:**
   - Escolha: **Windows x86-64** (para PCs 64-bit)
   - Tamanho: ~200-300 MB

### PASSO 2: Executar Instalador

1. **Localize o arquivo baixado:**
   - Geralmente em: `Downloads/postgresql-XX.X-windows-x64.exe`

2. **Clique com botão direito > Executar como administrador**

3. **Aguarde o instalador abrir**

### PASSO 3: Configuração do Instalador

#### 3.1. Tela de Boas-Vindas
- Clique em **"Next"**

#### 3.2. Escolher Diretório de Instalação
- **Padrão:** `C:\Program Files\PostgreSQL\15` (ou versão instalada)
- **Recomendado:** Deixar padrão
- Clique em **"Next"**

#### 3.3. Selecionar Componentes
- ✅ **PostgreSQL Server** (obrigatório)
- ✅ **pgAdmin 4** (interface gráfica - recomendado)
- ✅ **Stack Builder** (ferramentas adicionais - opcional)
- ✅ **Command Line Tools** (obrigatório)
- Clique em **"Next"**

#### 3.4. Escolher Diretório de Dados
- **Padrão:** `C:\Program Files\PostgreSQL\15\data`
- **Recomendado:** Deixar padrão
- Clique em **"Next"**

#### 3.5. Configurar Senha do Superusuário
- **⚠️ IMPORTANTE:** Anote esta senha!
- **Usuário:** `postgres` (padrão)
- **Senha:** Digite uma senha forte
  - Exemplo: `Postgres2024!`
  - Mínimo 8 caracteres
  - Use letras, números e símbolos
- **Confirme a senha**
- Clique em **"Next"**

**💡 DICA:** Anote a senha em local seguro! Você vai precisar dela.

#### 3.6. Porta do Servidor
- **Padrão:** `5432`
- **Recomendado:** Deixar padrão
- Clique em **"Next"**

#### 3.7. Selecionar Locale
- **Padrão:** `[Default locale]`
- **Recomendado:** Deixar padrão
- Clique em **"Next"**

#### 3.8. Resumo da Instalação
- Revise as configurações
- Clique em **"Next"**

#### 3.9. Instalação
- Aguarde a instalação (5-10 minutos)
- Não feche a janela!

#### 3.10. Finalização
- ✅ Desmarque **"Launch Stack Builder"** (se não precisar)
- ✅ Marque **"Launch pgAdmin 4"** (se quiser usar interface gráfica)
- Clique em **"Finish"**

---

## ✅ VERIFICAR INSTALAÇÃO

### Método 1: Via Prompt de Comando

1. **Abrir PowerShell ou CMD como Administrador:**
   - Pressione `Win + X`
   - Escolha **"Windows PowerShell (Admin)"** ou **"Terminal (Admin)"**

2. **Verificar se PostgreSQL está instalado:**
   ```powershell
   psql --version
   ```

3. **Se aparecer a versão, está instalado!**

### Método 2: Via Serviços do Windows

1. **Abrir Serviços:**
   - Pressione `Win + R`
   - Digite: `services.msc`
   - Pressione Enter

2. **Procurar por:**
   - `postgresql-x64-15` (ou versão instalada)

3. **Verificar Status:**
   - Deve estar como **"Em execução"**
   - Tipo de inicialização: **"Automático"**

### Método 3: Testar Conexão

1. **Abrir PowerShell:**
   ```powershell
   # Conectar ao PostgreSQL
   psql -U postgres
   ```

2. **Digitar a senha** que você configurou

3. **Se conectar, verá:**
   ```
   postgres=#
   ```

4. **Testar comando:**
   ```sql
   SELECT version();
   ```

5. **Sair:**
   ```sql
   \q
   ```

---

## 🔧 CONFIGURAÇÃO INICIAL

### Criar Banco de Dados para o Projeto

1. **Conectar ao PostgreSQL:**
   ```powershell
   psql -U postgres
   ```

2. **Digitar senha quando solicitado**

3. **Criar banco de dados:**
   ```sql
   CREATE DATABASE radio_indoor;
   ```

4. **Verificar se foi criado:**
   ```sql
   \l
   ```
   (Deve aparecer `radio_indoor` na lista)

5. **Sair:**
   ```sql
   \q
   ```

---

## 🛠️ FERRAMENTAS ÚTEIS

### pgAdmin 4 (Interface Gráfica)

Se você instalou o pgAdmin 4:

1. **Abrir pgAdmin:**
   - Menu Iniciar > PostgreSQL > pgAdmin 4

2. **Primeira vez:**
   - Vai pedir para criar senha master
   - Anote essa senha também!

3. **Conectar ao servidor:**
   - Clique em **"Servers"** > **"PostgreSQL 15"**
   - Senha: A senha do usuário `postgres` que você criou

4. **Criar banco via interface:**
   - Clique direito em **"Databases"**
   - **Create** > **Database**
   - Nome: `radio_indoor`
   - **Save**

### psql (Linha de Comando)

Comandos úteis:

```sql
-- Listar bancos
\l

-- Conectar a um banco
\c radio_indoor

-- Listar tabelas
\dt

-- Ver estrutura de uma tabela
\d nome_tabela

-- Sair
\q
```

---

## 🔐 CONFIGURAR ACESSO REMOTO (Opcional)

Se precisar acessar de outra máquina:

### 1. Editar pg_hba.conf

Localização: `C:\Program Files\PostgreSQL\15\data\pg_hba.conf`

Adicionar linha:
```
host    all             all             0.0.0.0/0               md5
```

### 2. Editar postgresql.conf

Localização: `C:\Program Files\PostgreSQL\15\data\postgresql.conf`

Encontrar e alterar:
```
listen_addresses = '*'  # Era 'localhost'
```

### 3. Reiniciar Serviço

```powershell
# Como Administrador
Restart-Service postgresql-x64-15
```

---

## 🐛 TROUBLESHOOTING

### Problema: "psql não é reconhecido"

**Solução:**
1. Adicionar ao PATH:
   - Painel de Controle > Sistema > Variáveis de Ambiente
   - Editar PATH do usuário
   - Adicionar: `C:\Program Files\PostgreSQL\15\bin`
   - Reiniciar terminal

**Ou usar caminho completo:**
```powershell
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres
```

### Problema: Serviço não inicia

**Solução:**
1. Verificar logs:
   - `C:\Program Files\PostgreSQL\15\data\log\`

2. Verificar permissões:
   - Pasta `data` precisa de permissões de leitura/escrita

3. Reiniciar serviço:
   ```powershell
   Restart-Service postgresql-x64-15
   ```

### Problema: Esqueci a senha

**Solução:**
1. Editar `pg_hba.conf`:
   ```
   # Mudar de md5 para trust (temporariamente)
   host    all             all             127.0.0.1/32            trust
   ```

2. Reiniciar serviço

3. Conectar sem senha:
   ```powershell
   psql -U postgres
   ```

4. Alterar senha:
   ```sql
   ALTER USER postgres WITH PASSWORD 'NovaSenha123!';
   ```

5. Reverter `pg_hba.conf` para `md5`

6. Reiniciar serviço novamente

### Problema: Porta 5432 já em uso

**Solução:**
1. Verificar o que está usando:
   ```powershell
   netstat -ano | findstr :5432
   ```

2. Se for outro PostgreSQL, desinstalar ou mudar porta

3. Ou mudar porta do novo PostgreSQL durante instalação

---

## 📝 CONFIGURAR PARA O PROJETO

### 1. Criar Banco de Dados

```powershell
psql -U postgres
```

```sql
CREATE DATABASE radio_indoor;
\q
```

### 2. Configurar no Backend

Editar `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
DB_NAME=radio_indoor
```

**⚠️ IMPORTANTE:** Substitua `sua_senha_aqui` pela senha que você criou!

### 3. Testar Conexão

```powershell
cd backend
npm run start:dev
```

Se conectar sem erros, está funcionando! ✅

---

## 🎯 RESUMO RÁPIDO

### Comandos Essenciais

```powershell
# Conectar ao PostgreSQL
psql -U postgres

# Criar banco
CREATE DATABASE radio_indoor;

# Listar bancos
\l

# Sair
\q
```

### Informações Importantes

- **Usuário padrão:** `postgres`
- **Porta padrão:** `5432`
- **Localização dados:** `C:\Program Files\PostgreSQL\15\data`
- **Localização binários:** `C:\Program Files\PostgreSQL\15\bin`

### Verificar Status

```powershell
# Ver serviço
Get-Service postgresql*

# Iniciar serviço
Start-Service postgresql-x64-15

# Parar serviço
Stop-Service postgresql-x64-15

# Reiniciar serviço
Restart-Service postgresql-x64-15
```

---

## ✅ CHECKLIST DE INSTALAÇÃO

- [ ] PostgreSQL baixado e instalado
- [ ] Senha do usuário `postgres` anotada
- [ ] Serviço rodando (verificar em Services)
- [ ] Teste de conexão funcionando (`psql -U postgres`)
- [ ] Banco `radio_indoor` criado
- [ ] Backend configurado no `.env`
- [ ] Teste de conexão do backend funcionando

---

## 🎓 PRÓXIMOS PASSOS

Após instalar PostgreSQL:

1. ✅ Criar banco `radio_indoor`
2. ✅ Configurar `backend/.env`
3. ✅ Testar conexão do backend
4. ✅ Iniciar backend: `npm run start:dev`

**Pronto para usar! 🚀**

---

## 💡 DICAS

### Dica 1: Backup Regular

```powershell
# Fazer backup
pg_dump -U postgres radio_indoor > backup.sql

# Restaurar backup
psql -U postgres radio_indoor < backup.sql
```

### Dica 2: Usar pgAdmin para Visualizar

- Interface gráfica facilita muito
- Ver tabelas, dados, estrutura
- Executar queries visualmente

### Dica 3: Manter Senha Segura

- Use senha forte
- Não compartilhe
- Anote em local seguro
- Use gerenciador de senhas

---

**PostgreSQL instalado e configurado! 🎉**







