<!--
G.E.A. Frontend
Layout de escritorio del Dashboard. Se monta únicamente cuando el
ancho de pantalla está en o sobre el breakpoint (ver DashboardView.vue)
— el layout móvil ni siquiera se instancia cuando este componente está
activo.
 -->

<template>
  <div class="dashboard-main">
    <div class="dashboard-desktop">
      <!-- Estado de Carga / Error -->
      <div v-if="loading" class="loading-state">Cargando dashboard...</div>
      <div v-else-if="error" class="error-state">{{ error }}</div>

      <!-- CONTENIDO DEL DASHBOARD DESKTOP LAYOUT -->
      <div v-else class="dashboard-content">

        <!-- Resumen general: fila propia a ancho completo, como panel de KPIs -->
        <div class="dashboard-row">
          <div class="panel flex-full">
            <div class="panel-header">
              <h3>Resumen general <span class="subtitle">(Totales del sistema)</span></h3>
            </div>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon bg-green">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22v-8"/><path d="M12 14A6 6 0 1 0 6 8c0 3.31 2.69 6 6 6z"/></svg>
                </div>
                <p class="stat-label">Reportes registrados</p>
                <h4 class="stat-value">{{ resumen.arbolesRegistrados }}</h4>
                <p class="stat-trend text-green">
                  {{ resumen.validados }} validados · {{ resumen.rechazados }} rechazados
                </p>
              </div>
              <div class="stat-card">
                <div class="stat-icon bg-red">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <p class="stat-label">Niveles severos (7.5)</p>
                <h4 class="stat-value">{{ resumen.nivelesSeveros }}</h4>
                <p class="stat-trend text-red">{{ infestacion.severa.pct }}% del total de árboles</p>
              </div>
              <div class="stat-card">
                <div class="stat-icon bg-purple">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                </div>
                <p class="stat-label">Kg recolectados</p>
                <h4 class="stat-value">{{ resumen.kgRecolectados }} kg</h4>
                <p class="stat-trend text-green">Total histórico acumulado</p>
              </div>
              <div class="stat-card">
                <div class="stat-icon bg-orange">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <p class="stat-label">Estudiantes activos</p>
                <h4 class="stat-value">{{ resumen.estudiantesActivos }}</h4>
                <p class="stat-trend text-green">Con estatus activo en el sistema</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Evolución de reportes + Infestación -->
        <div class="dashboard-row">
          <!-- Evolución de reportes -->
          <div class="panel flex-7">
            <div class="panel-header space-between">
              <h3>Evolución de reportes</h3>
              <select class="custom-select" v-model="rangoMeses">
                <option :value="3">Últimos 3 meses</option>
                <option :value="6">Últimos 6 meses</option>
                <option :value="999">Todo el historial</option>
              </select>
            </div>
            <div class="chart-container">
              <VueApexCharts
                v-if="chartSeriesVisible.length"
                type="line"
                height="320"
                width="100%"
                :options="chartOptions"
                :series="chartSeriesVisible"
              />
              <p v-else class="placeholder-text">Sin datos suficientes para graficar.</p>
            </div>
          </div>

          <!-- Niveles de infestación -->
          <div class="panel flex-5">
            <div class="panel-header">
              <h3>Árboles por nivel de infestación <span class="subtitle">(Hawksworth)</span></h3>
            </div>
            <div class="infestation-content">
              <div class="donut-chart">
                <VueApexCharts
                  v-if="infestacion.total > 0"
                  type="donut"
                  height="200"
                  :options="donutOptions"
                  :series="donutChart.series"
                />
                <div v-else class="donut-hole">
                  <span class="donut-label">Total</span>
                  <span class="donut-value">0</span>
                </div>
              </div>
              <div class="infestation-legend">
                <ul>
                  <li>
                    <span class="dot color-green"></span> 0 - No visible
                    <strong>{{ infestacion.noVisible.count }}</strong>
                    <small>({{ infestacion.noVisible.pct }}%)</small>
                  </li>
                  <li>
                    <span class="dot color-yellow"></span> 3.5 - Ligera
                    <strong>{{ infestacion.ligera.count }}</strong>
                    <small>({{ infestacion.ligera.pct }}%)</small>
                  </li>
                  <li>
                    <span class="dot color-red"></span> 7.5 - Severa
                    <strong>{{ infestacion.severa.count }}</strong>
                    <small>({{ infestacion.severa.pct }}%)</small>
                  </li>
                  <li>
                    <span class="dot color-purple"></span> En revisión
                    <strong>{{ infestacion.enRevision.count }}</strong>
                    <small>({{ infestacion.enRevision.pct }}%)</small>
                  </li>
                </ul>
              </div>
              <div class="infestation-index">
                <h4>Índice de afectación</h4>
                <h2 :class="indiceAfectacion.colorClass">{{ indiceAfectacion.pct }}%</h2>
                <span :class="['badge', indiceAfectacion.badgeClass]">● {{ indiceAfectacion.label }}</span>
                <p>Basado en el promedio ponderado de infestación</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Mapa de calor + Top Especies -->
        <div class="dashboard-row">
          <!-- Mapa de calor -->
          <div class="panel flex-5 map-panel">
            <div class="panel-header">
              <h3>Mapa de calor de infestación</h3>
            </div>
            <div class="map-placeholder">
              <button class="btn-expand">Ver mapa completo ↗</button>
            </div>
          </div>

          <!-- Top Especies -->
          <div class="panel flex-7">
            <div class="panel-header">
              <h3>Especies más afectadas <span class="subtitle">(Top 5)</span></h3>
            </div>
            <table class="data-table">
              <thead>
              <tr>
                <th>Especie</th>
                <th>Árboles</th>
                <th>% Severos</th>
                <th>Nivel promedio</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(item, index) in topEspecies" :key="index">
                <td class="species-cell">
                  <svg class="leaf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/></svg>
                  {{ item.nombre }}
                </td>
                <td>{{ item.arboles }}</td>
                <td>{{ item.severos }}%</td>
                <td>
                  <span :class="['trend-badge', getLevelColor(item.nivelPromedio)]">
                    {{ item.nivelPromedio }}
                  </span>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Reportes recientes: fila propia a ancho completo para dar aire a las 6 columnas -->
        <div class="dashboard-row">
          <div class="panel flex-full">
            <div class="panel-header">
              <h3>Reportes recientes</h3>
            </div>
            <table class="data-table">
              <thead>
              <tr>
                <th>ID</th>
                <th>Árbol</th>
                <th>Especie</th>
                <th>Nivel</th>
                <th>Responsable</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="reporte in reportesRecientes" :key="reporte.id">
                <td>{{ reporte.id }}</td>
                <td>{{ reporte.etiqueta }}</td>
                <td>{{ reporte.especie }}</td>
                <td>
                  <span :class="getLevelColor(reporte.nivelNum)">{{ reporte.nivel }}</span>
                </td>
                <td>{{ reporte.responsable }}</td>
                <td>{{ reporte.fecha }}</td>
                <td>
                  <span :class="['status-pill', getStatusClass(reporte.estado)]">{{ reporte.estado }}</span>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Footer -->
        <div class="dashboard-footer">
          <div class="footer-left">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <span>Los datos se actualizan automáticamente cada 10 minutos.</span>
          </div>
          <div class="footer-right">
            <span>Última actualización: {{ formatUltimaActualizacion(lastUpdated) }}</span>
            <button class="btn-refresh" @click="refrescar" :disabled="loading" title="Refrescar dashboard">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import { useDashboard } from '@src/composables/useDashboard';

const {
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
  refrescar,
} = useDashboard();

const formatUltimaActualizacion = (fecha) => {
  if (!fecha) return '—';
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(fecha);
};

// El backend agrupa por mes, así que el "rango" filtra client-side
// sobre los meses ya cargados en evolucionChart.
const rangoMeses = ref(6);

const chartCategoriesVisible = computed(() =>
  evolucionChart.value.categorias.slice(-rangoMeses.value)
);

const chartSeriesVisible = computed(() =>
  evolucionChart.value.series.map((serie) => ({
    ...serie,
    data: serie.data.slice(-rangoMeses.value),
  }))
);

const chartOptions = computed(() => ({
  chart: {
    id: 'evolucion-reportes',
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily: 'inherit',
    width: '100%',
  },
  colors: ['#22c55e', '#ef4444', '#6366f1'], // validados / rechazados / total
  stroke: { curve: 'smooth', width: 2.5 },
  dataLabels: { enabled: false },
  grid: { borderColor: '#e5e7eb', strokeDashArray: 4 },
  legend: { position: 'top', horizontalAlign: 'left' },
  xaxis: {
    categories: chartCategoriesVisible.value,
    labels: { style: { fontSize: '12px' } },
  },
  yaxis: {
    labels: { formatter: (val) => Math.round(val) },
  },
  tooltip: { shared: true, intersect: false },
}));

const donutOptions = computed(() => ({
  chart: { id: 'infestacion-donut', fontFamily: 'inherit' },
  labels: donutChart.value.labels,
  colors: donutChart.value.colors,
  legend: { show: false }, // ya tenemos una leyenda propia debajo del donut
  dataLabels: { enabled: false },
  stroke: { width: 2 },
  plotOptions: {
    pie: {
      donut: {
        size: '70%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total',
            formatter: () => infestacion.value.total,
          },
          value: {
            fontSize: '20px',
            fontWeight: 600,
          },
        },
      },
    },
  },
  tooltip: {
    y: { formatter: (val) => `${val} árboles` },
  },
}));
</script>

<style src="@src/assets/styles/dashboard_view.css" scoped></style>