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

        <!-- Resumen y Gráfica de Líneas -->
        <div class="dashboard-row">
          <!-- Resumen General -->
          <div class="panel flex-6">
            <div class="panel-header">
              <h3>Resumen general <span class="subtitle">(Esta semana)</span></h3>
            </div>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon bg-green">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22v-8"/><path d="M12 14A6 6 0 1 0 6 8c0 3.31 2.69 6 6 6z"/></svg>
                </div>
                <p class="stat-label">Árboles-reportes registrados</p>
                <h4 class="stat-value">{{ resumen.arbolesRegistrados || 128 }}</h4>
                <p class="stat-trend text-green">↑ 18 vs semana anterior</p>
              </div>
              <div class="stat-card">
                <div class="stat-icon bg-red">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <p class="stat-label">Niveles severos (7.5)</p>
                <h4 class="stat-value">{{ resumen.nivelesSeveros || 18 }}</h4>
                <p class="stat-trend text-red">↑ 5 vs semana anterior</p>
              </div>
              <div class="stat-card">
                <div class="stat-icon bg-purple">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                </div>
                <p class="stat-label">Kg recolectados</p>
                <h4 class="stat-value">{{ resumen.kgRecolectados || '256.8' }} kg</h4>
                <p class="stat-trend text-green">↑ 42.3 kg vs semana anterior</p>
              </div>
              <div class="stat-card">
                <div class="stat-icon bg-orange">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <p class="stat-label">Estudiantes activos</p>
                <h4 class="stat-value">{{ resumen.estudiantesActivos || 42 }}</h4>
                <p class="stat-trend text-green">↑ 6 vs semana anterior</p>
              </div>
            </div>
          </div>

          <!-- Evolución de reportes -->
          <div class="panel flex-4">
            <div class="panel-header space-between">
              <h3>Evolución de reportes</h3>
              <select class="custom-select">
                <option>Últimas 4 semanas</option>
              </select>
            </div>
            <div class="chart-container line-chart-placeholder">
              <p class="placeholder-text">[ Espacio para Gráfica de Líneas ]</p>
            </div>
          </div>
        </div>

        <!-- Infestación y Top Especies -->
        <div class="dashboard-row">
          <!-- Niveles de infestación -->
          <div class="panel flex-5">
            <div class="panel-header">
              <h3>Árboles por nivel de infestación <span class="subtitle">(Hawksworth)</span></h3>
            </div>
            <div class="infestation-content">
              <div class="donut-chart">
                <div class="donut-hole">
                  <span class="donut-label">Total</span>
                  <span class="donut-value">128</span>
                </div>
              </div>
              <div class="infestation-legend">
                <ul>
                  <li><span class="dot color-green"></span> 0 - No visible <strong>45</strong> <small>(35.2%)</small></li>
                  <li><span class="dot color-yellow"></span> 3.5 - Ligera <strong>48</strong> <small>(37.5%)</small></li>
                  <li><span class="dot color-red"></span> 7.5 - Severa <strong>35</strong> <small>(27.3%)</small></li>
                  <li><span class="dot color-purple"></span> En revisión <strong>20</strong> <small>(15.6%)</small></li>
                </ul>
              </div>
              <div class="infestation-index">
                <h4>Índice de afectación</h4>
                <h2 class="text-green">42%</h2>
                <span class="badge bg-light-yellow text-yellow">● Nivel moderado</span>
                <p>Basado en el promedio ponderado de infestación</p>
              </div>
            </div>
          </div>

          <!-- Top Especies -->
          <div class="panel flex-5">
            <div class="panel-header">
              <h3>Especies más afectadas <span class="subtitle">(Top 5)</span></h3>
            </div>
            <table class="data-table">
              <thead>
              <tr>
                <th>Especie</th>
                <th>Árboles</th>
                <th>% Severos</th>
                <th>Tendencia</th>
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
                    <span :class="['trend-badge', item.tendencia > 0 ? 'bg-light-red text-red' : 'bg-light-green text-green']">
                      {{ item.tendencia > 0 ? '↑' : '↓' }} {{ Math.abs(item.tendencia) }}%
                    </span>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Mapa de Calor y Reportes -->
        <div class="dashboard-row">
          <!-- Mapa de calor -->
          <div class="panel flex-4 map-panel">
            <div class="panel-header">
              <h3>Mapa de calor de infestación</h3>
            </div>
            <div class="map-placeholder">
              <button class="btn-expand">Ver mapa completo ↗</button>
            </div>
          </div>

          <!-- Reportes recientes -->
          <div class="panel flex-6">
            <div class="panel-header">
              <h3>Reportes recientes</h3>
            </div>
            <table class="data-table">
              <thead>
              <tr>
                <th>ID</th>
                <th>Especie</th>
                <th>Nivel</th>
                <th>Ubicación</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="reporte in reportesRecientes" :key="reporte.id">
                <td>{{ reporte.id }}</td>
                <td>{{ reporte.especie }}</td>
                <td>
                  <span :class="getLevelColor(reporte.nivelNum)">{{ reporte.nivel }}</span>
                </td>
                <td>{{ reporte.ubicacion }}</td>
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
            <span>Última actualización: 06/07/2026 11:11 a.m.</span>
            <button class="btn-refresh"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg></button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { useDashboard } from '@src/composables/useDashboard';

const {
  resumen,
  loading,
  error,
  topEspecies,
  reportesRecientes,
  getLevelColor,
  getStatusClass,
} = useDashboard();
</script>

<style src="@src/assets/styles/dashboard_view.css" scoped></style>
