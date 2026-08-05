/*
G.E.A. Frontend
Composable: useReportes
Estado y lógica de datos de la vista Reportes (listado, filtros helpers
de color/estado). Lo usan ReportesDesktopView.vue y
ReportesMobileView.vue — solo una de las dos está montada a la vez
(ver ReportesView.vue), así que no hay riesgo de disparar la llamada
a la API dos veces al mismo tiempo.
*/
import { ref, onMounted } from 'vue';
// import apiClient from '@src/api/client';

export function useReportes() {
  const loading = ref(false);
  const error = ref('');

  // Datos Mockup (Reemplazar con llamada API)
  const reportes = ref([
    {
      id: 'ARB-0156',
      nombre: 'Pirúl',
      especie: 'Schinus molle',
      estado: 'Pendiente',
      nivel_infestacion: '0.0 (No visible)',
      nivelNum: 0,
      reportado_por: 'Ana Martínez',
      ubicacion: 'UTTT - Área Verde 1',
      fecha: '06/07/2026 09:15 a.m.',
      coordenadas: '20.009856, -99.340125',
      action_status: 'En revisión',
    },
    {
      id: 'ARB-0198',
      nombre: 'Huizache',
      especie: 'Vachellia farnesiana',
      estado: 'Rechazado',
      nivel_infestacion: '3.5 (Ligera)',
      nivelNum: 3.5,
      reportado_por: 'Luis Ramírez',
      ubicacion: 'UTTT - Área Verde 2',
      fecha: '05/07/2026 04:30 p.m.',
      coordenadas: '20.011245, -99.342678',
      action_status: 'Rechazado',
    },
    {
      id: 'ARB-0234',
      nombre: 'Mezquite (Prosopus laevigata)',
      especie: 'Prosopis laevigata',
      estado: 'Severo',
      nivel_infestacion: '7.5 (Severo)',
      nivelNum: 7.5,
      reportado_por: 'Ana Martínez',
      ubicacion: 'UTTT - Área Verde 3',
      fecha: '06/07/2026 11:11 a.m.',
      coordenadas: '20.010284, -99.345047',
      action_status: 'Validado',
    },
  ]);

  // Helpers para clases dinámicas según estado/nivel
  const getCardBorderClass = (estado) => {
    if (estado === 'Pendiente') return 'border-blue';
    if (estado === 'Severo') return 'border-red';
    return 'border-gray';
  };

  const getIconColorClass = (estado) => {
    if (estado === 'Pendiente') return 'text-blue';
    if (estado === 'Severo') return 'text-red';
    return 'text-gray';
  };

  const getBadgeClass = (estado) => {
    if (estado === 'Pendiente') return 'bg-light-blue text-blue';
    if (estado === 'Severo') return 'bg-light-red text-red';
    return 'bg-light-gray text-gray-dark';
  };

  const getLevelTextClass = (nivel) => {
    if (nivel >= 7.5) return 'text-red';
    if (nivel >= 3.5) return 'text-yellow';
    return 'text-green';
  };

  const getActionBadgeClass = (status) => {
    if (status === 'En revisión') return 'bg-light-blue text-blue';
    if (status === 'Rechazado') return 'bg-light-red text-red';
    if (status === 'Validado') return 'bg-light-green text-green';
    return 'bg-light-gray text-gray-dark';
  };

  onMounted(async () => {
    /*
    try {
      loading.value = true;
      const { data } = await apiClient.get('/reportes/');
      reportes.value = data.results ?? data;
    } catch (e) {
      error.value = e?.response?.data?.detail || 'No se pudieron cargar los reportes.';
    } finally {
      loading.value = false;
    }
    */
  });

  return {
    loading,
    error,
    reportes,
    getCardBorderClass,
    getIconColorClass,
    getBadgeClass,
    getLevelTextClass,
    getActionBadgeClass,
  };
}