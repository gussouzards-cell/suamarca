# ⚙️ Configurar Backend - Próximos Passos

Banco de dados criado! Agora configure o backend.

---

## 📝 PASSO 1: Configurar Senha do Banco

1. **Abra o arquivo:** `backend/.env`

2. **Encontre a linha:**
   ```env
   DB_PASSWORD=SUA_SENHA_AQUI
   ```

3. **Substitua `SUA_SENHA_AQUI` pela senha do PostgreSQL:**
   ```env
   DB_PASSWORD=Postgres2024!
   ```
   (Use a senha que você criou durante a instalação)

4. **Salve o arquivo**

---

## 🚀 PASSO 2: Instalar Dependências

Abra PowerShell na pasta do backend:

```powershell
cd backend
npm install
```

Aguarde a instalação terminar.

---

## ✅ PASSO 3: Testar Conexão

Inicie o backend:

```powershell
npm run start:dev
```

**Se conectar com sucesso, você verá:**
```
🚀 Backend rodando em http://localhost:3000
```

**Se der erro de conexão:**
- Verifique se a senha no `.env` está correta
- Verifique se o PostgreSQL está rodando
- Verifique se o banco `radio_indoor` existe

---

## 🧪 PASSO 4: Testar API

Com o backend rodando, teste no navegador:

```
http://localhost:3000/api/devices
```

Deve retornar: `[]` (array vazio)

---

## ✅ CHECKLIST

- [ ] Banco `radio_indoor` criado
- [ ] Arquivo `.env` configurado com senha correta
- [ ] Dependências instaladas (`npm install`)
- [ ] Backend iniciado sem erros
- [ ] API respondendo em `http://localhost:3000/api/devices`

---

**Próximo passo:** Configurar o painel administrativo!






