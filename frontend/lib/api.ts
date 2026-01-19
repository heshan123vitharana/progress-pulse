import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'development' ? '/api' : (process.env.NEXT_PUBLIC_API_URL || '/api'),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important for Sanctum authentication
});

// Request interceptor - add token to requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

export default api;
