import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('satikflow_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Token expired or unauthorized
      if (error.response.status === 401) {
        localStorage.removeItem('satikflow_token');
        localStorage.removeItem('satikflow_user');
        
        // Only redirect to login if we aren't already there or on the landing page
        const path = window.location.pathname;
        if (path !== '/' && path !== '/login') {
          window.location.href = '/login?expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
