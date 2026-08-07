/*
G.E.A. Frontend
Composable: useMapa
Estado y lógica de datos del Mapa (listado de árboles del campus,
selección, detalle, estadísticas, filtros).

Conectado a:
  - GET /api/v1/dashboard/mapa-calor/  → lista de árboles con coordenadas + nivel
  - GET /api/v1/dashboard/resumen/     → KPIs para las tarjetas inferiores
  - GET /api/v1/arboles/{id}/          → detalle del árbol seleccionado
  - GET /api/v1/arboles/especies/      → catálogo para filtro de especie
  - GET /api/v1/arboles/ubicaciones/   → catálogo para filtro de zona/área
*/
import { ref, computed, onMounted } from 'vue';
import apiClient from '@src/api/client';

/**
 * Convierte el valor de coordenadas que manda el backend (id_area__coordenadas
 * o coordenadas de /arboles/{id}/) a un par [lat, lng] utilizable por Leaflet.
 *
 * Soporta varios formatos comunes para no depender de un único formato exacto:
 *   - "20.00901, -99.34501"        (string "lat,lng")
 *   - [20.00901, -99.34501]        (arreglo [lat, lng])
 *   - { lat: 20.00901, lng: -99.34501 } / { lat, lon }
 *   - "POINT(-99.34501 20.00901)"  (WKT, formato lng lat)
 *
 * Si el backend usa otro formato, ajusta esta función; es el único lugar
 * que necesita cambiar para que los marcadores del mapa se posicionen bien.
 */
export function parseCoordenadas(valor) {
  if (!valor) return null;

  if (Array.isArray(valor) && valor.length === 2) {
    const [a, b] = valor.map(Number);
    if (!Number.isNaN(a) && !Number.isNaN(b)) return [a, b];
    return null;
  }

  if (typeof valor === 'object') {
    const lat = Number(valor.lat ?? valor.latitude);
    const lng = Number(valor.lng ?? valor.lon ?? valor.longitude);
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) return [lat, lng];
    return null;
  }

  if (typeof valor === 'string') {
    const str = valor.trim();

    const wkt = str.match(/POINT\s*\(\s*(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s*\)/i);
    if (wkt) {
      const lng = Number(wkt[1]);
      const lat = Number(wkt[2]);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) return [lat, lng];
    }

    const partes = str.split(',').map((p) => Number(p.trim()));
    if (partes.length === 2 && partes.every((n) => !Number.isNaN(n))) {
      return [partes[0], partes[1]];
    }
  }

  return null;
}

export function useMapa() {
  const loading = ref(false);
  const error = ref('');

  // Datos crudos del mapa de calor (todos los árboles con coordenadas)
  const arbolesRaw = ref([]);

  // Catálogos para filtros
  const especiesCatalogo = ref([]); // [{ id, nombre, nombre_cientifico }]
  const ubicacionesCatalogo = ref([]); // [{ id, nombre, coordenadas }]

  // Filtros
  const searchQuery = ref('');
  const filtroEspecie = ref('');
  const filtroNivel = ref(''); // '', 'sano', 'ligera', 'severa'
  const filtroEstado = ref(''); // '', 'Sano', 'Infestado', 'Limpieza', 'Saneado'

  // Detalle del árbol seleccionado (respuesta completa de /arboles/{id}/)
  const arbolSeleccionado = ref(null);
  const detalleLoading = ref(false);

  // Estadísticas del dashboard
  const estadisticas = ref({
    arbolesRegistrados: 0,
    reportesNuevos: 0,
    nivelesSeveros: 0,
    kgRecolectados: '0.0',
    usuariosActivos: 0,
  });

  // --- Filtrado de árboles (client-side sobre los datos del mapa-calor) ---
  const arbolesFiltrados = computed(() => {
    let lista = arbolesRaw.value;

    if (searchQuery.value) {
      const q = searchQuery.value.trim().toLowerCase();
      lista = lista.filter(
        (a) =>
          a.etiqueta?.toLowerCase().includes(q) ||
          a.especie__nombre?.toLowerCase().includes(q) ||
          a.id_area__coordenadas?.toLowerCase().includes(q)
      );
    }

    if (filtroEspecie.value) {
      lista = lista.filter((a) => a.especie__nombre === filtroEspecie.value);
    }

    if (filtroNivel.value) {
      if (filtroNivel.value === 'sano') {
        lista = lista.filter((a) => a.nivel_infestacion === 0);
      } else if (filtroNivel.value === 'ligera') {
        lista = lista.filter((a) => a.nivel_infestacion > 0 && a.nivel_infestacion < 7.5);
      } else if (filtroNivel.value === 'severa') {
        lista = lista.filter((a) => a.nivel_infestacion >= 7.5);
      }
    }

    if (filtroEstado.value) {
      lista = lista.filter((a) => a.estado === filtroEstado.value);
    }

    return lista;
  });

  // Nombres de especie únicos para el filtro
  const especiesUnicas = computed(() => {
    const nombres = new Set(arbolesRaw.value.map((a) => a.especie__nombre).filter(Boolean));
    return Array.from(nombres).sort();
  });

  // --- Helpers de severidad ---
  const getNivelLabel = (nivel) => {
    if (nivel === 0) return 'No visible';
    if (nivel < 3.5) return 'Ligera';
    if (nivel < 7.5) return 'Moderada';
    return 'Severa';
  };

  const getNivelColorClass = (nivel) => {
    if (nivel >= 7.5) return 'text-red';
    if (nivel > 0) return 'text-yellow';
    return 'text-green';
  };

  const getEstadoBadgeClass = (estado) => {
    if (estado === 'Sano') return 'badge-green';
    if (estado === 'Infestado') return 'badge-red';
    if (estado === 'Limpieza') return 'badge-blue';
    if (estado === 'Saneado') return 'badge-gray';
    return 'badge-gray';
  };

  // --- Seleccionar un árbol del listado ---
  const seleccionarArbol = async (arbolMapa) => {
    // arbolMapa viene del mapa de calor, solo tiene etiqueta + nivel + estado + especie + coordenadas de área.
    // Para obtener el detalle completo necesitamos buscar por etiqueta en /arboles/
    detalleLoading.value = true;
    try {
      const { data } = await apiClient.get('/arboles/', {
        params: { search: arbolMapa.etiqueta, page_size: 1 },
      });
      const resultados = data.results ?? data;
      if (resultados.length > 0) {
        const arbolId = resultados[0].id;
        const { data: detalle } = await apiClient.get(`/arboles/${arbolId}/`);
        const nivelNum = detalle.nivel_infestacion ?? 0;
        // Hawksworth components from backend (computed from latest report)
        const h1 = detalle.hawksworth1 ?? null;
        const h2 = detalle.hawksworth2 ?? null;
        const h3 = detalle.hawksworth3 ?? null;
        arbolSeleccionado.value = {
          id: detalle.etiqueta || detalle.id,
          etiqueta: detalle.etiqueta,
          especie_comun: detalle.especie_detail?.nombre || arbolMapa.especie__nombre || '—',
          especie_cientifica: detalle.especie_detail?.nombre_cientifico || '',
          nivel_infestacion: `${nivelNum} (${getNivelLabel(nivelNum)})`,
          nivel_num: nivelNum,
          nivel_label: getNivelLabel(nivelNum),
          hawksworth: [h1, h2, h3],
          estado: detalle.estado,
          ultimo_reporte: detalle.fecha_reporte || '—',
          fecha_registro: detalle.created_at ? new Date(detalle.created_at).toLocaleDateString('es-MX') : '—',
          registrado_por: detalle.registrado_por || '—',
          veces_reportado: detalle.veces_reportado ?? 0,
          prioridad: detalle.prioridad || '—',
          observaciones: detalle.observaciones || 'Sin observaciones',
          ubicacion: detalle.ubicacion_detail?.nombre || '—',
          coordenadas: detalle.coordenadas || arbolMapa.id_area__coordenadas || '—',
          nativa: detalle.especie_detail?.nativa || false,
          imagenes: [detalle.imagen1, detalle.imagen2, detalle.imagen3, detalle.imagen4].filter(Boolean),
          uuid: detalle.id,
          reportes: detalle.reportes || [],
        };
      } else {
        // Si no se encuentra por búsqueda, usar datos del mapa
        const nivelNum = arbolMapa.nivel_infestacion ?? 0;
        arbolSeleccionado.value = {
          id: arbolMapa.etiqueta,
          etiqueta: arbolMapa.etiqueta,
          especie_comun: arbolMapa.especie__nombre || '—',
          especie_cientifica: '',
          nivel_infestacion: `${nivelNum} (${getNivelLabel(nivelNum)})`,
          nivel_num: nivelNum,
          nivel_label: getNivelLabel(nivelNum),
          hawksworth: [null, null, null],
          estado: arbolMapa.estado,
          ultimo_reporte: '—',
          fecha_registro: '—',
          registrado_por: '—',
          veces_reportado: 0,
          prioridad: '—',
          observaciones: 'Sin observaciones',
          ubicacion: '—',
          coordenadas: arbolMapa.id_area__coordenadas || '—',
          nativa: false,
          imagenes: [],
          uuid: null,
          reportes: [],
        };
      }
    } catch (e) {
      console.error('Error al cargar detalle del árbol:', e);
    } finally {
      detalleLoading.value = false;
    }
  };

  const deseleccionarArbol = () => {
    arbolSeleccionado.value = null;
  };

  // --- Limpiar filtros ---
  const limpiarFiltros = () => {
    searchQuery.value = '';
    filtroEspecie.value = '';
    filtroNivel.value = '';
    filtroEstado.value = '';
  };

  // --- Carga de datos ---
  const cargarDatos = async () => {
    loading.value = true;
    error.value = '';
    try {
      const [resMapa, resResumen, resEspecies, resUbicaciones] = await Promise.all([
        apiClient.get('/dashboard/mapa-calor/'),
        apiClient.get('/dashboard/resumen/'),
        apiClient.get('/arboles/especies/', { params: { page_size: 100 } }),
        apiClient.get('/arboles/ubicaciones/', { params: { page_size: 100 } }),
      ]);

      arbolesRaw.value = resMapa.data;

      const resumen = resResumen.data;
      estadisticas.value = {
        arbolesRegistrados: resumen.arboles?.total ?? 0,
        reportesNuevos: resumen.reportes?.total ?? 0,
        nivelesSeveros: resumen.arboles?.infestados ?? 0,
        kgRecolectados: Number(resumen.kg_recolectados ?? 0).toFixed(1),
        usuariosActivos: resumen.estudiantes_activos ?? 0,
      };

      especiesCatalogo.value = (resEspecies.data.results ?? resEspecies.data).map((e) => ({
        id: e.id,
        nombre: e.nombre,
        nombre_cientifico: e.nombre_cientifico,
      }));

      ubicacionesCatalogo.value = (resUbicaciones.data.results ?? resUbicaciones.data).map((u) => ({
        id: u.id,
        nombre: u.nombre,
        coordenadas: u.coordenadas,
      }));

      // No seleccionar ningún árbol automáticamente al cargar el mapa.
      // El panel derecho solo debe abrirse cuando el usuario selecciona un marcador.
    } catch (e) {
      error.value = e?.response?.data?.message || 'No se pudo cargar el mapa.';
    } finally {
      loading.value = false;
    }
  };

  onMounted(cargarDatos);

  return {
    loading,
    error,
    arbolesRaw,
    arbolesFiltrados,
    arbolSeleccionado,
    detalleLoading,
    estadisticas,
    especiesUnicas,
    especiesCatalogo,
    ubicacionesCatalogo,

    searchQuery,
    filtroEspecie,
    filtroNivel,
    filtroEstado,

    getNivelLabel,
    getNivelColorClass,
    getEstadoBadgeClass,
    parseCoordenadas,

    seleccionarArbol,
    deseleccionarArbol,
    limpiarFiltros,
    refrescar: cargarDatos,
  };
}