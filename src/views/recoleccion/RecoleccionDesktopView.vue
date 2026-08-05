<!--
G.E.A. Frontend
Layout de escritorio de Recolección.
-->

<template>
  <div class="recoleccion-main">
    <div class="recoleccion-desktop">
      <!-- ================= TARJETAS ESTADÍSTICAS ================= -->
      <div class="stats-grid">
        <div class="stat-card bg-light-green-card">
          <div class="stat-icon-wrapper bg-icon-green text-green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </div>
          <div class="stat-content">
            <p class="stat-label">Kg totales recolectados</p>
            <h3 class="stat-value">{{ totalKg.toFixed(1) }} kg</h3>
            <p class="stat-trend text-green">+ 42.3 kg vs mes anterior ↗</p>
          </div>
        </div>

        <div class="stat-card bg-light-blue-card">
          <div class="stat-icon-wrapper bg-icon-blue text-blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div class="stat-content">
            <p class="stat-label">Recolecciones realizadas</p>
            <h3 class="stat-value">{{ totalRecolecciones }}</h3>
            <p class="stat-trend text-green">+ 5 vs mes anterior ↗</p>
          </div>
        </div>

        <div class="stat-card bg-light-purple-card">
          <div class="stat-icon-wrapper bg-icon-purple text-purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
          </div>
          <div class="stat-content">
            <p class="stat-label">Árboles procesados</p>
            <h3 class="stat-value">{{ arbolesProcesados }}</h3>
            <p class="stat-trend text-green">+ 4 vs mes anterior ↗</p>
          </div>
        </div>

        <div class="stat-card bg-light-orange-card">
          <div class="stat-icon-wrapper bg-icon-orange text-orange">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10z"/></svg>
          </div>
          <div class="stat-content">
            <p class="stat-label">Promedio por recolección</p>
            <h3 class="stat-value">{{ promedioKg.toFixed(1) }} kg</h3>
            <p class="stat-trend text-green">+ 1.2 kg vs mes anterior ↗</p>
          </div>
        </div>
      </div>

      <!-- ================= BARRA DE BÚSQUEDA Y FILTROS ================= -->
      <div class="toolbar">
        <div class="search-group">
          <div class="search-box">
            <svg viewBox="0 0 24 24" class="icon-search" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Buscar por fecha, ubicación o responsable..." />
          </div>
          <button class="btn-search">
            <svg viewBox="0 0 24 24" class="icon-sm" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Buscar
          </button>
        </div>

        <div class="filters-group">
          <div class="input-wrapper">
            <label>Rango de fechas</label>
            <div class="date-input-container">
              <input type="text" value="01 Jun 2026 - 06 Jul 2026" readonly />
              <svg viewBox="0 0 24 24" class="icon-calendar" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
          </div>
          <div class="select-wrapper">
            <label>Ubicación</label>
            <select><option>Todas</option></select>
          </div>
          <div class="select-wrapper">
            <label>Responsable</label>
            <select><option>Todos</option></select>
          </div>
          <button class="btn-outline btn-filter">
            <svg viewBox="0 0 24 24" class="icon-sm" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Filtros
          </button>
        </div>
      </div>

      <!-- ================= BARRA DE ACCIÓN SECUNDARIA ================= -->
      <div class="action-bar">
        <p class="summary-text">Total: {{ totalRecolecciones }} recolecciones</p>
        <button class="btn-primary">
          + Nueva recolección
        </button>
      </div>

      <!-- Estados de carga y error -->
      <div v-if="loading" class="state-msg">Cargando recolecciones...</div>
      <div v-else-if="error" class="state-msg error-msg">{{ error }}</div>

      <!-- ================= TABLA PRINCIPAL ================= -->
      <div v-else class="table-container">
        <table class="data-table">
          <thead>
          <tr>
            <th>Fecha y hora</th>
            <th>Ubicación</th>
            <th class="text-center">Kg recolectados</th>
            <th>Responsable</th>
            <th>Última actualización</th>
            <th class="text-center">Acciones</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(item, index) in recolecciones" :key="index">
            <td>
              <div class="double-text">
                <span class="primary-text">{{ item.fecha }}</span>
                <span class="secondary-text">{{ item.hora }}</span>
              </div>
            </td>
            <td>
              <span class="primary-text">{{ item.ubicacion }}</span>
            </td>
            <td class="text-center">
              <span class="text-green font-bold text-lg">{{ item.kg.toFixed(1) }} kg</span>
            </td>
            <td>
              <span class="primary-text">{{ item.responsable }}</span>
            </td>
            <td>
              <div class="double-text">
                <span class="primary-text">{{ item.updatedFecha }}</span>
                <span class="secondary-text">{{ item.updatedHora }}</span>
              </div>
            </td>
            <td>
              <div class="actions-cell">
                <button class="btn-icon" aria-label="Ver detalles">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button class="btn-icon" aria-label="Más opciones">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                </button>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- ================= PAGINACIÓN ================= -->
      <div class="pagination-footer">
        <div class="per-page">
          <span>Mostrar</span>
          <select class="select-sm">
            <option>10</option>
            <option>20</option>
            <option>50</option>
          </select>
          <span>por página</span>
        </div>
        <div class="pagination-right">
          <span class="pagination-info">Mostrando 1 a 10 de {{ totalRecolecciones }} recolecciones</span>
          <div class="pagination-controls">
            <button class="page-arrow">&lt;</button>
            <button class="page-num active">1</button>
            <button class="page-num">2</button>
            <button class="page-num">3</button>
            <button class="page-num">4</button>
            <button class="page-arrow">&gt;</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRecoleccion } from '@src/composables/useRecoleccion';

const {
  loading,
  error,
  recolecciones,
  totalKg,
  totalRecolecciones,
  arbolesProcesados,
  promedioKg,
} = useRecoleccion();
</script>

<style src="@src/assets/styles/recoleccion_view.css" scoped></style>