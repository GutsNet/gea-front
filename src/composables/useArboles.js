/*
G.E.A. Frontend
Composable: useArboles
Estado y lógica de datos del listado de Árboles (tabla, filtros,
paginación y helpers de color/estado). Lo usan ArbolesDesktopView.vue
y ArbolesMobileView.vue — solo una de las dos está montada a la vez
(ver ArbolesView.vue), así que no hay riesgo de disparar la llamada
a la API dos veces al mismo tiempo.

Conectado a GET /api/v1/arboles/ (ArbolListSerializer):
  { id, etiqueta, especie, especie_nombre, id_area, coordenadas,
    nivel_infestacion, estado, fecha_reporte }

`especie_nombre` viene incluido, pero `especie_cientifica` y el
nombre de la `Ubicacion` NO vienen en el listado de árboles (solo el
UUID de `id_area`). Por eso se cargan por separado /arboles/especies/
y /arboles/ubicaciones/ una sola vez, y se arman mapas id -> nombre
para enriquecer cada fila sin tener que pedir el detalle de cada árbol.
*/
import { ref, reactive, computed, onMounted, watch } from 'vue';
import apiClient from '@src/api/client';

// Estados fitosanitarios reales del modelo Arbol (API.md, sección 3.3)
export const ESTADOS_ARBOL = ['Sano', 'Infestado', 'Limpieza', 'Saneado'];

const PAGE_SIZE_DEFAULT = 10;
const SEARCH_DEBOUNCE_MS = 400;

export function useArboles() {
  const loading = ref(false);
  const error = ref('');

  const arboles = ref([]);
  const count = ref(0);

  // Catálogos para filtros y para resolver nombres que no vienen en el listado
  const especies = ref([]); // [{ id, nombre, nombre_cientifico, nativa }]
  const ubicaciones = ref([]); // [{ id, nombre, coordenadas }]
  const catalogosListos = ref(false);

  const especiesPorId = computed(() => {
    const map = {};
    especies.value.forEach((e) => { map[e.id] = e; });
    return map;
  });

  const ubicacionesPorId = computed(() => {
    const map = {};
    ubicaciones.value.forEach((u) => { map[u.id] = u; });
    return map;
  });

  // Filtros, búsqueda, orden y paginación
  const filtros = reactive({
    search: '',
    especie: '',
    id_area: '',
    estado: '',
    ordering: '-fecha_reporte',
  });

  const paginacion = reactive({
    page: 1,
    pageSize: PAGE_SIZE_DEFAULT,
  });

  const totalPages = computed(() => {
    if (!paginacion.pageSize) return 1;
    return Math.max(1, Math.ceil(count.value / paginacion.pageSize));
  });

  const rangoMostrado = computed(() => {
    if (count.value === 0) return { desde: 0, hasta: 0 };
    const desde = (paginacion.page - 1) * paginacion.pageSize + 1;
    const hasta = Math.min(paginacion.page * paginacion.pageSize, count.value);
    return { desde, hasta };
  });

  // Helpers de formato ------------------------------------------------

  const formatFecha = (isoDate) => {
    if (!isoDate) return '—';
    const [y, m, d] = isoDate.split('-');
    if (!y || !m || !d) return isoDate;
    return `${d}/${m}/${y}`;
  };

  const getNivelTexto = (nivel) => {
    if (nivel === null || nivel === undefined) return '--';
    return Number(nivel).toFixed(1);
  };

  // Escala Hawksworth: nivel_infestacion es la suma de 3 componentes (0 a 7.5)
  const getSeverityLabel = (nivel) => {
    if (nivel === null || nivel === undefined) return '--';
    if (nivel === 0) return 'No visible';
    if (nivel <= 2.5) return 'Ligera';
    if (nivel <= 5) return 'Moderada';
    return 'Severa';
  };

  // Helper functions usadas por la tabla (colores/badges) -------------

  const getSeverityColorClass = (nivel) => {
    if (nivel === null || nivel === undefined) return 'text-blue';
    if (nivel > 5) return 'text-red';
    if (nivel > 0) return 'text-orange';
    return 'text-green';
  };

  const getSeverityBgClass = (nivel) => {
    if (nivel === null || nivel === undefined) return 'bg-blue';
    if (nivel > 5) return 'bg-red';
    if (nivel > 0) return 'bg-orange';
    return 'bg-green';
  };

  const getInfestationBadgeClass = (nivel) => {
    if (nivel === null || nivel === undefined) return 'badge-outline-blue';
    if (nivel > 5) return 'badge-light-red';
    if (nivel > 0) return 'badge-light-orange';
    return 'badge-light-green';
  };

  // Estados reales del Árbol: Sano | Infestado | Limpieza | Saneado
  const getStatusBadgeClass = (estado) => {
    if (estado === 'Sano') return 'pill-light-green text-green';
    if (estado === 'Infestado') return 'pill-light-red text-red';
    if (estado === 'Limpieza') return 'pill-light-blue text-blue';
    if (estado === 'Saneado') return 'pill-light-gray text-gray';
    return 'pill-light-gray text-gray';
  };

  // Carga de catálogos (una sola vez) ----------------------------------

  const fetchCatalogos = async () => {
    try {
      const [especiesRes, ubicacionesRes] = await Promise.all([
        apiClient.get('/arboles/especies/', { params: { page_size: 100 } }),
        apiClient.get('/arboles/ubicaciones/', { params: { page_size: 100 } }),
      ]);
      especies.value = especiesRes.data.results ?? especiesRes.data;
      ubicaciones.value = ubicacionesRes.data.results ?? ubicacionesRes.data;
    } catch (e) {
      // Los catálogos son auxiliares (nombres científicos / ubicación);
      // si fallan, la tabla sigue funcionando con los datos del árbol.
      console.error('No se pudieron cargar los catálogos de especies/ubicaciones.', e);
    } finally {
      catalogosListos.value = true;
    }
  };

  // Mapeo de la respuesta de la API a las filas que consume la tabla ---

  const mapArbol = (item) => {
    const especieInfo = especiesPorId.value[item.especie];
    const ubicacionInfo = ubicacionesPorId.value[item.id_area];

    return {
      id: item.id,
      especie: item.especie,
      id_area: item.id_area,
      especie_comun: item.especie_nombre || especieInfo?.nombre || '—',
      especie_cientifica: especieInfo?.nombre_cientifico || '',
      ubicacion: ubicacionInfo?.nombre || '—',
      coordenadas: item.coordenadas || '—',
      nivelTexto: getNivelTexto(item.nivel_infestacion),
      nivelNum: item.nivel_infestacion,
      estadoInfestacion: getSeverityLabel(item.nivel_infestacion),
      estado: item.estado,
      fechaReporte: formatFecha(item.fecha_reporte),
      fechaReporteRaw: item.fecha_reporte || '',
      horaReporte: '',
      etiqueta: item.etiqueta,
    };
  };

  // Carga de árboles -----------------------------------------------------

  const detalleArbol = ref(null);
  const detalleLoading = ref(false);

  const fetchArboles = async () => {
    try {
      loading.value = true;
      error.value = '';

      const params = {
        page: paginacion.page,
        page_size: paginacion.pageSize,
      };
      if (filtros.search) params.search = filtros.search;
      if (filtros.especie) params.especie = filtros.especie;
      if (filtros.id_area) params.id_area = filtros.id_area;
      if (filtros.estado) params.estado = filtros.estado;
      if (filtros.ordering) params.ordering = filtros.ordering;

      const { data } = await apiClient.get('/arboles/', { params });
      const results = data.results ?? data;
      count.value = data.count ?? results.length;
      arboles.value = results.map(mapArbol);
    } catch (e) {
      error.value = e?.response?.data?.message || e?.response?.data?.detail || 'No se pudieron cargar los árboles.';
      arboles.value = [];
      count.value = 0;
    } finally {
      loading.value = false;
    }
  };

  const fetchArbolDetalle = async (id) => {
    try {
      detalleLoading.value = true;
      detalleArbol.value = null;
      const { data } = await apiClient.get(`/arboles/${id}/`);
      detalleArbol.value = data;
      return { ok: true, data };
    } catch (e) {
      const mensaje = e?.response?.data?.message || e?.response?.data?.detail || 'No se pudo cargar el detalle del árbol.';
      return { ok: false, error: mensaje };
    } finally {
      detalleLoading.value = false;
    }
  };

  const crearArbol = async (datos) => {
    try {
      await apiClient.post('/arboles/', datos);
      await fetchArboles();
      return { ok: true };
    } catch (e) {
      const mensaje = e?.response?.data?.message || e?.response?.data?.detail || 'No se pudo crear el árbol.';
      return { ok: false, error: mensaje, details: e?.response?.data };
    }
  };

  const editarArbol = async (id, datos) => {
    try {
      await apiClient.patch(`/arboles/${id}/`, datos);
      await fetchArboles();
      return { ok: true };
    } catch (e) {
      const mensaje = e?.response?.data?.message || e?.response?.data?.detail || 'No se pudo editar el árbol.';
      return { ok: false, error: mensaje, details: e?.response?.data };
    }
  };

  const eliminarArbol = async (id) => {
    try {
      await apiClient.delete(`/arboles/${id}/`);
      await fetchArboles();
      return { ok: true };
    } catch (e) {
      const mensaje = e?.response?.data?.message || e?.response?.data?.detail || 'No se pudo eliminar el árbol.';
      return { ok: false, error: mensaje, details: e?.response?.data };
    }
  };

  // Acciones expuestas a la vista ----------------------------------------

  let searchTimeout = null;
  const setSearch = (value) => {
    filtros.search = value;
    paginacion.page = 1;
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(fetchArboles, SEARCH_DEBOUNCE_MS);
  };

  const searchNow = () => {
    clearTimeout(searchTimeout);
    paginacion.page = 1;
    fetchArboles();
  };

  const setFiltro = (campo, valor) => {
    filtros[campo] = valor;
    paginacion.page = 1;
    fetchArboles();
  };

  const limpiarFiltros = () => {
    filtros.search = '';
    filtros.especie = '';
    filtros.id_area = '';
    filtros.estado = '';
    filtros.ordering = '-fecha_reporte';
    paginacion.page = 1;
    fetchArboles();
  };

  const irAPagina = (page) => {
    if (page < 1 || page > totalPages.value || page === paginacion.page) return;
    paginacion.page = page;
    fetchArboles();
  };

  const setPageSize = (size) => {
    paginacion.pageSize = Number(size);
    paginacion.page = 1;
    fetchArboles();
  };

  onMounted(async () => {
    await fetchCatalogos();
    await fetchArboles();
  });

  return {
    loading,
    error,
    arboles,
    count,
    especies,
    ubicaciones,
    detalleArbol,
    detalleLoading,
    ESTADOS_ARBOL,
    filtros,
    paginacion,
    totalPages,
    rangoMostrado,

    getSeverityColorClass,
    getSeverityBgClass,
    getInfestationBadgeClass,
    getStatusBadgeClass,

    fetchArboles,
    fetchArbolDetalle,
    crearArbol,
    editarArbol,
    eliminarArbol,
    setSearch,
    searchNow,
    setFiltro,
    limpiarFiltros,
    irAPagina,
    setPageSize,
  };
}