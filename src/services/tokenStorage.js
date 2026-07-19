// Centraliza el almacenamiento de sesión para que client.js y authService.js
// lean/escriban siempre desde el mismo lugar con las mismas claves.
//
// "Recordarme" decide el storage:
//   - true  -> localStorage   (sobrevive a cerrar el navegador, ~24h de vida
//              del refresh token según la API)
//   - false -> sessionStorage (se borra al cerrar la pestaña/navegador)
//
// gea_remember_session se guarda siempre en localStorage (no es sensible,
// solo indica en qué storage hay que buscar el resto de los datos).

const ACCESS_KEY = 'gea_access';
const REFRESH_KEY = 'gea_refresh';
const USER_KEY = 'gea_user';
const REMEMBER_SESSION_KEY = 'gea_remember_session';

function isRemembered() {
  return localStorage.getItem(REMEMBER_SESSION_KEY) === 'true';
}

function activeStorage() {
  return isRemembered() ? localStorage : sessionStorage;
}

function clearBothStorages() {
  [localStorage, sessionStorage].forEach((store) => {
    store.removeItem(ACCESS_KEY);
    store.removeItem(REFRESH_KEY);
    store.removeItem(USER_KEY);
  });
}

/**
 * Guarda una sesión nueva (llamar justo después de un login exitoso).
 */
export function setSession({ access, refresh, user, remember }) {
  clearBothStorages();

  if (remember) {
    localStorage.setItem(REMEMBER_SESSION_KEY, 'true');
  } else {
    localStorage.removeItem(REMEMBER_SESSION_KEY);
  }

  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(ACCESS_KEY, access);
  storage.setItem(REFRESH_KEY, refresh);
  storage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Actualiza solo los tokens (llamar tras un refresh exitoso).
 */
export function updateAccess({ access, refresh }) {
  const storage = activeStorage();
  storage.setItem(ACCESS_KEY, access);
  if (refresh) {
    storage.setItem(REFRESH_KEY, refresh);
  }
}

export function getAccessToken() {
  return activeStorage().getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  return activeStorage().getItem(REFRESH_KEY);
}

export function getStoredUser() {
  const raw = activeStorage().getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearSession() {
  clearBothStorages();
  localStorage.removeItem(REMEMBER_SESSION_KEY);
}