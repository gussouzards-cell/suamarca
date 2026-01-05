# 🏢 Sistema de Empresas - Agrupamento de Dispositivos

Sistema completo para agrupar TV Boxes por empresa, facilitando o gerenciamento e visualização.

---

## 🎯 FUNCIONALIDADES

### ✅ O que foi implementado:

1. **Gerenciamento de Empresas**
   - Criar, editar e excluir empresas
   - Campos: Nome, Descrição, Contato, Endereço

2. **Associação de Dispositivos**
   - Associar dispositivos a empresas
   - Remover associação (deixar sem empresa)

3. **Visualização Agrupada**
   - Ver dispositivos agrupados por empresa
   - Contador de dispositivos por empresa
   - Opção de desabilitar agrupamento

4. **Filtros e Organização**
   - Listar dispositivos por empresa
   - Ver quantos dispositivos cada empresa possui

---

## 🏗️ ARQUITETURA

### Backend

#### 1. Entidade `Company`
- Campos: `id`, `nome`, `descricao`, `contato`, `endereco`
- Relacionamento: Uma empresa pode ter vários dispositivos

#### 2. Entidade `Device` (Atualizada)
- Campo: `company_id` (opcional)
- Relacionamento: Um dispositivo pertence a uma empresa (ou nenhuma)

#### 3. Endpoints

**Empresas:**
- `POST /api/companies` - Criar empresa
- `GET /api/companies` - Listar todas
- `GET /api/companies/:id` - Obter uma empresa
- `GET /api/companies/:id/devices` - Listar dispositivos da empresa
- `PUT /api/companies/:id` - Atualizar empresa
- `DELETE /api/companies/:id` - Excluir empresa

**Dispositivos (Atualizado):**
- `PUT /api/devices/:uuid` - Agora aceita `company_id`

---

## 🖥️ PAINEL ADMIN

### Gerenciar Empresas

1. **Criar Empresa:**
   - Clique em **"+ Nova Empresa"**
   - Preencha os dados (nome obrigatório)
   - Clique em **"Salvar"**

2. **Editar Empresa:**
   - Clique em **"Editar"** na empresa desejada
   - Modifique os dados
   - Clique em **"Salvar"**

3. **Excluir Empresa:**
   - Clique em **"Excluir"** na empresa desejada
   - Confirme a exclusão
   - ⚠️ Dispositivos associados ficarão sem empresa

### Associar Dispositivo a Empresa

1. Clique em **"Editar"** no dispositivo
2. Selecione a empresa no campo **"Empresa"**
3. Ou selecione **"Sem empresa"** para remover associação
4. Clique em **"Salvar"**

### Visualizar por Empresa

1. **Agrupamento Ativado (Padrão):**
   - Dispositivos são agrupados por empresa
   - Cada grupo mostra o nome da empresa e quantidade de dispositivos
   - Dispositivos sem empresa aparecem em grupo "Sem Empresa"

2. **Desativar Agrupamento:**
   - Desmarque a opção **"Agrupar por empresa"**
   - Todos os dispositivos aparecem em uma única lista

---

## 📊 EXEMPLO DE USO

### Cenário: 3 Empresas

**Empresa A:**
- TV Box Sala 1
- TV Box Sala 2
- TV Box Recepção

**Empresa B:**
- TV Box Loja 1
- TV Box Loja 2

**Empresa C:**
- TV Box Escritório

**Sem Empresa:**
- TV Box Teste

### Visualização no Painel

```
🏢 Empresa A (3 dispositivo(s))
  [Card] TV Box Sala 1
  [Card] TV Box Sala 2
  [Card] TV Box Recepção

🏢 Empresa B (2 dispositivo(s))
  [Card] TV Box Loja 1
  [Card] TV Box Loja 2

🏢 Empresa C (1 dispositivo(s))
  [Card] TV Box Escritório

🏢 Sem Empresa (1 dispositivo(s))
  [Card] TV Box Teste
```

---

## 🔄 FLUXO DE TRABALHO

### 1. Criar Empresas

```
1. Acesse painel admin
2. Clique em "+ Nova Empresa"
3. Preencha: Nome, Descrição, Contato, Endereço
4. Salve
```

### 2. Associar Dispositivos

```
1. Clique em "Editar" no dispositivo
2. Selecione empresa no dropdown
3. Salve
```

### 3. Visualizar Agrupado

```
1. Marque "Agrupar por empresa" (já vem marcado)
2. Veja dispositivos organizados por empresa
```

---

## 📡 API - Exemplos

### Criar Empresa

```bash
POST /api/companies
Content-Type: application/json

{
  "nome": "Empresa ABC",
  "descricao": "Empresa de tecnologia",
  "contato": "(11) 99999-9999",
  "endereco": "Rua Exemplo, 123"
}
```

### Associar Dispositivo

```bash
PUT /api/devices/{uuid}
Content-Type: application/json

{
  "company_id": "uuid-da-empresa"
}
```

### Listar Dispositivos de uma Empresa

```bash
GET /api/companies/{id}/devices
```

### Remover Associação

```bash
PUT /api/devices/{uuid}
Content-Type: application/json

{
  "company_id": null
}
```

---

## 🗄️ BANCO DE DADOS

### Tabela `companies`

```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY,
  nome VARCHAR UNIQUE NOT NULL,
  descricao TEXT,
  contato VARCHAR,
  endereco VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela `devices` (Atualizada)

```sql
ALTER TABLE devices ADD COLUMN company_id UUID;
ALTER TABLE devices ADD CONSTRAINT fk_company 
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;
```

---

## ✅ CHECKLIST

- [ ] Backend rodando
- [ ] Tabela `companies` criada (automático)
- [ ] Coluna `company_id` adicionada em `devices` (automático)
- [ ] Painel admin atualizado
- [ ] Criar primeira empresa
- [ ] Associar dispositivos
- [ ] Testar visualização agrupada

---

## 🐛 TROUBLESHOOTING

### Empresas não aparecem

1. Verifique se backend está rodando
2. Verifique se tabela `companies` existe
3. Verifique logs do backend
4. Recarregue a página

### Dispositivo não associa

1. Verifique se empresa existe
2. Verifique se `company_id` está sendo enviado
3. Verifique logs do backend
4. Tente novamente

### Agrupamento não funciona

1. Verifique se checkbox está marcado
2. Verifique se dispositivos têm `company_id`
3. Recarregue a página

---

## 💡 DICAS

### Dica 1: Nomear Empresas

Use nomes claros e consistentes:
- ✅ "Empresa ABC - Matriz"
- ✅ "Empresa ABC - Filial SP"
- ❌ "emp1", "teste", "abc"

### Dica 2: Organização

Agrupe por:
- Localização (Matriz, Filial, Loja)
- Departamento (Vendas, TI, RH)
- Cliente (se for serviço terceirizado)

### Dica 3: Descrição

Use a descrição para informações adicionais:
- Endereço completo
- Responsável
- Horário de funcionamento

---

## 🎯 PRÓXIMOS PASSOS

1. **Filtros:** Filtrar dispositivos por empresa
2. **Estatísticas:** Dashboard por empresa
3. **Exportação:** Exportar relatórios por empresa
4. **Permissões:** Controle de acesso por empresa
5. **Notificações:** Alertas por empresa

---

**Sistema de empresas implementado e funcionando! 🎉**

Agora você pode organizar seus dispositivos por empresa e visualizar facilmente quais TV Boxes estão conectadas em cada grupo!






