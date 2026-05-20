import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

// Check if we are running in production but pointing to localhost backend
if (typeof window !== 'undefined') {
  const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isApiLocal = API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1');
  
  if (!isLocalHost && isApiLocal) {
    console.warn(
      `⚠️ [SatikFlow API Configuration Warning]\n` +
      `The frontend is running on a production domain (${window.location.hostname}), ` +
      `but the API is pointing to localhost (${API_BASE_URL}).\n\n` +
      `To fix this:\n` +
      `1. Find your live backend URL on Vercel (e.g., https://satikflow-backend.vercel.app).\n` +
      `2. Go to your frontend Vercel Project settings -> Environment Variables.\n` +
      `3. Add VITE_API_BASE_URL with the value: https://your-backend-url.vercel.app/api\n` +
      `4. Trigger a REDEPLOY of the frontend project in Vercel for the changes to take effect.`
    );
  }
}

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
