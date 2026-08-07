/*
G.E.A. Frontend
Composable: useUsuarios
Estado y lógica para la vista de Usuarios (CRUD completo).
Solo accesible por Root; Administrativos pueden listar.

Conectado a /api/v1/auth/usuarios/ (UsuarioViewSet):
  GET    → lista (UsuarioSerializer)
  POST   → crear (UsuarioCreateSerializer, Root only)
  PATCH  → editar (UsuarioCreateSerializer, Root only)
  DELETE → eliminar (Root only)
*/
import { ref, reactive, computed, onMounted } from 'vue';
import apiClient from '@src/api/client';
import { hasRole } from '@src/services/authService';

const PAGE_SIZE_DEFAULT = 10;
const ROLES = [
  { value: 'root', label: 'Sysadmin (root)' },
  { value: 'admin', label: 'Coordinador (admin)' },
  { value: 'user', label: 'Brigadista (user)' },
];

export const CUATRIMESTRES = Array.from({ length: 11 }, (_, i) => i + 1);

export function useUsuarios() {
  const loading = ref(false);
  const error = ref('');

  const usuarios = ref([]);
  const count = ref(0);

  // Permisos
  const esRoot = computed(() => hasRole('root'));

  // Filtros, búsqueda, orden y paginación
  const filtros = reactive({
    search: '',
    rol: '',
    estatus: '',
    grupo: '',
    cuatrimestre: '',
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

  const paginasVisibles = computed(() => {
    const total = totalPages.value;
    const actual = paginacion.page;
    const delta = 2;
    const inicio = Math.max(1, actual - delta);
    const fin = Math.min(total, actual + delta);
    const paginas = [];
    for (let i = inicio; i <= fin; i++) paginas.push(i);
    return paginas;
  });

  // Formato
  const formatFecha = (isoDate) => {
    if (!isoDate) return '—';
    const [y, m, d] = isoDate.split('-');
    if (!y || !m || !d) return isoDate;
    return `${d}/${m}/${y}`;
  };

  const formatFechaHora = (isoDateTime) => {
    if (!isoDateTime) return { fecha: 'Sin acceso registrado', hora: '' };
    const fecha = new Date(isoDateTime);
    if (Number.isNaN(fecha.getTime())) return { fecha: isoDateTime, hora: '' };
    return {
      fecha: fecha.toLocaleDateString('es-MX'),
      hora: fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true }),
    };
  };

  const normalizarRol = (rol) => {
    const normalized = String(rol || '').trim().toLowerCase();
    if (normalized === 'root') return 'root';
    if (normalized === 'administrativo' || normalized === 'admin') return 'admin';
    if (normalized === 'estudiante' || normalized === 'user') return 'user';
    return normalized;
  };

  const getRolLabel = (rol) => {
    const normalized = normalizarRol(rol);
    const found = ROLES.find((r) => r.value === normalized);
    return found ? found.label : rol;
  };

  const getRolBadgeClass = (rol) => {
    const normalized = normalizarRol(rol);
    if (normalized === 'root') return 'pill-light-red text-red';
    if (normalized === 'admin') return 'pill-light-blue text-blue';
    return 'pill-light-green text-green';
  };

  const getStatusBadgeClass = (estado) => {
    if (estado === 'Activo') return 'pill-light-green text-green';
    return 'pill-light-red text-red';
  };

  // Mapeo de respuesta
  const mapUsuario = (item) => {
    const acceso = formatFechaHora(item.ultimo_acceso);
    return {
      id: item.id,
      username: item.username,
      matricula: item.matricula,
      rol: item.rol,
      rolLabel: getRolLabel(item.rol),
      grupo: item.grupo,
      cuatrimestre: item.cuatrimestre,
      estado: item.estatus ? 'Activo' : 'Inactivo',
      estatus: item.estatus,
      fechaRegistro: formatFecha(item.fecha_registro),
      ultimoAccesoFecha: acceso.fecha,
      ultimoAccesoHora: acceso.hora,
    };
  };

  // Carga de datos
  const fetchUsuarios = async () => {
    try {
      loading.value = true;
      error.value = '';

      const params = {
        page: paginacion.page,
        page_size: paginacion.pageSize,
      };
      if (filtros.search) params.search = filtros.search;
      if (filtros.rol) params.rol = filtros.rol;
      if (filtros.estatus !== '') params.estatus = filtros.estatus;
      if (filtros.grupo) params.grupo = filtros.grupo;
      if (filtros.cuatrimestre) params.cuatrimestre = filtros.cuatrimestre;
      if (filtros.ordering) params.ordering = filtros.ordering;

      const { data } = await apiClient.get('/auth/usuarios/', { params });
      const results = data.results ?? data;
      count.value = data.count ?? results.length;
      usuarios.value = results.map(mapUsuario);
    } catch (e) {
      error.value = e?.response?.data?.message || e?.response?.data?.detail || 'No se pudieron cargar los usuarios.';
      usuarios.value = [];
      count.value = 0;
    } finally {
      loading.value = false;
    }
  };

  // Acciones
  let searchTimeout = null;
  const setSearch = (value) => {
    filtros.search = value;
    paginacion.page = 1;
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(fetchUsuarios, 400);
  };

  const searchNow = () => {
    clearTimeout(searchTimeout);
    paginacion.page = 1;
    fetchUsuarios();
  };

  const setFiltro = (campo, valor) => {
    filtros[campo] = valor;
    paginacion.page = 1;
    fetchUsuarios();
  };

  const limpiarFiltros = () => {
    filtros.search = '';
    filtros.rol = '';
    filtros.estatus = '';
    filtros.grupo = '';
    filtros.cuatrimestre = '';
    filtros.ordering = '-fecha_registro';
    paginacion.page = 1;
    fetchUsuarios();
  };

  const irAPagina = (page) => {
    if (page < 1 || page > totalPages.value || page === paginacion.page) return;
    paginacion.page = page;
    fetchUsuarios();
  };

  const setPageSize = (size) => {
    paginacion.pageSize = Number(size);
    paginacion.page = 1;
    fetchUsuarios();
  };

  // CRUD
  const crearUsuario = async ({ matricula, username, password, rol, grupo, cuatrimestre, estatus }) => {
    try {
      loading.value = true;
      error.value = '';
      await apiClient.post('/auth/usuarios/', {
        matricula,
        username,
        password,
        rol: normalizarRol(rol),
        grupo,
        cuatrimestre,
        estatus,
      });
      paginacion.page = 1;
      await fetchUsuarios();
      return { ok: true };
    } catch (e) {
      const mensaje = e?.response?.data?.message || e?.response?.data?.detail || 'No se pudo crear el usuario.';
      return { ok: false, error: mensaje, details: e?.response?.data?.details };
    } finally {
      loading.value = false;
    }
  };

  const editarUsuario = async (id, datos) => {
    try {
      loading.value = true;
      error.value = '';
      // Solo enviar campos que tienen valor (PATCH)
      const payload = {};
      if (datos.matricula) payload.matricula = datos.matricula;
      if (datos.username) payload.username = datos.username;
      if (datos.password) payload.password = datos.password;
      if (datos.rol) payload.rol = normalizarRol(datos.rol);
      if (datos.grupo !== undefined) payload.grupo = datos.grupo;
      if (datos.cuatrimestre !== undefined) payload.cuatrimestre = datos.cuatrimestre;
      if (datos.estatus !== undefined) payload.estatus = datos.estatus;

      await apiClient.patch(`/auth/usuarios/${id}/`, payload);
      await fetchUsuarios();
      return { ok: true };
    } catch (e) {
      const mensaje = e?.response?.data?.message || e?.response?.data?.detail || 'No se pudo editar el usuario.';
      return { ok: false, error: mensaje, details: e?.response?.data?.details };
    } finally {
      loading.value = false;
    }
  };

  const eliminarUsuario = async (id) => {
    try {
      loading.value = true;
      error.value = '';
      await apiClient.delete(`/auth/usuarios/${id}/`);
      // Si la página quedó vacía, retrocede
      if (usuarios.value.length === 1 && paginacion.page > 1) {
        paginacion.page -= 1;
      }
      await fetchUsuarios();
      return { ok: true };
    } catch (e) {
      const mensaje = e?.response?.data?.message || e?.response?.data?.detail || 'No se pudo eliminar el usuario.';
      return { ok: false, error: mensaje };
    } finally {
      loading.value = false;
    }
  };

  onMounted(fetchUsuarios);

  return {
    loading,
    error,
    usuarios,
    count,
    esRoot,
    ROLES,
    CUATRIMESTRES,

    filtros,
    paginacion,
    totalPages,
    rangoMostrado,
    paginasVisibles,

    getRolBadgeClass,
    getStatusBadgeClass,

    setSearch,
    searchNow,
    setFiltro,
    limpiarFiltros,
    irAPagina,
    setPageSize,

    crearUsuario,
    editarUsuario,
    eliminarUsuario,
    fetchUsuarios,
  };
}