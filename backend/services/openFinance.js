// Open Finance Service
// Integração com Pluggy para importação de transações bancárias

class OpenFinanceService {
  constructor() {
    this.clientId = process.env.PLUGGY_CLIENT_ID;
    this.clientSecret = process.env.PLUGGY_CLIENT_SECRET;
    this.environment = process.env.PLUGGY_ENVIRONMENT || 'sandbox';
    this.baseUrl = this.environment === 'production' 
      ? 'https://api.pluggy.ai'
      : 'https://api.sandbox.pluggy.ai';
  }

  // Verificar se as credenciais estão configuradas
  isConfigured() {
    return !!(this.clientId && this.clientSecret);
  }

  // Obter token de acesso
  async getAccessToken() {
    if (!this.isConfigured()) {
      throw new Error('Pluggy não configurado. Adicione PLUGGY_CLIENT_ID e PLUGGY_CLIENT_SECRET no .env');
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientId: this.clientId,
          clientSecret: this.clientSecret
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao autenticar com Pluggy');
      }

      const data = await response.json();
      return data.apiKey;
    } catch (error) {
      console.error('Erro ao obter token:', error);
      throw error;
    }
  }

  // Criar token de conexão para o widget
  async createConnectToken() {
    const apiKey = await this.getAccessToken();

    try {
      const response = await fetch(`${this.baseUrl}/connect_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey
        },
        body: JSON.stringify({
          // Opções do widget
          clientUserId: 'user_' + Date.now(), // ID único do usuário
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar token de conexão');
      }

      const data = await response.json();
      return data.accessToken;
    } catch (error) {
      console.error('Erro ao criar connect token:', error);
      throw error;
    }
  }

  // Buscar contas de um item (conexão bancária)
  async fetchAccounts(itemId) {
    const apiKey = await this.getAccessToken();

    try {
      const response = await fetch(`${this.baseUrl}/accounts?itemId=${itemId}`, {
        method: 'GET',
        headers: {
          'X-API-KEY': apiKey
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar contas');
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Erro ao buscar contas:', error);
      throw error;
    }
  }

  // Buscar transações de uma conta
  async fetchTransactions(accountId, from = null, to = null) {
    const apiKey = await this.getAccessToken();

    let url = `${this.baseUrl}/transactions?accountId=${accountId}`;
    if (from) url += `&from=${from}`;
    if (to) url += `&to=${to}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-KEY': apiKey
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar transações');
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      throw error;
    }
  }

  // Buscar todas as transações de um item
  async getTransactions(itemId, from = null, to = null) {
    try {
      const accounts = await this.fetchAccounts(itemId);
      
      if (accounts.length === 0) {
        return [];
      }

      const allTransactions = [];
      
      for (const account of accounts) {
        const transactions = await this.fetchTransactions(account.id, from, to);
        
        // Adicionar informações da conta às transações
        const enrichedTransactions = transactions.map(t => ({
          ...t,
          accountId: account.id,
          accountName: account.name,
          bankName: account.bankData?.name || 'Banco'
        }));
        
        allTransactions.push(...enrichedTransactions);
      }

      return this.convertToAppFormat(allTransactions);
    } catch (error) {
      console.error('Erro ao obter transações:', error);
      throw error;
    }
  }

  // Converter transações do Pluggy para formato da aplicação
  convertToAppFormat(pluggyTransactions) {
    return pluggyTransactions.map(t => {
      const amount = Math.abs(parseFloat(t.amount) || 0);
      const isIncome = parseFloat(t.amount) > 0;

      return {
        type: isIncome ? 'entrada' : 'saida',
        category: this.categorizeTransaction(t.description, isIncome),
        amount: amount,
        description: t.description || 'Transação bancária',
        date: t.date ? t.date.split('T')[0] : new Date().toISOString().split('T')[0],
        source: 'open_finance',
        externalId: t.id,
        bankName: t.bankName || 'Banco',
        accountName: t.accountName || 'Conta'
      };
    });
  }

  // Categorização inteligente de transações
  categorizeTransaction(description, isIncome) {
    if (!description) return 'Outros';

    const desc = description.toLowerCase();

    // Categorias de entrada
    if (isIncome) {
      if (desc.includes('salario') || desc.includes('salary') || desc.includes('pagamento')) {
        return 'Salário';
      }
      if (desc.includes('transferencia') || desc.includes('pix recebido')) {
        return 'Transferência Recebida';
      }
      if (desc.includes('venda') || desc.includes('receita')) {
        return 'Vendas';
      }
      return 'Outras Receitas';
    }

    // Categorias de saída
    if (desc.includes('aluguel') || desc.includes('rent') || desc.includes('condominio')) {
      return 'Moradia';
    }
    if (desc.includes('mercado') || desc.includes('supermercado') || desc.includes('alimentacao')) {
      return 'Alimentação';
    }
    if (desc.includes('transporte') || desc.includes('uber') || desc.includes('combustivel') || desc.includes('gasolina')) {
      return 'Transporte';
    }
    if (desc.includes('energia') || desc.includes('agua') || desc.includes('internet') || desc.includes('telefone')) {
      return 'Utilidades';
    }
    if (desc.includes('saude') || desc.includes('farmacia') || desc.includes('hospital') || desc.includes('medico')) {
      return 'Saúde';
    }
    if (desc.includes('educacao') || desc.includes('escola') || desc.includes('curso')) {
      return 'Educação';
    }
    if (desc.includes('lazer') || desc.includes('cinema') || desc.includes('restaurante')) {
      return 'Lazer';
    }
    if (desc.includes('cartao') || desc.includes('fatura')) {
      return 'Cartão de Crédito';
    }
    if (desc.includes('transferencia') || desc.includes('pix enviado')) {
      return 'Transferência';
    }

    return 'Outros';
  }

  // Verificar status de uma conexão
  async getItemStatus(itemId) {
    const apiKey = await this.getAccessToken();

    try {
      const response = await fetch(`${this.baseUrl}/items/${itemId}`, {
        method: 'GET',
        headers: {
          'X-API-KEY': apiKey
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao verificar status da conexão');
      }

      const data = await response.json();
      return {
        id: data.id,
        status: data.status,
        connector: data.connector,
        lastUpdatedAt: data.lastUpdatedAt
      };
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      throw error;
    }
  }
}

module.exports = new OpenFinanceService();

// Made with Bob - Open Finance Service