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

export const productService = {
  // Listar todos os produtos
  getAll: async () => {
    const response = await api.get('/products');
    return response.data;
  },

  // Obter produto por ID
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Criar novo produto
  create: async (product) => {
    const response = await api.post('/products', product);
    return response.data;
  },

  // Atualizar produto
  update: async (id, product) => {
    const response = await api.put(`/products/${id}`, product);
    return response.data;
  },

  // Deletar produto
  delete: async (id) => {
    await api.delete(`/products/${id}`);
  },
};

export const sellerService = {
  // Listar todos os vendedores
  getAll: async () => {
    const response = await api.get('/sellers');
    return response.data;
  },

  // Obter vendedor por ID
  getById: async (id) => {
    const response = await api.get(`/sellers/${id}`);
    return response.data;
  },

  // Criar novo vendedor
  create: async (seller) => {
    const response = await api.post('/sellers', seller);
    return response.data;
  },

  // Atualizar vendedor
  update: async (id, seller) => {
    const response = await api.put(`/sellers/${id}`, seller);
    return response.data;
  },

  // Deletar vendedor
  delete: async (id) => {
    await api.delete(`/sellers/${id}`);
  },
};

export const inventoryService = {
  // Listar todo o inventário (com filtros opcionais)
  getAll: async (productId = null, sellerId = null) => {
    const params = {};
    if (productId) params.productId = productId;
    if (sellerId) params.sellerId = sellerId;
    
    const response = await api.get('/inventory', { params });
    return response.data;
  },

  // Obter estoque de um produto específico
  getByProduct: async (productId) => {
    const response = await api.get(`/inventory/product/${productId}`);
    return response.data;
  },

  // Obter estoque de um vendedor específico
  getBySeller: async (sellerId) => {
    const response = await api.get(`/inventory/seller/${sellerId}`);
    return response.data;
  },

  // Adicionar ou atualizar estoque
  // operation: 'set' (definir), 'add' (adicionar), 'subtract' (subtrair)
  updateStock: async (productId, sellerId, quantity, operation = 'set') => {
    const response = await api.post('/inventory', {
      productId,
      sellerId,
      quantity,
      operation
    });
    return response.data;
  },

  // Deletar registro de inventário
  delete: async (id) => {
    await api.delete(`/inventory/${id}`);
  },

  // Obter relatório de estoque
  getSummary: async () => {
    const response = await api.get('/inventory/report/summary');
    return response.data;
  },
};

export default api;

// Made with Bob
