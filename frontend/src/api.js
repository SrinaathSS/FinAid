import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  register: async (username, email, password) => {
    const response = await api.post('/auth/register/', {
      username,
      email,
      password,
      password2: password,
    });
    return response.data;
  },

  login: async (username, password) => {
    const response = await api.post('/auth/login/', {
      username,
      password,
    });
    if (response.data.tokens) {
      localStorage.setItem('access_token', response.data.tokens.access);
      localStorage.setItem('refresh_token', response.data.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/user/');
    return response.data;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

// Transactions API
export const transactionsAPI = {
  uploadMonthlyData: async (transactions, stats, monthKey) => {
    // Use provided monthKey or extract from first transaction
    if (!monthKey && transactions.length > 0) {
      monthKey = transactions[0]?.date?.slice(0, 7); // "YYYY-MM"
    }
    
    const response = await api.post('/transactions/upload/', {
      transactions,
      stats,
      month_key: monthKey,
    });
    return response.data;
  },

  getAllMonthlyData: async () => {
    const response = await api.get('/transactions/monthly/');
    return response.data;
  },

  getMonthlyData: async (monthKey) => {
    const response = await api.get(`/transactions/monthly/${monthKey}/`);
    return response.data;
  },

  deleteMonthlyData: async (monthKey) => {
    // Encode the month_key to handle special characters
    const encodedMonthKey = encodeURIComponent(monthKey);
    const response = await api.delete(`/transactions/monthly/${encodedMonthKey}/`);
    return response.data;
  },
};

export default api;
