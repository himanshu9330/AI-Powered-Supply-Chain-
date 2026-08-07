import { api } from './api';

export const inventoryService = {
  getAll: async (params = {}) => {
    const res = await api.get('/inventory', { params });
    return res.data;
  },
  getSummary: async () => {
    const res = await api.get('/inventory/summary');
    return res.data;
  },
  adjust: async (data) => {
    const res = await api.post('/inventory/adjust', data);
    return res.data;
  },
  getReorderSuggestions: async () => {
    const res = await api.get('/inventory/reorder-suggestions');
    return res.data;
  },
};

export const warehouseService = {
  getAll: async () => {
    const res = await api.get('/warehouses');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/warehouses/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/warehouses', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/warehouses/${id}`, data);
    return res.data;
  },
};

export const supplierService = {
  getAll: async () => {
    const res = await api.get('/suppliers');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/suppliers/${id}`);
    return res.data;
  },
  getPerformance: async () => {
    const res = await api.get('/suppliers/performance');
    return res.data;
  },
};

export const purchaseOrderService = {
  getAll: async (params = {}) => {
    const res = await api.get('/purchase-orders', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/purchase-orders/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/purchase-orders', data);
    return res.data;
  },
  receive: async (id, data) => {
    const res = await api.post(`/purchase-orders/${id}/receive`, data);
    return res.data;
  },
};

export const salesService = {
  getAll: async (params = {}) => {
    const res = await api.get('/sales', { params });
    return res.data;
  },
  getSummary: async () => {
    const res = await api.get('/sales/summary');
    return res.data;
  },
};

export const transferService = {
  getAll: async () => {
    const res = await api.get('/transfers');
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/transfers', data);
    return res.data;
  },
  updateStatus: async (id, status) => {
    const res = await api.patch(`/transfers/${id}/status`, { status });
    return res.data;
  },
};
