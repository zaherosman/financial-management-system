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

// Caminho do arquivo de dados
const DATA_FILE = path.join(__dirname, 'data', 'transactions.json');

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

// Carregar transações ao iniciar o servidor
let transactions = loadTransactions();
console.log(`📦 ${transactions.length} transações carregadas do arquivo`);

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
