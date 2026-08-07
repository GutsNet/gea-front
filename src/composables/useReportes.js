/*
G.E.A. Frontend
Composable: useReportes
Estado y lógica de datos de la vista Reportes (listado, filtros, helpers
de color/estado). Lo usan ReportesDesktopView.vue y
ReportesMobileView.vue — solo una de las dos está montada a la vez
(ver ReportesView.vue), así que no hay riesgo de disparar la llamada
a la API dos veces al mismo tiempo.

NOTA DE DISEÑO IMPORTANTE:
Esta vista muestra en realidad el ciclo de vida de una `Solicitud`
(Pendiente -> Aceptada/Rechazada), no de un `Reporte` puro. El modelo
`Reporte` del backend solo existe DESPUÉS de que una solicitud es
aceptada, y siempre nace con estatus "Validado" — nunca "Pendiente".
Por eso este composable consume GET /api/v1/solicitudes/.

`SolicitudListSerializer` no incluye nombre de especie ni ubicación
(solo IDs / UUIDs). Para resolverlos sin hacer una petición por cada
tarjeta, cargamos UNA VEZ el catálogo de árboles y ubicaciones y
cruzamos en memoria. Esto solo funciona para solicitudes que apuntan
a un `arbol_existente`; para propuestas de árbol/especie NUEVOS (que
aún no existen como registro oficial), esos campos quedan como
"Ver detalles" hasta que el usuario pulsa ese botón, que trae el
detalle completo vía GET /api/v1/solicitudes/{id}/.
*/
import { ref, computed, onMounted, watch } from 'vue';
import apiClient from '@src/api/client';
// Ajusta esta ruta si tu módulo de sesión vive en otro archivo; se asume
// que expone `hasRole(...roles)` tal como en tu servicio de auth actual.
import { hasRole, getStoredUser } from '@src/services/authService';

const PAGE_SIZE = 10;
const PAGE_SIZE_FILTRO_LOCAL = 100; // cuando el filtro no es soportado por el backend

export function useReportes() {
  const solicitudesRaw = ref([]);
  const totalCount = ref(0);
  const page = ref(1);

  const arbolesMap = ref({}); // id -> { etiqueta, especieNombre, coordenadas, idArea }
  const ubicacionesMap = ref({}); // id -> nombre
  const especiesDisponibles = ref([]); // opciones (solo nombre) para el <select> de filtro
  const especiesCatalogo = ref([]); // [{ id, nombre, nombreCientifico }] para el formulario de alta

  const detalleCache = ref({}); // id (solicitud) -> respuesta de /solicitudes/{id}/
  const detalleLoadingId = ref(null);

  const loading = ref(false);
  const error = ref('');

  // --- Permisos ---
  // Aceptar/rechazar y eliminar están reservados a Root ("sysadmin") y
  // Administrativo ("coordinador"). Crear y ver detalles están disponibles
  // para cualquier usuario autenticado, incluido el rol `Estudiante`
  // ("Brigadista" en el lenguaje de negocio): un reporte enviado por un
  // Brigadista siempre queda "Pendiente" (en revisión) hasta que Admin/Root
  // lo valide o rechace desde el modal de detalle.
  const puedeGestionar = computed(() => hasRole('root', 'admin'));
  const currentUser = getStoredUser();
  const currentUserId = currentUser?.id || null;

  // --- Catálogos con ID, listos para usarse en <select> de formularios ---
  const arbolesOpciones = computed(() =>
    Object.entries(arbolesMap.value).map(([id, a]) => ({ id, ...a }))
  );
  const ubicacionesOpciones = computed(() =>
    Object.entries(ubicacionesMap.value).map(([id, nombre]) => ({ id, nombre }))
  );

  // --- Crear solicitud (POST /api/v1/solicitudes/) ---
  const creando = ref(false);
  const crearError = ref('');

  // --- Eliminar solicitud (DELETE /api/v1/solicitudes/{id}/) ---
  const eliminandoId = ref(null);
  const eliminarError = ref('');

  // --- Aceptar / rechazar (POST /api/v1/solicitudes/{id}/revisar/) ---
  const revisando = ref(false);
  const revisarError = ref('');

  // --- Filtro "mis reportes" vs "todo" (relevante para Administrativo/Root,
  // ya que un Estudiante ya solo ve los suyos por regla del backend) ---
  const soloMisReportes = ref(false);

  // --- Filtros ---
  const search = ref('');
  const estadoFiltro = ref(''); // '', 'Pendiente', 'Aceptada', 'Rechazada' (soportado por el backend)
  const nivelFiltro = ref(''); // '', 'no_visible', 'ligera', 'severa' (client-side, ver nota)
  const especieFiltro = ref(''); // nombre de especie (client-side, ver nota)

  // El backend NO soporta filtrar solicitudes por nivel de infestación ni
  // por especie (filterset_fields solo permite `status` y `solicitante`).
  // Cuando alguno de estos dos filtros está activo, pedimos una página más
  // grande (100, el máximo permitido) y filtramos en memoria, deshabilitando
  // la paginación normal para no dar resultados incompletos/engañosos.
  const usaFiltroLocal = computed(() => Boolean(nivelFiltro.value || especieFiltro.value));

  const totalPages = computed(() => {
    if (usaFiltroLocal.value) return 1;
    return Math.max(1, Math.ceil(totalCount.value / PAGE_SIZE));
  });

  const pageNumbers = computed(() => {
    const delta = 2;
    const start = Math.max(1, page.value - delta);
    const end = Math.min(totalPages.value, page.value + delta);
    const nums = [];
    for (let i = start; i <= end; i += 1) nums.push(i);
    return nums;
  });

  const cumpleNivel = (nivel) => {
    if (!nivelFiltro.value) return true;
    if (nivelFiltro.value === 'no_visible') return nivel === 0;
    if (nivelFiltro.value === 'ligera') return nivel > 0 && nivel < 7.5;
    if (nivelFiltro.value === 'severa') return nivel >= 7.5;
    return true;
  };

  const calcularEstado = (s) => {
    if (s.status === 'Pendiente') return 'Pendiente';
    if (s.status === 'Rechazada') return 'Rechazado';
    // Aceptada: no hay "estado de solicitud" más granular, así que
    // mostramos la severidad real calculada a partir de n1+n2+n3.
    if (s.nivel_infestacion >= 7.5) return 'Severo';
    if (s.nivel_infestacion >= 3.5) return 'Ligera';
    return 'No visible';
  };

  const calcularActionStatus = (status) => {
    if (status === 'Pendiente') return 'En revisión';
    if (status === 'Rechazada') return 'Rechazado';
    return 'Validado'; // Aceptada
  };

  const formatNivel = (nivel) => {
    const label = nivel >= 7.5 ? 'Severo' : nivel >= 3.5 ? 'Ligera' : 'No visible';
    return `${nivel} (${label})`;
  };

  const formatFecha = (isoString) => {
    if (!isoString) return '—';
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(isoString));
  };

  // --- Combina la solicitud cruda con datos resueltos del catálogo ---
  const enriquecerSolicitud = (s) => {
    const arbol = s.arbol_existente ? arbolesMap.value[s.arbol_existente] : null;
    const detalle = detalleCache.value[s.id];

    const especieNombre = arbol?.especieNombre || detalle?.nueva_especie_nombre || null;
    const especieCientifica =
      detalle?.nueva_especie_nombre_cientifico || (arbol ? null : null); // no disponible en list
    const etiqueta = arbol?.etiqueta || s.nueva_etiqueta || detalle?.nueva_etiqueta || '—';
    const idArea = arbol?.idArea || detalle?.id_area || null;
    const ubicacionNombre = idArea ? ubicacionesMap.value[idArea] : null;
    const coordenadas = arbol?.coordenadas || detalle?.coordenadas_exactas || null;

    return {
      id: s.id,
      nombre: especieNombre ? `${etiqueta} — ${especieNombre}` : etiqueta,
      especie: especieNombre || (detalle ? 'Sin datos' : 'Ver detalles'),
      especieCientifica: especieCientifica || '—',
      estado: calcularEstado(s),
      status: s.status,
      nivel_infestacion: formatNivel(s.nivel_infestacion),
      nivelNum: s.nivel_infestacion,
      reportado_por: s.solicitante_matricula,
      ubicacion: ubicacionNombre || (detalle ? 'Sin ubicación registrada' : 'Ver detalles'),
      coordenadas: coordenadas || (detalle ? 'No especificadas' : 'Ver detalles'),
      fecha: formatFecha(s.fecha_solicitud),
      action_status: calcularActionStatus(s.status),
      motivoRechazo: detalle?.motivo_rechazo || '',
      observaciones: detalle?.observaciones || '',
      revisadoPor: detalle?.revisado_por_matricula || null,
      fechaRevision: detalle?.fecha_revision ? formatFecha(detalle.fecha_revision) : null,
      // Mediciones individuales Hawksworth (ya vienen en el listado, no
      // requieren esperar al detalle) — se muestran en el modal para dar
      // TODOS los datos, no solo el total.
      n1: s.n1,
      n2: s.n2,
      n3: s.n3,
      especieNativa: detalle ? Boolean(detalle.nueva_especie_nativa) : null,
      imagenes: detalle
        ? [detalle.imagen1, detalle.imagen2, detalle.imagen3, detalle.imagen4].filter(Boolean)
        : [],
      esPropio: currentUser?.matricula ? s.solicitante_matricula === currentUser.matricula : false,
      detalleCargado: Boolean(detalle),
      detalleLoading: detalleLoadingId.value === s.id,
    };
  };

  const reportes = computed(() =>
    solicitudesRaw.value
      .map(enriquecerSolicitud)
      .filter((item) => cumpleNivel(item.nivelNum))
      .filter((item) => !especieFiltro.value || item.especie === especieFiltro.value)
  );

  const paginationLabel = computed(() => {
    if (usaFiltroLocal.value) {
      return `Mostrando ${reportes.value.length} resultados filtrados (de los primeros ${PAGE_SIZE_FILTRO_LOCAL})`;
    }
    if (totalCount.value === 0) return 'Sin reportes que mostrar';
    const start = (page.value - 1) * PAGE_SIZE + 1;
    const end = Math.min(page.value * PAGE_SIZE, totalCount.value);
    return `Mostrando ${start} a ${end} de ${totalCount.value} reportes`;
  });

  // --- Carga de catálogo de referencia (una sola vez al montar) ---
  const cargarReferencias = async () => {
    try {
      const [resArboles, resUbicaciones, resEspecies] = await Promise.all([
        apiClient.get('/arboles/', { params: { page_size: 100 } }),
        apiClient.get('/arboles/ubicaciones/', { params: { page_size: 100 } }),
        apiClient.get('/arboles/especies/', { params: { page_size: 100 } }),
      ]);

      const arbolesResults = resArboles.data.results ?? resArboles.data;
      arbolesMap.value = Object.fromEntries(
        arbolesResults.map((a) => [
          a.id,
          {
            etiqueta: a.etiqueta,
            especieNombre: a.especie_nombre,
            coordenadas: a.coordenadas,
            idArea: a.id_area,
          },
        ])
      );

      const ubicacionesResults = resUbicaciones.data.results ?? resUbicaciones.data;
      ubicacionesMap.value = Object.fromEntries(ubicacionesResults.map((u) => [u.id, u.nombre]));

      const especiesResults = resEspecies.data.results ?? resEspecies.data;
      especiesDisponibles.value = especiesResults.map((e) => e.nombre);
      especiesCatalogo.value = especiesResults.map((e) => ({
        id: e.id,
        nombre: e.nombre,
        nombreCientifico: e.nombre_cientifico,
      }));
    } catch (e) {
      // No bloquea el listado principal si fallan las referencias; algunos
      // campos simplemente quedarán como "Ver detalles" en vez de resueltos.
      console.warn('No se pudieron cargar árboles/ubicaciones/especies de referencia:', e);
    }
  };

  // --- Carga del listado principal de solicitudes ---
  const cargarSolicitudes = async () => {
    loading.value = true;
    error.value = '';
    try {
      const params = {
        page: usaFiltroLocal.value ? 1 : page.value,
        page_size: usaFiltroLocal.value ? PAGE_SIZE_FILTRO_LOCAL : PAGE_SIZE,
        ordering: '-fecha_solicitud',
      };
      if (search.value) params.search = search.value;
      if (estadoFiltro.value) params.status = estadoFiltro.value;
      if (soloMisReportes.value && currentUserId) params.solicitante = currentUserId;

      const { data } = await apiClient.get('/solicitudes/', { params });
      solicitudesRaw.value = data.results;
      totalCount.value = data.count;
    } catch (e) {
      error.value = e?.response?.data?.message || 'No se pudieron cargar los reportes.';
    } finally {
      loading.value = false;
    }
  };

  const verDetalle = async (id) => {
    if (detalleCache.value[id]) return; // ya está cargado, no repetir la petición
    detalleLoadingId.value = id;
    try {
      const { data } = await apiClient.get(`/solicitudes/${id}/`);
      detalleCache.value = { ...detalleCache.value, [id]: data };
    } catch (e) {
      error.value = e?.response?.data?.message || 'No se pudo cargar el detalle del reporte.';
    } finally {
      detalleLoadingId.value = null;
    }
  };

  // payload esperado, ver SolicitudCreateSerializer (API.md §6.3):
  // { arbol_existente } o { nueva_etiqueta, id_area, coordenadas_exactas,
  //   especie_existente | (nueva_especie_nombre + nueva_especie_nombre_cientifico + nueva_especie_nativa) }
  // más siempre: n1, n2, n3, observaciones?, imagen1..4?
  const crearSolicitud = async (payload) => {
    creando.value = true;
    crearError.value = '';
    try {
      const { data } = await apiClient.post('/solicitudes/', payload);

      // Los reportes creados por un Administrativo/Root se registran
      // directamente (auto-validados vía /revisar/, el único endpoint que
      // puede aceptar una solicitud). Los de un Estudiante quedan
      // "Pendiente" para revisión posterior, tal como los crea el backend.
      if (puedeGestionar.value && data?.id) {
        try {
          await apiClient.post(`/solicitudes/${data.id}/revisar/`, { accion: 'Aceptada' });
        } catch (e) {
          crearError.value =
            'El reporte se creó pero no se pudo validar automáticamente; revísalo manualmente desde "Ver detalles".';
        }
      }

      page.value = 1;
      await cargarSolicitudes();
      return true;
    } catch (e) {
      crearError.value =
        e?.response?.data?.message || 'No se pudo crear la solicitud.';
      return false;
    } finally {
      creando.value = false;
    }
  };

  const eliminarSolicitud = async (id) => {
    if (!puedeGestionar.value) return false;
    eliminandoId.value = id;
    eliminarError.value = '';
    try {
      await apiClient.delete(`/solicitudes/${id}/`);
      solicitudesRaw.value = solicitudesRaw.value.filter((s) => s.id !== id);
      totalCount.value = Math.max(0, totalCount.value - 1);
      // Si la página quedó vacía y no era la primera, retrocede una página
      // para no dejar al usuario viendo una lista vacía innecesariamente.
      if (
        solicitudesRaw.value.length === 0 &&
        page.value > 1 &&
        !usaFiltroLocal.value
      ) {
        page.value -= 1;
        await cargarSolicitudes();
      }
      return true;
    } catch (e) {
      eliminarError.value =
        e?.response?.data?.message || 'No se pudo eliminar el reporte.';
      return false;
    } finally {
      eliminandoId.value = null;
    }
  };

  // accion: 'Aceptada' | 'Rechazada'. Solo Administrativo/Root (ver
  // IsAdministrativo en el backend, §6.7). Precondición del backend: la
  // solicitud debe estar "Pendiente", si no, responde 400.
  const revisarSolicitud = async (id, accion, motivoRechazo = '') => {
    if (!puedeGestionar.value) return false;
    revisando.value = true;
    revisarError.value = '';
    try {
      const body = { accion };
      if (accion === 'Rechazada') body.motivo_rechazo = motivoRechazo || '';
      const { data } = await apiClient.post(`/solicitudes/${id}/revisar/`, body);
      // Actualiza la caché de detalle con la respuesta (SolicitudDetailSerializer)
      // para reflejar el nuevo estatus al instante en el modal abierto.
      detalleCache.value = { ...detalleCache.value, [id]: data };
      // Refresca el listado para sincronizar el badge/estado en la tarjeta.
      await cargarSolicitudes();
      return true;
    } catch (e) {
      revisarError.value =
        e?.response?.data?.message || 'No se pudo procesar la revisión.';
      return false;
    } finally {
      revisando.value = false;
    }
  };

  let searchTimeout = null;
  watch(search, () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      page.value = 1;
      cargarSolicitudes();
    }, 400);
  });

  watch([estadoFiltro, nivelFiltro, especieFiltro, soloMisReportes], () => {
    page.value = 1;
    cargarSolicitudes();
  });

  const irAPagina = (p) => {
    if (p < 1 || p > totalPages.value || p === page.value) return;
    page.value = p;
    cargarSolicitudes();
  };

  const limpiarFiltros = () => {
    search.value = '';
    estadoFiltro.value = '';
    nivelFiltro.value = '';
    especieFiltro.value = '';
    soloMisReportes.value = false;
    page.value = 1;
    cargarSolicitudes();
  };

  // Helpers para clases dinámicas según estado/nivel (idénticos a los que ya tenías)
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
    await cargarReferencias();
    await cargarSolicitudes();
  });

  return {
    reportes,
    loading,
    error,
    // Paginación
    page,
    totalPages,
    pageNumbers,
    paginationLabel,
    usaFiltroLocal,
    irAPagina,
    // Filtros
    search,
    estadoFiltro,
    nivelFiltro,
    especieFiltro,
    especiesDisponibles,
    soloMisReportes,
    limpiarFiltros,
    // Detalle bajo demanda
    verDetalle,
    // Permisos
    puedeGestionar,
    // Catálogos para formularios
    arbolesOpciones,
    ubicacionesOpciones,
    especiesCatalogo,
    // Crear
    creando,
    crearError,
    crearSolicitud,
    // Eliminar
    eliminandoId,
    eliminarError,
    eliminarSolicitud,
    // Aceptar / rechazar
    revisando,
    revisarError,
    revisarSolicitud,
    // Helpers de estilo
    getCardBorderClass,
    getIconColorClass,
    getBadgeClass,
    getLevelTextClass,
    getActionBadgeClass,
  };
}