<!--
G.E.A. Frontend
Layout de escritorio de Árboles. Se monta únicamente cuando el ancho
de pantalla está en o sobre el breakpoint (ver ArbolesView.vue) — el
layout móvil ni siquiera se instancia cuando este componente está
activo.
 -->

<template>
  <div class="arboles-main">
    <div class="arboles-desktop">
      <!-- Barra superior de búsqueda y filtros -->
      <div class="toolbar">
        <div class="search-group">
          <div class="search-box">
            <svg viewBox="0 0 24 24" class="icon-search" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Buscar árbol, especie o ubicación..." />
          </div>
          <button class="btn-search">
            <svg viewBox="0 0 24 24" class="icon-sm" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Buscar
          </button>
        </div>

        <div class="filters-group">
          <div class="select-wrapper">
            <label>Especie</label>
            <select><option>Todas</option></select>
          </div>
          <div class="select-wrapper">
            <label>Nivel de infestación</label>
            <select><option>Todos</option></select>
          </div>
          <div class="select-wrapper">
            <label>Estado</label>
            <select><option>Todos</option></select>
          </div>
          <button class="btn-outline btn-filter">
            <svg viewBox="0 0 24 24" class="icon-sm" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Filtros
          </button>
        </div>
      </div>

      <!-- Resumen de totales -->
      <div class="summary-bar">
        <p>Total: 128 árboles registrados</p>
      </div>

      <!-- Estados de carga y error -->
      <div v-if="loading" class="state-msg">Cargando árboles...</div>
      <div v-else-if="error" class="state-msg error-msg">{{ error }}</div>

      <!-- Tabla Principal -->
      <div v-else class="table-container">
        <table class="data-table">
          <thead>
          <tr>
            <th>ID del árbol</th>
            <th>Especie</th>
            <th>Ubicación</th>
            <th class="text-center">Nivel de infestación</th>
            <th class="text-center">Estado</th>
            <th>Último reporte</th>
            <th class="text-center">Acciones</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in arboles" :key="item.id">

            <!--ID e Ícono -->
            <td>
              <div class="id-cell">
                <div class="severity-icon" :class="getSeverityColorClass(item.nivelNum, item.estadoInfestacion)">
                  <svg v-if="item.nivelNum >= 7.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                  <svg v-else-if="item.estadoInfestacion === 'En revisión'" viewBox="0 0 24 24" fill="currentColor"><path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                  <svg v-else-if="item.nivelNum === 0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  <svg v-else viewBox="0 0 24 24" fill="currentColor"><path d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.48 2.54l2.6 1.53c.56-1.24.88-2.62.88-4.07 0-5.18-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-5.06.5-9 4.76-9 9.95 0 5.52 4.47 10 9.99 10 3.31 0 6.24-1.61 8.06-4.09l-2.6-1.53C16.17 17.98 14.21 19 12 19z"/></svg>
                </div>
                <span class="font-semibold">{{ item.id }}</span>
                <span class="status-dot" :class="getSeverityBgClass(item.nivelNum, item.estadoInfestacion)"></span>
              </div>
            </td>

            <!-- especie -->
            <td>
              <div class="double-text">
                <span class="primary-text">{{ item.especie_comun }}</span>
                <span class="secondary-text">({{ item.especie_cientifica }})</span>
              </div>
            </td>

            <!-- Ubicación -->
            <td>
              <div class="double-text">
                <span class="primary-text">{{ item.ubicacion }}</span>
                <span class="secondary-text">{{ item.coordenadas }}</span>
              </div>
            </td>

            <!-- nivel de Infestación -->
            <td class="text-center">
              <div class="infestation-cell">
                  <span class="infestation-badge" :class="getInfestationBadgeClass(item.nivelNum, item.estadoInfestacion)">
                    {{ item.nivelTexto }}
                  </span>
                <span class="secondary-text">{{ item.estadoInfestacion }}</span>
              </div>
            </td>

            <!-- Estado -->
            <td class="text-center">
                <span class="status-pill" :class="getStatusBadgeClass(item.estado)">
                  {{ item.estado }}
                </span>
            </td>

            <!-- Último reporte -->
            <td>
              <div class="double-text">
                <span class="primary-text">{{ item.fechaReporte }}</span>
                <span class="secondary-text" v-if="item.horaReporte">{{ item.horaReporte }}</span>
              </div>
            </td>

            <!-- Acciones -->
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

      <!-- Paginación -->
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
          <span class="pagination-info">Mostrando 1 a 10 de 128 árboles</span>
          <div class="pagination-controls">
            <button class="page-arrow">&lt;</button>
            <button class="page-num active">1</button>
            <button class="page-num">2</button>
            <button class="page-num">3</button>
            <button class="page-num">4</button>
            <button class="page-num">5</button>
            <span class="page-dots">...</span>
            <button class="page-num">13</button>
            <button class="page-arrow">&gt;</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { useArboles } from '@src/composables/useArboles';

const {
  loading,
  error,
  arboles,
  getSeverityColorClass,
  getSeverityBgClass,
  getInfestationBadgeClass,
  getStatusBadgeClass,
} = useArboles();
</script>

<style src="@src/assets/styles/arboles_view.css" scoped></style>
