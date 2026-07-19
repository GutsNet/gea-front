import apiClient from '../api/client';
import {
  setSession,
  clearSession,
  getStoredUser,
  getAccessToken,
  getRefreshToken,
  updateAccess,
} from './tokenStorage';

const REMEMBER_MATRICULA_KEY = 'gea_remember_matricula';

export { getStoredUser, getAccessToken };

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
  return localStorage.getItem(REMEMBER_MATRICULA_KEY) || '';
}

/**
 * Autentica contra POST /auth/login/ y persiste tokens + usuario.
 * @param {string} matricula
 * @param {string} password
 * @param {boolean} remember - si true, guarda la sesión en localStorage
 *   (persiste tras cerrar el navegador) y recuerda la matrícula para el
 *   próximo login. Si false, la sesión vive en sessionStorage (se pierde
 *   al cerrar la pestaña/navegador) y no se recuerda la matrícula.
 */
export async function loginWithCredentials(matricula, password, remember = false) {
  const { data } = await apiClient.post('/auth/login/', {
    matricula,
    password,
  });

  setSession({
    access: data.access,
    refresh: data.refresh,
    user: data.user,
    remember,
  });

  if (remember) {
    localStorage.setItem(REMEMBER_MATRICULA_KEY, matricula);
  } else {
    localStorage.removeItem(REMEMBER_MATRICULA_KEY);
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
  updateAccess({ access: data.access, refresh: data.refresh });

  return data.access;
}

export function logout() {
  clearSession();
}