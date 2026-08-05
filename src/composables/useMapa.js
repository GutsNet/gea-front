/*
G.E.A. Frontend
Composable: useMapa
Estado y lógica de datos del Mapa (árbol seleccionado, estadísticas
inferiores). Lo usan MapaDesktopView.vue y MapaMobileView.vue — solo
una de las dos está montada a la vez (ver MapaView.vue), así que no
hay riesgo de disparar la llamada a la API dos veces al mismo tiempo.
*/
import { ref, onMounted } from 'vue';
// import apiClient from '@src/api/client';

export function useMapa() {
  const loading = ref(false);
  const error = ref('');

  // Árbol actualmente seleccionado en el mapa (Datos Mockup — Reemplazar con llamada API)
  const arbolSeleccionado = ref({
    id: 'ARB-0234',
    especie_comun: 'Mezquite',
    especie_cientifica: 'Prosopus laevigata',
    nivel_infestacion: '7.5 (Severo)',
    estado: 'Saneado',
    ultimo_reporte: '06/07/2026 11:11:11',
  });

  // Estadísticas de las tarjetas inferiores (Datos Mockup — Reemplazar con llamada API)
  const estadisticas = ref({
    arbolesRegistrados: 128,
    reportesNuevos: 35,
    nivelesSeveros: 18,
    kgRecolectados: '256.8',
    usuariosActivos: 10,
  });

  onMounted(async () => {
    /*
    try {
      loading.value = true;
      const { data } = await apiClient.get('/mapa/resumen/');
      arbolSeleccionado.value = data.arbolSeleccionado;
      estadisticas.value = data.estadisticas;
    } catch (e) {
      error.value = e?.response?.data?.detail || 'No se pudo cargar el mapa.';
    } finally {
      loading.value = false;
    }
    */
  });

  return {
    loading,
    error,
    arbolSeleccionado,
    estadisticas,
  };
}
