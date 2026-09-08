import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Token to every outgoing request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle HTTP Response Errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Clean up invalid credentials if explicitly 401 Unauthorized
      if (error.response.status === 401) {
        console.warn('Session expired or unauthenticated request.');
        // Clear local credentials but avoid forceful hard redirects that cause data loss
        localStorage.removeItem('token');
        localStorage.removeItem('access_token');
      }
    }
    return Promise.reject(error);
  }
);

export default API;