/*
G.E.A. Frontend
Composable: useUsuarios
Estado y lógica para la vista de Usuarios (en construcción).
*/
import { ref } from 'vue';

export function useUsuarios() {
  // No hay datos reales todavía
  const loading = ref(false);
  const error = ref('');

  return {
    loading,
    error,
  };
}