import { reactive } from 'vue'

// Estado compartido por toda la app (no es un componente, así que el mismo
// objeto reactive() se reutiliza en cualquier archivo que lo importe).
const state = reactive({ toasts: [] })

let idCounter = 0

function push(type, message, { timeout = 5000 } = {}) {
  const id = ++idCounter
  state.toasts.push({ id, type, message })

  if (timeout > 0) {
    setTimeout(() => dismiss(id), timeout)
  }

  return id
}

function dismiss(id) {
  const index = state.toasts.findIndex((toast) => toast.id === id)
  if (index !== -1) {
    state.toasts.splice(index, 1)
  }
}

/**
 * API pública para disparar notificaciones desde cualquier componente o
 * servicio, sin necesidad de props ni emits:
 *
 *   import { notify } from '@/services/notifications'
 *   notify.error('Matrícula o contraseña incorrectos.')
 *   notify.success('Reporte guardado correctamente.')
 *   notify.info('Tu sesión expiró, vuelve a iniciar sesión.', { timeout: 8000 })
 */
export const notify = {
  success: (message, options) => push('success', message, options),
  error: (message, options) => push('error', message, options),
  warning: (message, options) => push('warning', message, options),
  info: (message, options) => push('info', message, options),
  dismiss,
}

// Usado únicamente por NotificationsHost.vue para leer la lista de toasts.
export function useNotifications() {
  return state
}