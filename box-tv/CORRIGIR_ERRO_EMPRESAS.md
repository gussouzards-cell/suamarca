# 🔧 Corrigir Erro: Cannot POST /api/companies

Guia para resolver o erro ao salvar empresas.

---

## 🐛 PROBLEMA

**Erro:** `Cannot POST /api/companies`

Isso indica que a rota não está sendo encontrada pelo backend.

---

## ✅ SOLUÇÃO

### Passo 1: Corrigir Erro de Compilação

O scheduler tinha um erro. Já foi corrigido:
- `EVERY_2_MINUTES` → `EVERY_5_MINUTES`

### Passo 2: Reiniciar o Backend

**IMPORTANTE:** O backend precisa ser reiniciado para carregar o novo módulo `CompaniesModule`.

#### Se o backend está rodando:

1. **Pare o backend:**
   - Pressione `Ctrl+C` no terminal onde está rodando
   - Ou feche o terminal

2. **Reinicie:**
   ```bash
   cd backend
   npm run start:dev
   ```

#### Se o backend não está rodando:

```bash
cd backend
npm run start:dev
```

---

## 🧪 TESTAR

### 1. Verificar se Backend está Rodando

Abra no navegador:
```
http://localhost:3000/api/companies
```

Deve retornar `[]` (array vazio) se não houver empresas.

### 2. Testar Criação via API

**PowerShell:**
```powershell
$body = @{
    nome = "Empresa Teste"
    descricao = "Teste"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/companies" -Method POST -Body $body -ContentType "application/json"
```

**Ou via curl:**
```bash
curl -X POST http://localhost:3000/api/companies \
  -H "Content-Type: application/json" \
  -d '{"nome":"Empresa Teste","descricao":"Teste"}'
```

### 3. Verificar Logs do Backend

Ao iniciar, deve aparecer:
```
🚀 Backend rodando em http://localhost:3000
```

E ao fazer requisição:
```
[Nest] LOG [RoutesResolver] CompaniesController {/companies}: +0ms
```

---

## 🔍 VERIFICAÇÕES

### 1. Verificar se CompaniesModule está Importado

**Arquivo:** `backend/src/app.module.ts`

Deve conter:
```typescript
import { CompaniesModule } from './companies/companies.module';

@Module({
  imports: [
    // ...
    CompaniesModule,
  ],
})
```

### 2. Verificar se Controller está Configurado

**Arquivo:** `backend/src/companies/companies.controller.ts`

Deve conter:
```typescript
@Controller('companies')
export class CompaniesController {
  @Post()
  async create(@Body() createCompanyDto: CreateCompanyDto) {
    // ...
  }
}
```

### 3. Verificar Prefixo Global

**Arquivo:** `backend/src/main.ts`

Deve conter:
```typescript
app.setGlobalPrefix('api');
```

Isso faz com que todas as rotas tenham prefixo `/api`.

---

## 🐛 OUTROS PROBLEMAS POSSÍVEIS

### Problema 1: Porta Diferente

Se o backend está em outra porta, atualize a URL no frontend:

**Arquivo:** `admin-panel/lib/api.ts`

```typescript
baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
```

### Problema 2: CORS

Se houver erro de CORS, verifique:

**Arquivo:** `backend/src/main.ts`

```typescript
app.enableCors({
  origin: process.env.ADMIN_PANEL_URL || 'http://localhost:3001',
  credentials: true,
});
```

### Problema 3: Banco de Dados

Se houver erro de banco, verifique:

1. PostgreSQL está rodando
2. `.env` está configurado corretamente
3. Tabela `companies` será criada automaticamente

---

## ✅ CHECKLIST

- [ ] Erro do scheduler corrigido
- [ ] Backend reiniciado
- [ ] Backend rodando sem erros
- [ ] Teste via navegador: `http://localhost:3000/api/companies`
- [ ] Teste criação via API
- [ ] Teste no painel admin

---

## 🎯 RESUMO

1. **Corrigir erro do scheduler** ✅ (já feito)
2. **Reiniciar backend** ⚠️ (você precisa fazer)
3. **Testar criação de empresa** ⚠️ (depois de reiniciar)

**Após reiniciar o backend, o erro deve desaparecer! 🎉**






