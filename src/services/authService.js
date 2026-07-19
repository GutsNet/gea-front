import apiClient from '../api/client';

const ACCESS_KEY = 'gea_access';
const REFRESH_KEY = 'gea_refresh';
const USER_KEY = 'gea_user';
const REMEMBER_KEY = 'gea_remember_matricula';

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

/**
 * true si hay un token de acceso y un usuario guardado en el navegador.
 * No valida contra el backend si el token sigue vigente; eso lo resuelve
 * el interceptor de axios (client.js) en la primera petición que falle.
 */
export function isAuthenticated() {
  return Boolean(getAccessToken() && getStoredUser());
}

/**
 * Revisa si el usuario en sesión tiene alguno de los roles indicados.
 * Uso: hasRole('Root', 'Administrativo')
 */
export function hasRole(...roles) {
  const user = getStoredUser();
  if (!user) return false;
  return roles.includes(user.rol);
}

export function getRememberedMatricula() {
  return localStorage.getItem(REMEMBER_KEY) || '';
}

/**
 * Autentica contra POST /auth/login/ y persiste tokens + usuario.
 * @param {string} matricula
 * @param {string} password
 * @param {boolean} remember - si true, recuerda la matrícula (no la contraseña) para el próximo login.
 */
export async function loginWithCredentials(matricula, password, remember = false) {
  const { data } = await apiClient.post('/auth/login/', {
    matricula,
    password,
  });

  localStorage.setItem(ACCESS_KEY, data.access);
  localStorage.setItem(REFRESH_KEY, data.refresh);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));

  if (remember) {
    localStorage.setItem(REMEMBER_KEY, matricula);
  } else {
    localStorage.removeItem(REMEMBER_KEY);
  }

  return data;
}

/**
 * Refresca manualmente el access token. El interceptor de client.js ya
 * hace esto automáticamente ante un 401; esta función se deja disponible
 * por si algún flujo (por ejemplo, revalidar sesión al abrir la app) la necesita.
 */
export async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) {
    throw new Error('No hay refresh token disponible.');
  }

  const { data } = await apiClient.post('/auth/token/refresh/', { refresh });

  localStorage.setItem(ACCESS_KEY, data.access);
  if (data.refresh) {
    localStorage.setItem(REFRESH_KEY, data.refresh);
  }

  return data.access;
}

export function logout() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}
