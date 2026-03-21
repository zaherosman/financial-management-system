# 📦 Sistema de Controle de Estoque

## Visão Geral

O sistema agora inclui funcionalidades completas de controle de estoque, permitindo gerenciar produtos, vendedores e a quantidade de itens em estoque por vendedor.

## Funcionalidades Implementadas

### 1. Gerenciamento de Produtos

**Localização:** Menu Estoque > Produtos

**Recursos:**
- ✅ Cadastro de produtos com nome, SKU, categoria, preço e descrição
- ✅ Edição de produtos existentes
- ✅ Exclusão de produtos (remove automaticamente o estoque relacionado)
- ✅ Validação de SKU único
- ✅ Listagem completa de produtos em tabela

**Campos do Produto:**
- **Nome** (obrigatório): Nome do produto
- **SKU** (obrigatório): Código único de identificação
- **Categoria**: Categoria do produto (padrão: "Geral")
- **Preço**: Preço unitário em R$
- **Descrição**: Descrição detalhada do produto

### 2. Gerenciamento de Vendedores

**Localização:** Menu Estoque > Vendedores

**Recursos:**
- ✅ Cadastro de vendedores com nome, email, telefone e região
- ✅ Edição de vendedores existentes
- ✅ Exclusão de vendedores (remove automaticamente o estoque relacionado)
- ✅ Status ativo/inativo
- ✅ Validação de email único
- ✅ Listagem completa de vendedores em tabela

**Campos do Vendedor:**
- **Nome** (obrigatório): Nome completo do vendedor
- **Email**: Email para contato
- **Telefone**: Telefone para contato
- **Região**: Região de atuação
- **Status**: Ativo ou Inativo

### 3. Controle de Estoque

**Localização:** Menu Estoque > Controle de Estoque

**Recursos:**
- ✅ Visualização de estoque por produto e vendedor
- ✅ Três operações de estoque:
  - **Definir**: Define quantidade exata
  - **Adicionar**: Soma à quantidade atual
  - **Remover**: Subtrai da quantidade atual
- ✅ Validação para evitar estoque negativo
- ✅ Relatórios em três visualizações:
  - Todos os registros
  - Resumo por produto
  - Resumo por vendedor
- ✅ Dashboard com métricas principais

**Operações de Estoque:**

1. **Definir Quantidade**
   - Define o estoque exato para um produto/vendedor
   - Exemplo: Definir 100 unidades

2. **Adicionar ao Estoque**
   - Adiciona unidades ao estoque atual
   - Exemplo: Estoque atual 50 + adicionar 30 = 80

3. **Remover do Estoque**
   - Remove unidades do estoque atual
   - Exemplo: Estoque atual 80 - remover 20 = 60

## API Endpoints

### Produtos

```
GET    /api/products           - Listar todos os produtos
POST   /api/products           - Criar novo produto
GET    /api/products/:id       - Obter produto por ID
PUT    /api/products/:id       - Atualizar produto
DELETE /api/products/:id       - Deletar produto
```

### Vendedores

```
GET    /api/sellers            - Listar todos os vendedores
POST   /api/sellers            - Criar novo vendedor
GET    /api/sellers/:id        - Obter vendedor por ID
PUT    /api/sellers/:id        - Atualizar vendedor
DELETE /api/sellers/:id        - Deletar vendedor
```

### Inventário

```
GET    /api/inventory                      - Listar todo o inventário
GET    /api/inventory?productId=xxx        - Filtrar por produto
GET    /api/inventory?sellerId=xxx         - Filtrar por vendedor
GET    /api/inventory/product/:productId   - Estoque de um produto
GET    /api/inventory/seller/:sellerId     - Estoque de um vendedor
POST   /api/inventory                      - Adicionar/atualizar estoque
DELETE /api/inventory/:id                  - Deletar registro
GET    /api/inventory/report/summary       - Relatório resumido
```

## Estrutura de Dados

### Produto
```json
{
  "id": "uuid",
  "name": "Nome do Produto",
  "description": "Descrição",
  "sku": "SKU-001",
  "price": 99.99,
  "category": "Categoria",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Vendedor
```json
{
  "id": "uuid",
  "name": "Nome do Vendedor",
  "email": "email@example.com",
  "phone": "(11) 98765-4321",
  "region": "São Paulo - SP",
  "active": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Inventário
```json
{
  "id": "uuid",
  "productId": "product-uuid",
  "sellerId": "seller-uuid",
  "quantity": 100,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Arquivos de Dados

Os dados são armazenados em arquivos JSON no diretório `backend/data/`:

- `products.json` - Lista de produtos
- `sellers.json` - Lista de vendedores
- `inventory.json` - Registros de estoque

## Fluxo de Uso Recomendado

1. **Cadastrar Produtos**
   - Acesse Menu Estoque > Produtos
   - Clique em "Adicionar Produto"
   - Preencha os dados e salve

2. **Cadastrar Vendedores**
   - Acesse Menu Estoque > Vendedores
   - Clique em "Adicionar Vendedor"
   - Preencha os dados e salve

3. **Gerenciar Estoque**
   - Acesse Menu Estoque > Controle de Estoque
   - Clique em "Atualizar Estoque"
   - Selecione produto e vendedor
   - Escolha a operação (Definir/Adicionar/Remover)
   - Informe a quantidade e salve

4. **Visualizar Relatórios**
   - Use as abas para alternar entre visualizações
   - "Todos os Registros": Lista completa
   - "Por Produto": Estoque total por produto
   - "Por Vendedor": Estoque total por vendedor

## Validações Implementadas

### Produtos
- ✅ Nome e SKU são obrigatórios
- ✅ SKU deve ser único
- ✅ Preço não pode ser negativo

### Vendedores
- ✅ Nome é obrigatório
- ✅ Email deve ser único (se fornecido)
- ✅ Status padrão é "ativo"

### Inventário
- ✅ Produto e vendedor devem existir
- ✅ Quantidade não pode ser negativa
- ✅ Operações de adição/subtração validadas

## Recursos de Segurança

- ✅ Confirmação antes de excluir produtos/vendedores
- ✅ Exclusão em cascata (remove estoque relacionado)
- ✅ Validação de dados no backend
- ✅ Mensagens de erro claras

## Componentes Frontend

### ProductManagement.jsx
Gerenciamento completo de produtos com modal de criação/edição.

### SellerManagement.jsx
Gerenciamento completo de vendedores com modal de criação/edição.

### InventoryManagement.jsx
Controle de estoque com três visualizações em abas e dashboard de métricas.

## Serviços API (frontend/src/services/api.js)

```javascript
// Produtos
productService.getAll()
productService.getById(id)
productService.create(product)
productService.update(id, product)
productService.delete(id)

// Vendedores
sellerService.getAll()
sellerService.getById(id)
sellerService.create(seller)
sellerService.update(id, seller)
sellerService.delete(id)

// Inventário
inventoryService.getAll(productId, sellerId)
inventoryService.getByProduct(productId)
inventoryService.getBySeller(sellerId)
inventoryService.updateStock(productId, sellerId, quantity, operation)
inventoryService.delete(id)
inventoryService.getSummary()
```

## Próximas Melhorias Sugeridas

- [ ] Histórico de movimentações de estoque
- [ ] Alertas de estoque baixo
- [ ] Exportação de relatórios em PDF/Excel
- [ ] Gráficos de evolução de estoque
- [ ] Integração com sistema de vendas
- [ ] Código de barras para produtos
- [ ] Fotos de produtos
- [ ] Múltiplos locais de armazenamento

## Suporte

Para dúvidas ou problemas, consulte a documentação principal do projeto ou entre em contato com a equipe de desenvolvimento.

---

**Desenvolvido com Bob** 🤖