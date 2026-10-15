import axios from 'axios';

// Create Axios client with configurable baseURL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to attach JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('aeroops_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses to handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if we are already on login
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('aeroops_token');
        localStorage.removeItem('aeroops_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
