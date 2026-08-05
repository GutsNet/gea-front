/*
G.E.A. Frontend
Composable: useRecoleccion
Estado y lógica para la vista de Recolección.
*/
import { ref, computed } from 'vue';

export function useRecoleccion() {
  const loading = ref(false);
  const error = ref('');

  // Datos simulados (iguales a los originales)
  const recolecciones = ref([
    { fecha: '06/07/2026', hora: '11:11 a.m.', ubicacion: 'Área Verde 3', kg: 12.5, responsable: 'Ana Martínez', updatedFecha: '06/07/2026', updatedHora: '11:11 a.m.' },
    { fecha: '05/07/2026', hora: '04:30 p.m.', ubicacion: 'Área Verde 2', kg: 6.8, responsable: 'Luis Ramírez', updatedFecha: '05/07/2026', updatedHora: '04:30 p.m.' },
    { fecha: '05/07/2026', hora: '09:15 a.m.', ubicacion: 'Área Verde 1', kg: 4.2, responsable: 'María González', updatedFecha: '06/07/2026', updatedHora: '09:15 a.m.' },
    { fecha: '04/07/2026', hora: '03:20 p.m.', ubicacion: 'Área Verde 2', kg: 8.1, responsable: 'Jorge Hernández', updatedFecha: '04/07/2026', updatedHora: '03:20 p.m.' },
    { fecha: '03/07/2026', hora: '10:45 a.m.', ubicacion: 'Área Verde 3', kg: 15.6, responsable: 'Fernanda López', updatedFecha: '03/07/2026', updatedHora: '10:45 a.m.' },
    { fecha: '02/07/2026', hora: '02:15 p.m.', ubicacion: 'Jardín Central', kg: 3.9, responsable: 'Carlos Pérez', updatedFecha: '02/07/2026', updatedHora: '02:15 p.m.' },
    { fecha: '01/07/2026', hora: '11:30 a.m.', ubicacion: 'Área Verde 1', kg: 5.7, responsable: 'Sofía Torres', updatedFecha: '01/07/2026', updatedHora: '11:30 a.m.' },
  ]);

  // Estadísticas calculadas (simuladas)
  const totalKg = computed(() => {
    return recolecciones.value.reduce((sum, r) => sum + r.kg, 0);
  });

  const totalRecolecciones = computed(() => recolecciones.value.length);

  const arbolesProcesados = computed(() => {
    // Simulamos un número (puede ser un cálculo real si tuvieras datos)
    return 28;
  });

  const promedioKg = computed(() => {
    if (recolecciones.value.length === 0) return 0;
    return totalKg.value / recolecciones.value.length;
  });

  // Función para cargar datos (mock)
  async function cargarRecolecciones() {
    loading.value = true;
    error.value = '';
    try {
      // Simulamos llamada a API
      await new Promise(resolve => setTimeout(resolve, 300));
      // Los datos ya están en recolecciones
    } catch (e) {
      error.value = 'No se pudieron cargar las recolecciones.';
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    error,
    recolecciones,
    totalKg,
    totalRecolecciones,
    arbolesProcesados,
    promedioKg,
    cargarRecolecciones,
  };
}