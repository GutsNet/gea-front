import { isAuthenticated } from '../services/authService';

/**
 * Guard global de navegación.
 * - Si la ruta requiere sesión (meta.requiresAuth) y no hay usuario autenticado,
 *   redirige a /login conservando la ruta de destino en ?redirect=.
 * - Si el usuario ya está autenticado e intenta entrar a /login, lo manda al dashboard.
 */
export function authGuard(to, from, next) {
  const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth);
  const authenticated = isAuthenticated();

  if (requiresAuth && !authenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } });
    return;
  }

  if (to.name === 'Login' && authenticated) {
    next({ name: 'Dashboard' });
    return;
  }

  next();
}
