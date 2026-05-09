import axios from 'axios';
import { apiBaseUrl } from './appConfig';

const api = axios.create({
  baseURL: apiBaseUrl
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tp_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
