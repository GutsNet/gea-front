<!--
G.E.A. Frontend
Layout de escritorio del Mapa. Se monta únicamente cuando el ancho de
pantalla está en o sobre el breakpoint (ver MapaView.vue) — el layout
móvil ni siquiera se instancia cuando este componente está activo.
 -->

<template>
  <div class="map-main">
    <div class="map-desktop">
      <!-- Estado de Carga / Error -->
      <div v-if="loading" class="loading-state">Cargando mapa...</div>
      <div v-else-if="error" class="error-state">{{ error }}</div>

      <!-- CONTENIDO DEL MAPA DESKTOP LAYOUT -->
      <template v-else>

        <!--BARRA SUPERIOR (Búsqueda y Filtros)-->
        <div class="toolbar">
          <div class="search-group">
            <div class="search-box">
              <svg viewBox="0 0 24 24" class="icon-search" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" placeholder="Buscar árbol o ubicación..." />
            </div>
            <button class="btn-add" aria-label="Añadir nuevo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>

          <div class="filters-group">
            <div class="select-wrapper">
              <label>Filtrar por especie</label>
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
          </div>
        </div>

        <!-- CONTENIDO PRINCIPAL (Mapa + Panel lateral)-->
        <div class="main-layout">

          <!-- CONTENEDOR DEL MAPA -->
          <div class="map-container">
            <!-- Controles del mapa  -->
            <div class="map-controls">
              <button class="map-btn" aria-label="Acercar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <button class="map-btn" aria-label="Alejar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <button class="map-btn mt-small" aria-label="Mi ubicación">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="10"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/></svg>
              </button>
            </div>

            <!-- Leyenda del mapa -->
            <div class="map-legend">
              <h4>Nivel de infestación (Hawksworth)</h4>
              <ul>
                <li><span class="legend-icon text-green"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8"/></svg></span> 0 - No visible</li>
                <li><span class="legend-icon text-yellow"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8"/></svg></span> 3.5 - Ligera</li>
                <li><span class="legend-icon text-red"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg></span> 7.5 - Severa</li>
                <li><span class="legend-icon text-dark"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6" stroke="white" stroke-width="2"/></svg></span> Árbol muerto - estado crítico</li>
                <li><span class="legend-icon text-blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><circle cx="12" cy="12" r="8"/></svg></span> En revisión</li>
              </ul>
            </div>
          </div>

          <!-- PANEL LATERAL DE DETALLES -->
          <aside class="details-panel" v-if="arbolSeleccionado">
            <div class="tree-image-container">
              <!--MAPIÑA -->
              <img src="" alt="Foto del árbol" class="tree-image" />
              <div class="tree-badge text-red">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              </div>
            </div>

            <div class="tree-header">
              <h3>{{ arbolSeleccionado.especie_comun }}</h3>
              <p class="subtitle">({{ arbolSeleccionado.especie_cientifica }})</p>
              <p class="tree-id">ID: {{ arbolSeleccionado.id }}</p>
            </div>

            <div class="tree-info">
              <div class="info-group">
                <label>Nivel de infestación</label>
                <p class="font-bold text-red">{{ arbolSeleccionado.nivel_infestacion }}</p>
              </div>
              <div class="info-group-inline">
                <label>Estado:</label>
                <span class="text-green font-medium">{{ arbolSeleccionado.estado }}</span>
              </div>
              <div class="info-group">
                <label>Último reporte:</label>
                <p>{{ arbolSeleccionado.ultimo_reporte }}</p>
              </div>
            </div>

            <div class="tree-actions">
              <button class="btn-primary-full">Ver detalles</button>
              <button class="btn-outline-full">Marcar como saneado</button>
            </div>
          </aside>

        </div>

        <!--TARJETAS INFERIORES DE ESTADÍSTICAS -->
        <div class="stats-row">
          <!-- Card 1 -->
          <div class="stat-card bg-light-green-card border-card-green">
            <div class="stat-icon-wrapper bg-icon-green text-green">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 11.4A5.5 5.5 0 0 0 14 5a5.5 5.5 0 0 0-8.5 4.6 4.5 4.5 0 0 0 .5 8.4H11v4h2v-4h1.5a4.5 4.5 0 0 0 2.5-8.6z"/></svg>
            </div>
            <div class="stat-text">
              <p class="stat-label">Árboles registrados</p>
              <h4 class="stat-value">{{ estadisticas.arbolesRegistrados }}</h4>
            </div>
          </div>

          <!-- Card 2 -->
          <div class="stat-card bg-light-blue-card border-card-blue">
            <div class="stat-icon-wrapper bg-icon-blue text-blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
            </div>
            <div class="stat-text">
              <p class="stat-label">Reportes nuevos</p>
              <h4 class="stat-value">{{ estadisticas.reportesNuevos }}</h4>
            </div>
          </div>

          <!-- Card 3 -->
          <div class="stat-card bg-light-red-card border-card-red">
            <div class="stat-icon-wrapper bg-icon-red text-red">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            </div>
            <div class="stat-text">
              <p class="stat-label">Niveles severos</p>
              <h4 class="stat-value">{{ estadisticas.nivelesSeveros }}</h4>
            </div>
          </div>

          <!-- Card 4 -->
          <div class="stat-card bg-light-purple-card border-card-purple">
            <div class="stat-icon-wrapper bg-icon-purple text-purple">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M16 10a4 4 0 0 1-8 0" fill="none" stroke="white" stroke-width="2"/></svg>
            </div>
            <div class="stat-text">
              <p class="stat-label">Kg recolectados</p>
              <h4 class="stat-value">{{ estadisticas.kgRecolectados }} kg</h4>
            </div>
          </div>

          <!-- Card 5 -->
          <div class="stat-card bg-light-orange-card border-card-orange">
            <div class="stat-icon-wrapper bg-icon-orange text-orange">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75" fill="none" stroke="currentColor" stroke-width="2"/></svg>
            </div>
            <div class="stat-text">
              <p class="stat-label">Usuarios activos</p>
              <h4 class="stat-value">{{ estadisticas.usuariosActivos }}</h4>
            </div>
          </div>
        </div>

      </template>
    </div>
  </div>
</template>

<script setup>
import { useMapa } from '@src/composables/useMapa';

const {
  loading,
  error,
  arbolSeleccionado,
  estadisticas,
} = useMapa();
</script>

<style src="@src/assets/styles/mapa_view.css" scoped></style>
