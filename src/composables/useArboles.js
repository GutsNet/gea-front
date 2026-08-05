/*
G.E.A. Frontend
Composable: useArboles
Estado y lógica de datos del listado de Árboles (tabla, filtros,
helpers de color/estado). Lo usan ArbolesDesktopView.vue y
ArbolesMobileView.vue — solo una de las dos está montada a la vez
(ver ArbolesView.vue), así que no hay riesgo de disparar la llamada
a la API dos veces al mismo tiempo.
*/
import { ref, onMounted } from 'vue';
// import apiClient from '@src/api/client';

export function useArboles() {
  const loading = ref(false);
  const error = ref('');

  // Datos Mockup (Reemplazar con llamada API)
  const arboles = ref([
    { id: 'ARB-0234', especie_comun: 'Mezquite', especie_cientifica: 'Prosopis laevigata', ubicacion: 'Área Verde 3', coordenadas: '20.010284, -99.345047', nivelTexto: '7.5', nivelNum: 7.5, estadoInfestacion: 'Severo', estado: 'Validado', fechaReporte: '06/07/2026', horaReporte: '11:11 a.m.' },
    { id: 'ARB-0198', especie_comun: 'Huizache', especie_cientifica: 'Vachellia farnesiana', ubicacion: 'Área Verde 2', coordenadas: '20.011245, -99.342678', nivelTexto: '3.5', nivelNum: 3.5, estadoInfestacion: 'Ligera', estado: 'Rechazado', fechaReporte: '05/07/2026', horaReporte: '04:30 p.m.' },
    { id: 'ARB-0156', especie_comun: 'Pirúl', especie_cientifica: 'Schinus molle', ubicacion: 'Área Verde 1', coordenadas: '20.009856, -99.340125', nivelTexto: '0.0', nivelNum: 0, estadoInfestacion: 'No visible', estado: 'En revisión', fechaReporte: '06/07/2026', horaReporte: '09:15 a.m.' },
    { id: 'ARB-0123', especie_comun: 'Casuarina', especie_cientifica: 'Casuarina equisetifolia', ubicacion: 'Área Verde 2', coordenadas: '20.011876, -99.341890', nivelTexto: '1.0', nivelNum: 1.0, estadoInfestacion: 'Moderado', estado: 'Validado', fechaReporte: '04/07/2026', horaReporte: '03:20 p.m.' },
    { id: 'ARB-0099', especie_comun: 'Eucalipto', especie_cientifica: 'Eucalyptus spp.', ubicacion: 'Área Verde 3', coordenadas: '20.010945, -99.344567', nivelTexto: '3.5', nivelNum: 3.5, estadoInfestacion: 'Ligera', estado: 'Validado', fechaReporte: '03/07/2026', horaReporte: '10:45 a.m.' },
    { id: 'ARB-0088', especie_comun: 'Lluvia de oro', especie_cientifica: 'Cassia fistula', ubicacion: 'Jardín Central', coordenadas: '20.010123, -99.345890', nivelTexto: 'En revisión', nivelNum: null, estadoInfestacion: '--', estado: 'Pendiente', fechaReporte: 'En revisión', horaReporte: '' },
    { id: 'ARB-0077', especie_comun: 'Laurel de la india', especie_cientifica: 'Ficus microcarpa', ubicacion: 'Estacionamiento', coordenadas: '20.009654, -99.346789', nivelTexto: '0.0', nivelNum: 0, estadoInfestacion: 'No visible', estado: 'Validado', fechaReporte: '02/07/2026', horaReporte: '02:15 p.m.' },
    { id: 'ARB-0065', especie_comun: 'Neem', especie_cientifica: 'Azadirachta indica', ubicacion: 'Área Verde 1', coordenadas: '20.009234, -99.341234', nivelTexto: '2.5', nivelNum: 2.5, estadoInfestacion: 'Moderado', estado: 'En revisión', fechaReporte: '01/07/2026', horaReporte: '11:30 a.m.' },
  ]);

  // Helper Functions
  const getSeverityColorClass = (nivel, texto) => {
    if (texto === 'En revisión' || nivel === null) return 'text-blue';
    if (nivel >= 7.5) return 'text-red';
    if (nivel > 0) return 'text-orange';
    return 'text-green';
  };

  const getSeverityBgClass = (nivel, texto) => {
    if (texto === 'En revisión' || nivel === null) return 'bg-blue';
    if (nivel >= 7.5) return 'bg-red';
    if (nivel > 0) return 'bg-orange';
    return 'bg-green';
  };

  const getInfestationBadgeClass = (nivel, texto) => {
    if (texto === '--') return 'badge-outline-blue';
    if (nivel >= 7.5) return 'badge-light-red';
    if (nivel > 0) return 'badge-light-orange';
    return 'badge-light-green';
  };

  const getStatusBadgeClass = (estado) => {
    if (estado === 'Validado') return 'pill-light-green text-green';
    if (estado === 'Rechazado') return 'pill-light-red text-red';
    if (estado === 'En revisión') return 'pill-light-blue text-blue';
    return 'pill-light-gray text-gray';
  };

  onMounted(async () => {
    /* Lógica original
    try {
      loading.value = true;
      const { data } = await apiClient.get('/arboles/');
      arboles.value = data.results ?? data;
    } catch (e) {
      error.value = e?.response?.data?.detail || 'No se pudieron cargar los árboles.';
    } finally {
      loading.value = false;
    }
    */
  });

  return {
    loading,
    error,
    arboles,
    getSeverityColorClass,
    getSeverityBgClass,
    getInfestationBadgeClass,
    getStatusBadgeClass,
  };
}
