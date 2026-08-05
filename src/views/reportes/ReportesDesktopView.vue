<template>
  <section class="reports-wrapper">

    <!-- Barra superior de acciones y filtros -->
    <div class="toolbar">
      <div class="toolbar-top">
        <button class="btn-primary">
          <svg viewBox="0 0 24 24" class="icon-sm" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nuevo reporte
        </button>
      </div>

      <div class="filters-bar">
        <div class="search-box">
          <svg viewBox="0 0 24 24" class="icon-search" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Buscar reporte" />
        </div>

        <div class="filter-group">
          <div class="select-wrapper">
            <label>Filtrar por especie</label>
            <select><option>Todas</option></select>
          </div>
          <div class="select-wrapper">
            <label>Nivel de Infestación</label>
            <select><option>Todos</option></select>
          </div>
          <div class="select-wrapper">
            <label>Estado</label>
            <select><option>Todos</option></select>
          </div>
          <button class="btn-outline">Limpiar filtros</button>
        </div>
      </div>
    </div>

    <!-- Estados de carga y error -->
    <div v-if="loading" class="state-msg">Cargando reportes...</div>
    <div v-else-if="error" class="state-msg error-msg">{{ error }}</div>

    <!-- Lista de Reportes -->
    <div v-else class="reports-list">
      <div
          v-for="item in reportes"
          :key="item.id"
          class="report-card"
          :class="getCardBorderClass(item.estado)"
      >

        <div class="card-icon" :class="getIconColorClass(item.estado)">
          <svg v-if="item.estado === 'Severo'" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          <svg v-else-if="item.estado === 'Pendiente'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><circle cx="12" cy="12" r="8"/></svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
        </div>

        <!-- Contenido principal  -->
        <div class="card-grid">
          <!-- Info Principal -->
          <div class="grid-col">
            <h3 class="tree-name">{{ item.nombre }}</h3>
            <p class="text-sm text-gray">ID: {{ item.id }}</p>
            <span class="status-badge" :class="getBadgeClass(item.estado)">{{ item.estado }}</span>
          </div>

          <!--  Especie y Ubicación -->
          <div class="grid-col">
            <div class="data-group">
              <label>Especie</label>
              <p class="font-medium">{{ item.especie }}</p>
            </div>
            <div class="data-group">
              <label>Ubicación</label>
              <p>{{ item.ubicacion }}</p>
            </div>
          </div>

          <!-- nfestación y Fecha -->
          <div class="grid-col">
            <div class="data-group">
              <label>Nivel de infestación</label>
              <p :class="getLevelTextClass(item.nivelNum)" class="font-medium">{{ item.nivel_infestacion }}</p>
            </div>
            <div class="data-group">
              <label>Fecha del reporte</label>
              <p>{{ item.fecha }}</p>
            </div>
          </div>

          <!-- Reportador y Coordenadas -->
          <div class="grid-col">
            <div class="data-group">
              <label>Reportado por</label>
              <p class="font-medium">{{ item.reportado_por }}</p>
            </div>
            <div class="data-group">
              <label>Coordenadas</label>
              <p>{{ item.coordenadas }}</p>
            </div>
          </div>
        </div>

        <div class="card-actions">
          <button class="btn-action-primary">Ver detalles</button>
          <button class="btn-action-secondary" :class="getActionBadgeClass(item.action_status)">
            {{ item.action_status }}
          </button>
        </div>
      </div>
    </div>

    <!-- Paginación -->
    <div class="pagination-footer">
      <span class="pagination-info">Mostrando 1 a 3 de 24 reportes</span>
      <div class="pagination-controls">
        <button class="page-arrow">&lt;</button>
        <button class="page-num active">1</button>
        <button class="page-num">2</button>
        <button class="page-num">3</button>
        <button class="page-num">4</button>
        <button class="page-num">5</button>
        <button class="page-arrow">&gt;</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useReportes } from '@src/composables/useReportes';

const { 
    loading,
    error,
    reportes,
    getCardBorderClass,
    getIconColorClass,
    getBadgeClass,
    getLevelTextClass,
    getActionBadgeClass,
 } = useReportes();

</script>

<style src="@src/assets/styles/reportes_view.css" scoped></style>