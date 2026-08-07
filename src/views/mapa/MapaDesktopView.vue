<!--
G.E.A. Frontend
Layout de escritorio del Mapa. Conectado a datos reales de la API.
Muestra un listado de árboles con filtros, panel de detalle lateral
y tarjetas de estadísticas.
-->

<template>
  <div class="map-main">
    <div class="map-desktop">
      <!-- Estado de Error (no oculta el layout: el usuario puede reintentar con "Refrescar") -->
      <div v-if="error" class="error-state">{{ error }}</div>

      <!-- CONTENIDO DEL MAPA DESKTOP LAYOUT: siempre montado. El mapa de OpenLayers
           se inicializa una sola vez en onMounted() y NUNCA se desmonta por culpa
           de `loading`, para evitar la condición de carrera que dejaba `map` en
           null y el mapa en blanco hasta recargar la página. -->

        <!--BARRA SUPERIOR (Búsqueda y Filtros)-->
        <div class="toolbar">
          <div class="search-group">
            <div class="search-box">
              <svg viewBox="0 0 24 24" class="icon-search" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" placeholder="Buscar árbol o ubicación..." v-model="searchQuery" />
            </div>
            <button class="btn-add" aria-label="Refrescar datos" @click="refrescar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            </button>
          </div>

          <div class="filters-group">
            <div class="select-wrapper">
              <label>Filtrar por especie</label>
              <select v-model="filtroEspecie">
                <option value="">Todas</option>
                <option v-for="nombre in especiesUnicas" :key="nombre" :value="nombre">{{ nombre }}</option>
              </select>
            </div>
            <div class="select-wrapper">
              <label>Nivel de infestación</label>
              <select v-model="filtroNivel">
                <option value="">Todos</option>
                <option value="sano">No visible (0)</option>
                <option value="ligera">Ligera (0.1 - 7.4)</option>
                <option value="severa">Severa (7.5)</option>
              </select>
            </div>
            <div class="select-wrapper">
              <label>Estado</label>
              <select v-model="filtroEstado">
                <option value="">Todos</option>
                <option value="Sano">Sano</option>
                <option value="Infestado">Infestado</option>
                <option value="Limpieza">Limpieza</option>
                <option value="Saneado">Saneado</option>
              </select>
            </div>
          </div>
        </div>

        <!-- CONTENIDO PRINCIPAL (Mapa + panel de detalle opcional) -->
        <div class="main-layout" :class="{ 'panel-open': arbolSeleccionado }">

          <!-- MAPA INTERACTIVO (OpenLayers) -->
          <div class="map-container">
            <!-- Aquí monta OpenLayers el mapa real -->
            <div ref="mapEl" class="ol-map-el"></div>

            <!-- Overlay de carga de datos: ya NO desmonta el mapa, solo se
                 superpone mientras cargarDatos() está en curso. -->
            <div v-if="loading" class="map-loading-overlay">Cargando datos...</div>

            <!-- Selector de tipo de vista -->
            <div class="map-layers-switcher">
              <button
                v-for="capa in capasBase"
                :key="capa.id"
                type="button"
                class="layer-btn"
                :class="{ 'layer-btn-active': capaActiva === capa.id }"
                @click="cambiarCapa(capa.id)"
              >
                {{ capa.titulo }}
              </button>
            </div>

            <!-- Controles de zoom / recentrado -->
            <div class="map-controls">
              <button class="map-btn" aria-label="Acercar" @click="acercar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <button class="map-btn mt-small" aria-label="Alejar" @click="alejar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <button class="map-btn mt-small" aria-label="Centrar en el campus" @click="centrarMapa">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
              </button>
            </div>

            <!-- Tooltip flotante sobre el árbol bajo el cursor -->
            <div ref="tooltipEl" class="map-tooltip"></div>

            <!-- Leyenda del mapa -->
            <div class="map-legend">
              <h4>Nivel de infestación (Hawksworth)</h4>
              <ul>
                <li><span class="legend-icon text-green"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8"/></svg></span> 0 - No visible</li>
                <li><span class="legend-icon text-yellow"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8"/></svg></span> 3.5 - Ligera</li>
                <li><span class="legend-icon text-red"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg></span> 7.5 - Severa</li>
              </ul>
            </div>
          </div>

          <div class="details-panel" v-if="arbolSeleccionado">
            <!-- Header del panel -->
            <header class="dp-header">
              <div class="dp-header-left">
                <div class="dp-breadcrumb">Mapa &gt; <strong>Detalles {{ arbolSeleccionado.etiqueta }}</strong></div>
              </div>
              <div class="dp-header-right">
                <button class="dp-share-btn" type="button" @click="compartirArbol" title="Compartir">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                    <path d="M8.59 13.51L15.42 17.49" /><path d="M15.41 6.51L8.59 10.49" />
                  </svg>
                  Compartir
                </button>
                <button class="dp-close-btn" type="button" @click="deseleccionarArbol" title="Cerrar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </header>

            <!-- Cuerpo principal: 2 columnas -->
            <div class="dp-body">
              <!-- Columna izquierda: Imagen + info especie -->
              <div class="dp-left-col">
                <div class="dp-image-wrap">
                  <img v-if="arbolSeleccionado?.imagenes?.length" :src="arbolSeleccionado.imagenes[0]" alt="Foto del árbol" class="dp-tree-img" />
                  <div v-else class="dp-img-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="64" height="64">
                      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
                      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
                    </svg>
                  </div>
                  <!-- Badge de severidad en la imagen -->
                  <div v-if="arbolSeleccionado?.nivel_num >= 7.5" class="dp-severity-badge dp-severity-red">
                    <svg viewBox="0 0 24 24" fill="white" width="18" height="18"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                  </div>
                  <div v-else-if="arbolSeleccionado?.nivel_num > 0" class="dp-severity-badge dp-severity-yellow">
                    <svg viewBox="0 0 24 24" fill="white" width="18" height="18"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                  </div>
                  <!-- Etiqueta del árbol -->
                  <div class="dp-etiqueta-badge">{{ arbolSeleccionado.etiqueta }}</div>
                </div>

                <!-- Info de especie -->
                <div class="dp-species-info">
                  <div class="dp-species-label">Especie</div>
                  <h3 class="dp-species-name">{{ arbolSeleccionado.especie_comun }}</h3>
                  <p class="dp-species-sci" v-if="arbolSeleccionado.especie_cientifica">({{ arbolSeleccionado.especie_cientifica }})</p>
                  <span class="dp-native-badge" v-if="arbolSeleccionado.nativa">Especie nativa</span>
                </div>

                <!-- Ubicación -->
                <div class="dp-location-block">
                  <div class="dp-species-label">Ubicación</div>
                  <p class="dp-location-value">{{ arbolSeleccionado.ubicacion }}</p>
                </div>

                <!-- Coordenadas -->
                <div class="dp-coords-block">
                  <div class="dp-species-label">Coordenadas</div>
                  <div class="dp-coords-row">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2" width="16" height="16"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span class="dp-coords-text">{{ arbolSeleccionado.coordenadas }}</span>
                    <button class="dp-copy-btn" type="button" @click="copiarCoordenadas" title="Copiar coordenadas">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Columna derecha: Hawksworth -->
              <div class="dp-right-col">
                <div class="dp-hawk-card">
                  <h4 class="dp-hawk-title">Nivel de infestación (Hawksworth)</h4>
                  <!-- Nivel total grande -->
                  <div class="dp-hawk-total" :class="hawkTotalClass">
                    {{ arbolSeleccionado.nivel_num }} ({{ arbolSeleccionado.nivel_label }})
                  </div>
                  <!-- 3 componentes -->
                  <div class="dp-hawk-components">
                    <div class="dp-hawk-comp" v-for="(val, i) in arbolSeleccionado.hawksworth" :key="i">
                      {{ val !== null ? val : '—' }}
                    </div>
                  </div>
                  <!-- Leyenda -->
                  <div class="dp-hawk-legend">
                    <h4 class="dp-hawk-legend-title">Nivel de infestación (Hawksworth)</h4>
                    <ul>
                      <li><span class="dp-legend-dot dp-dot-green"></span> 0 - No visible</li>
                      <li><span class="dp-legend-dot dp-dot-yellow"></span> 3.5 - Ligera</li>
                      <li><span class="dp-legend-dot dp-dot-red"></span> 7.5 - Severa</li>
                      <li><span class="dp-legend-dot dp-dot-gray"></span> Árbol muerto - estado crítico</li>
                      <li><span class="dp-legend-dot dp-dot-blue"></span> En revisión</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <!-- Grid de datos del árbol -->
            <div class="dp-data-grid">
              <div class="dp-data-left">
                <div class="dp-data-row">
                  <span class="dp-dot-indicator dp-dot-green"></span>
                  <span class="dp-data-label">ID del árbol</span>
                  <span class="dp-data-value">{{ arbolSeleccionado.etiqueta }}</span>
                </div>
                <div class="dp-data-row">
                  <span class="dp-dot-indicator dp-dot-green"></span>
                  <span class="dp-data-label">Fecha de registro</span>
                  <span class="dp-data-value">{{ arbolSeleccionado.fecha_registro }}</span>
                </div>
                <div class="dp-data-row">
                  <span class="dp-dot-indicator dp-dot-green"></span>
                  <span class="dp-data-label">Registrado por</span>
                  <span class="dp-data-value">{{ arbolSeleccionado.registrado_por }}</span>
                </div>
                <div class="dp-data-row">
                  <span class="dp-dot-indicator dp-dot-green"></span>
                  <span class="dp-data-label">Estado actual</span>
                  <span class="dp-data-value">
                    <span class="dp-estado-pill" :class="getEstadoBadgeClass(arbolSeleccionado.estado)">{{ arbolSeleccionado.estado }}</span>
                  </span>
                </div>
              </div>
              <div class="dp-data-right">
                <div class="dp-data-row">
                  <span class="dp-dot-indicator dp-dot-green"></span>
                  <span class="dp-data-label">Último reporte</span>
                  <span class="dp-data-value">{{ arbolSeleccionado.ultimo_reporte }}</span>
                </div>
                <div class="dp-data-row">
                  <span class="dp-dot-indicator dp-dot-green"></span>
                  <span class="dp-data-label">Veces reportado</span>
                  <span class="dp-data-value">{{ arbolSeleccionado.veces_reportado }}</span>
                </div>
                <div class="dp-data-row">
                  <span class="dp-dot-indicator dp-dot-green"></span>
                  <span class="dp-data-label">Prioridad</span>
                  <span class="dp-data-value">
                    <span class="dp-estado-pill" :class="getEstadoBadgeClass(arbolSeleccionado.prioridad)">{{ arbolSeleccionado.prioridad }}</span>
                  </span>
                </div>
                <div class="dp-data-row">
                  <span class="dp-dot-indicator dp-dot-green"></span>
                  <span class="dp-data-label">Observaciones</span>
                  <span class="dp-data-value dp-obs-text">{{ arbolSeleccionado.observaciones }}</span>
                </div>
              </div>
            </div>

            <!-- Acciones -->
            <div class="dp-actions">
              <button class="dp-btn-saneado" type="button">Árbol saneado</button>
              <button class="dp-btn-editar" type="button" v-if="arbolSeleccionado?.uuid" @click="irADetalle">Editar datos</button>
            </div>

            <!-- Historial de reportes -->
            <div class="dp-history" v-if="arbolSeleccionado.reportes?.length">
              <h4 class="dp-history-title">Historial de reportes</h4>
              <table class="dp-history-table">
                <thead>
                  <tr>
                    <th>Fecha y hora</th>
                    <th>Nivel de infestación</th>
                    <th>Estado</th>
                    <th>Observaciones</th>
                    <th>Reportado por</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(rep, idx) in arbolSeleccionado.reportes" :key="idx">
                    <td>{{ rep.fecha || '—' }}</td>
                    <td><span class="dp-nivel-inline" :class="getReporteNivelClass(rep.nivel_infestacion)">{{ rep.nivel_infestacion ?? '—' }}</span></td>
                    <td><span class="dp-estado-inline" :class="getEstadoBadgeClass(rep.estado)">{{ rep.estado || '—' }}</span></td>
                    <td>{{ rep.observaciones || '—' }}</td>
                    <td>{{ rep.reportado_por || '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <!--TARJETAS INFERIORES DE ESTADÍSTICAS -->
        <div class="stats-row" v-if="!loading">
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
              <p class="stat-label">Reportes totales</p>
              <h4 class="stat-value">{{ estadisticas.reportesNuevos }}</h4>
            </div>
          </div>

          <!-- Card 3 -->
          <div class="stat-card bg-light-red-card border-card-red">
            <div class="stat-icon-wrapper bg-icon-red text-red">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            </div>
            <div class="stat-text">
              <p class="stat-label">Árboles infestados</p>
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
  detalleLoading,
  estadisticas,
  especiesUnicas,
  searchQuery,
  filtroEspecie,
  filtroNivel,
  filtroEstado,
  getNivelColorClass,
  getEstadoBadgeClass,
  seleccionarArbol,
  deseleccionarArbol,
  limpiarFiltros,
  refrescar,
} = useMapa();

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

const hawkTotalClass = computed(() => {
  const n = arbolSeleccionado.value?.nivel_num ?? 0;
  if (n >= 7.5) return 'dp-hawk-red';
  if (n > 0) return 'dp-hawk-yellow';
  return 'dp-hawk-green';
});

const getReporteNivelClass = (nivel) => {
  if (nivel === null || nivel === undefined) return '';
  if (nivel >= 7.5) return 'dp-nivel-red';
  if (nivel > 0) return 'dp-nivel-yellow';
  return 'dp-nivel-green';
};

/* ===================== MAPA (OpenLayers) ===================== */

// Polígono del campus, en orden SO -> SE -> NE -> NO.
// OJO: OpenLayers usa [lon, lat] (x, y), al revés que Leaflet.
const CAMPUS_POLIGONO_LONLAT = [
  [-99.347131, 20.007539], // Suroeste
  [-99.343406, 20.007436], // Sureste
  [-99.342308, 20.010539], // Noreste
  [-99.346731, 20.010981], // Noroeste
];
const CAMPUS_MERCATOR = CAMPUS_POLIGONO_LONLAT.map((c) => fromLonLat(c));
const CAMPUS_EXTENT = boundingExtent(CAMPUS_MERCATOR);

// Mismos umbrales que getNivelColorClass del composable, en hex, para el estilo del marcador
function colorPorNivel(nivel) {
  if (nivel >= 7.5) return '#dc2626'; // rojo — severa
  if (nivel > 0) return '#eab308'; // amarillo — ligera/moderada
  return '#16a34a'; // verde — no visible / sano
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

// --- Capas base (selector de tipo de vista) ---
const capaSatelital = new TileLayer({
  source: new TileArcGISRest({
    // El servicio ArcGIS REST maneja mejor las teselas de World Imagery que un XYZ manual,
    // lo que evita los tiles con el texto de "Data not available yet" en ciertos zooms.
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

// --- Polígono visible del campus ---
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

// --- Marcadores de árboles ---
const fuenteMarcadores = new VectorSource();
const capaMarcadores = new VectorLayer({ source: fuenteMarcadores });
const marcadoresPorEtiqueta = new Map();

function pintarMarcadores() {
  fuenteMarcadores.clear();
  marcadoresPorEtiqueta.clear();

  arbolesFiltrados.value.forEach((arbol) => {
    const coords = parseCoordenadas(arbol.coordenadas || arbol.id_area__coordenadas);
    if (!coords) return; // árbol sin coordenadas parseables: se omite del mapa

    const [lat, lng] = coords; // parseCoordenadas devuelve [lat, lng]
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

// Ajusta el tamaño del mapa sin modificar la vista actual del usuario.
function ajustarTamanoMapa() {
  if (!map) return;
  map.updateSize();
}

function initMap() {
  if (map || !mapEl.value) return;

  const vista = new View({
    center: getCenter(CAMPUS_EXTENT),
    zoom: 18,
    extent: CAMPUS_EXTENT,
    // constrainOnlyCenter: true → solo el CENTRO de la vista queda atado al
    // campus; el viewport sí puede mostrar área más grande al alejar zoom.
    // Con `false` (como estaba antes) OpenLayers no deja alejar más allá del
    // encaje exacto del polígono, sin importar minZoom.
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
    offset: [14, 0],
    positioning: 'center-left',
    stopEvent: false,
  });
  map.addOverlay(overlayTooltip);

  // Clic en un marcador -> abre el panel de detalle vía seleccionarArbol()
  map.on('click', (evt) => {
    const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f, {
      layerFilter: (capa) => capa === capaMarcadores,
      hitTolerance: 6,
    });
    if (feature) seleccionarArbol(feature.get('arbol'));
  });

  // Hover -> tooltip flotante + cursor pointer sobre los marcadores
  map.on('pointermove', (evt) => {
    if (evt.dragging) return;
    const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f, {
      layerFilter: (capa) => capa === capaMarcadores,
      hitTolerance: 6,
    });

    map.getTargetElement().style.cursor = feature ? 'pointer' : '';

    if (feature) {
      const arbol = feature.get('arbol');
      tooltipEl.value.textContent = `${arbol.etiqueta} · ${arbol.especie__nombre || '—'}`;
      tooltipEl.value.style.display = 'block';
      overlayTooltip.setPosition(evt.coordinate);
    } else {
      tooltipEl.value.style.display = 'none';
    }
  });

  // Ajuste inicial + cada vez que el contenedor cambie de tamaño de verdad.
  // No se vuelve a centrar el mapa, solo se actualiza el canvas.
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
  if (map) {
    map.setTarget(null);
    map = null;
  }
  overlayTooltip = null;
  marcadoresPorEtiqueta.clear();
}

// El contenedor del mapa (mapEl) ahora está SIEMPRE en el DOM (ver template:
// ya no se desmonta según `loading`/`error`), así que el mapa de OpenLayers
// se inicializa una única vez, apenas se monta el componente. Antes esto
// dependía de un watch sobre un computed `mapaListo` ligado a `loading`,
// lo que generaba una condición de carrera con cargarDatos() (llamado en
// el onMounted del composable useMapa): loading pasaba a true justo después
// del montaje, el contenedor se desmontaba, y dependiendo del timing de la
// respuesta de la API, `initMap()` podía terminar ejecutándose cuando
// `mapEl.value` todavía no existía, dejando `map` en null para siempre
// (mapa en blanco, sin tiles, sin marcadores, y los botones de capa sin
// efecto porque no había ningún Map real al que aplicarles setVisible()).
onMounted(async () => {
  await nextTick();
  initMap();
});

// Redibuja los marcadores cuando cambian los filtros / búsqueda
watch(arbolesFiltrados, () => {
  if (map) pintarMarcadores();
});

// Resalta el marcador del árbol seleccionado sin modificar la vista del usuario.
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
    }
  }
});

const acercar = () => {
  if (!map) return;
  const vista = map.getView();
  vista.animate({ zoom: (vista.getZoom() ?? 18) + 1, duration: 200 });
};
const alejar = () => {
  if (!map) return;
  const vista = map.getView();
  vista.animate({ zoom: (vista.getZoom() ?? 18) - 1, duration: 200 });
};
const centrarMapa = () => {
  if (!map) return;
  map.getView().fit(CAMPUS_EXTENT, { size: map.getSize(), padding: [8, 8, 8, 8], duration: 300 });
};

onBeforeUnmount(destruirMapa);
</script>

<style src="@src/assets/styles/mapa_view.css" scoped></style>

<style scoped>
/* ====== PANEL DE DETALLE REDISEÑADO ====== */

/* --- Layout overrides --- */
.main-layout {
  grid-template-columns: 1fr;
}
.main-layout.panel-open {
  grid-template-columns: 1fr 480px;
}

/* --- Panel container --- */
.details-panel {
  background: white;
  border: 1px solid var(--map-border, #e2e8f0);
  border-radius: 14px;
  padding: 0;
  display: flex;
  flex-direction: column;
  min-height: 550px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow-y: auto;
  max-height: calc(100vh - 200px);
}

/* --- Header --- */
.dp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  position: sticky;
  top: 0;
  background: white;
  z-index: 2;
  border-radius: 14px 14px 0 0;
}
.dp-breadcrumb {
  font-size: 0.82rem;
  color: #64748b;
}
.dp-breadcrumb strong {
  color: #15803d;
}
.dp-header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.dp-share-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #15803d;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.45rem 0.85rem;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.dp-share-btn:hover { background: #166534; }
.dp-close-btn {
  background: transparent;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.35rem;
  cursor: pointer;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.dp-close-btn:hover { background: #f8fafc; }

/* --- Body 2 columns --- */
.dp-body {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 1rem;
  padding: 1rem 1.25rem;
}

/* --- Left column: Image + Species --- */
.dp-left-col {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.dp-image-wrap {
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  background: #f0fdf4;
}
.dp-tree-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.dp-img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #86efac;
}
.dp-severity-badge {
  position: absolute;
  top: 0.6rem;
  left: 0.6rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}
.dp-severity-red { background: #dc2626; }
.dp-severity-yellow { background: #eab308; }
.dp-etiqueta-badge {
  position: absolute;
  bottom: 0.6rem;
  right: 0.6rem;
  background: rgba(0,0,0,0.65);
  color: white;
  padding: 0.3rem 0.7rem;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

/* Species info */
.dp-species-label {
  font-size: 0.72rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 500;
  margin-bottom: 0.15rem;
}
.dp-species-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
}
.dp-species-sci {
  margin: 0.1rem 0 0;
  font-size: 0.82rem;
  color: #64748b;
  font-style: italic;
}
.dp-native-badge {
  display: inline-block;
  margin-top: 0.35rem;
  padding: 0.2rem 0.65rem;
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #bbf7d0;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
}
.dp-location-value {
  margin: 0;
  font-size: 0.88rem;
  font-weight: 600;
  color: #0f172a;
}

/* Coordinates */
.dp-coords-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.7rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  margin-top: 0.2rem;
}
.dp-coords-text {
  font-size: 0.82rem;
  color: #334155;
  font-weight: 500;
  flex: 1;
  font-variant-numeric: tabular-nums;
}
.dp-copy-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  padding: 0.2rem;
  display: flex;
  align-items: center;
  border-radius: 4px;
  transition: color 0.15s;
}
.dp-copy-btn:hover { color: #334155; }

/* --- Right column: Hawksworth --- */
.dp-right-col {
  display: flex;
  flex-direction: column;
}
.dp-hawk-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}
.dp-hawk-title {
  margin: 0;
  font-size: 0.78rem;
  color: #334155;
  font-weight: 600;
}
.dp-hawk-total {
  text-align: center;
  padding: 0.75rem;
  border-radius: 10px;
  color: white;
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 0.01em;
}
.dp-hawk-red { background: #dc2626; }
.dp-hawk-yellow { background: #eab308; }
.dp-hawk-green { background: #16a34a; }
.dp-hawk-components {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.4rem;
}
.dp-hawk-comp {
  text-align: center;
  padding: 0.55rem 0.3rem;
  border-radius: 8px;
  background: #1e293b;
  color: white;
  font-size: 0.9rem;
  font-weight: 700;
}
.dp-hawk-legend {
  border-top: 1px solid #e2e8f0;
  padding-top: 0.6rem;
  margin-top: 0.2rem;
}
.dp-hawk-legend-title {
  margin: 0 0 0.45rem;
  font-size: 0.72rem;
  color: #334155;
  font-weight: 600;
}
.dp-hawk-legend ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.dp-hawk-legend li {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.72rem;
  color: #475569;
}

/* Legend dots (reusable) */
.dp-legend-dot, .dp-dot-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}
.dp-dot-green { background: #16a34a; }
.dp-dot-yellow { background: #eab308; }
.dp-dot-red { background: #dc2626; }
.dp-dot-gray { background: #94a3b8; }
.dp-dot-blue { background: #3b82f6; }

/* --- Data grid --- */
.dp-data-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  padding: 0 1.25rem;
  border-top: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
}
.dp-data-left {
  border-right: 1px solid #f1f5f9;
}
.dp-data-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid #f8fafc;
  font-size: 0.8rem;
}
.dp-data-row:last-child { border-bottom: none; }
.dp-data-label {
  color: #64748b;
  font-weight: 500;
  white-space: nowrap;
}
.dp-data-value {
  margin-left: auto;
  color: #0f172a;
  font-weight: 600;
  text-align: right;
  font-size: 0.8rem;
}
.dp-obs-text {
  white-space: normal;
  max-width: 140px;
  line-height: 1.3;
  font-size: 0.75rem;
  font-weight: 500;
}
.dp-estado-pill {
  display: inline-block;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  white-space: nowrap;
}
.badge-green { background: #dcfce7; color: #15803d; }
.badge-red { background: #fee2e2; color: #dc2626; }
.badge-blue { background: #dbeafe; color: #2563eb; }
.badge-gray { background: #f1f5f9; color: #64748b; }

/* --- Actions --- */
.dp-actions {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 0.85rem 1.25rem;
}
.dp-btn-saneado {
  width: 100%;
  padding: 0.75rem;
  background: #15803d;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.dp-btn-saneado:hover { background: #166534; }
.dp-btn-editar {
  width: 100%;
  padding: 0.7rem;
  background: white;
  color: #334155;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.dp-btn-editar:hover { background: #f8fafc; border-color: #94a3b8; }

/* --- History table --- */
.dp-history {
  padding: 0.85rem 1.25rem 1.25rem;
  border-top: 1px solid #f1f5f9;
}
.dp-history-title {
  margin: 0 0 0.65rem;
  font-size: 0.85rem;
  color: #0f172a;
  font-weight: 700;
}
.dp-history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.75rem;
}
.dp-history-table th {
  text-align: left;
  padding: 0.5rem 0.6rem;
  color: #64748b;
  font-weight: 500;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}
.dp-history-table td {
  padding: 0.5rem 0.6rem;
  border-bottom: 1px solid #f8fafc;
  color: #334155;
  vertical-align: top;
}
.dp-nivel-inline {
  font-weight: 700;
}
.dp-nivel-red { color: #dc2626; }
.dp-nivel-yellow { color: #eab308; }
.dp-nivel-green { color: #16a34a; }
.dp-estado-inline {
  font-size: 0.72rem;
  font-weight: 600;
}

/* --- Responsive: squeeze panel on smaller screens --- */
@media (max-width: 1100px) {
  .main-layout.panel-open {
    grid-template-columns: 1fr 380px;
  }
  .dp-body {
    grid-template-columns: 1fr;
  }
}

/* --- Legacy overrides (keep map loading overlay) --- */
.map-loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.35);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 500;
  pointer-events: none;
}
</style>