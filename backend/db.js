const { Pool } = require('pg');

// Configuração do pool de conexões
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Função para inicializar o banco de dados
const initDatabase = async () => {
  try {
    // Criar tabela de transações se não existir
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(10) NOT NULL CHECK (type IN ('entrada', 'saida')),
        category VARCHAR(100) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Criar índices para melhor performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
      CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
      CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
    `);

    console.log('✅ Banco de dados inicializado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    throw error;
  }
};

// Funções de acesso ao banco de dados
const db = {
  // Buscar todas as transações
  async getAllTransactions() {
    const result = await pool.query(
      'SELECT * FROM transactions ORDER BY date DESC, created_at DESC'
    );
    return result.rows;
  },

  // Buscar transação por ID
  async getTransactionById(id) {
    const result = await pool.query(
      'SELECT * FROM transactions WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  // Criar nova transação
  async createTransaction(transaction) {
    const { type, category, amount, description, date } = transaction;
    const result = await pool.query(
      `INSERT INTO transactions (type, category, amount, description, date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [type, category, amount, description || '', date]
    );
    return result.rows[0];
  },

  // Atualizar transação
  async updateTransaction(id, transaction) {
    const { type, category, amount, description, date } = transaction;
    const result = await pool.query(
      `UPDATE transactions
       SET type = $1, category = $2, amount = $3, description = $4, date = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [type, category, amount, description, date, id]
    );
    return result.rows[0];
  },

  // Deletar transação
  async deleteTransaction(id) {
    await pool.query('DELETE FROM transactions WHERE id = $1', [id]);
  },

  // Buscar transações por período
  async getTransactionsByPeriod(startDate, endDate) {
    let query = 'SELECT * FROM transactions WHERE 1=1';
    const params = [];
    
    if (startDate) {
      params.push(startDate);
      query += ` AND date >= $${params.length}`;
    }
    
    if (endDate) {
      params.push(endDate);
      query += ` AND date <= $${params.length}`;
    }
    
    query += ' ORDER BY date DESC, created_at DESC';
    
    const result = await pool.query(query, params);
    return result.rows;
  },

  // Estatísticas agregadas
  async getStatistics(startDate, endDate) {
    let query = `
      SELECT 
        type,
        category,
        SUM(amount) as total,
        COUNT(*) as count,
        AVG(amount) as average
      FROM transactions
      WHERE 1=1
    `;
    const params = [];
    
    if (startDate) {
      params.push(startDate);
      query += ` AND date >= $${params.length}`;
    }
    
    if (endDate) {
      params.push(endDate);
      query += ` AND date <= $${params.length}`;
    }
    
    query += ' GROUP BY type, category ORDER BY total DESC';
    
    const result = await pool.query(query, params);
    return result.rows;
  }
};

module.exports = { pool, initDatabase, db };

// Made with Bob - Database Configuration