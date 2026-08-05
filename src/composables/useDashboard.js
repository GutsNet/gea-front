/*
G.E.A. Frontend
Composable: useDashboard
Estado y lógica de datos del Dashboard (resumen, top especies,
reportes recientes, helpers de color/estado). Lo usan
DashboardDesktopView.vue y DashboardMobileView.vue — solo una de las
dos está montada a la vez (ver DashboardView.vue), así que no hay
riesgo de disparar la llamada a la API dos veces al mismo tiempo.
*/
import { ref, onMounted } from 'vue';
// import apiClient from '@src/api/client';

export function useDashboard() {
  const resumen = ref({});
  const loading = ref(false);
  const error = ref('');

  // Datos Mockup (Reemplazar con llamada API)
  const topEspecies = ref([
    { nombre: 'Mezquite (Prosopis laevigata)', arboles: 38, severos: 52.6, tendencia: 12 },
    { nombre: 'Huizache (Vachellia farnesiana)', arboles: 28, severos: 46.4, tendencia: 8 },
    { nombre: 'Pirúl (Schinus molle)', arboles: 22, severos: 27.3, tendencia: -5 },
    { nombre: 'Casuarina (Casuarina equisetifolia)', arboles: 16, severos: 18.8, tendencia: -3 },
    { nombre: 'Eucalipto (Eucalyptus spp.)', arboles: 12, severos: 10.0, tendencia: -2 },
  ]);

  const reportesRecientes = ref([
    { id: 'ARB-0234', especie: 'Mezquite', nivel: '7.5 (Severo)', nivelNum: 7.5, ubicacion: 'Área Verde 3', fecha: '06/07/2026 11:11 a.m.', estado: 'Validado' },
    { id: 'ARB-0233', especie: 'Huizache', nivel: '3.5 (Ligera)', nivelNum: 3.5, ubicacion: 'Área Verde 2', fecha: '06/07/2026 10:45 a.m.', estado: 'En revisión' },
    { id: 'ARB-0232', especie: 'Pirúl', nivel: '0.0 (No visible)', nivelNum: 0, ubicacion: 'Área Verde 1', fecha: '06/07/2026 09:30 a.m.', estado: 'Pendiente' },
    { id: 'ARB-0231', especie: 'Mezquite', nivel: '7.5 (Severo)', nivelNum: 7.5, ubicacion: 'Área Verde 3', fecha: '05/07/2026 04:20 p.m.', estado: 'Validado' },
    { id: 'ARB-0230', especie: 'Casuarina', nivel: '3.5 (Ligera)', nivelNum: 3.5, ubicacion: 'Área Verde 2', fecha: '05/07/2026 03:15 p.m.', estado: 'En revisión' },
  ]);

  const getLevelColor = (nivel) => {
    if (nivel >= 7.5) return 'text-red font-semibold';
    if (nivel >= 3.5) return 'text-yellow font-semibold';
    return 'text-green font-semibold';
  };

  const getStatusClass = (estado) => {
    if (estado === 'Validado') return 'status-validado';
    if (estado === 'En revisión') return 'status-revision';
    return 'status-pendiente';
  };

  onMounted(async () => {
    /*
    try {
      loading.value = true;
      const { data } = await apiClient.get('/dashboard/resumen/');
      resumen.value = data;
    } catch (e) {
      error.value = e?.response?.data?.detail || 'No se pudo cargar el dashboard.';
    } finally {
      loading.value = false;
    }
    */
  });

  return {
    resumen,
    loading,
    error,
    topEspecies,
    reportesRecientes,
    getLevelColor,
    getStatusClass,
  };
}
