/*
G.E.A. Frontend
Composable: useEstudiantes
Estado y lógica de datos del listado de Estudiantes (tabla, filtros,
tarjetas de estadísticas, helper de estado). Lo usan
EstudiantesDesktopView.vue y EstudiantesMobileView.vue — solo una de
las dos está montada a la vez (ver EstudiantesView.vue), así que no
hay riesgo de disparar la llamada a la API dos veces al mismo tiempo.

Conectado a GET /api/v1/auth/usuarios/?rol=Estudiante (UsuarioSerializer):
  { id, matricula, username, rol, grupo, cuatrimestre, estatus,
    fecha_registro, ultimo_acceso }

Ese endpoint requiere rol Administrativo o Root (ver API.md 2.6).

Importante — el modelo `Usuario` real NO tiene `nombre` (nombre
completo) ni `correo`, y `estatus` es booleano (`Activo`/`Inactivo`),
no un estado de 3 valores como "En pausa". El mock original inventaba
esos campos; aquí se ajustan a lo que la API expone de verdad.

Tampoco existe un endpoint que devuelva "kg recolectados por
estudiante" directamente. Se calcula pidiendo, para cada estudiante
de la página visible, sus recolecciones (`GET /recoleccion/?responsable=<id>`)
y sumando `kilos` en el cliente. Es correcto pero no escala a
catálogos enormes; si el backend llega a exponer un campo agregado,
conviene cambiarlo por eso.
*/
import { ref, reactive, computed, onMounted } from 'vue';
import apiClient from '@src/api/client';

const PAGE_SIZE_DEFAULT = 10;
export const CUATRIMESTRES = Array.from({ length: 11 }, (_, i) => i + 1);

export function useEstudiantes() {
  const loading = ref(false);
  const error = ref('');

  const estudiantes = ref([]);
  const count = ref(0);

  // Grupos distintos, para el selector de filtro (se arman a partir de
  // una carga amplia del roster; ver fetchGrupos)
  const grupos = ref([]);

  // KPIs
  const estudiantesActivos = ref(0);
  const kgRecolectadosTotal = ref(0);

  // Filtros, orden y paginación ------------------------------------------

  const filtros = reactive({
    search: '',
    grupo: '',
    cuatrimestre: '',
    estatus: '', // '' = todos, 'true' = activos, 'false' = inactivos
    ordering: '-fecha_registro',
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

  // Formato ----------------------------------------------------------------

  const formatFecha = (isoDate) => {
    if (!isoDate) return '—';
    const [y, m, d] = isoDate.split('-');
    if (!y || !m || !d) return isoDate;
    return `${d}/${m}/${y}`;
  };

  const formatFechaHora = (isoDateTime) => {
    if (!isoDateTime) return { fecha: 'Sin actividad registrada', hora: '' };
    const fecha = new Date(isoDateTime);
    if (Number.isNaN(fecha.getTime())) return { fecha: isoDateTime, hora: '' };
    return {
      fecha: fecha.toLocaleDateString('es-MX'),
      hora: fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true }),
    };
  };

  const getStatusBadgeClass = (estado) => {
    if (estado === 'Activo') return 'pill-light-green text-green';
    if (estado === 'Inactivo') return 'pill-light-red text-red';
    return 'pill-light-gray text-gray';
  };

  // Kg recolectados por estudiante (agregado en cliente) -------------------

  const fetchKgEstudiante = async (estudianteId) => {
    let total = 0;
    let url = '/recoleccion/';
    let params = { responsable: estudianteId, page_size: 100 };
    let paginas = 0;
    try {
      // Suma todas las páginas de recolecciones de este estudiante,
      // con un tope de seguridad para no encadenar peticiones infinitas.
      while (url && paginas < 10) {
        const { data } = await apiClient.get(url, params ? { params } : undefined);
        const results = data.results ?? data;
        total += results.reduce((sum, r) => sum + (r.kilos || 0), 0);
        url = data.next || null;
        params = null; // "next" ya trae los query params completos
        paginas += 1;
      }
    } catch (e) {
      // Si falla, se deja el total en lo que se haya acumulado hasta ahí.
    }
    return total;
  };

  // Carga de datos -----------------------------------------------------------

  const mapEstudiante = (item) => {
    const actividad = formatFechaHora(item.ultimo_acceso);
    return {
      id: item.id,
      username: item.username,
      matricula: item.matricula,
      grupo: item.grupo,
      cuatrimestre: item.cuatrimestre,
      estado: item.estatus ? 'Activo' : 'Inactivo',
      fechaRegistro: formatFecha(item.fecha_registro),
      fechaActividad: actividad.fecha,
      horaActividad: actividad.hora,
      kgs: null, // se completa después, de forma asíncrona
      kgsCargando: true,
    };
  };

  const cargarKgsDePagina = async (lista) => {
    await Promise.all(
      lista.map(async (est) => {
        est.kgs = await fetchKgEstudiante(est.id);
        est.kgsCargando = false;
      })
    );
  };

  const fetchGrupos = async () => {
    try {
      const { data } = await apiClient.get('/auth/usuarios/', {
        params: { rol: 'user', page_size: 100 },
      });
      const results = data.results ?? data;
      const distintos = new Set(results.map((u) => u.grupo).filter(Boolean));
      grupos.value = Array.from(distintos).sort();
    } catch (e) {
      grupos.value = [];
    }
  };

  const fetchResumen = async () => {
    try {
      const { data } = await apiClient.get('/dashboard/resumen/');
      estudiantesActivos.value = data.estudiantes_activos ?? 0;
      kgRecolectadosTotal.value = data.kg_recolectados ?? 0;
    } catch (e) {
      // KPIs informativos; si falla el resumen se quedan en 0.
    }
  };

  const fetchEstudiantes = async () => {
    try {
      loading.value = true;
      error.value = '';

      const params = {
        rol: 'user',
        page: paginacion.page,
        page_size: paginacion.pageSize,
      };
      if (filtros.search) params.search = filtros.search;
      if (filtros.grupo) params.grupo = filtros.grupo;
      if (filtros.cuatrimestre) params.cuatrimestre = filtros.cuatrimestre;
      if (filtros.estatus !== '') params.estatus = filtros.estatus;
      if (filtros.ordering) params.ordering = filtros.ordering;

      const { data } = await apiClient.get('/auth/usuarios/', { params });
      const results = data.results ?? data;
      count.value = data.count ?? results.length;
      const mapeados = results.map(mapEstudiante);
      estudiantes.value = mapeados;

      // Se piden los kg recolectados en segundo plano, sin bloquear
      // el renderizado de la tabla.
      cargarKgsDePagina(mapeados);
    } catch (e) {
      error.value = e?.response?.data?.message || e?.response?.data?.detail || 'No se pudieron cargar los estudiantes.';
      estudiantes.value = [];
      count.value = 0;
    } finally {
      loading.value = false;
    }
  };

  // Acciones expuestas a la vista --------------------------------------------

  let searchTimeout = null;
  const setSearch = (value) => {
    filtros.search = value;
    paginacion.page = 1;
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(fetchEstudiantes, 400);
  };

  const searchNow = () => {
    clearTimeout(searchTimeout);
    paginacion.page = 1;
    fetchEstudiantes();
  };

  const setFiltro = (campo, valor) => {
    filtros[campo] = valor;
    paginacion.page = 1;
    fetchEstudiantes();
  };

  const limpiarFiltros = () => {
    filtros.search = '';
    filtros.grupo = '';
    filtros.cuatrimestre = '';
    filtros.estatus = '';
    filtros.ordering = '-fecha_registro';
    paginacion.page = 1;
    fetchEstudiantes();
  };

  const irAPagina = (page) => {
    if (page < 1 || page > totalPages.value || page === paginacion.page) return;
    paginacion.page = page;
    fetchEstudiantes();
  };

  const setPageSize = (size) => {
    paginacion.pageSize = Number(size);
    paginacion.page = 1;
    fetchEstudiantes();
  };

  // Crea un estudiante nuevo (requiere rol Root en backend)
  const crearEstudiante = async ({ matricula, username, password, grupo, cuatrimestre, estatus }) => {
    try {
      loading.value = true;
      error.value = '';
      await apiClient.post('/auth/usuarios/', {
        matricula,
        username,
        password,
        rol: 'user',
        grupo,
        cuatrimestre,
        estatus,
      });
      paginacion.page = 1;
      await Promise.all([fetchEstudiantes(), fetchResumen(), fetchGrupos()]);
      return { ok: true };
    } catch (e) {
      const mensaje = e?.response?.data?.message || e?.response?.data?.detail || 'No se pudo crear el estudiante.';
      error.value = mensaje;
      return { ok: false, error: mensaje, details: e?.response?.data?.details };
    } finally {
      loading.value = false;
    }
  };

  const editarEstudiante = async (id, { matricula, username, password, grupo, cuatrimestre, estatus }) => {
    try {
      loading.value = true;
      error.value = '';
      await apiClient.patch(`/auth/usuarios/${id}/`, {
        matricula,
        username,
        password: password || undefined,
        grupo,
        cuatrimestre,
        estatus,
      });
      await Promise.all([fetchEstudiantes(), fetchResumen(), fetchGrupos()]);
      return { ok: true };
    } catch (e) {
      const mensaje = e?.response?.data?.message || e?.response?.data?.detail || 'No se pudo editar el estudiante.';
      error.value = mensaje;
      return { ok: false, error: mensaje, details: e?.response?.data };
    } finally {
      loading.value = false;
    }
  };

  const eliminarEstudiante = async (id) => {
    try {
      loading.value = true;
      error.value = '';
      await apiClient.delete(`/auth/usuarios/${id}/`);
      await Promise.all([fetchEstudiantes(), fetchResumen(), fetchGrupos()]);
      return { ok: true };
    } catch (e) {
      const mensaje = e?.response?.data?.message || e?.response?.data?.detail || 'No se pudo eliminar el estudiante.';
      error.value = mensaje;
      return { ok: false, error: mensaje, details: e?.response?.data };
    } finally {
      loading.value = false;
    }
  };

  onMounted(async () => {
    await Promise.all([fetchEstudiantes(), fetchResumen(), fetchGrupos()]);
  });

  return {
    loading,
    error,
    estudiantes,
    count,
    grupos,
    CUATRIMESTRES,

    estudiantesActivos,
    kgRecolectadosTotal,

    filtros,
    paginacion,
    totalPages,
    rangoMostrado,

    getStatusBadgeClass,
    setSearch,
    searchNow,
    setFiltro,
    limpiarFiltros,
    irAPagina,
    setPageSize,
    crearEstudiante,
    editarEstudiante,
    eliminarEstudiante,
    fetchEstudiantes,
  };
}