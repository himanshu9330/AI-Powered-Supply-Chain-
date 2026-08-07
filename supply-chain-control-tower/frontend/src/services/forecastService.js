import { api, mlApi } from './api';

export const forecastService = {
  // Backend API
  getAll: async () => {
    const res = await api.get('/forecasts');
    return res.data;
  },
  generate: async (productId, modelType = 'ensemble', horizonDays = 30) => {
    const res = await api.post('/forecasts/generate', { productId, modelType, horizonDays });
    return res.data;
  },

  // Direct FastAPI ML Service integrations
  forecastML: async (productId, history, modelType = 'ensemble', horizonDays = 30) => {
    const res = await mlApi.post('/forecast', {
      product_id: productId,
      horizon_days: horizonDays,
      model_type: modelType,
      history,
    });
    return res.data;
  },
  compareModels: async (productId, history, horizonDays = 30) => {
    const res = await mlApi.post('/compare', {
      product_id: productId,
      horizon_days: horizonDays,
      history,
    });
    return res.data;
  },
  detectAnomalies: async (productId, history, sensitivity = 2.0) => {
    const res = await mlApi.post('/anomalies', {
      product_id: productId,
      history,
      sensitivity,
    });
    return res.data;
  },
  getModelRegistry: async () => {
    const res = await mlApi.get('/registry');
    return res.data;
  },
  getFeatureImportance: async (productId, modelType = 'xgboost') => {
    const res = await mlApi.get('/feature-importance', {
      params: { product_id: productId, model_type: modelType },
    });
    return res.data;
  },
  trainModel: async (productId, history, modelType = 'all') => {
    const res = await mlApi.post('/train', {
      product_id: productId,
      model_type: modelType,
      history,
    });
    return res.data;
  },
};

export const analyticsService = {
  getOverview: async () => {
    const res = await api.get('/analytics/overview');
    return res.data;
  },
  getAbcXyz: async () => {
    const res = await api.get('/analytics/abc-xyz');
    return res.data;
  },
  getDeadStock: async () => {
    const res = await api.get('/analytics/dead-stock');
    return res.data;
  },
  getOverstock: async () => {
    const res = await api.get('/analytics/overstock');
    return res.data;
  },
  getTurnover: async () => {
    const res = await api.get('/analytics/inventory-turnover');
    return res.data;
  },
};

export const optimizationService = {
  getEoq: async (productId) => {
    const res = await api.get(`/optimization/eoq/${productId}`);
    return res.data;
  },
  getAllRecommendations: async () => {
    const res = await api.get('/optimization/recommendations');
    return res.data;
  },
  getTransferSuggestions: async () => {
    const res = await api.get('/optimization/transfers');
    return res.data;
  },
};

export const reportService = {
  downloadInventoryReport: async (format = 'excel') => {
    const res = await api.get(`/reports/inventory?format=${format}`, { responseType: 'blob' });
    return res.data;
  },
  downloadForecastReport: async (format = 'excel') => {
    const res = await api.get(`/reports/forecast?format=${format}`, { responseType: 'blob' });
    return res.data;
  },
  downloadSalesReport: async (format = 'excel') => {
    const res = await api.get(`/reports/sales?format=${format}`, { responseType: 'blob' });
    return res.data;
  },
  downloadSupplierReport: async (format = 'excel') => {
    const res = await api.get(`/reports/suppliers?format=${format}`, { responseType: 'blob' });
    return res.data;
  },
};

export const notificationService = {
  getAll: async () => {
    const res = await api.get('/notifications');
    return res.data;
  },
  markAsRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },
  markAllAsRead: async () => {
    const res = await api.post('/notifications/read-all');
    return res.data;
  },
};
