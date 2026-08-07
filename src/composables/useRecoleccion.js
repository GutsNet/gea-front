/*
G.E.A. Frontend
Composable: useRecoleccion
Estado y lógica para la vista de Recolección.

Conectado a /api/v1/recoleccion/ (RecoleccionSerializer):
  { id, responsable, responsable_matricula, kilos, fecha }

Importante: el modelo `Recoleccion` real NO tiene `ubicacion`, `hora`
ni `updated_at` (ver API.md, sección 5.1) — solo responsable, kilos
y fecha (sin hora). El mock original inventaba esos campos; aquí se
quitan en vez de simularlos.

Los filtros exactos que soporta el backend son `responsable` y
`fecha` (no hay filtro de rango de fechas ni `?search=` en este
recurso), así que la búsqueda de texto se resuelve del lado cliente
sobre la matrícula del responsable dentro de la página cargada, y el
filtro de fecha se manda tal cual al backend.

Las tarjetas de KPI se alimentan de /api/v1/dashboard/resumen/
(fuente única de verdad para totales del sistema) en vez de sumar
solo lo que hay cargado en la página actual.
*/
import { ref, reactive, computed, onMounted } from 'vue';
import apiClient from '@src/api/client';

const PAGE_SIZE_DEFAULT = 10;

export function useRecoleccion() {
  const loading = ref(false);
  const error = ref('');

  const recolecciones = ref([]);
  const count = ref(0);

  // Estudiantes activos, para el filtro/selector de "Responsable"
  const estudiantes = ref([]); // [{ id, matricula, ... }]

  // KPIs (vienen de /dashboard/resumen/, no de la página actual)
  const kgTotales = ref(0);
  const totalRecolecciones = ref(0);
  const arbolesProcesados = ref(0); // = árboles con estado "Saneado"

  const promedioKg = computed(() => {
    if (!totalRecolecciones.value) return 0;
    return kgTotales.value / totalRecolecciones.value;
  });

  // Filtros, orden y paginación --------------------------------------

  const filtros = reactive({
    busqueda: '', // filtro de texto del lado cliente, sobre la página cargada
    fecha: '', // filtro exacto que sí soporta el backend (YYYY-MM-DD)
    responsable: '',
    ordering: '-fecha',
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

  // Filtrado de texto del lado cliente (matrícula) sobre la página actual
  const recoleccionesFiltradas = computed(() => {
    if (!filtros.busqueda) return recolecciones.value;
    const q = filtros.busqueda.trim().toLowerCase();
    return recolecciones.value.filter((r) =>
      r.responsable.toLowerCase().includes(q) || r.fecha.includes(q)
    );
  });

  // Formato -------------------------------------------------------------

  const formatFecha = (isoDate) => {
    if (!isoDate) return '—';
    const [y, m, d] = isoDate.split('-');
    if (!y || !m || !d) return isoDate;
    return `${d}/${m}/${y}`;
  };

  const mapRecoleccion = (item) => ({
    id: item.id,
    fecha: formatFecha(item.fecha),
    responsable: item.responsable_matricula || '—',
    responsableId: item.responsable,
    kg: item.kilos,
  });

  // Carga de datos --------------------------------------------------------

  const fetchEstudiantes = async () => {
    try {
      const { data } = await apiClient.get('/auth/usuarios/', {
        params: { rol: 'Estudiante', estatus: true, page_size: 100 },
      });
      estudiantes.value = data.results ?? data;
    } catch (e) {
      // El selector de responsable requiere permisos de Administrativo;
      // si el usuario actual no los tiene, simplemente queda vacío.
      estudiantes.value = [];
    }
  };

  const fetchResumen = async () => {
    try {
      const { data } = await apiClient.get('/dashboard/resumen/');
      kgTotales.value = data.kg_recolectados ?? 0;
      arbolesProcesados.value = data.arboles?.saneados ?? 0;
    } catch (e) {
      // Las tarjetas de KPI son informativas; si el resumen falla, se
      // quedan en 0 y la tabla de recolecciones sigue funcionando.
    }
  };

  const fetchRecolecciones = async () => {
    try {
      loading.value = true;
      error.value = '';

      const params = {
        page: paginacion.page,
        page_size: paginacion.pageSize,
      };
      if (filtros.fecha) params.fecha = filtros.fecha;
      if (filtros.responsable) params.responsable = filtros.responsable;
      if (filtros.ordering) params.ordering = filtros.ordering;

      const { data } = await apiClient.get('/recoleccion/', { params });
      const results = data.results ?? data;
      count.value = data.count ?? results.length;
      recolecciones.value = results.map(mapRecoleccion);

      // El total de recolecciones para el KPI se toma sin filtros (una sola
      // vez) para no confundir "total del sistema" con "total filtrado".
      if (!filtros.fecha && !filtros.responsable && paginacion.page === 1) {
        totalRecolecciones.value = count.value;
      } else if (totalRecolecciones.value === 0) {
        // Primer fetch ya trae filtros: pedimos el conteo global aparte.
        const { data: sinFiltro } = await apiClient.get('/recoleccion/', { params: { page_size: 1 } });
        totalRecolecciones.value = sinFiltro.count ?? 0;
      }
    } catch (e) {
      error.value = e?.response?.data?.message || e?.response?.data?.detail || 'No se pudieron cargar las recolecciones.';
      recolecciones.value = [];
      count.value = 0;
    } finally {
      loading.value = false;
    }
  };

  // Acciones expuestas a la vista ------------------------------------------

  const setBusqueda = (valor) => {
    filtros.busqueda = valor;
  };

  const setFiltro = (campo, valor) => {
    filtros[campo] = valor;
    paginacion.page = 1;
    fetchRecolecciones();
  };

  const limpiarFiltros = () => {
    filtros.busqueda = '';
    filtros.fecha = '';
    filtros.responsable = '';
    filtros.ordering = '-fecha';
    paginacion.page = 1;
    fetchRecolecciones();
  };

  const irAPagina = (page) => {
    if (page < 1 || page > totalPages.value || page === paginacion.page) return;
    paginacion.page = page;
    fetchRecolecciones();
  };

  const setPageSize = (size) => {
    paginacion.pageSize = Number(size);
    paginacion.page = 1;
    fetchRecolecciones();
  };

  // Crea una recolección nueva (requiere rol Administrativo/Root en backend)
  const detalleRecoleccion = ref(null);
  const detalleLoading = ref(false);

  const crearRecoleccion = async ({ responsable, kilos, fecha }) => {
    try {
      loading.value = true;
      error.value = '';
      await apiClient.post('/recoleccion/', { responsable, kilos, fecha });
      paginacion.page = 1;
      await Promise.all([fetchRecolecciones(), fetchResumen()]);
      return { ok: true };
    } catch (e) {
      const mensaje = e?.response?.data?.message || e?.response?.data?.detail || 'No se pudo registrar la recolección.';
      error.value = mensaje;
      return { ok: false, error: mensaje, details: e?.response?.data?.details };
    } finally {
      loading.value = false;
    }
  };

  const fetchRecoleccion = async (id) => {
    try {
      detalleLoading.value = true;
      detalleRecoleccion.value = null;
      const { data } = await apiClient.get(`/recoleccion/${id}/`);
      detalleRecoleccion.value = data;
      return { ok: true, data };
    } catch (e) {
      const mensaje = e?.response?.data?.message || e?.response?.data?.detail || 'No se pudo cargar el detalle de la recolección.';
      return { ok: false, error: mensaje };
    } finally {
      detalleLoading.value = false;
    }
  };

  const editarRecoleccion = async (id, datos) => {
    try {
      loading.value = true;
      error.value = '';
      await apiClient.patch(`/recoleccion/${id}/`, datos);
      await Promise.all([fetchRecolecciones(), fetchResumen()]);
      return { ok: true };
    } catch (e) {
      const mensaje = e?.response?.data?.message || e?.response?.data?.detail || 'No se pudo editar la recolección.';
      error.value = mensaje;
      return { ok: false, error: mensaje, details: e?.response?.data };
    } finally {
      loading.value = false;
    }
  };

  const eliminarRecoleccion = async (id) => {
    try {
      loading.value = true;
      error.value = '';
      await apiClient.delete(`/recoleccion/${id}/`);
      await Promise.all([fetchRecolecciones(), fetchResumen()]);
      return { ok: true };
    } catch (e) {
      const mensaje = e?.response?.data?.message || e?.response?.data?.detail || 'No se pudo eliminar la recolección.';
      error.value = mensaje;
      return { ok: false, error: mensaje, details: e?.response?.data };
    } finally {
      loading.value = false;
    }
  };

  onMounted(async () => {
    await Promise.all([fetchRecolecciones(), fetchResumen(), fetchEstudiantes()]);
  });

  return {
    loading,
    error,
    recolecciones: recoleccionesFiltradas,
    count,
    estudiantes,
    detalleRecoleccion,
    detalleLoading,

    kgTotales,
    totalRecolecciones,
    arbolesProcesados,
    promedioKg,

    filtros,
    paginacion,
    totalPages,
    rangoMostrado,

    setBusqueda,
    setFiltro,
    limpiarFiltros,
    irAPagina,
    setPageSize,
    crearRecoleccion,
    fetchRecolecciones,
    fetchRecoleccion,
    editarRecoleccion,
    eliminarRecoleccion,
  };
}