import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token in every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tyller_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const createTransactionRule = async (data: { search_token: string; category: string; transaction_type?: string; origin?: string }) => {
  return api.post('/rules', data);
};

export const fetchRules = async () => {
  return api.get('/rules');
};

export const deleteRule = async (id: string) => {
  return api.delete(`/rules/${id}`);
};

export const approveRule = async (id: string) => {
  return api.put(`/rules/${id}/approve`);
};

export const updateRule = async (id: string, data: { search_token: string; category: string; transaction_type?: string }) => {
  return api.put(`/rules/${id}`, data);
};

export const fetchActionPlansHistory = async () => {
  return api.get('/ai/action-plans/history');
};

export const saveActionPlan = async (data: { economyLevel: string; planContent: string }) => {
  return api.post('/ai/action-plans', data);
};

export default api;
