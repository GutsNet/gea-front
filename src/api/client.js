import axios from 'axios';
import { getAccessToken, getRefreshToken, updateAccess, clearSession } from '../services/tokenStorage';

/**
 * VITE_API_URL debe apuntar a la base SIN /v1 (client.js lo agrega):
 *   .env.development -> VITE_API_URL=http://localhost:8000/api
 *   .env.production  -> VITE_API_URL=/api
 */
const ENV_BASE = import.meta.env.VITE_API_URL;
const BASE_URL = ENV_BASE ? `${ENV_BASE}/v1` : 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Evita disparar N refresh en paralelo si varias peticiones fallan a la vez con 401.
let isRefreshing = false;
let pendingQueue = [];

function resolvePending(token) {
  pendingQueue.forEach(({ resolve }) => resolve(token));
  pendingQueue = [];
}

function rejectPending(error) {
  pendingQueue.forEach(({ reject }) => reject(error));
  pendingQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    const isAuthEndpoint =
      config?.url?.includes('/auth/login/') || config?.url?.includes('/auth/token/refresh/');

    // Si no es un 401, es un endpoint de auth, o ya reintentamos esta petición: propaga el error.
    if (response?.status !== 401 || isAuthEndpoint || config?._retry) {
      return Promise.reject(error);
    }

    const refresh = getRefreshToken();

    if (!refresh) {
      clearSession();
      window.dispatchEvent(new CustomEvent('gea:session-expired'));
      return Promise.reject(error);
    }

    config._retry = true;

    if (isRefreshing) {
      // Ya hay un refresh en curso: encola esta petición hasta que termine.
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((newToken) => {
        config.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(config);
      });
    }

    isRefreshing = true;

    try {
      const { data } = await axios.post(`${BASE_URL}/auth/token/refresh/`, { refresh });

      updateAccess({ access: data.access, refresh: data.refresh });

      resolvePending(data.access);
      config.headers.Authorization = `Bearer ${data.access}`;
      return apiClient(config);
    } catch (refreshError) {
      rejectPending(refreshError);
      clearSession();
      window.dispatchEvent(new CustomEvent('gea:session-expired'));
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;