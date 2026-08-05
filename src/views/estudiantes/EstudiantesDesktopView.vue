<template>
  <section class="students-wrapper">

    <!-- Tarjetas de Estadísticas Top -->
    <div class="stats-grid">
      <!--  Estudiantes activos -->
      <div class="stat-card border-green">
        <div class="stat-icon-wrapper bg-light-green">
          <svg viewBox="0 0 24 24" class="icon-stat text-green" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">Estudiantes activos</p>
          <h3 class="stat-value">42</h3>
          <p class="stat-trend text-green">+ 6 vs mes anterior ↗</p>
        </div>yar
      </div>

      <!-- Kgs recolectados -->
      <div class="stat-card border-purple">
        <div class="stat-icon-wrapper bg-light-purple">
          <svg viewBox="0 0 24 24" class="icon-stat text-purple" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">Kgs recolectados</p>
          <h3 class="stat-value">256.8 kg</h3>
          <p class="stat-trend text-green">+ 32.5 kg vs mes anterior ↗</p>
        </div>
      </div>

      <!-- Grupos -->
      <div class="stat-card border-blue">
        <div class="stat-icon-wrapper bg-light-blue">
          <svg viewBox="0 0 24 24" class="icon-stat text-blue" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">Grupos</p>
          <h3 class="stat-value">18</h3>
          <p class="stat-trend text-green">+ 2 vs mes anterior ↗</p>
        </div>
      </div>
    </div>

    <!-- Barra de Búsqueda y Filtros -->
    <div class="toolbar">
      <div class="search-group">
        <div class="search-box">
          <svg viewBox="0 0 24 24" class="icon-search" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Buscar estudiante por nombre, matrícula o grupo..." />
        </div>
        <button class="btn-search">
          <svg viewBox="0 0 24 24" class="icon-sm" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          Buscar
        </button>
      </div>

      <div class="filters-group">
        <div class="select-wrapper">
          <label>Grupo</label>
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

    <!-- Barra secundaria: Totales y Nuevo Estudiante -->
    <div class="action-bar">
      <p class="summary-text">Total: 42 estudiantes</p>
      <button class="btn-primary">
        + Nuevo estudiante
      </button>
    </div>

    <!-- Estados de carga y error -->
    <div v-if="loading" class="state-msg">Cargando estudiantes...</div>
    <div v-else-if="error" class="state-msg error-msg">{{ error }}</div>

    <!-- Tabla Principal -->
    <div v-else class="table-container">
      <table class="data-table">
        <thead>
        <tr>
          <th>Estudiante</th>
          <th>Matrícula</th>
          <th>Grupo</th>
          <th class="text-right">Kgs recolectados</th>
          <th class="text-center">Estado</th>
          <th>Última actividad</th>
          <th class="text-center">Acciones</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="estudiante in estudiantes" :key="estudiante.matricula">
          <!-- Estudiante -->
          <td>
            <div class="double-text">
              <span class="primary-text font-medium">{{ estudiante.nombre }}</span>
              <span class="secondary-text">{{ estudiante.correo }}</span>
            </div>
          </td>

          <!-- Matrícula -->
          <td class="text-gray">{{ estudiante.matricula }}</td>

          <!-- Grupo -->
          <td>
              <span class="primary-text" :class="{'multiline': estudiante.grupo.length > 25}">
                {{ estudiante.grupo }}
              </span>
          </td>

          <!-- Kgs recolectados -->
          <td class="text-right text-gray">{{ estudiante.kgs.toFixed(1) }} kg</td>

          <!-- Estado -->
          <td class="text-center">
              <span class="status-pill" :class="getStatusBadgeClass(estudiante.estado)">
                {{ estudiante.estado }}
              </span>
          </td>

          <!-- ultima actividad -->
          <td>
            <div class="double-text">
              <span class="primary-text">{{ estudiante.fechaActividad }}</span>
              <span class="secondary-text">{{ estudiante.horaActividad }}</span>
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
        <span class="pagination-info">Mostrando 1 a 10 de 42 estudiantes</span>
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
    </div>
  </section>
</template>

<script setup>
import { useEstudiantes } from '@src/composables/useEstudiantes.js';

const { 
  estudiantes, 
  loading, 
  error, 
  getStatusBadgeClass
} = useEstudiantes();

</script>

<style src="@src/assets/styles/estudiantes_view.css" scoped></style>