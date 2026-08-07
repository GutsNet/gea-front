<!--
G.E.A. Frontend
Layout móvil del Mapa. Se monta únicamente cuando el ancho de
pantalla está bajo el breakpoint (ver MapaWrapper.vue).

Paridad de funciones con MapaDesktopView.vue:
  - Mapa interactivo con OpenLayers (capa satelital/calles/relieve,
    polígono del campus, marcadores coloreados por nivel Hawksworth,
    tooltip al tocar, controles de zoom/centrado).
  - Búsqueda + filtros (especie, nivel de infestación, estado) + refrescar.
  - Selección de árbol -> panel de detalle (aquí como bottom sheet):
    imagen, especie, ubicación, coordenadas (copiar), Hawksworth con
    3 componentes + leyenda, grid de datos, acciones (saneado / editar),
    historial de reportes, compartir.
  - Tarjetas de estadísticas del dashboard (aquí como tira horizontal).

Usa el mismo composable useMapa() que escritorio para no duplicar
lógica de datos/filtrado.
-->

<template>
  <div class="map-main">
    <div class="mm-mobile">
      <!-- ===== BARRA SUPERIOR: búsqueda + filtros + refrescar ===== -->
      <div class="mm-topbar">
        <div class="mm-search-box">
          <svg viewBox="0 0 24 24" class="mm-icon-search" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Buscar árbol o ubicación" v-model="searchQuery" />
        </div>

        <button
          class="mm-icon-btn"
          :class="{ 'mm-icon-btn-active': mostrarFiltros }"
          type="button"
          aria-label="Filtros"
          @click="mostrarFiltros = !mostrarFiltros"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          <span v-if="filtrosActivos" class="mm-badge-dot"></span>
        </button>

        <button class="mm-icon-btn mm-icon-btn-primary" type="button" aria-label="Refrescar datos" @click="refrescar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        </button>
      </div>

      <!-- ===== PANEL DE FILTROS (colapsable) ===== -->
      <transition name="mm-collapse">
        <div class="mm-filters-panel" v-if="mostrarFiltros">
          <div class="mm-filter-field">
            <label>Especie</label>
            <select v-model="filtroEspecie">
              <option value="">Todas</option>
              <option v-for="nombre in especiesUnicas" :key="nombre" :value="nombre">{{ nombre }}</option>
            </select>
          </div>
          <div class="mm-filter-field">
            <label>Nivel de infestación</label>
            <select v-model="filtroNivel">
              <option value="">Todos</option>
              <option value="sano">No visible (0)</option>
              <option value="ligera">Ligera (0.1 - 7.4)</option>
              <option value="severa">Severa (7.5)</option>
            </select>
          </div>
          <div class="mm-filter-field">
            <label>Estado</label>
            <select v-model="filtroEstado">
              <option value="">Todos</option>
              <option value="Sano">Sano</option>
              <option value="Infestado">Infestado</option>
              <option value="Limpieza">Limpieza</option>
              <option value="Saneado">Saneado</option>
            </select>
          </div>
          <button class="mm-filters-clear" type="button" :disabled="!filtrosActivos" @click="limpiarFiltros">
            Limpiar filtros
          </button>
        </div>
      </transition>

      <!-- ===== TIRA DE ESTADÍSTICAS ===== -->
      <div class="mm-stats-strip" v-if="!loading">
        <div class="mm-stat-chip mm-chip-green">
          <span class="mm-chip-icon mm-chip-icon-green">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 11.4A5.5 5.5 0 0 0 14 5a5.5 5.5 0 0 0-8.5 4.6 4.5 4.5 0 0 0 .5 8.4H11v4h2v-4h1.5a4.5 4.5 0 0 0 2.5-8.6z"/></svg>
          </span>
          <span class="mm-chip-value">{{ estadisticas.arbolesRegistrados }}</span>
          <span class="mm-chip-label">Árboles</span>
        </div>
        <div class="mm-stat-chip mm-chip-blue">
          <span class="mm-chip-icon mm-chip-icon-blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </span>
          <span class="mm-chip-value">{{ estadisticas.reportesNuevos }}</span>
          <span class="mm-chip-label">Reportes</span>
        </div>
        <div class="mm-stat-chip mm-chip-red">
          <span class="mm-chip-icon mm-chip-icon-red">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          </span>
          <span class="mm-chip-value">{{ estadisticas.nivelesSeveros }}</span>
          <span class="mm-chip-label">Infestados</span>
        </div>
        <div class="mm-stat-chip mm-chip-purple">
          <span class="mm-chip-icon mm-chip-icon-purple">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/></svg>
          </span>
          <span class="mm-chip-value">{{ estadisticas.kgRecolectados }} kg</span>
          <span class="mm-chip-label">Recolectados</span>
        </div>
        <div class="mm-stat-chip mm-chip-orange">
          <span class="mm-chip-icon mm-chip-icon-orange">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          </span>
          <span class="mm-chip-value">{{ estadisticas.usuariosActivos }}</span>
          <span class="mm-chip-label">Usuarios activos</span>
        </div>
      </div>

      <div v-if="error" class="error-state">{{ error }}</div>

      <!-- ===== MAPA INTERACTIVO ===== -->
      <div class="mm-map-wrap">
        <div ref="mapEl" class="ol-map-el"></div>

        <div v-if="loading" class="map-loading-overlay">Cargando datos...</div>

        <!-- Selector de capa base -->
        <div class="mm-layers-switcher">
          <button
            v-for="capa in capasBase"
            :key="capa.id"
            type="button"
            class="mm-layer-btn"
            :class="{ 'mm-layer-btn-active': capaActiva === capa.id }"
            @click="cambiarCapa(capa.id)"
          >
            {{ capa.titulo }}
          </button>
        </div>

        <!-- Controles de zoom / centrado / leyenda -->
        <div class="mm-map-controls">
          <button class="mm-map-btn" type="button" aria-label="Acercar" @click="acercar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <button class="mm-map-btn" type="button" aria-label="Alejar" @click="alejar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <button class="mm-map-btn" type="button" aria-label="Centrar en el campus" @click="centrarMapa">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
          </button>
          <button
            class="mm-map-btn"
            :class="{ 'mm-icon-btn-active': mostrarLeyenda }"
            type="button"
            aria-label="Mostrar leyenda"
            @click="mostrarLeyenda = !mostrarLeyenda"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          </button>
        </div>

        <!-- Leyenda (colapsable, oculta por defecto para no tapar el mapa) -->
        <transition name="mm-collapse">
          <div class="mm-legend" v-if="mostrarLeyenda">
            <h4>Nivel de infestación (Hawksworth)</h4>
            <ul>
              <li><span class="mm-legend-dot mm-dot-green"></span> 0 - No visible</li>
              <li><span class="mm-legend-dot mm-dot-yellow"></span> 3.5 - Ligera</li>
              <li><span class="mm-legend-dot mm-dot-red"></span> 7.5 - Severa</li>
            </ul>
          </div>
        </transition>

        <!-- Tooltip flotante sobre el árbol tocado -->
        <div ref="tooltipEl" class="map-tooltip"></div>
      </div>

      <!-- ===== BOTTOM SHEET: vista previa compacta ===== -->
      <transition name="mm-sheet">
        <div class="mm-sheet-compact" v-if="arbolSeleccionado && !panelExpandido">
          <button class="mm-sheet-x" type="button" aria-label="Cerrar" @click="deseleccionarArbol">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          <div class="mm-sheet-compact-row">
            <div class="mm-sheet-compact-info">
              <h3 class="mm-sheet-title">{{ arbolSeleccionado.especie_comun }}</h3>
              <p class="mm-sheet-sci" v-if="arbolSeleccionado.especie_cientifica">({{ arbolSeleccionado.especie_cientifica }})</p>
              <p class="mm-sheet-id">ID: {{ arbolSeleccionado.etiqueta }}</p>
              <p class="mm-sheet-nivel">
                Nivel de infestación:
                <strong :class="hawkTotalClass">{{ arbolSeleccionado.nivel_num }} ({{ arbolSeleccionado.nivel_label }})</strong>
              </p>
            </div>
            <div class="mm-sheet-severity" :class="severityBadgeClass" v-if="arbolSeleccionado.nivel_num > 0">
              <svg viewBox="0 0 24 24" fill="white" width="18" height="18"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            </div>
          </div>

          <button class="mm-sheet-btn-primary" type="button" @click="panelExpandido = true">Ver Detalles</button>
        </div>
      </transition>

      <!-- ===== BOTTOM SHEET: detalle completo ===== -->
      <transition name="mm-sheet-full">
        <div class="mm-sheet-full" v-if="arbolSeleccionado && panelExpandido">
          <header class="mm-sf-header">
            <button class="mm-sf-back" type="button" @click="panelExpandido = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="15 18 9 12 15 6"/></svg>
              Volver
            </button>
            <div class="mm-sf-actions">
              <button class="mm-sf-share" type="button" @click="compartirArbol" title="Compartir">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                  <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                  <path d="M8.59 13.51L15.42 17.49" /><path d="M15.41 6.51L8.59 10.49" />
                </svg>
              </button>
              <button class="mm-sf-close" type="button" @click="deseleccionarArbol" title="Cerrar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </header>

          <div class="mm-sf-body">
            <!-- Imagen -->
            <div class="mm-sf-image-wrap">
              <img v-if="arbolSeleccionado?.imagenes?.length" :src="arbolSeleccionado.imagenes[0]" alt="Foto del árbol" class="mm-sf-tree-img" />
              <div v-else class="mm-sf-img-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="56" height="56">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
                </svg>
              </div>
              <div v-if="arbolSeleccionado?.nivel_num >= 7.5" class="mm-sf-severity-badge mm-sf-severity-red">
                <svg viewBox="0 0 24 24" fill="white" width="16" height="16"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              </div>
              <div v-else-if="arbolSeleccionado?.nivel_num > 0" class="mm-sf-severity-badge mm-sf-severity-yellow">
                <svg viewBox="0 0 24 24" fill="white" width="16" height="16"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              </div>
              <div class="mm-sf-etiqueta-badge">{{ arbolSeleccionado.etiqueta }}</div>
            </div>

            <!-- Especie -->
            <div class="mm-sf-block">
              <div class="mm-sf-label">Especie</div>
              <h3 class="mm-sf-species-name">{{ arbolSeleccionado.especie_comun }}</h3>
              <p class="mm-sf-species-sci" v-if="arbolSeleccionado.especie_cientifica">({{ arbolSeleccionado.especie_cientifica }})</p>
              <span class="mm-sf-native-badge" v-if="arbolSeleccionado.nativa">Especie nativa</span>
            </div>

            <!-- Ubicación -->
            <div class="mm-sf-block">
              <div class="mm-sf-label">Ubicación</div>
              <p class="mm-sf-value-strong">{{ arbolSeleccionado.ubicacion }}</p>
            </div>

            <!-- Coordenadas -->
            <div class="mm-sf-block">
              <div class="mm-sf-label">Coordenadas</div>
              <div class="mm-sf-coords-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2" width="16" height="16"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span class="mm-sf-coords-text">{{ arbolSeleccionado.coordenadas }}</span>
                <button class="mm-sf-copy-btn" type="button" @click="copiarCoordenadas" title="Copiar coordenadas">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                </button>
              </div>
            </div>

            <!-- Hawksworth -->
            <div class="mm-sf-hawk-card">
              <h4 class="mm-sf-hawk-title">Nivel de infestación (Hawksworth)</h4>
              <div class="mm-sf-hawk-total" :class="hawkTotalClass">
                {{ arbolSeleccionado.nivel_num }} ({{ arbolSeleccionado.nivel_label }})
              </div>
              <div class="mm-sf-hawk-components">
                <div class="mm-sf-hawk-comp" v-for="(val, i) in arbolSeleccionado.hawksworth" :key="i">
                  {{ val !== null ? val : '—' }}
                </div>
              </div>
              <div class="mm-sf-hawk-legend">
                <ul>
                  <li><span class="mm-legend-dot mm-dot-green"></span> 0 - No visible</li>
                  <li><span class="mm-legend-dot mm-dot-yellow"></span> 3.5 - Ligera</li>
                  <li><span class="mm-legend-dot mm-dot-red"></span> 7.5 - Severa</li>
                  <li><span class="mm-legend-dot mm-dot-gray"></span> Árbol muerto - estado crítico</li>
                  <li><span class="mm-legend-dot mm-dot-blue"></span> En revisión</li>
                </ul>
              </div>
            </div>

            <!-- Grid de datos -->
            <div class="mm-sf-data-grid">
              <div class="mm-sf-data-row">
                <span class="mm-legend-dot mm-dot-green"></span>
                <span class="mm-sf-data-label">ID del árbol</span>
                <span class="mm-sf-data-value">{{ arbolSeleccionado.etiqueta }}</span>
              </div>
              <div class="mm-sf-data-row">
                <span class="mm-legend-dot mm-dot-green"></span>
                <span class="mm-sf-data-label">Fecha de registro</span>
                <span class="mm-sf-data-value">{{ arbolSeleccionado.fecha_registro }}</span>
              </div>
              <div class="mm-sf-data-row">
                <span class="mm-legend-dot mm-dot-green"></span>
                <span class="mm-sf-data-label">Registrado por</span>
                <span class="mm-sf-data-value">{{ arbolSeleccionado.registrado_por }}</span>
              </div>
              <div class="mm-sf-data-row">
                <span class="mm-legend-dot mm-dot-green"></span>
                <span class="mm-sf-data-label">Estado actual</span>
                <span class="mm-sf-data-value">
                  <span class="mm-sf-estado-pill" :class="getEstadoBadgeClass(arbolSeleccionado.estado)">{{ arbolSeleccionado.estado }}</span>
                </span>
              </div>
              <div class="mm-sf-data-row">
                <span class="mm-legend-dot mm-dot-green"></span>
                <span class="mm-sf-data-label">Último reporte</span>
                <span class="mm-sf-data-value">{{ arbolSeleccionado.ultimo_reporte }}</span>
              </div>
              <div class="mm-sf-data-row">
                <span class="mm-legend-dot mm-dot-green"></span>
                <span class="mm-sf-data-label">Veces reportado</span>
                <span class="mm-sf-data-value">{{ arbolSeleccionado.veces_reportado }}</span>
              </div>
              <div class="mm-sf-data-row">
                <span class="mm-legend-dot mm-dot-green"></span>
                <span class="mm-sf-data-label">Prioridad</span>
                <span class="mm-sf-data-value">
                  <span class="mm-sf-estado-pill" :class="getEstadoBadgeClass(arbolSeleccionado.prioridad)">{{ arbolSeleccionado.prioridad }}</span>
                </span>
              </div>
              <div class="mm-sf-data-row mm-sf-data-row-obs">
                <span class="mm-legend-dot mm-dot-green"></span>
                <span class="mm-sf-data-label">Observaciones</span>
                <span class="mm-sf-data-value mm-sf-obs-text">{{ arbolSeleccionado.observaciones }}</span>
              </div>
            </div>

            <!-- Acciones -->
            <div class="mm-sf-actions-col">
              <button class="mm-sf-btn-saneado" type="button">Árbol saneado</button>
              <button class="mm-sf-btn-editar" type="button" v-if="arbolSeleccionado?.uuid" @click="irADetalle">Editar datos</button>
            </div>

            <!-- Historial -->
            <div class="mm-sf-history" v-if="arbolSeleccionado.reportes?.length">
              <h4 class="mm-sf-history-title">Historial de reportes</h4>
              <div class="mm-sf-history-list">
                <div class="mm-sf-history-item" v-for="(rep, idx) in arbolSeleccionado.reportes" :key="idx">
                  <div class="mm-sf-history-item-top">
                    <span class="mm-sf-history-fecha">{{ rep.fecha || '—' }}</span>
                    <span class="mm-sf-estado-pill mm-sf-estado-pill-sm" :class="getEstadoBadgeClass(rep.estado)">{{ rep.estado || '—' }}</span>
                  </div>
                  <div class="mm-sf-history-item-mid">
                    <span :class="getReporteNivelClass(rep.nivel_infestacion)">Nivel: {{ rep.nivel_infestacion ?? '—' }}</span>
                    <span class="mm-sf-history-reportero">{{ rep.reportado_por || '—' }}</span>
                  </div>
                  <p class="mm-sf-history-obs" v-if="rep.observaciones">{{ rep.observaciones }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useMapa, parseCoordenadas } from '@src/composables/useMapa';

import 'ol/ol.css';
import OlMap from 'ol/Map';
import View from 'ol/View';
import Overlay from 'ol/Overlay';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import TileArcGISRest from 'ol/source/TileArcGISRest';
import OSM from 'ol/source/OSM';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import { boundingExtent, getCenter } from 'ol/extent';
import { defaults as defaultControls } from 'ol/control';
import { defaults as defaultInteractions } from 'ol/interaction';

const router = useRouter();

const {
  loading,
  error,
  arbolesFiltrados,
  arbolSeleccionado,
  estadisticas,
  especiesUnicas,
  searchQuery,
  filtroEspecie,
  filtroNivel,
  filtroEstado,
  getEstadoBadgeClass,
  seleccionarArbol,
  deseleccionarArbol: deseleccionarArbolBase,
  limpiarFiltros,
  refrescar,
} = useMapa();

/* ===================== UI: filtros / leyenda / sheet ===================== */

const mostrarFiltros = ref(false);
const mostrarLeyenda = ref(false);
const panelExpandido = ref(false);

const filtrosActivos = computed(
  () => !!(filtroEspecie.value || filtroNivel.value || filtroEstado.value)
);

// Al cerrar el detalle, siempre volvemos al estado "compacto" para la próxima selección.
const deseleccionarArbol = () => {
  deseleccionarArbolBase();
  panelExpandido.value = false;
};

const hawkTotalClass = computed(() => {
  const n = arbolSeleccionado.value?.nivel_num ?? 0;
  if (n >= 7.5) return 'mm-hawk-red';
  if (n > 0) return 'mm-hawk-yellow';
  return 'mm-hawk-green';
});

const severityBadgeClass = computed(() => {
  const n = arbolSeleccionado.value?.nivel_num ?? 0;
  return n >= 7.5 ? 'mm-severity-red' : 'mm-severity-yellow';
});

const getReporteNivelClass = (nivel) => {
  if (nivel === null || nivel === undefined) return '';
  if (nivel >= 7.5) return 'mm-nivel-red';
  if (nivel > 0) return 'mm-nivel-yellow';
  return 'mm-nivel-green';
};

const irADetalle = () => {
  if (arbolSeleccionado.value?.uuid) {
    router.push({ path: '/arboles', query: { detalle: arbolSeleccionado.value.uuid } });
  }
};

const compartirArbol = async () => {
  if (!arbolSeleccionado.value) return;
  const url = `${window.location.origin}/arboles/${arbolSeleccionado.value.uuid}`;

  if (navigator.share) {
    await navigator.share({
      title: `Detalle ${arbolSeleccionado.value.etiqueta}`,
      text: `Ver estado e información del árbol ${arbolSeleccionado.value.especie_comun}`,
      url,
    });
  } else {
    await navigator.clipboard.writeText(url);
    window.alert('Enlace copiado al portapapeles.');
  }
};

const copiarCoordenadas = async () => {
  if (!arbolSeleccionado.value?.coordenadas) return;
  await navigator.clipboard.writeText(arbolSeleccionado.value.coordenadas);
  window.alert('Coordenadas copiadas al portapapeles.');
};

/* ===================== MAPA (OpenLayers) ===================== */
/* Misma lógica que MapaDesktopView.vue: mismo polígono de campus,
   mismos umbrales de color, misma inicialización robusta (el
   contenedor del mapa siempre está montado, initMap() se llama una
   sola vez en onMounted, y se destruye en onBeforeUnmount). */

const CAMPUS_POLIGONO_LONLAT = [
  [-99.347131, 20.007539], // Suroeste
  [-99.343406, 20.007436], // Sureste
  [-99.342308, 20.010539], // Noreste
  [-99.346731, 20.010981], // Noroeste
];
const CAMPUS_MERCATOR = CAMPUS_POLIGONO_LONLAT.map((c) => fromLonLat(c));
const CAMPUS_EXTENT = boundingExtent(CAMPUS_MERCATOR);

function colorPorNivel(nivel) {
  if (nivel >= 7.5) return '#dc2626';
  if (nivel > 0) return '#eab308';
  return '#16a34a';
}

function estiloMarcador(nivel, seleccionado) {
  return new Style({
    image: new CircleStyle({
      radius: seleccionado ? 11 : 8,
      fill: new Fill({ color: colorPorNivel(Number(nivel) || 0) }),
      stroke: new Stroke({ color: '#ffffff', width: seleccionado ? 3 : 2 }),
    }),
  });
}

const capaSatelital = new TileLayer({
  source: new TileArcGISRest({
    url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
    attributions: 'Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics',
    maxZoom: 19,
    cacheSize: 256,
  }),
  visible: true,
});

const capaCalles = new TileLayer({
  source: new OSM({ cacheSize: 256 }),
  visible: false,
});

const capaRelieve = new TileLayer({
  source: new XYZ({
    url: 'https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attributions:
      'Map data: &copy; OpenStreetMap contributors, SRTM | Estilo: &copy; OpenTopoMap (CC-BY-SA)',
    maxZoom: 17,
    cacheSize: 256,
  }),
  visible: false,
});

const capasBase = [
  { id: 'satelital', titulo: 'Satelital', layer: capaSatelital },
  { id: 'calles', titulo: 'Calles', layer: capaCalles },
  { id: 'relieve', titulo: 'Relieve', layer: capaRelieve },
];

const capaActiva = ref('satelital');

function cambiarCapa(id) {
  capaActiva.value = id;
  capasBase.forEach((c) => c.layer.setVisible(c.id === id));
}

const fuentePoligono = new VectorSource({
  features: [new Feature({ geometry: new Polygon([CAMPUS_MERCATOR]) })],
});
const capaPoligono = new VectorLayer({
  source: fuentePoligono,
  style: new Style({
    stroke: new Stroke({ color: '#15803d', width: 2 }),
    fill: new Fill({ color: 'rgba(21, 128, 61, 0.08)' }),
  }),
});

const fuenteMarcadores = new VectorSource();
const capaMarcadores = new VectorLayer({ source: fuenteMarcadores });
const marcadoresPorEtiqueta = new Map();

function pintarMarcadores() {
  fuenteMarcadores.clear();
  marcadoresPorEtiqueta.clear();

  arbolesFiltrados.value.forEach((arbol) => {
    const coords = parseCoordenadas(arbol.coordenadas || arbol.id_area__coordenadas);
    if (!coords) return;

    const [lat, lng] = coords;
    const esSeleccionado = arbolSeleccionado.value?.etiqueta === arbol.etiqueta;

    const feature = new Feature({ geometry: new Point(fromLonLat([lng, lat])) });
    feature.setStyle(estiloMarcador(arbol.nivel_infestacion, esSeleccionado));
    feature.set('arbol', arbol);

    fuenteMarcadores.addFeature(feature);
    marcadoresPorEtiqueta.set(arbol.etiqueta, feature);
  });
}

const mapEl = ref(null);
const tooltipEl = ref(null);
let map = null;
let overlayTooltip = null;
let resizeObserver = null;
let tooltipTimeout = null;

function ajustarTamanoMapa() {
  if (!map) return;
  map.updateSize();
}

function initMap() {
  if (map || !mapEl.value) return;

  const vista = new View({
    center: getCenter(CAMPUS_EXTENT),
    zoom: 17,
    extent: CAMPUS_EXTENT,
    constrainOnlyCenter: true,
    maxZoom: 21,
    minZoom: 14,
  });

  map = new OlMap({
    target: mapEl.value,
    layers: [capaSatelital, capaCalles, capaRelieve, capaPoligono, capaMarcadores],
    view: vista,
    controls: defaultControls({ zoom: false, rotate: false, attribution: true }),
    interactions: defaultInteractions({ pinchRotate: false, altShiftDragRotate: false }),
  });

  overlayTooltip = new Overlay({
    element: tooltipEl.value,
    offset: [0, -14],
    positioning: 'bottom-center',
    stopEvent: false,
  });
  map.addOverlay(overlayTooltip);

  // Tocar un marcador -> abre la vista previa (bottom sheet compacto)
  map.on('click', (evt) => {
    const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f, {
      layerFilter: (capa) => capa === capaMarcadores,
      hitTolerance: 10,
    });
    if (feature) {
      panelExpandido.value = false;
      seleccionarArbol(feature.get('arbol'));

      // Tooltip breve al tocar (equivalente táctil del hover de escritorio)
      const arbol = feature.get('arbol');
      tooltipEl.value.textContent = `${arbol.etiqueta} · ${arbol.especie__nombre || '—'}`;
      tooltipEl.value.style.display = 'block';
      overlayTooltip.setPosition(feature.getGeometry().getCoordinates());
      if (tooltipTimeout) clearTimeout(tooltipTimeout);
      tooltipTimeout = setTimeout(() => {
        tooltipEl.value.style.display = 'none';
      }, 1800);
    }
  });

  resizeObserver = new ResizeObserver(() => ajustarTamanoMapa());
  resizeObserver.observe(mapEl.value);
  requestAnimationFrame(ajustarTamanoMapa);

  pintarMarcadores();
}

function destruirMapa() {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  if (tooltipTimeout) clearTimeout(tooltipTimeout);
  if (map) {
    map.setTarget(null);
    map = null;
  }
  overlayTooltip = null;
  marcadoresPorEtiqueta.clear();
}

onMounted(async () => {
  await nextTick();
  initMap();
});

watch(arbolesFiltrados, () => {
  if (map) pintarMarcadores();
});

watch(arbolSeleccionado, (nuevo, anterior) => {
  if (!map) return;

  if (anterior) {
    const featAnterior = marcadoresPorEtiqueta.get(anterior.etiqueta);
    if (featAnterior) featAnterior.setStyle(estiloMarcador(anterior.nivel_num, false));
  }

  if (nuevo) {
    const featNuevo = marcadoresPorEtiqueta.get(nuevo.etiqueta);
    if (featNuevo) {
      featNuevo.setStyle(estiloMarcador(nuevo.nivel_num, true));
      // Centra suavemente el marcador seleccionado, desplazado hacia arriba
      // para que quede visible por encima del bottom sheet compacto.
      const vista = map.getView();
      vista.animate({
        center: featNuevo.getGeometry().getCoordinates(),
        duration: 300,
      });
    }
  }
});

// Cerrar el panel de filtros al tocar el mapa mejora la usabilidad en pantallas chicas.
watch(mostrarFiltros, (abierto) => {
  if (abierto) mostrarLeyenda.value = false;
});
watch(mostrarLeyenda, (abierto) => {
  if (abierto) mostrarFiltros.value = false;
});

const acercar = () => {
  if (!map) return;
  const vista = map.getView();
  vista.animate({ zoom: (vista.getZoom() ?? 17) + 1, duration: 200 });
};
const alejar = () => {
  if (!map) return;
  const vista = map.getView();
  vista.animate({ zoom: (vista.getZoom() ?? 17) - 1, duration: 200 });
};
const centrarMapa = () => {
  if (!map) return;
  map.getView().fit(CAMPUS_EXTENT, { size: map.getSize(), padding: [8, 8, 8, 8], duration: 300 });
};

onBeforeUnmount(destruirMapa);
</script>

<style src="@src/assets/styles/mapa_view.css" scoped></style>

<style scoped>
/* ====================================================================
   VISTA MÓVIL — clases con prefijo "mm-" para no mezclarse con las
   clases del layout de escritorio (que usa "dp-" / las clases base
   de mapa_view.css). Solo se reutilizan de mapa_view.css las
   variables CSS de .map-main (--map-primary, etc.) y las clases
   compartidas .error-state / .map-loading-overlay / .ol-map-el /
   .map-tooltip.
   ==================================================================== */

.mm-mobile {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100dvh;
  min-height: 100vh;
  background: var(--map-bg);
  overflow: hidden;
}

/* ---------- Barra superior ---------- */
.mm-topbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 0.85rem;
  background: white;
  border-bottom: 1px solid var(--map-border);
  z-index: 5;
}
.mm-search-box {
  position: relative;
  flex: 1;
  min-width: 0;
}
.mm-search-box input {
  width: 100%;
  padding: 0.6rem 0.9rem 0.6rem 2.4rem;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.88rem;
  outline: none;
  background: #f8fafc;
}
.mm-icon-search {
  position: absolute;
  left: 0.7rem;
  top: 50%;
  transform: translateY(-50%);
  width: 17px;
  height: 17px;
  color: #94a3b8;
}
.mm-icon-btn {
  position: relative;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: white;
  color: var(--map-text);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.mm-icon-btn svg { width: 18px; height: 18px; }
.mm-icon-btn-active {
  background: #f0fdf4;
  border-color: var(--map-primary);
  color: var(--map-primary);
}
.mm-icon-btn-primary {
  background: var(--map-primary);
  border-color: var(--map-primary);
  color: white;
}
.mm-badge-dot {
  position: absolute;
  top: -3px;
  right: -3px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--map-danger);
  border: 2px solid white;
}

/* ---------- Filtros ---------- */
.mm-filters-panel {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding: 0.85rem;
  background: white;
  border-bottom: 1px solid var(--map-border);
  z-index: 5;
}
.mm-filter-field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.mm-filter-field label {
  font-size: 0.75rem;
  color: var(--map-muted);
  font-weight: 600;
}
.mm-filter-field select {
  padding: 0.6rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #f8fafc;
  font-size: 0.85rem;
}
.mm-filters-clear {
  margin-top: 0.15rem;
  padding: 0.55rem;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: white;
  color: var(--map-text);
  font-size: 0.82rem;
  font-weight: 600;
}
.mm-filters-clear:disabled { opacity: 0.5; }

/* ---------- Estadísticas ---------- */
.mm-stats-strip {
  display: flex;
  gap: 0.6rem;
  padding: 0.65rem 0.85rem;
  overflow-x: auto;
  background: white;
  border-bottom: 1px solid var(--map-border);
  z-index: 5;
  -webkit-overflow-scrolling: touch;
}
.mm-stat-chip {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.7rem;
  border-radius: 10px;
  min-width: 118px;
}
.mm-chip-icon {
  width: 30px;
  height: 30px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.mm-chip-icon svg { width: 16px; height: 16px; }
.mm-chip-value { font-size: 0.92rem; font-weight: 700; color: #0f172a; display: block; }
.mm-chip-label { font-size: 0.68rem; color: var(--map-muted); font-weight: 500; }

.mm-chip-green { background: #f0fdf4; }
.mm-chip-icon-green { background: #bbf7d0; color: var(--map-primary); }
.mm-chip-blue { background: #eff6ff; }
.mm-chip-icon-blue { background: #bfdbfe; color: var(--map-blue); }
.mm-chip-red { background: #fef2f2; }
.mm-chip-icon-red { background: #fecaca; color: var(--map-danger); }
.mm-chip-purple { background: #faf5ff; }
.mm-chip-icon-purple { background: #e9d5ff; color: var(--map-purple); }
.mm-chip-orange { background: #fffbeb; }
.mm-chip-icon-orange { background: #fde68a; color: var(--map-orange); }

/* ---------- Mapa ---------- */
.mm-map-wrap {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.mm-map-wrap .ol-map-el { position: absolute; inset: 0; width: 100%; height: 100%; }
.mm-map-wrap .ol-map-el:focus,
.mm-map-wrap .ol-map-el .ol-viewport:focus { outline: none; }

.mm-layers-switcher {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 10;
  display: flex;
  background: white;
  border-radius: 8px;
  padding: 0.2rem;
  gap: 0.1rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.18);
}
.mm-layer-btn {
  background: transparent;
  border: none;
  border-radius: 6px;
  padding: 0.35rem 0.55rem;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--map-text);
  cursor: pointer;
  white-space: nowrap;
}
.mm-layer-btn-active {
  background-color: var(--map-primary);
  color: white;
}

.mm-map-controls {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.mm-map-btn {
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--map-text);
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
}
.mm-map-btn svg { width: 17px; height: 17px; }

.mm-legend {
  position: absolute;
  bottom: 0.75rem;
  left: 0.75rem;
  z-index: 10;
  background: white;
  padding: 0.8rem;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.18);
  font-size: 0.78rem;
  max-width: 190px;
}
.mm-legend h4 { margin: 0 0 0.55rem 0; font-size: 0.78rem; color: var(--map-dark); }
.mm-legend ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.4rem; }
.mm-legend li { display: flex; align-items: center; gap: 0.45rem; color: #475569; }

.mm-legend-dot, .mm-dot-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}
.mm-dot-green { background: #16a34a; }
.mm-dot-yellow { background: #eab308; }
.mm-dot-red { background: #dc2626; }
.mm-dot-gray { background: #94a3b8; }
.mm-dot-blue { background: #3b82f6; }

/* ---------- Bottom sheet compacto ---------- */
.mm-sheet-compact {
  position: absolute;
  left: 0.6rem;
  right: 0.6rem;
  bottom: 0.85rem;
  z-index: 20;
  background: white;
  border-radius: 16px;
  padding: 1rem 1.1rem 1.1rem;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.22);
}
.mm-sheet-x {
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
}
.mm-sheet-compact-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  padding-right: 1.5rem;
}
.mm-sheet-title { margin: 0; font-size: 1.05rem; font-weight: 700; color: #0f172a; }
.mm-sheet-sci { margin: 0.1rem 0 0; font-size: 0.8rem; color: var(--map-muted); font-style: italic; }
.mm-sheet-id { margin: 0.35rem 0 0; font-size: 0.82rem; color: #475569; }
.mm-sheet-nivel { margin: 0.3rem 0 0; font-size: 0.85rem; color: #475569; }
.mm-hawk-red { color: var(--map-danger); }
.mm-hawk-yellow { color: #ca8a04; }
.mm-hawk-green { color: var(--map-primary); }
.mm-sheet-severity {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.mm-severity-red { background: var(--map-danger); }
.mm-severity-yellow { background: #eab308; }

.mm-sheet-btn-primary {
  margin-top: 1rem;
  width: 100%;
  padding: 0.8rem;
  border: none;
  border-radius: 10px;
  background: var(--map-primary);
  color: white;
  font-weight: 700;
  font-size: 0.92rem;
}

/* ---------- Bottom sheet completo ---------- */
.mm-sheet-full {
  position: absolute;
  inset: 0.6rem 0 0 0;
  z-index: 25;
  background: white;
  border-radius: 18px 18px 0 0;
  box-shadow: 0 -6px 24px rgba(15, 23, 42, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.mm-sf-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  flex-shrink: 0;
}
.mm-sf-back {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: transparent;
  border: none;
  color: var(--map-primary);
  font-weight: 700;
  font-size: 0.9rem;
  padding: 0.3rem 0.2rem;
}
.mm-sf-actions { display: flex; align-items: center; gap: 0.5rem; }
.mm-sf-share {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: none;
  background: var(--map-primary);
  color: white;
}
.mm-sf-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: transparent;
  color: #64748b;
}

.mm-sf-body {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 1rem 1.1rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mm-sf-image-wrap {
  position: relative;
  width: 100%;
  height: 170px;
  border-radius: 12px;
  overflow: hidden;
  background: #f0fdf4;
}
.mm-sf-tree-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.mm-sf-img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #86efac; }
.mm-sf-severity-badge {
  position: absolute;
  top: 0.55rem;
  left: 0.55rem;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}
.mm-sf-severity-red { background: var(--map-danger); }
.mm-sf-severity-yellow { background: #eab308; }
.mm-sf-etiqueta-badge {
  position: absolute;
  bottom: 0.55rem;
  right: 0.55rem;
  background: rgba(0,0,0,0.65);
  color: white;
  padding: 0.28rem 0.65rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
}

.mm-sf-block { display: flex; flex-direction: column; gap: 0.1rem; }
.mm-sf-label {
  font-size: 0.7rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 500;
}
.mm-sf-species-name { margin: 0.1rem 0 0; font-size: 1.05rem; font-weight: 700; color: #0f172a; }
.mm-sf-species-sci { margin: 0.1rem 0 0; font-size: 0.85rem; color: #64748b; font-style: italic; }
.mm-sf-native-badge {
  display: inline-block;
  margin-top: 0.4rem;
  align-self: flex-start;
  padding: 0.2rem 0.65rem;
  background: #dcfce7;
  color: var(--map-primary);
  border: 1px solid #bbf7d0;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
}
.mm-sf-value-strong { margin: 0.1rem 0 0; font-size: 0.9rem; font-weight: 600; color: #0f172a; }

.mm-sf-coords-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 0.7rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  margin-top: 0.25rem;
}
.mm-sf-coords-text {
  font-size: 0.82rem;
  color: #334155;
  font-weight: 500;
  flex: 1;
  font-variant-numeric: tabular-nums;
  word-break: break-word;
}
.mm-sf-copy-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  padding: 0.2rem;
  display: flex;
  align-items: center;
  border-radius: 4px;
  flex-shrink: 0;
}

.mm-sf-hawk-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}
.mm-sf-hawk-title { margin: 0; font-size: 0.8rem; color: #334155; font-weight: 600; }
.mm-sf-hawk-total {
  text-align: center;
  padding: 0.75rem;
  border-radius: 10px;
  color: white;
  font-size: 1.05rem;
  font-weight: 800;
}
.mm-sf-hawk-components {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.4rem;
}
.mm-sf-hawk-comp {
  text-align: center;
  padding: 0.55rem 0.3rem;
  border-radius: 8px;
  background: #1e293b;
  color: white;
  font-size: 0.9rem;
  font-weight: 700;
}
.mm-sf-hawk-legend { border-top: 1px solid #e2e8f0; padding-top: 0.65rem; }
.mm-sf-hawk-legend ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.35rem; }
.mm-sf-hawk-legend li { display: flex; align-items: center; gap: 0.45rem; font-size: 0.75rem; color: #475569; }

.mm-sf-data-grid {
  display: flex;
  flex-direction: column;
  border-top: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
}
.mm-sf-data-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.1rem;
  border-bottom: 1px solid #f8fafc;
  font-size: 0.85rem;
}
.mm-sf-data-row:last-child { border-bottom: none; }
.mm-sf-data-row-obs { align-items: flex-start; }
.mm-sf-data-label { color: #64748b; font-weight: 500; white-space: nowrap; }
.mm-sf-data-value { margin-left: auto; color: #0f172a; font-weight: 600; text-align: right; font-size: 0.85rem; }
.mm-sf-obs-text { white-space: normal; max-width: 62%; line-height: 1.35; font-size: 0.8rem; font-weight: 500; }

.mm-sf-estado-pill {
  display: inline-block;
  padding: 0.18rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}
.mm-sf-estado-pill-sm { font-size: 0.68rem; padding: 0.12rem 0.5rem; }
.badge-green, .mm-sf-estado-pill.badge-green { background: #dcfce7; color: #15803d; }
.badge-red, .mm-sf-estado-pill.badge-red { background: #fee2e2; color: #dc2626; }
.badge-blue, .mm-sf-estado-pill.badge-blue { background: #dbeafe; color: #2563eb; }
.badge-gray, .mm-sf-estado-pill.badge-gray { background: #f1f5f9; color: #64748b; }

.mm-sf-actions-col { display: flex; flex-direction: column; gap: 0.6rem; }
.mm-sf-btn-saneado {
  width: 100%;
  padding: 0.8rem;
  background: var(--map-primary);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.92rem;
  font-weight: 700;
}
.mm-sf-btn-editar {
  width: 100%;
  padding: 0.75rem;
  background: white;
  color: #334155;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
}

.mm-sf-history { border-top: 1px solid #f1f5f9; padding-top: 0.9rem; }
.mm-sf-history-title { margin: 0 0 0.65rem; font-size: 0.88rem; color: #0f172a; font-weight: 700; }
.mm-sf-history-list { display: flex; flex-direction: column; gap: 0.6rem; }
.mm-sf-history-item {
  border: 1px solid #f1f5f9;
  border-radius: 10px;
  padding: 0.6rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.mm-sf-history-item-top { display: flex; align-items: center; justify-content: space-between; }
.mm-sf-history-fecha { font-size: 0.78rem; color: #64748b; }
.mm-sf-history-item-mid {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.8rem;
  font-weight: 700;
}
.mm-sf-history-reportero { font-weight: 500; color: #64748b; font-size: 0.75rem; }
.mm-sf-history-obs { margin: 0; font-size: 0.78rem; color: #334155; }
.mm-nivel-red { color: #dc2626; }
.mm-nivel-yellow { color: #eab308; }
.mm-nivel-green { color: #16a34a; }

/* ---------- Transiciones ---------- */
.mm-collapse-enter-active,
.mm-collapse-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.mm-collapse-enter-from,
.mm-collapse-leave-to { opacity: 0; transform: translateY(-6px); }

.mm-sheet-enter-active,
.mm-sheet-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.mm-sheet-enter-from,
.mm-sheet-leave-to { opacity: 0; transform: translateY(16px); }

.mm-sheet-full-enter-active,
.mm-sheet-full-leave-active { transition: transform 0.25s ease; }
.mm-sheet-full-enter-from,
.mm-sheet-full-leave-to { transform: translateY(100%); }
</style>