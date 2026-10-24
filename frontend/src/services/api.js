import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Create a device fingerprint if it doesn't exist
  let fingerprint = localStorage.getItem('device_fingerprint');
  if (!fingerprint) {
    fingerprint = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('device_fingerprint', fingerprint);
  }
  config.headers['Fingerprint'] = fingerprint;
  
  return config;
});

export default api;
