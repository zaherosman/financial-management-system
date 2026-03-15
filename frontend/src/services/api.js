import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const transactionService = {
  // Listar todas as transações
  getAll: async () => {
    const response = await api.get('/transactions');
    return response.data;
  },

  // Obter transação por ID
  getById: async (id) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  // Criar nova transação
  create: async (transaction) => {
    const response = await api.post('/transactions', transaction);
    return response.data;
  },

  // Atualizar transação
  update: async (id, transaction) => {
    const response = await api.put(`/transactions/${id}`, transaction);
    return response.data;
  },

  // Deletar transação
  delete: async (id) => {
    await api.delete(`/transactions/${id}`);
  },
};

export const kpiService = {
  // Obter KPIs
  getKPIs: async (startDate = null, endDate = null, grouping = 'mensal') => {
    const params = { grouping };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await api.get('/kpis', { params });
    return response.data;
  },
};

export default api;

// Made with Bob
