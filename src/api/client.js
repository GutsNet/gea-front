import axios from 'axios';

/**
 * Si defines VITE_API_URL en .env.development / .env.production
 * (por ejemplo: VITE_API_URL=http://localhost:8000/api), se usa esa base.
 * Si no existe la variable, cae al valor de desarrollo por defecto.
 */
const ENV_BASE = import.meta.env.VITE_API_URL;
const BASE_URL = ENV_BASE ? `${ENV_BASE}/v1` : 'http://localhost:8000/api/v1';

const ACCESS_KEY = 'gea_access';
const REFRESH_KEY = 'gea_refresh';
const USER_KEY = 'gea_user';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

function clearSession() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

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

    const refresh = localStorage.getItem(REFRESH_KEY);

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

      localStorage.setItem(ACCESS_KEY, data.access);
      if (data.refresh) {
        localStorage.setItem(REFRESH_KEY, data.refresh);
      }

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
