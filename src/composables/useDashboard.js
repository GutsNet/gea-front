/*
G.E.A. Frontend
Composable: useDashboard
Estado y lógica de datos del Dashboard (resumen, infestación, top
especies, reportes recientes, helpers de color/estado). Lo usan
DashboardDesktopView.vue y DashboardMobileView.vue — solo una de las
dos está montada a la vez (ver DashboardView.vue), así que no hay
riesgo de disparar la llamada a la API dos veces al mismo tiempo.
*/
import { ref, onMounted, computed } from 'vue';
import apiClient from '../api/client';

export function useDashboard() {
  const resumenRaw = ref(null);
  const arbolesMapa = ref([]); // GET /dashboard/mapa-calor/
  const evolucionReportes = ref([]); // GET /dashboard/evolucion-reportes/
  const topEspecies = ref([]);
  const reportesRecientes = ref([]);
  const loading = ref(false);
  const error = ref('');
  const lastUpdated = ref(null);

  // --- Mapea el resumen del backend a lo que pinta la vista ---
  const resumen = computed(() => {
    if (!resumenRaw.value) {
      return {
        arbolesRegistrados: 0,
        nivelesSeveros: 0,
        kgRecolectados: '0.0',
        estudiantesActivos: 0,
        validados: 0,
        rechazados: 0,
      };
    }
    return {
      arbolesRegistrados: resumenRaw.value.reportes?.total ?? 0,
      nivelesSeveros: infestacion.value.severa.count,
      kgRecolectados: Number(resumenRaw.value.kg_recolectados ?? 0).toFixed(1),
      estudiantesActivos: resumenRaw.value.estudiantes_activos ?? 0,
      // Datos reales disponibles para reemplazar las flechas de tendencia
      // inventadas: el backend no tiene comparación semana-contra-semana,
      // así que usamos composición real en vez de deltas falsos.
      validados: resumenRaw.value.reportes?.validados ?? 0,
      rechazados: resumenRaw.value.reportes?.rechazados ?? 0,
    };
  });

  // --- Desglose para el donut (calculado desde mapa-calor) ---
  const infestacion = computed(() => {
    const total = arbolesMapa.value.length;
    const noVisible = arbolesMapa.value.filter((a) => a.nivel_infestacion === 0).length;
    const ligera = arbolesMapa.value.filter(
      (a) => a.nivel_infestacion > 0 && a.nivel_infestacion < 7.5
    ).length;
    const severa = arbolesMapa.value.filter((a) => a.nivel_infestacion >= 7.5).length;
    // No hay un estatus "en revisión" a nivel árbol; usamos "Limpieza"
    // (árboles bajo tratamiento activo) como aproximación. Ajusta si tu
    // definición de negocio es otra.
    const enRevision = arbolesMapa.value.filter((a) => a.estado === 'Limpieza').length;

    const pct = (n) => (total ? Number(((n / total) * 100).toFixed(1)) : 0);

    return {
      total,
      noVisible: { count: noVisible, pct: pct(noVisible) },
      ligera: { count: ligera, pct: pct(ligera) },
      severa: { count: severa, pct: pct(severa) },
      enRevision: { count: enRevision, pct: pct(enRevision) },
    };
  });

  // --- Datos para el donut de ApexCharts (mismos números que la leyenda) ---
  const donutChart = computed(() => ({
    labels: ['No visible', 'Ligera', 'Severa', 'En revisión'],
    series: [
      infestacion.value.noVisible.count,
      infestacion.value.ligera.count,
      infestacion.value.severa.count,
      infestacion.value.enRevision.count,
    ],
    colors: ['#22c55e', '#eab308', '#ef4444', '#a855f7'],
  }));

  // --- Índice de afectación: promedio de nivel_infestacion normalizado a % ---
  const indiceAfectacion = computed(() => {
    if (!arbolesMapa.value.length) {
      return { pct: 0, label: 'Sin datos', colorClass: 'text-green', badgeClass: 'bg-light-green text-green' };
    }
    const promedio =
      arbolesMapa.value.reduce((sum, a) => sum + a.nivel_infestacion, 0) /
      arbolesMapa.value.length;
    const pct = Math.round((promedio / 7.5) * 100);

    let label = 'Nivel bajo';
    let colorClass = 'text-green';
    let badgeClass = 'bg-light-green text-green';
    if (pct >= 60) {
      label = 'Nivel alto';
      colorClass = 'text-red';
      badgeClass = 'bg-light-red text-red';
    } else if (pct >= 30) {
      label = 'Nivel moderado';
      colorClass = 'text-yellow';
      badgeClass = 'bg-light-yellow text-yellow';
    }

    return { pct, label, colorClass, badgeClass };
  });

  // --- Serie para la gráfica de líneas (ApexCharts) ---
  // El backend agrupa por mes (TruncMonth), no por semana; el selector de
  // rango de la vista filtra client-side sobre estos meses ya cargados.
  const evolucionChart = computed(() => {
    const categorias = evolucionReportes.value.map((item) =>
      new Intl.DateTimeFormat('es-MX', { month: 'short', year: '2-digit' }).format(
        new Date(item.mes)
      )
    );

    return {
      categorias,
      series: [
        { name: 'Validados', data: evolucionReportes.value.map((i) => i.validados) },
        { name: 'Rechazados', data: evolucionReportes.value.map((i) => i.rechazados) },
        { name: 'Total', data: evolucionReportes.value.map((i) => i.total) },
      ],
    };
  });

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

  const formatFecha = (isoString) =>
    new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(isoString));

  const cargarDashboard = async () => {
    loading.value = true;
    error.value = '';
    try {
      const [resResumen, resMapa, resEvolucion, resEspecies, resReportes] = await Promise.all([
        apiClient.get('/dashboard/resumen/'),
        apiClient.get('/dashboard/mapa-calor/'),
        apiClient.get('/dashboard/evolucion-reportes/'),
        apiClient.get('/dashboard/especies-afectadas/'),
        apiClient.get('/reportes/', { params: { ordering: '-hora', page_size: 5 } }),
      ]);

      resumenRaw.value = resResumen.data;
      arbolesMapa.value = resMapa.data;
      evolucionReportes.value = resEvolucion.data;

      topEspecies.value = resEspecies.data.map((e) => ({
        nombre: `${e.nombre} (${e.nombre_cientifico})`,
        arboles: e.total_arboles,
        severos: e.total_arboles
          ? Number(((e.arboles_infestados / e.total_arboles) * 100).toFixed(1))
          : 0,
        // El backend SÍ expone nivel_promedio (Avg de nivel_infestacion
        // por especie) en /dashboard/especies-afectadas/; lo usamos en
        // vez de una "tendencia" que no existe como dato real.
        nivelPromedio: Number(e.nivel_promedio ?? 0).toFixed(1),
      }));

      reportesRecientes.value = resReportes.data.results.map((r) => ({
        id: r.id,
        etiqueta: r.arbol_etiqueta ?? '—',
        especie: r.especie ?? 'Desconocida',
        nivel: `${r.nivel_infestacion} (${
          r.nivel_infestacion >= 7.5 ? 'Severo' : r.nivel_infestacion >= 2.5 ? 'Moderado' :  r.nivel_infestacion > 0 ? 'Ligera' : 'No visible'
        })`,
        nivelNum: r.nivel_infestacion,
        // No es una ubicación real (el serializer no la incluye);
        // es la matrícula de quien generó el reporte.
        responsable: r.responsable_matricula || '—',
        fecha: formatFecha(r.hora),
        estado: r.status_reporte,
      }));

      lastUpdated.value = new Date();
    } catch (e) {
      error.value = e?.response?.data?.message || 'No se pudo cargar el dashboard.';
    } finally {
      loading.value = false;
    }
  };

  onMounted(cargarDashboard);

  return {
    resumen,
    infestacion,
    indiceAfectacion,
    donutChart,
    evolucionChart,
    loading,
    error,
    topEspecies,
    reportesRecientes,
    lastUpdated,
    getLevelColor,
    getStatusClass,
    refrescar: cargarDashboard,
  };
}