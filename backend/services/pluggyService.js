const { PluggyClient } = require('pluggy-sdk');

// Verificar se as credenciais estão configuradas
const isConfigured = () => {
  return process.env.PLUGGY_CLIENT_ID &&
         process.env.PLUGGY_CLIENT_SECRET &&
         process.env.PLUGGY_CLIENT_ID !== 'your_client_id_here' &&
         process.env.PLUGGY_CLIENT_SECRET !== 'your_client_secret_here';
};

// Inicializar cliente Pluggy apenas se configurado
let pluggyClient = null;

const getClient = () => {
  if (!isConfigured()) {
    throw new Error(
      'Credenciais do Pluggy não configuradas. ' +
      'Por favor, configure PLUGGY_CLIENT_ID e PLUGGY_CLIENT_SECRET no arquivo .env'
    );
  }
  
  if (!pluggyClient) {
    pluggyClient = new PluggyClient({
      clientId: process.env.PLUGGY_CLIENT_ID,
      clientSecret: process.env.PLUGGY_CLIENT_SECRET,
      environment: process.env.PLUGGY_ENVIRONMENT || 'sandbox'
    });
  }
  
  return pluggyClient;
};

/**
 * Criar Connect Token para iniciar fluxo de conexão
 */
async function createConnectToken() {
  try {
    const client = getClient();
    const connectToken = await client.createConnectToken();
    return {
      success: true,
      accessToken: connectToken.accessToken
    };
  } catch (error) {
    console.error('Erro ao criar connect token:', error);
    throw new Error('Falha ao criar token de conexão: ' + error.message);
  }
}

/**
 * Obter informações de uma conta conectada
 */
async function getItem(itemId) {
  try {
    const client = getClient();
    const item = await client.fetchItem(itemId);
    return {
      success: true,
      item
    };
  } catch (error) {
    console.error('Erro ao buscar item:', error);
    throw new Error('Falha ao buscar informações da conta: ' + error.message);
  }
}

/**
 * Obter contas de um item
 */
async function getAccounts(itemId) {
  try {
    const client = getClient();
    const accounts = await client.fetchAccounts(itemId);
    return {
      success: true,
      accounts: accounts.results
    };
  } catch (error) {
    console.error('Erro ao buscar contas:', error);
    throw new Error('Falha ao buscar contas: ' + error.message);
  }
}

/**
 * Obter transações de uma conta
 */
async function getTransactions(accountId, options = {}) {
  try {
    const { from, to, pageSize = 100 } = options;
    
    const params = {
      accountId,
      pageSize
    };
    
    if (from) params.from = from;
    if (to) params.to = to;
    
    const client = getClient();
    const transactions = await client.fetchTransactions(params);
    
    return {
      success: true,
      transactions: transactions.results,
      total: transactions.total
    };
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    throw new Error('Falha ao buscar transações: ' + error.message);
  }
}

/**
 * Sincronizar transações de todas as contas de um item
 */
async function syncTransactions(itemId, options = {}) {
  try {
    // Buscar todas as contas do item
    const accountsResponse = await getAccounts(itemId);
    const accounts = accountsResponse.accounts;
    
    if (!accounts || accounts.length === 0) {
      return {
        success: true,
        transactions: [],
        message: 'Nenhuma conta encontrada'
      };
    }
    
    // Buscar transações de todas as contas
    const allTransactions = [];
    
    for (const account of accounts) {
      const transactionsResponse = await getTransactions(account.id, options);
      
      // Formatar transações para o formato do sistema
      const formattedTransactions = transactionsResponse.transactions.map(tx => ({
        description: tx.description || 'Transação bancária',
        amount: Math.abs(tx.amount),
        type: tx.amount < 0 ? 'expense' : 'income',
        category: mapCategory(tx.category),
        date: tx.date.split('T')[0], // YYYY-MM-DD
        source: 'pluggy',
        accountId: account.id,
        accountName: account.name,
        bankName: account.bankData?.name || 'Banco',
        pluggyTransactionId: tx.id
      }));
      
      allTransactions.push(...formattedTransactions);
    }
    
    return {
      success: true,
      transactions: allTransactions,
      total: allTransactions.length
    };
  } catch (error) {
    console.error('Erro ao sincronizar transações:', error);
    throw new Error('Falha ao sincronizar transações: ' + error.message);
  }
}

/**
 * Mapear categoria do Pluggy para categorias do sistema
 */
function mapCategory(pluggyCategory) {
  const categoryMap = {
    'Food and Drink': 'alimentacao',
    'Shopping': 'compras',
    'Transportation': 'transporte',
    'Home': 'moradia',
    'Bills and Utilities': 'contas',
    'Entertainment': 'lazer',
    'Health and Fitness': 'saude',
    'Travel': 'viagem',
    'Education': 'educacao',
    'Income': 'salario',
    'Transfer': 'transferencia',
    'Investment': 'investimento'
  };
  
  return categoryMap[pluggyCategory] || 'outros';
}

/**
 * Deletar uma conexão (item)
 */
async function deleteItem(itemId) {
  try {
    const client = getClient();
    await client.deleteItem(itemId);
    return {
      success: true,
      message: 'Conexão removida com sucesso'
    };
  } catch (error) {
    console.error('Erro ao deletar item:', error);
    throw new Error('Falha ao remover conexão: ' + error.message);
  }
}

/**
 * Listar todos os conectores disponíveis
 */
async function getConnectors() {
  try {
    const client = getClient();
    const connectors = await client.fetchConnectors();
    return {
      success: true,
      connectors: connectors.results
    };
  } catch (error) {
    console.error('Erro ao buscar conectores:', error);
    throw new Error('Falha ao buscar bancos disponíveis: ' + error.message);
  }
}

module.exports = {
  createConnectToken,
  getItem,
  getAccounts,
  getTransactions,
  syncTransactions,
  deleteItem,
  getConnectors
};

// Made with Bob
