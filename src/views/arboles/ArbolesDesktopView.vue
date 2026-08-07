<!--
G.E.A. Frontend
Layout de escritorio de Árboles. Se monta únicamente cuando el ancho
de pantalla está en o sobre el breakpoint (ver ArbolesView.vue) — el
layout móvil ni siquiera se instancia cuando este componente está
activo.

Conectado a GET /api/v1/arboles/: búsqueda (?search=), filtros
exactos (?especie=, ?id_area=, ?estado=) y paginación estándar de DRF
(?page=, ?page_size=).
 -->

<template>
  <div class="arboles-main">
    <div class="arboles-desktop">
      <!-- Barra superior de búsqueda y filtros -->
      <div class="toolbar">
        <div class="search-group">
          <div class="search-box">
            <svg viewBox="0 0 24 24" class="icon-search" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              placeholder="Buscar árbol, especie o ubicación..."
              :value="filtros.search"
              @input="setSearch($event.target.value)"
              @keyup.enter="searchNow"
            />
          </div>
          <button class="btn-search" @click="searchNow">
            <svg viewBox="0 0 24 24" class="icon-sm" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Buscar
          </button>
        </div>

        <div class="filters-group">
          <div class="select-wrapper">
            <label>Especie</label>
            <select :value="filtros.especie" @change="setFiltro('especie', $event.target.value)">
              <option value="">Todas</option>
              <option v-for="e in especies" :key="e.id" :value="e.id">{{ e.nombre }}</option>
            </select>
          </div>
          <div class="select-wrapper">
            <label>Ubicación</label>
            <select :value="filtros.id_area" @change="setFiltro('id_area', $event.target.value)">
              <option value="">Todas</option>
              <option v-for="u in ubicaciones" :key="u.id" :value="u.id">{{ u.nombre }}</option>
            </select>
          </div>
          <div class="select-wrapper">
            <label>Estado</label>
            <select :value="filtros.estado" @change="setFiltro('estado', $event.target.value)">
              <option value="">Todos</option>
              <option v-for="estado in ESTADOS_ARBOL" :key="estado" :value="estado">{{ estado }}</option>
            </select>
          </div>
          <button class="btn-outline btn-filter" @click="limpiarFiltros" title="Limpiar filtros">
            <svg viewBox="0 0 24 24" class="icon-sm" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Limpiar
          </button>
        </div>
      </div>

      <!-- Resumen de totales -->
      <div class="summary-bar">
        <p>Total: {{ count }} árboles registrados</p>
        <button v-if="esAdministrativo" class="btn-primary" @click="abrirModalCrear" style="margin-left: auto;">+ Nuevo árbol</button>
      </div>

      <!-- Estados de carga y error -->
      <div v-if="loading" class="state-msg">Cargando árboles...</div>
      <div v-else-if="error" class="state-msg error-msg">{{ error }}</div>
      <div v-else-if="arboles.length === 0" class="state-msg">No se encontraron árboles con los filtros seleccionados.</div>

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
                <div class="severity-icon" :class="getSeverityColorClass(item.nivelNum)">
                  <svg v-if="item.nivelNum > 5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                  <svg v-else-if="item.nivelNum === null" viewBox="0 0 24 24" fill="currentColor"><path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                  <svg v-else-if="item.nivelNum === 0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  <svg v-else viewBox="0 0 24 24" fill="currentColor"><path d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.48 2.54l2.6 1.53c.56-1.24.88-2.62.88-4.07 0-5.18-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-5.06.5-9 4.76-9 9.95 0 5.52 4.47 10 9.99 10 3.31 0 6.24-1.61 8.06-4.09l-2.6-1.53C16.17 17.98 14.21 19 12 19z"/></svg>
                </div>
                <span class="font-semibold">{{ item.etiqueta }}</span>
                <span class="status-dot" :class="getSeverityBgClass(item.nivelNum)"></span>
              </div>
            </td>

            <!-- especie -->
            <td>
              <div class="double-text">
                <span class="primary-text">{{ item.especie_comun }}</span>
                <span class="secondary-text" v-if="item.especie_cientifica">({{ item.especie_cientifica }})</span>
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
                  <span class="infestation-badge" :class="getInfestationBadgeClass(item.nivelNum)">
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
                <button class="btn-icon" aria-label="Ver detalles" @click="abrirDetalle(item.id)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button v-if="esAdministrativo" class="btn-icon" aria-label="Editar árbol" @click="abrirModalEditar(item)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button v-if="esAdministrativo" class="btn-icon btn-icon-danger" aria-label="Eliminar árbol" @click="confirmarEliminar(item)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
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
          <select class="select-sm" :value="paginacion.pageSize" @change="setPageSize($event.target.value)">
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
          <span>por página</span>
        </div>
        <div class="pagination-right">
          <span class="pagination-info">
            Mostrando {{ rangoMostrado.desde }} a {{ rangoMostrado.hasta }} de {{ count }} árboles
          </span>
          <div class="pagination-controls">
            <button
              class="page-arrow"
              :disabled="paginacion.page <= 1"
              @click="irAPagina(paginacion.page - 1)"
            >&lt;</button>

            <button
              v-for="p in paginasVisibles"
              :key="p"
              class="page-num"
              :class="{ active: p === paginacion.page }"
              @click="irAPagina(p)"
            >{{ p }}</button>

            <button
              class="page-arrow"
              :disabled="paginacion.page >= totalPages"
              @click="irAPagina(paginacion.page + 1)"
            >&gt;</button>
          </div>
        </div>
      </div>

      </div>

      <!-- Modal: Detalle del árbol (vista completa) -->
      <Modal v-model="detalleAbierto" :persistent="false" :maxWidth="1100">
        <template #title>
          <div class="dm-title-row">
            <div class="dm-title-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2" width="20" height="20"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              <div>
                <h2 class="dm-heading">Detalles del árbol</h2>
                <p class="dm-breadcrumb">Mapa &gt; <strong>Detalles {{ detalleArbol?.etiqueta || '' }}</strong></p>
              </div>
            </div>
            <button class="dm-share-btn" type="button" @click="compartirDetalle" title="Compartir">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <path d="M8.59 13.51L15.42 17.49"/><path d="M15.41 6.51L8.59 10.49"/>
              </svg>
              Compartir
            </button>
          </div>
        </template>

        <div v-if="detalleLoading" class="state-msg">Cargando detalle...</div>
        <div v-else-if="detalleArbol" class="dm-content">
          <!-- Cuerpo principal: 2 columnas -->
          <div class="dm-body">
            <!-- Col izquierda: Imagen + Especie + Ubicación + Coordenadas -->
            <div class="dm-left">
              <div class="dm-image-wrap">
                <img v-if="detalleArbol.imagen1" :src="detalleArbol.imagen1" alt="Foto del árbol" class="dm-tree-img" />
                <div v-else class="dm-img-placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="64" height="64">
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
                  </svg>
                </div>
                <!-- Severity badge -->
                <div v-if="(detalleArbol.nivel_infestacion ?? 0) >= 7.5" class="dm-sev-badge dm-sev-red">
                  <svg viewBox="0 0 24 24" fill="white" width="22" height="22"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                </div>
                <div v-else-if="(detalleArbol.nivel_infestacion ?? 0) > 0" class="dm-sev-badge dm-sev-yellow">
                  <svg viewBox="0 0 24 24" fill="white" width="22" height="22"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                </div>
                <!-- Etiqueta -->
                <div class="dm-etiqueta">{{ detalleArbol.etiqueta }}</div>
              </div>

              <!-- Species info -->
              <div class="dm-info-section">
                <span class="dm-section-label">Especie</span>
                <h3 class="dm-species-name">{{ detalleArbol.especie_detail?.nombre || '—' }}</h3>
                <p class="dm-species-sci" v-if="detalleArbol.especie_detail?.nombre_cientifico">({{ detalleArbol.especie_detail.nombre_cientifico }})</p>
                <span class="dm-native-pill" v-if="detalleArbol.especie_detail?.nativa">Especie nativa</span>
              </div>

              <!-- Ubicación -->
              <div class="dm-info-section">
                <span class="dm-section-label">Ubicación</span>
                <p class="dm-info-value">{{ detalleArbol.ubicacion_detail?.nombre || '—' }}</p>
              </div>

              <!-- Coordenadas -->
              <div class="dm-info-section">
                <span class="dm-section-label">Coordenadas</span>
                <div class="dm-coords-row">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2" width="18" height="18"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span class="dm-coords-text">{{ detalleArbol.coordenadas || '—' }}</span>
                  <button class="dm-copy-btn" type="button" @click="copiarCoordenadasDetalle" title="Copiar coordenadas">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Col derecha: Hawksworth -->
            <div class="dm-right">
              <div class="dm-hawk-card">
                <h4 class="dm-hawk-title">Nivel de infestación (Hawksworth)</h4>
                <div class="dm-hawk-total" :class="dmHawkClass">
                  {{ detalleArbol.nivel_infestacion ?? 0 }} ({{ dmNivelLabel }})
                </div>
                <div class="dm-hawk-comps">
                  <div class="dm-hawk-comp">{{ detalleArbol.hawksworth1 != null ? detalleArbol.hawksworth1.toFixed(1) : '—' }}</div>
                  <div class="dm-hawk-comp">{{ detalleArbol.hawksworth2 != null ? detalleArbol.hawksworth2.toFixed(1) : '—' }}</div>
                  <div class="dm-hawk-comp">{{ detalleArbol.hawksworth3 != null ? detalleArbol.hawksworth3.toFixed(1) : '—' }}</div>
                </div>
                <!-- Leyenda -->
                <div class="dm-hawk-legend">
                  <h4 class="dm-hawk-legend-title">Nivel de infestación (Hawksworth)</h4>
                  <ul>
                    <li><span class="dm-ldot dm-ldot-green"></span> 0 - No visible</li>
                    <li><span class="dm-ldot dm-ldot-yellow"></span> 3.5 - Ligera</li>
                    <li><span class="dm-ldot dm-ldot-red"></span> 7.5 - Severa</li>
                    <li><span class="dm-ldot dm-ldot-gray"></span> Árbol muerto - estado crítico</li>
                    <li><span class="dm-ldot dm-ldot-blue"></span> En revisión</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Data grid -->
          <div class="dm-data-grid">
            <div class="dm-data-col">
              <div class="dm-data-row">
                <span class="dm-dot dm-dot-green"></span>
                <span class="dm-dlabel">ID del árbol</span>
                <span class="dm-dvalue">{{ detalleArbol.etiqueta }}</span>
              </div>
              <div class="dm-data-row">
                <span class="dm-dot dm-dot-green"></span>
                <span class="dm-dlabel">Fecha de registro</span>
                <span class="dm-dvalue">{{ dmFechaRegistro }}</span>
              </div>
              <div class="dm-data-row">
                <span class="dm-dot dm-dot-green"></span>
                <span class="dm-dlabel">Registrado por</span>
                <span class="dm-dvalue">{{ detalleArbol.registrado_por || '—' }}</span>
              </div>
              <div class="dm-data-row">
                <span class="dm-dot dm-dot-green"></span>
                <span class="dm-dlabel">Estado actual</span>
                <span class="dm-dvalue"><span class="dm-pill" :class="dmEstadoClass(detalleArbol.estado)">{{ detalleArbol.estado || '—' }}</span></span>
              </div>
            </div>
            <div class="dm-data-col">
              <div class="dm-data-row">
                <span class="dm-dot dm-dot-green"></span>
                <span class="dm-dlabel">Último reporte</span>
                <span class="dm-dvalue">{{ dmFechaReporte }}</span>
              </div>
              <div class="dm-data-row">
                <span class="dm-dot dm-dot-green"></span>
                <span class="dm-dlabel">Veces reportado</span>
                <span class="dm-dvalue">{{ detalleArbol.veces_reportado ?? 0 }}</span>
              </div>
              <div class="dm-data-row">
                <span class="dm-dot dm-dot-green"></span>
                <span class="dm-dlabel">Prioridad</span>
                <span class="dm-dvalue"><span class="dm-pill" :class="dmPrioridadClass(detalleArbol.prioridad)">{{ detalleArbol.prioridad || '—' }}</span></span>
              </div>
              <div class="dm-data-row">
                <span class="dm-dot dm-dot-green"></span>
                <span class="dm-dlabel">Observaciones</span>
                <span class="dm-dvalue dm-obs">{{ detalleArbol.observaciones || 'Sin observaciones' }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="dm-actions">
            <button class="dm-btn-saneado" type="button">Árbol saneado</button>
            <button class="dm-btn-editar" type="button" @click="cerrarDetalle">Editar datos</button>
          </div>

          <!-- Historial de reportes -->
          <div class="dm-history">
            <h4 class="dm-history-heading">Historial de reportes</h4>
            <table class="dm-history-table" v-if="detalleArbol.reportes?.length">
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
                <tr v-for="(rep, idx) in detalleArbol.reportes" :key="idx">
                  <td>{{ rep.fecha || '—' }}</td>
                  <td><span class="dm-nivel-color" :class="dmNivelClass(rep.nivel_infestacion)">{{ rep.nivel_infestacion != null ? `${rep.nivel_infestacion} (${dmNivelLabelFor(rep.nivel_infestacion)})` : '—' }}</span></td>
                  <td><span class="dm-pill-sm" :class="dmEstadoClass(rep.estado)">{{ rep.estado || '—' }}</span></td>
                  <td class="dm-obs-cell">{{ rep.observaciones || '—' }}</td>
                  <td>{{ rep.reportado_por || '—' }}</td>
                </tr>
              </tbody>
            </table>
            <p v-else class="dm-no-history">No hay reportes registrados para este árbol.</p>
          </div>
        </div>
        <div v-else class="state-msg">No se encontró el detalle del árbol.</div>
      </Modal>

      <!-- Modal: Crear / Editar árbol -->
      <Modal v-model="modalAbierto">
        <template #title>{{ editandoId ? 'Editar árbol' : 'Nuevo árbol' }}</template>

        <div class="modal-row">
          <div class="select-wrapper modal-field">
            <label>Etiqueta</label>
            <input type="text" v-model="form.etiqueta" required />
          </div>
          <div class="select-wrapper modal-field">
            <label>Especie</label>
            <select v-model="form.especie" required>
              <option value="" disabled>Selecciona una especie</option>
              <option v-for="e in especies" :key="e.id" :value="e.id">{{ e.nombre }}</option>
            </select>
          </div>
        </div>

        <div class="modal-row">
          <div class="select-wrapper modal-field">
            <label>Ubicación</label>
            <select v-model="form.id_area" required>
              <option value="" disabled>Selecciona una ubicación</option>
              <option v-for="u in ubicaciones" :key="u.id" :value="u.id">{{ u.nombre }}</option>
            </select>
          </div>
          <div class="select-wrapper modal-field">
            <label>Coordenadas</label>
            <input type="text" v-model="form.coordenadas" placeholder="Lat,Lng" />
          </div>
        </div>

        <div class="modal-row">
          <div class="select-wrapper modal-field">
            <label>Nivel de infestación</label>
            <input type="number" min="0" max="7.5" step="0.1" v-model.number="form.nivel_infestacion" />
          </div>
          <div class="select-wrapper modal-field">
            <label>Estado</label>
            <select v-model="form.estado" required>
              <option v-for="estado in ESTADOS_ARBOL" :key="estado" :value="estado">{{ estado }}</option>
            </select>
          </div>
        </div>

        <div class="modal-row">
          <div class="select-wrapper modal-field">
            <label>Fecha de reporte</label>
            <input type="date" v-model="form.fecha_reporte" required />
          </div>
        </div>

        <p v-if="modalError" class="state-msg error-msg modal-error">{{ modalError }}</p>

        <template #actions>
          <div class="modal-actions">
            <button type="button" class="btn-outline" @click="cerrarModal">Cancelar</button>
            <button type="button" class="btn-primary" @click="guardarArbol" :disabled="guardando">
              {{ guardando ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </template>
      </Modal>
    </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useArboles } from '@src/composables/useArboles';
import Modal from '@src/components/common/Modal.vue';
import { hasRole } from '@src/services/authService';

defineEmits(['ver-detalle']);

const {
  loading,
  error,
  arboles,
  count,
  especies,
  ubicaciones,
  detalleArbol,
  detalleLoading,
  ESTADOS_ARBOL,
  filtros,
  paginacion,
  totalPages,
  rangoMostrado,

  getSeverityColorClass,
  getSeverityBgClass,
  getInfestationBadgeClass,
  getStatusBadgeClass,

  fetchArboles,
  fetchArbolDetalle,
  crearArbol,
  editarArbol,
  eliminarArbol,
  setSearch,
  searchNow,
  setFiltro,
  limpiarFiltros,
  irAPagina,
  setPageSize,
} = useArboles();

const route = useRoute();
const esAdministrativo = computed(() => hasRole('admin', 'root'));

const modalAbierto = ref(false);
const detalleAbierto = ref(false);
const editandoId = ref(null);
const guardando = ref(false);
const modalError = ref('');

const form = reactive({
  etiqueta: '',
  especie: '',
  id_area: '',
  coordenadas: '',
  nivel_infestacion: 0,
  estado: 'Sano',
  fecha_reporte: new Date().toISOString().slice(0, 10),
});

const abrirModalCrear = () => {
  editandoId.value = null;
  form.etiqueta = '';
  form.especie = '';
  form.id_area = '';
  form.coordenadas = '';
  form.nivel_infestacion = 0;
  form.estado = 'Sano';
  form.fecha_reporte = new Date().toISOString().slice(0, 10);
  modalError.value = '';
  modalAbierto.value = true;
};

const abrirDetalle = async (id) => {
  const resultado = await fetchArbolDetalle(id);
  if (resultado.ok) {
    detalleAbierto.value = true;
  } else {
    window.alert(resultado.error);
  }
};

const cerrarDetalle = () => {
  detalleAbierto.value = false;
};

onMounted(() => {
  if (route.query.detalle) {
    abrirDetalle(route.query.detalle);
  }
});

const abrirModalEditar = (item) => {
  editandoId.value = item.id;
  form.etiqueta = item.etiqueta;
  form.especie = item.especie;
  form.id_area = item.id_area;
  form.coordenadas = item.coordenadas || '';
  form.nivel_infestacion = item.nivelNum ?? 0;
  form.estado = item.estado || 'Sano';
  form.fecha_reporte = item.fechaReporteRaw || new Date().toISOString().slice(0, 10);
  modalError.value = '';
  modalAbierto.value = true;
};

const cerrarModal = () => {
  modalAbierto.value = false;
  editandoId.value = null;
};

const guardarArbol = async () => {
  guardando.value = true;
  modalError.value = '';

  const payload = {
    etiqueta: form.etiqueta,
    especie: form.especie,
    id_area: form.id_area,
    coordenadas: form.coordenadas,
    nivel_infestacion: Number(form.nivel_infestacion),
    estado: form.estado,
    fecha_reporte: form.fecha_reporte,
  };

  const resultado = editandoId.value
    ? await editarArbol(editandoId.value, payload)
    : await crearArbol(payload);

  guardando.value = false;
  if (resultado.ok) {
    cerrarModal();
  } else {
    modalError.value = resultado.error;
  }
};

const confirmarEliminar = async (item) => {
  if (!window.confirm(`¿Eliminar el árbol ${item.etiqueta}? Esta acción no se puede deshacer.`)) return;
  const resultado = await eliminarArbol(item.id);
  if (!resultado.ok) {
    window.alert(resultado.error);
  }
};

// Ventana simple de páginas visibles alrededor de la página actual
const paginasVisibles = computed(() => {
  const total = totalPages.value;
  const actual = paginacion.page;
  const rango = 2;
  const inicio = Math.max(1, actual - rango);
  const fin = Math.min(total, actual + rango);
  const paginas = [];
  for (let i = inicio; i <= fin; i++) paginas.push(i);
  return paginas;
});

// --- Helpers para el modal de detalle rediseñado ---

const dmNivelLabelFor = (nivel) => {
  if (nivel === 0) return 'No visible';
  if (nivel < 3.5) return 'Ligera';
  if (nivel < 7.5) return 'Moderada';
  return 'Severa';
};

const dmNivelLabel = computed(() => {
  return dmNivelLabelFor(detalleArbol.value?.nivel_infestacion ?? 0);
});

const dmHawkClass = computed(() => {
  const n = detalleArbol.value?.nivel_infestacion ?? 0;
  if (n >= 7.5) return 'dm-hawk-red';
  if (n > 0) return 'dm-hawk-yellow';
  return 'dm-hawk-green';
});

const dmEstadoClass = (estado) => {
  if (estado === 'Sano' || estado === 'Saneado') return 'dm-pill-green';
  if (estado === 'Infestado') return 'dm-pill-red';
  if (estado === 'Limpieza') return 'dm-pill-blue';
  return 'dm-pill-gray';
};

const dmNivelClass = (nivel) => {
  if (nivel === null || nivel === undefined) return '';
  if (nivel >= 7.5) return 'dm-nivel-red';
  if (nivel > 0) return 'dm-nivel-yellow';
  return 'dm-nivel-green';
};

const compartirDetalle = async () => {
  if (!detalleArbol.value) return;
  const url = `${window.location.origin}/arboles/${detalleArbol.value.id}`;
  if (navigator.share) {
    await navigator.share({
      title: `Detalle ${detalleArbol.value.etiqueta}`,
      text: `Ver estado e información del árbol`,
      url,
    });
  } else {
    await navigator.clipboard.writeText(url);
    window.alert('Enlace copiado al portapapeles.');
  }
};

const copiarCoordenadasDetalle = async () => {
  if (!detalleArbol.value?.coordenadas) return;
  await navigator.clipboard.writeText(detalleArbol.value.coordenadas);
  window.alert('Coordenadas copiadas al portapapeles.');
};

// Formatea la fecha created_at (ISO datetime) al formato dd/mm/yyyy
const dmFechaRegistro = computed(() => {
  const raw = detalleArbol.value?.created_at;
  if (!raw) return '—';
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return raw;
  }
});

// Formatea la fecha_reporte (date string yyyy-mm-dd) al formato dd/mm/yyyy
const dmFechaReporte = computed(() => {
  const raw = detalleArbol.value?.fecha_reporte;
  if (!raw) return '—';
  const [y, m, d] = raw.split('-');
  if (!y || !m || !d) return raw;
  return `${d}/${m}/${y}`;
});

// Clase CSS para la pill de prioridad
const dmPrioridadClass = (prioridad) => {
  if (prioridad === 'Crítica') return 'dm-pill-red';
  if (prioridad === 'Alta') return 'dm-pill-red';
  if (prioridad === 'Media') return 'dm-pill-blue';
  if (prioridad === 'Baja') return 'dm-pill-green';
  return 'dm-pill-gray';
};
</script>

<style src="@src/assets/styles/arboles_view.css" scoped></style>

<style scoped>
/* ====== MODAL DE DETALLE REDISEÑADO ====== */

/* --- Title row --- */
.dm-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 1rem;
}
.dm-title-left {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}
.dm-heading {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
}
.dm-breadcrumb {
  margin: 0.1rem 0 0;
  font-size: 0.78rem;
  color: #64748b;
}
.dm-breadcrumb strong {
  color: #15803d;
}
.dm-share-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #15803d;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}
.dm-share-btn:hover { background: #166534; }

/* --- Content container --- */
.dm-content {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* --- Body 2 columns --- */
.dm-body {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 1.25rem;
  margin-bottom: 1rem;
}

/* --- Left column --- */
.dm-left {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}
.dm-image-wrap {
  position: relative;
  width: 100%;
  min-height: 280px;
  max-height: 340px;
  border-radius: 14px;
  overflow: hidden;
  background: #f0fdf4;
}
.dm-tree-img {
  width: 100%;
  height: 100%;
  min-height: 280px;
  max-height: 340px;
  object-fit: cover;
  display: block;
}
.dm-img-placeholder {
  width: 100%;
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #86efac;
}
.dm-sev-badge {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.25);
}
.dm-sev-red { background: #dc2626; }
.dm-sev-yellow { background: #eab308; }
.dm-etiqueta {
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  background: rgba(0,0,0,0.6);
  color: white;
  padding: 0.35rem 0.85rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

/* Species info */
.dm-section-label {
  display: block;
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 500;
  margin-bottom: 0.15rem;
}
.dm-species-name {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
}
.dm-species-sci {
  margin: 0.15rem 0 0;
  font-size: 0.88rem;
  color: #64748b;
  font-style: italic;
}
.dm-native-pill {
  display: inline-block;
  margin-top: 0.4rem;
  padding: 0.25rem 0.75rem;
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #bbf7d0;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
}
.dm-info-value {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
}
.dm-info-section {
  padding: 0;
}

/* Coordinates */
.dm-coords-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.85rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-top: 0.2rem;
}
.dm-coords-text {
  font-size: 0.88rem;
  color: #334155;
  font-weight: 500;
  flex: 1;
  font-variant-numeric: tabular-nums;
}
.dm-copy-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  border-radius: 4px;
  transition: color 0.15s;
}
.dm-copy-btn:hover { color: #334155; }

/* --- Right column: Hawksworth --- */
.dm-right {
  display: flex;
  flex-direction: column;
}
.dm-hawk-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  height: 100%;
}
.dm-hawk-title {
  margin: 0;
  font-size: 0.82rem;
  color: #334155;
  font-weight: 600;
}
.dm-hawk-total {
  text-align: center;
  padding: 0.85rem;
  border-radius: 12px;
  color: white;
  font-size: 1.25rem;
  font-weight: 800;
}
.dm-hawk-red { background: #dc2626; }
.dm-hawk-yellow { background: #eab308; }
.dm-hawk-green { background: #16a34a; }
.dm-hawk-comps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}
.dm-hawk-comp {
  text-align: center;
  padding: 0.65rem 0.4rem;
  border-radius: 10px;
  background: #1e293b;
  color: white;
  font-size: 1rem;
  font-weight: 700;
}
.dm-hawk-legend {
  border-top: 1px solid #e2e8f0;
  padding-top: 0.75rem;
  margin-top: 0.25rem;
}
.dm-hawk-legend-title {
  margin: 0 0 0.5rem;
  font-size: 0.75rem;
  color: #334155;
  font-weight: 600;
}
.dm-hawk-legend ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.dm-hawk-legend li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.78rem;
  color: #475569;
}
.dm-ldot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}
.dm-ldot-green { background: #16a34a; }
.dm-ldot-yellow { background: #eab308; }
.dm-ldot-red { background: #dc2626; }
.dm-ldot-gray { background: #94a3b8; }
.dm-ldot-blue { background: #3b82f6; }

/* --- Data grid --- */
.dm-data-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  margin-bottom: 1rem;
}
.dm-data-col:first-child {
  border-right: 1px solid #f1f5f9;
}
.dm-data-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.7rem 1rem;
  border-bottom: 1px solid #f8fafc;
  font-size: 0.85rem;
}
.dm-data-row:last-child { border-bottom: none; }
.dm-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dm-dot-green { background: #16a34a; }
.dm-dlabel {
  color: #64748b;
  font-weight: 500;
  white-space: nowrap;
}
.dm-dvalue {
  margin-left: auto;
  color: #0f172a;
  font-weight: 600;
  text-align: right;
}
.dm-obs {
  white-space: normal;
  max-width: 200px;
  line-height: 1.35;
  font-size: 0.8rem;
  font-weight: 500;
}
.dm-pill {
  display: inline-block;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}
.dm-pill-green { background: #dcfce7; color: #15803d; }
.dm-pill-red { background: #fee2e2; color: #dc2626; }
.dm-pill-blue { background: #dbeafe; color: #2563eb; }
.dm-pill-gray { background: #f1f5f9; color: #64748b; }

/* --- Actions --- */
.dm-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.dm-btn-saneado {
  padding: 0.8rem;
  background: #15803d;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.dm-btn-saneado:hover { background: #166534; }
.dm-btn-editar {
  padding: 0.75rem;
  background: white;
  color: #334155;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.dm-btn-editar:hover { background: #f8fafc; border-color: #94a3b8; }

/* --- History --- */
.dm-history {
  border-top: 1px solid #f1f5f9;
  padding-top: 1rem;
}
.dm-history-heading {
  margin: 0 0 0.75rem;
  font-size: 0.92rem;
  color: #0f172a;
  font-weight: 700;
}
.dm-history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
}
.dm-history-table th {
  text-align: left;
  padding: 0.6rem 0.75rem;
  color: #64748b;
  font-weight: 500;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}
.dm-history-table td {
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid #f8fafc;
  color: #334155;
  vertical-align: top;
}
.dm-nivel-color { font-weight: 700; }
.dm-nivel-red { color: #dc2626; }
.dm-nivel-yellow { color: #eab308; }
.dm-nivel-green { color: #16a34a; }
.dm-pill-sm {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
}
.dm-obs-cell {
  max-width: 250px;
  white-space: normal;
  line-height: 1.35;
}
.dm-no-history {
  color: #94a3b8;
  font-size: 0.85rem;
  text-align: center;
  padding: 1rem 0;
  margin: 0;
}
</style>