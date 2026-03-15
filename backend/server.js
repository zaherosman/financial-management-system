const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { initDatabase, db } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Armazenamento em memória (fallback se não houver DATABASE_URL)
let transactions = [];
const USE_DATABASE = !!process.env.DATABASE_URL;

// Inicializar banco de dados se disponível
if (USE_DATABASE) {
  initDatabase().catch(err => {
    console.error('Erro ao inicializar banco de dados, usando memória:', err);
  });
}

// Funções auxiliares para abstrair armazenamento
const storage = {
  async getAll() {
    if (USE_DATABASE) {
      return await db.getAllTransactions();
    }
    return transactions;
  },

  async getById(id) {
    if (USE_DATABASE) {
      return await db.getTransactionById(id);
    }
    return transactions.find(t => t.id === id);
  },

  async create(transaction) {
    if (USE_DATABASE) {
      return await db.createTransaction(transaction);
    }
    const newTransaction = {
      id: uuidv4(),
      ...transaction,
      createdAt: new Date().toISOString()
    };
    transactions.push(newTransaction);
    return newTransaction;
  },

  async update(id, transaction) {
    if (USE_DATABASE) {
      return await db.updateTransaction(id, transaction);
    }
    const index = transactions.findIndex(t => t.id === id);
    if (index === -1) return null;
    transactions[index] = {
      ...transactions[index],
      ...transaction,
      updatedAt: new Date().toISOString()
    };
    return transactions[index];
  },

  async delete(id) {
    if (USE_DATABASE) {
      await db.deleteTransaction(id);
      return;
    }
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      transactions.splice(index, 1);
    }
  }
};

// Rotas

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API funcionando',
    database: USE_DATABASE ? 'PostgreSQL' : 'Memory',
    timestamp: new Date().toISOString()
  });
});

// Listar todas as transações
app.get('/api/transactions', async (req, res) => {
  try {
    const allTransactions = await storage.getAll();
    res.json(allTransactions);
  } catch (err) {
    console.error('Erro ao buscar transações:', err);
    res.status(500).json({ error: 'Erro ao buscar transações' });
  }
});

// Criar nova transação
app.post('/api/transactions', async (req, res) => {
  const { type, category, amount, description, date } = req.body;

  if (!type || !category || !amount || !date) {
    return res.status(400).json({ error: 'Campos obrigatórios: type, category, amount, date' });
  }

  if (type !== 'entrada' && type !== 'saida') {
    return res.status(400).json({ error: 'Type deve ser "entrada" ou "saida"' });
  }

  try {
    const transaction = {
      type,
      category,
      amount: parseFloat(amount),
      description: description || '',
      date: date // Mantém a data como string no formato YYYY-MM-DD
    };

    const newTransaction = await storage.create(transaction);
    res.status(201).json(newTransaction);
  } catch (err) {
    console.error('Erro ao criar transação:', err);
    res.status(500).json({ error: 'Erro ao criar transação' });
  }
});

// Obter transação por ID
app.get('/api/transactions/:id', async (req, res) => {
  try {
    const transaction = await storage.getById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }
    res.json(transaction);
  } catch (err) {
    console.error('Erro ao buscar transação:', err);
    res.status(500).json({ error: 'Erro ao buscar transação' });
  }
});

// Atualizar transação
app.put('/api/transactions/:id', async (req, res) => {
  const { type, category, amount, description, date } = req.body;
  
  try {
    const transaction = {
      type,
      category,
      amount: parseFloat(amount),
      description,
      date
    };

    const updatedTransaction = await storage.update(req.params.id, transaction);
    if (!updatedTransaction) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }
    res.json(updatedTransaction);
  } catch (err) {
    console.error('Erro ao atualizar transação:', err);
    res.status(500).json({ error: 'Erro ao atualizar transação' });
  }
});

// Deletar transação
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    await storage.delete(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao deletar transação:', err);
    res.status(500).json({ error: 'Erro ao deletar transação' });
  }
});

// KPIs para CFOs
app.get('/api/kpis', async (req, res) => {
  const { startDate, endDate, grouping = 'mensal' } = req.query;

  try {
    let filteredTransactions = await storage.getAll();

    // Filtrar por período se fornecido
    if (startDate || endDate) {
      filteredTransactions = filteredTransactions.filter(t => {
        // Compare date strings directly (YYYY-MM-DD format)
        if (startDate && t.date < startDate) return false;
        if (endDate && t.date > endDate) return false;
        return true;
      });
    }

    // Calcular totais
    const totalEntradas = filteredTransactions
      .filter(t => t.type === 'entrada')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalSaidas = filteredTransactions
      .filter(t => t.type === 'saida')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const saldoLiquido = totalEntradas - totalSaidas;

    // Calcular por categoria
    const porCategoria = {};
    filteredTransactions.forEach(t => {
      if (!porCategoria[t.category]) {
        porCategoria[t.category] = { entradas: 0, saidas: 0 };
      }
      if (t.type === 'entrada') {
        porCategoria[t.category].entradas += parseFloat(t.amount);
      } else {
        porCategoria[t.category].saidas += parseFloat(t.amount);
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
        porPeriodo[key].entradas += parseFloat(t.amount);
      } else {
        porPeriodo[key].saidas += parseFloat(t.amount);
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
  } catch (err) {
    console.error('Erro ao calcular KPIs:', err);
    res.status(500).json({ error: 'Erro ao calcular KPIs' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 API disponível em http://localhost:${PORT}/api`);
  console.log(`💾 Armazenamento: ${USE_DATABASE ? 'PostgreSQL' : 'Memória'}`);
});

// Made with Bob - Hybrid Storage Support
