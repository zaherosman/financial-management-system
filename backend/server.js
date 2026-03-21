const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const openFinanceService = require('./services/openFinance');
const pluggyService = require('./services/pluggyService');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Caminhos dos arquivos de dados
const DATA_FILE = path.join(__dirname, 'data', 'transactions.json');
const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');
const SELLERS_FILE = path.join(__dirname, 'data', 'sellers.json');
const INVENTORY_FILE = path.join(__dirname, 'data', 'inventory.json');

// Garantir que o diretório data existe
const ensureDataDirectory = () => {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Carregar transações do arquivo
const loadTransactions = () => {
  try {
    ensureDataDirectory();
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erro ao carregar transações:', error);
  }
  return [];
};

// Salvar transações no arquivo
const saveTransactions = (transactions) => {
  try {
    ensureDataDirectory();
    fs.writeFileSync(DATA_FILE, JSON.stringify(transactions, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Erro ao salvar transações:', error);
    return false;
  }
};

// Funções para carregar e salvar produtos
const loadProducts = () => {
  try {
    ensureDataDirectory();
    if (fs.existsSync(PRODUCTS_FILE)) {
      const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
  }
  return [];
};

const saveProducts = (products) => {
  try {
    ensureDataDirectory();
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Erro ao salvar produtos:', error);
    return false;
  }
};

// Funções para carregar e salvar vendedores
const loadSellers = () => {
  try {
    ensureDataDirectory();
    if (fs.existsSync(SELLERS_FILE)) {
      const data = fs.readFileSync(SELLERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erro ao carregar vendedores:', error);
  }
  return [];
};

const saveSellers = (sellers) => {
  try {
    ensureDataDirectory();
    fs.writeFileSync(SELLERS_FILE, JSON.stringify(sellers, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Erro ao salvar vendedores:', error);
    return false;
  }
};

// Funções para carregar e salvar inventário
const loadInventory = () => {
  try {
    ensureDataDirectory();
    if (fs.existsSync(INVENTORY_FILE)) {
      const data = fs.readFileSync(INVENTORY_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erro ao carregar inventário:', error);
  }
  return [];
};

const saveInventory = (inventory) => {
  try {
    ensureDataDirectory();
    fs.writeFileSync(INVENTORY_FILE, JSON.stringify(inventory, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Erro ao salvar inventário:', error);
    return false;
  }
};

// Carregar dados ao iniciar o servidor
let transactions = loadTransactions();
let products = loadProducts();
let sellers = loadSellers();
let inventory = loadInventory();
console.log(`📦 ${transactions.length} transações carregadas do arquivo`);
console.log(`📦 ${products.length} produtos carregados do arquivo`);
console.log(`📦 ${sellers.length} vendedores carregados do arquivo`);
console.log(`📦 ${inventory.length} registros de inventário carregados do arquivo`);

// Rotas

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API funcionando' });
});

// Listar todas as transações
app.get('/api/transactions', (req, res) => {
  res.json(transactions);
});

// Criar nova transação
app.post('/api/transactions', (req, res) => {
  const { type, category, amount, description, date } = req.body;

  if (!type || !category || !amount || !date) {
    return res.status(400).json({ error: 'Campos obrigatórios: type, category, amount, date' });
  }

  if (type !== 'entrada' && type !== 'saida') {
    return res.status(400).json({ error: 'Type deve ser "entrada" ou "saida"' });
  }

  const transaction = {
    id: uuidv4(),
    type,
    category,
    amount: parseFloat(amount),
    description: description || '',
    date: date, // Mantém a data como string no formato YYYY-MM-DD
    createdAt: new Date().toISOString()
  };

  transactions.push(transaction);
  saveTransactions(transactions);
  res.status(201).json(transaction);
});

// Obter transação por ID
app.get('/api/transactions/:id', (req, res) => {
  const transaction = transactions.find(t => t.id === req.params.id);
  if (!transaction) {
    return res.status(404).json({ error: 'Transação não encontrada' });
  }
  res.json(transaction);
});

// Atualizar transação
app.put('/api/transactions/:id', (req, res) => {
  const index = transactions.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Transação não encontrada' });
  }

  const { type, category, amount, description, date } = req.body;
  
  transactions[index] = {
    ...transactions[index],
    type: type || transactions[index].type,
    category: category || transactions[index].category,
    amount: amount ? parseFloat(amount) : transactions[index].amount,
    description: description !== undefined ? description : transactions[index].description,
    date: date || transactions[index].date, // Mantém a data como string no formato YYYY-MM-DD
    updatedAt: new Date().toISOString()
  };

  saveTransactions(transactions);
  res.json(transactions[index]);
});

// Deletar transação
app.delete('/api/transactions/:id', (req, res) => {
  const index = transactions.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Transação não encontrada' });
  }

  transactions.splice(index, 1);
  saveTransactions(transactions);
  res.status(204).send();
});

// KPIs para CFOs
app.get('/api/kpis', (req, res) => {
  const { startDate, endDate, grouping = 'mensal' } = req.query;

  let filteredTransactions = transactions;

  // Filtrar por período se fornecido
  if (startDate || endDate) {
    filteredTransactions = transactions.filter(t => {
      // Compare date strings directly (YYYY-MM-DD format)
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;
      return true;
    });
  }

  // Calcular totais
  const totalEntradas = filteredTransactions
    .filter(t => t.type === 'entrada')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSaidas = filteredTransactions
    .filter(t => t.type === 'saida')
    .reduce((sum, t) => sum + t.amount, 0);

  const saldoLiquido = totalEntradas - totalSaidas;

  // Calcular por categoria
  const porCategoria = {};
  filteredTransactions.forEach(t => {
    if (!porCategoria[t.category]) {
      porCategoria[t.category] = { entradas: 0, saidas: 0 };
    }
    if (t.type === 'entrada') {
      porCategoria[t.category].entradas += t.amount;
    } else {
      porCategoria[t.category].saidas += t.amount;
    }
  });

  // Função para obter chave de agrupamento baseada no tipo
  const getGroupKey = (date, grouping) => {
    // Parse date string (YYYY-MM-DD) directly without timezone conversion
    const [year, month, day] = date.split('-');
    const d = new Date(year, month - 1, day);
    
    switch(grouping) {
      case 'diario':
        return `${year}-${month}-${day}`;
      case 'semanal':
        const weekNum = Math.ceil(parseInt(day) / 7);
        return `${year}-${month}-S${weekNum}`;
      case 'mensal':
        return `${year}-${month}`;
      case 'quartil':
        const quarter = Math.ceil(parseInt(month) / 3);
        return `${year}-Q${quarter}`;
      case 'anual':
        return `${year}`;
      default:
        return `${year}-${month}`;
    }
  };

  // Calcular tendência com agrupamento dinâmico
  const porPeriodo = {};
  filteredTransactions.forEach(t => {
    const key = getGroupKey(t.date, grouping);
    if (!porPeriodo[key]) {
      porPeriodo[key] = { entradas: 0, saidas: 0, saldo: 0, patrimonio: 0 };
    }
    if (t.type === 'entrada') {
      porPeriodo[key].entradas += t.amount;
    } else {
      porPeriodo[key].saidas += t.amount;
    }
    porPeriodo[key].saldo = porPeriodo[key].entradas - porPeriodo[key].saidas;
  });

  // Calcular patrimônio acumulado (saldo acumulado ao longo do tempo)
  let patrimonioAcumulado = 0;
  const sortedKeys = Object.keys(porPeriodo).sort();
  sortedKeys.forEach(key => {
    patrimonioAcumulado += porPeriodo[key].saldo;
    porPeriodo[key].patrimonio = patrimonioAcumulado;
  });

  // Calcular margem operacional
  const margemOperacional = totalEntradas > 0 
    ? ((saldoLiquido / totalEntradas) * 100).toFixed(2) 
    : 0;

  // Burn rate (taxa de queima mensal média)
  const meses = Object.keys(porPeriodo).length || 1;
  const burnRate = (totalSaidas / meses).toFixed(2);

  // Runway (quantos meses o saldo atual duraria)
  const runway = totalSaidas > 0 
    ? ((saldoLiquido / (totalSaidas / meses))).toFixed(1)
    : 'Infinito';

  const kpis = {
    resumo: {
      totalEntradas: totalEntradas.toFixed(2),
      totalSaidas: totalSaidas.toFixed(2),
      saldoLiquido: saldoLiquido.toFixed(2),
      numeroTransacoes: filteredTransactions.length
    },
    indicadores: {
      margemOperacional: `${margemOperacional}%`,
      burnRate: burnRate,
      runway: runway === 'Infinito' ? runway : `${runway} meses`,
      ticketMedioEntrada: filteredTransactions.filter(t => t.type === 'entrada').length > 0
        ? (totalEntradas / filteredTransactions.filter(t => t.type === 'entrada').length).toFixed(2)
        : '0.00',
      ticketMedioSaida: filteredTransactions.filter(t => t.type === 'saida').length > 0
        ? (totalSaidas / filteredTransactions.filter(t => t.type === 'saida').length).toFixed(2)
        : '0.00'
    },
    porCategoria,
    tendenciaMensal: porPeriodo,
    periodo: {
      inicio: startDate || 'Início',
      fim: endDate || 'Atual'
    }
  };

  res.json(kpis);
});
// ============================================
// PRODUTOS - CRUD
// ============================================

// Listar todos os produtos
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Criar novo produto
app.post('/api/products', (req, res) => {
  const { name, description, sku, price, category } = req.body;

  if (!name || !sku) {
    return res.status(400).json({ error: 'Campos obrigatórios: name, sku' });
  }

  // Verificar se SKU já existe
  if (products.find(p => p.sku === sku)) {
    return res.status(400).json({ error: 'SKU já existe' });
  }

  const product = {
    id: uuidv4(),
    name,
    description: description || '',
    sku,
    price: price ? parseFloat(price) : 0,
    category: category || 'Geral',
    createdAt: new Date().toISOString()
  };

  products.push(product);
  saveProducts(products);
  res.status(201).json(product);
});

// Obter produto por ID
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }
  res.json(product);
});

// Atualizar produto
app.put('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }

  const { name, description, sku, price, category } = req.body;
  
  // Verificar se novo SKU já existe em outro produto
  if (sku && sku !== products[index].sku) {
    if (products.find(p => p.sku === sku && p.id !== req.params.id)) {
      return res.status(400).json({ error: 'SKU já existe' });
    }
  }

  products[index] = {
    ...products[index],
    name: name || products[index].name,
    description: description !== undefined ? description : products[index].description,
    sku: sku || products[index].sku,
    price: price ? parseFloat(price) : products[index].price,
    category: category || products[index].category,
    updatedAt: new Date().toISOString()
  };

  saveProducts(products);
  res.json(products[index]);
});

// Deletar produto
app.delete('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }

  // Remover inventário relacionado ao produto
  inventory = inventory.filter(i => i.productId !== req.params.id);
  saveInventory(inventory);

  products.splice(index, 1);
  saveProducts(products);
  res.status(204).send();
});

// ============================================
// VENDEDORES - CRUD
// ============================================

// Listar todos os vendedores
app.get('/api/sellers', (req, res) => {
  res.json(sellers);
});

// Criar novo vendedor
app.post('/api/sellers', (req, res) => {
  const { name, email, phone, region } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Campo obrigatório: name' });
  }

  // Verificar se email já existe
  if (email && sellers.find(s => s.email === email)) {
    return res.status(400).json({ error: 'Email já cadastrado' });
  }

  const seller = {
    id: uuidv4(),
    name,
    email: email || '',
    phone: phone || '',
    region: region || '',
    active: true,
    createdAt: new Date().toISOString()
  };

  sellers.push(seller);
  saveSellers(sellers);
  res.status(201).json(seller);
});

// Obter vendedor por ID
app.get('/api/sellers/:id', (req, res) => {
  const seller = sellers.find(s => s.id === req.params.id);
  if (!seller) {
    return res.status(404).json({ error: 'Vendedor não encontrado' });
  }
  res.json(seller);
});

// Atualizar vendedor
app.put('/api/sellers/:id', (req, res) => {
  const index = sellers.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Vendedor não encontrado' });
  }

  const { name, email, phone, region, active } = req.body;
  
  // Verificar se novo email já existe em outro vendedor
  if (email && email !== sellers[index].email) {
    if (sellers.find(s => s.email === email && s.id !== req.params.id)) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
  }

  sellers[index] = {
    ...sellers[index],
    name: name || sellers[index].name,
    email: email !== undefined ? email : sellers[index].email,
    phone: phone !== undefined ? phone : sellers[index].phone,
    region: region !== undefined ? region : sellers[index].region,
    active: active !== undefined ? active : sellers[index].active,
    updatedAt: new Date().toISOString()
  };

  saveSellers(sellers);
  res.json(sellers[index]);
});

// Deletar vendedor
app.delete('/api/sellers/:id', (req, res) => {
  const index = sellers.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Vendedor não encontrado' });
  }

  // Remover inventário relacionado ao vendedor
  inventory = inventory.filter(i => i.sellerId !== req.params.id);
  saveInventory(inventory);

  sellers.splice(index, 1);
  saveSellers(sellers);
  res.status(204).send();
});

// ============================================
// INVENTÁRIO - Controle de Estoque por Vendedor
// ============================================

// Listar todo o inventário (com filtros opcionais)
app.get('/api/inventory', (req, res) => {
  const { productId, sellerId } = req.query;
  
  let filteredInventory = inventory;
  
  if (productId) {
    filteredInventory = filteredInventory.filter(i => i.productId === productId);
  }
  
  if (sellerId) {
    filteredInventory = filteredInventory.filter(i => i.sellerId === sellerId);
  }
  
  // Enriquecer com dados de produto e vendedor
  const enrichedInventory = filteredInventory.map(item => {
    const product = products.find(p => p.id === item.productId);
    const seller = sellers.find(s => s.id === item.sellerId);
    
    return {
      ...item,
      productName: product ? product.name : 'Produto não encontrado',
      productSku: product ? product.sku : '',
      sellerName: seller ? seller.name : 'Vendedor não encontrado'
    };
  });
  
  res.json(enrichedInventory);
});

// Obter estoque de um produto específico
app.get('/api/inventory/product/:productId', (req, res) => {
  const productInventory = inventory.filter(i => i.productId === req.params.productId);
  
  if (productInventory.length === 0) {
    return res.json({
      productId: req.params.productId,
      totalQuantity: 0,
      bySeller: []
    });
  }
  
  const totalQuantity = productInventory.reduce((sum, i) => sum + i.quantity, 0);
  
  const bySeller = productInventory.map(item => {
    const seller = sellers.find(s => s.id === item.sellerId);
    return {
      ...item,
      sellerName: seller ? seller.name : 'Vendedor não encontrado'
    };
  });
  
  res.json({
    productId: req.params.productId,
    totalQuantity,
    bySeller
  });
});

// Obter estoque de um vendedor específico
app.get('/api/inventory/seller/:sellerId', (req, res) => {
  const sellerInventory = inventory.filter(i => i.sellerId === req.params.sellerId);
  
  if (sellerInventory.length === 0) {
    return res.json({
      sellerId: req.params.sellerId,
      totalProducts: 0,
      products: []
    });
  }
  
  const productsWithStock = sellerInventory.map(item => {
    const product = products.find(p => p.id === item.productId);
    return {
      ...item,
      productName: product ? product.name : 'Produto não encontrado',
      productSku: product ? product.sku : ''
    };
  });
  
  res.json({
    sellerId: req.params.sellerId,
    totalProducts: sellerInventory.length,
    products: productsWithStock
  });
});

// Adicionar ou atualizar estoque
app.post('/api/inventory', (req, res) => {
  const { productId, sellerId, quantity, operation = 'set' } = req.body;

  if (!productId || !sellerId || quantity === undefined) {
    return res.status(400).json({ error: 'Campos obrigatórios: productId, sellerId, quantity' });
  }

  // Verificar se produto existe
  const product = products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }

  // Verificar se vendedor existe
  const seller = sellers.find(s => s.id === sellerId);
  if (!seller) {
    return res.status(404).json({ error: 'Vendedor não encontrado' });
  }

  // Buscar registro existente
  const existingIndex = inventory.findIndex(
    i => i.productId === productId && i.sellerId === sellerId
  );

  let newQuantity = parseFloat(quantity);

  if (existingIndex !== -1) {
    // Atualizar registro existente
    if (operation === 'add') {
      newQuantity = inventory[existingIndex].quantity + parseFloat(quantity);
    } else if (operation === 'subtract') {
      newQuantity = inventory[existingIndex].quantity - parseFloat(quantity);
    }
    // operation === 'set' usa newQuantity diretamente

    if (newQuantity < 0) {
      return res.status(400).json({ error: 'Quantidade não pode ser negativa' });
    }

    inventory[existingIndex] = {
      ...inventory[existingIndex],
      quantity: newQuantity,
      updatedAt: new Date().toISOString()
    };

    saveInventory(inventory);
    res.json(inventory[existingIndex]);
  } else {
    // Criar novo registro
    if (newQuantity < 0) {
      return res.status(400).json({ error: 'Quantidade não pode ser negativa' });
    }

    const inventoryItem = {
      id: uuidv4(),
      productId,
      sellerId,
      quantity: newQuantity,
      createdAt: new Date().toISOString()
    };

    inventory.push(inventoryItem);
    saveInventory(inventory);
    res.status(201).json(inventoryItem);
  }
});

// Deletar registro de inventário
app.delete('/api/inventory/:id', (req, res) => {
  const index = inventory.findIndex(i => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Registro de inventário não encontrado' });
  }

  inventory.splice(index, 1);
  saveInventory(inventory);
  res.status(204).send();
});

// Relatório de estoque total
app.get('/api/inventory/report/summary', (req, res) => {
  const summary = {
    totalProducts: products.length,
    totalSellers: sellers.length,
    totalInventoryRecords: inventory.length,
    productsSummary: [],
    sellersSummary: []
  };

  // Resumo por produto
  products.forEach(product => {
    const productInventory = inventory.filter(i => i.productId === product.id);
    const totalQuantity = productInventory.reduce((sum, i) => sum + i.quantity, 0);
    const sellersWithStock = productInventory.length;

    summary.productsSummary.push({
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      totalQuantity,
      sellersWithStock
    });
  });

  // Resumo por vendedor
  sellers.forEach(seller => {
    const sellerInventory = inventory.filter(i => i.sellerId === seller.id);
    const totalProducts = sellerInventory.length;
    const totalQuantity = sellerInventory.reduce((sum, i) => sum + i.quantity, 0);

    summary.sellersSummary.push({
      sellerId: seller.id,
      sellerName: seller.name,
      totalProducts,
      totalQuantity
    });
  });

  res.json(summary);
});


// ============================================
// PLUGGY - Open Finance Integration
// ============================================

// Criar Connect Token para iniciar fluxo de conexão
app.post('/api/pluggy/connect-token', async (req, res) => {
  try {
    const result = await pluggyService.createConnectToken();
    res.json(result);
  } catch (error) {
    console.error('Erro ao criar connect token:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obter informações de um item (conta conectada)
app.get('/api/pluggy/items/:itemId', async (req, res) => {
  try {
    const result = await pluggyService.getItem(req.params.itemId);
    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar item:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obter contas de um item
app.get('/api/pluggy/items/:itemId/accounts', async (req, res) => {
  try {
    const result = await pluggyService.getAccounts(req.params.itemId);
    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar contas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sincronizar e importar transações de um item
app.post('/api/pluggy/items/:itemId/sync', async (req, res) => {
  try {
    const { from, to, pageSize } = req.body;
    
    // Sincronizar transações do Pluggy
    const result = await pluggyService.syncTransactions(req.params.itemId, {
      from,
      to,
      pageSize
    });
    
    if (!result.success) {
      return res.status(500).json({ error: 'Falha ao sincronizar transações' });
    }
    
    // Adicionar transações ao sistema
    const importedTransactions = result.transactions.map(tx => ({
      id: uuidv4(),
      type: tx.type === 'income' ? 'entrada' : 'saida',
      category: tx.category,
      amount: tx.amount,
      description: `${tx.description} (${tx.bankName})`,
      date: tx.date,
      source: 'pluggy',
      pluggyData: {
        accountId: tx.accountId,
        accountName: tx.accountName,
        bankName: tx.bankName,
        transactionId: tx.pluggyTransactionId
      },
      createdAt: new Date().toISOString()
    }));
    
    // Evitar duplicatas - verificar se transação já existe
    const existingPluggyIds = transactions
      .filter(t => t.source === 'pluggy' && t.pluggyData)
      .map(t => t.pluggyData.transactionId);
    
    const newTransactions = importedTransactions.filter(
      tx => !existingPluggyIds.includes(tx.pluggyData.transactionId)
    );
    
    transactions.push(...newTransactions);
    saveTransactions(transactions);
    
    res.json({
      success: true,
      imported: newTransactions.length,
      total: result.total,
      duplicates: importedTransactions.length - newTransactions.length,
      transactions: newTransactions
    });
  } catch (error) {
    console.error('Erro ao sincronizar transações:', error);
    res.status(500).json({ error: error.message });
  }
});

// Deletar conexão (item)
app.delete('/api/pluggy/items/:itemId', async (req, res) => {
  try {
    const result = await pluggyService.deleteItem(req.params.itemId);
    
    // Remover transações associadas ao item
    const itemTransactions = transactions.filter(
      t => t.source === 'pluggy' &&
      t.pluggyData &&
      t.pluggyData.accountId
    );
    
    transactions = transactions.filter(
      t => !(t.source === 'pluggy' && t.pluggyData && t.pluggyData.accountId)
    );
    
    saveTransactions(transactions);
    
    res.json({
      ...result,
      transactionsRemoved: itemTransactions.length
    });
  } catch (error) {
    console.error('Erro ao deletar item:', error);
    res.status(500).json({ error: error.message });
  }
});

// Listar conectores disponíveis (bancos)
app.get('/api/pluggy/connectors', async (req, res) => {
  try {
    const result = await pluggyService.getConnectors();
    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar conectores:', error);
    res.status(500).json({ error: error.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 API disponível em http://localhost:${PORT}/api`);
});

// Made with Bob
