<template>
  <section class="reports-wrapper">

    <!-- Barra superior de acciones y filtros -->
    <div class="toolbar">
      <div class="filters-bar">
        <div class="filters-left">
          <div class="search-box">
            <svg viewBox="0 0 24 24" class="icon-search" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Buscar por etiqueta u observaciones" v-model="search" />
          </div>

          <div class="filter-group">
            <div class="select-wrapper" v-if="puedeGestionar">
              <label>Reportes</label>
              <select v-model="soloMisReportes">
                <option :value="false">Todos</option>
                <option :value="true">Propios</option>
              </select>
            </div>
            <div class="select-wrapper">
              <label>Filtrar por especie</label>
              <select v-model="especieFiltro">
                <option value="">Todas</option>
                <option v-for="nombre in especiesDisponibles" :key="nombre" :value="nombre">{{ nombre }}</option>
              </select>
            </div>
            <div class="select-wrapper">
              <label>Nivel de Infestación</label>
              <select v-model="nivelFiltro">
                <option value="">Todos</option>
                <option value="no_visible">No visible (0)</option>
                <option value="ligera">Ligera (0.1 - 7.4)</option>
                <option value="severa">Severa (7.5)</option>
              </select>
            </div>
            <div class="select-wrapper">
              <label>Estado</label>
              <select v-model="estadoFiltro">
                <option value="">Todos</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Aceptada">Aceptada</option>
                <option value="Rechazada">Rechazada</option>
              </select>
            </div>
            <button class="btn-outline" @click="limpiarFiltros">Limpiar filtros</button>
          </div>
        </div>

        <button class="btn-primary" @click="onNuevoReporte">
          <svg viewBox="0 0 24 24" class="icon-sm" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nuevo reporte
        </button>
      </div>

      <p v-if="usaFiltroLocal" class="filter-local-note">
        El filtro de especie/nivel se aplica sobre los primeros 100 resultados (el backend no soporta filtrarlos directamente).
      </p>
    </div>

    <!-- Estados de carga y error -->
    <div v-if="loading" class="state-msg">Cargando reportes...</div>
    <div v-else-if="error" class="state-msg error-msg">{{ error }}</div>
    <div v-else-if="reportes.length === 0" class="state-msg">No hay reportes que coincidan con los filtros.</div>

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

        <!-- Contenido principal (solo lo esencial; el resto vive en el modal de detalle) -->
        <div class="card-grid">
          <!-- Info Principal -->
          <div class="grid-col">
            <h3 class="tree-name">{{ item.nombre }}</h3>
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

          <!-- Infestación y Fecha -->
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

          <!-- Reportador -->
          <div class="grid-col">
            <div class="data-group">
              <label>Reportado por</label>
              <p class="font-medium">{{ item.reportado_por }}</p>
            </div>
          </div>
        </div>

        <div class="card-actions">
          <button class="btn-action-primary" @click="abrirDetalle(item.id)">
            Ver detalles
          </button>
          <button
              v-if="puedeGestionar"
              class="btn-action-danger"
              :disabled="eliminandoId === item.id"
              @click="onEliminar(item.id)"
          >
            {{ eliminandoId === item.id ? 'Eliminando...' : 'Eliminar' }}
          </button>
          <button class="btn-action-secondary" :class="getActionBadgeClass(item.action_status)">
            {{ item.action_status }}
          </button>
        </div>
      </div>
    </div>

    <p v-if="eliminarError" class="state-msg error-msg">{{ eliminarError }}</p>

    <!-- Paginación -->
    <div class="pagination-footer">
      <span class="pagination-info">{{ paginationLabel }}</span>
      <div class="pagination-controls" v-if="!usaFiltroLocal">
        <button class="page-arrow" :disabled="page === 1" @click="irAPagina(page - 1)">&lt;</button>
        <button
            v-for="p in pageNumbers"
            :key="p"
            class="page-num"
            :class="{ active: p === page }"
            @click="irAPagina(p)"
        >
          {{ p }}
        </button>
        <button class="page-arrow" :disabled="page === totalPages" @click="irAPagina(page + 1)">&gt;</button>
      </div>
    </div>

    <!-- Modal: Ver detalles (incluye aceptar/rechazar para Administrativo/Root) -->
    <Modal v-model="detalleAbierto" :persistent="false">
      <template #title>
        <h2>Detalle del reporte</h2>
      </template>

      <template v-slot:default>
        <div class="modal-body rd-body">
          <div v-if="detalleLoadingActual" class="state-msg">Cargando detalle...</div>

          <template v-else-if="detalleActual">
            <p v-if="revisarError" class="state-msg error-msg">{{ revisarError }}</p>

            <div class="rd-grid">
              <!-- Columna 1: Evidencia fotográfica -->
              <div class="rd-photo-col">
                <div class="rd-photo" :class="{ 'rd-photo-empty': !detalleActual.imagenes.length }">
                  <span
                    v-if="detalleActual.nivelNum !== null && detalleActual.nivelNum >= 7.5"
                    class="rd-alert-badge"
                    title="Nivel severo"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                  </span>

                  <a v-if="detalleActual.imagenes.length" :href="detalleActual.imagenes[0]" target="_blank" rel="noopener">
                    <img :src="detalleActual.imagenes[0]" alt="Evidencia principal" />
                  </a>
                  <div v-else class="rd-photo-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <circle cx="9" cy="11" r="2" />
                      <path d="M21 16l-5.2-5.2a2 2 0 0 0-2.8 0L5 19" />
                    </svg>
                    <span>Sin evidencia fotográfica</span>
                  </div>

                  <span class="rd-photo-tag">REPORTE-{{ detalleActual.id }}</span>
                </div>

                <div v-if="detalleActual.imagenes.length > 1" class="rd-thumbs">
                  <a
                    v-for="(img, idx) in detalleActual.imagenes.slice(1)"
                    :key="idx"
                    :href="img"
                    target="_blank"
                    rel="noopener"
                    class="rd-thumb-link"
                  >
                    <img :src="img" :alt="`Imagen ${idx + 2}`" />
                  </a>
                </div>
              </div>

              <!-- Columna 2: Datos del árbol / ubicación -->
              <div class="rd-info-col">
                <div class="rd-field-group">
                  <label>Especie</label>
                  <p class="rd-field-main">{{ detalleActual.especie }}</p>
                  <div class="rd-tag-row">
                    <span v-if="detalleActual.especieCientifica !== '—'" class="rd-sci-name">{{ detalleActual.especieCientifica }}</span>
                    <span v-if="detalleActual.especieNativa" class="rd-native-badge">Especie nativa</span>
                  </div>
                </div>

                <div class="rd-field-group">
                  <label>Nombre / etiqueta</label>
                  <p class="rd-field-main">{{ detalleActual.nombre }}</p>
                </div>

                <div class="rd-field-group">
                  <label>Ubicación</label>
                  <p class="rd-field-main">{{ detalleActual.ubicacion }}</p>
                </div>

                <div class="rd-field-group">
                  <label>Coordenadas</label>
                  <div class="rd-coord-box">
                    <svg viewBox="0 0 24 24" class="rd-icon-sm" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{{ detalleActual.coordenadas }}</span>
                    <button type="button" class="rd-copy-btn" @click="copiarCoordenadas(detalleActual.coordenadas)" aria-label="Copiar coordenadas">
                      <svg viewBox="0 0 24 24" class="rd-icon-sm" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    </button>
                  </div>
                  <span v-if="coordenadasCopiadas" class="rd-copied-msg">Copiado</span>
                </div>

                <div v-if="detalleActual.observaciones" class="rd-field-group">
                  <label>Observaciones</label>
                  <p>{{ detalleActual.observaciones }}</p>
                </div>
              </div>

              <!-- Columna 3: Nivel de infestación + estatus -->
              <div class="rd-level-col">
                <div class="rd-level-card">
                  <label>Nivel de infestación (Hawksworth)</label>
                  <div class="rd-level-big" :class="nivelBadgeClass(detalleActual.nivelNum)">
                    {{ detalleActual.nivel_infestacion }}
                  </div>
                  <div class="rd-level-mini-row">
                    <span class="rd-level-mini" :class="nivelBadgeClass(detalleActual.nivelNum)">{{ detalleActual.n1 }}</span>
                    <span class="rd-level-mini" :class="nivelBadgeClass(detalleActual.nivelNum)">{{ detalleActual.n2 }}</span>
                    <span class="rd-level-mini" :class="nivelBadgeClass(detalleActual.nivelNum)">{{ detalleActual.n3 }}</span>
                  </div>
                </div>

                <div class="rd-status-card">
                  <label>Estatus de la solicitud</label>
                  <span class="status-badge" :class="getBadgeClass(detalleActual.estado)">{{ detalleActual.estado }}</span>
                  <div class="rd-meta-row"><span class="rd-dot"></span>Reportado por {{ detalleActual.reportado_por }}</div>
                  <div class="rd-meta-row"><span class="rd-dot"></span>{{ detalleActual.fecha }}</div>
                  <div class="rd-meta-row"><span class="rd-dot"></span>ID: {{ detalleActual.id }}</div>
                </div>
              </div>
            </div>

            <!-- Revisión: solo si ya se procesó -->
            <div v-if="detalleActual.status !== 'Pendiente'" class="rd-review-box">
              <h3>Revisión</h3>
              <div class="rd-review-grid">
                <div class="rd-meta-row"><span class="rd-dot"></span>Estatus: {{ detalleActual.status }}</div>
                <div v-if="detalleActual.revisadoPor" class="rd-meta-row"><span class="rd-dot"></span>Revisado por: {{ detalleActual.revisadoPor }}</div>
                <div v-if="detalleActual.fechaRevision" class="rd-meta-row"><span class="rd-dot"></span>Fecha de revisión: {{ detalleActual.fechaRevision }}</div>
              </div>
              <p v-if="detalleActual.motivoRechazo" class="rd-motivo">Motivo de rechazo: {{ detalleActual.motivoRechazo }}</p>
            </div>

            <!-- Validar / rechazar: solo Administrativo/Root, y solo si sigue Pendiente -->
            <div v-if="puedeGestionar && detalleActual.status === 'Pendiente'" class="rd-actions-box">
              <template v-if="!mostrarRechazoForm">
                <button type="button" class="btn-primary rd-btn-full" :disabled="revisando" @click="onAceptar(detalleActual.id)">
                  {{ revisando ? 'Procesando...' : 'Aceptar / Validar' }}
                </button>
                <button type="button" class="btn-outline rd-btn-full rd-btn-danger-outline" :disabled="revisando" @click="mostrarRechazoForm = true">
                  Rechazar
                </button>
              </template>

              <div v-else class="form-field">
                <label>Motivo de rechazo</label>
                <textarea v-model="motivoRechazoInput" rows="3" placeholder="Explica por qué se rechaza (opcional)"></textarea>
                <div class="modal-footer modal-footer-plain">
                  <button type="button" class="btn-outline" :disabled="revisando" @click="mostrarRechazoForm = false">Cancelar</button>
                  <button type="button" class="btn-action-danger" :disabled="revisando" @click="onRechazar(detalleActual.id)">
                    {{ revisando ? 'Procesando...' : 'Confirmar rechazo' }}
                  </button>
                </div>
              </div>
            </div>
            </template>

          <p v-else class="state-msg error-msg">No se pudo cargar el detalle.</p>
        </div>
      </template>

      <template #actions>
        <div class="modal-actions-right">
          <button class="btn-outline" @click="cerrarDetalle">Cerrar</button>
        </div>
      </template>
    </Modal>

    <!-- Modal: Nuevo reporte (POST /api/v1/solicitudes/) -->
    <Modal v-model="mostrarModalNuevo">
      <template #title>
        <h2>Nuevo reporte</h2>
      </template>

      <template v-slot:default>
        <form class="modal-body" @submit.prevent="onSubmitNuevoReporte">
          <p v-if="crearError" class="state-msg error-msg">{{ crearError }}</p>
          <p v-if="formError" class="state-msg error-msg">{{ formError }}</p>

          <fieldset class="form-fieldset">
            <legend class="nr-legend">
              <span class="nr-legend-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22v-8"/><path d="M12 14A6 6 0 1 0 6 8c0 3.31 2.69 6 6 6z"/></svg>
              </span>
              Árbol
            </legend>

            <div class="nr-toggle">
              <label class="nr-toggle-option">
                <input type="radio" value="existente" v-model="form.tipoArbol" />
                <span>Árbol existente</span>
              </label>
              <label class="nr-toggle-option">
                <input type="radio" value="nuevo" v-model="form.tipoArbol" />
                <span>Árbol nuevo</span>
              </label>
            </div>

            <div v-if="form.tipoArbol === 'existente'" class="form-field">
              <label>Selecciona el árbol</label>
              <select v-model="form.arbolExistenteId">
                <option value="">— Selecciona —</option>
                <option v-for="a in arbolesOpciones" :key="a.id" :value="a.id">
                  {{ a.etiqueta }}<span v-if="a.especieNombre"> — {{ a.especieNombre }}</span>
                </option>
              </select>
            </div>

            <template v-else>
              <div class="form-grid-2">
                <div class="form-field">
                  <label>Etiqueta del árbol nuevo</label>
                  <input type="text" v-model="form.nueva_etiqueta" placeholder="Ej. A-104" />
                </div>
                <div class="form-field">
                  <label>Ubicación</label>
                  <select v-model="form.idArea">
                    <option value="">— Selecciona —</option>
                    <option v-for="u in ubicacionesOpciones" :key="u.id" :value="u.id">{{ u.nombre }}</option>
                  </select>
                </div>
              </div>
              <div class="form-field">
                <label>Coordenadas exactas</label>
                <div class="nr-input-icon">
                  <svg viewBox="0 0 24 24" class="nr-input-icon-svg" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <input type="text" v-model="form.coordenadas_exactas" placeholder="Ej. 20.0500, -99.3400" />
                </div>
              </div>

              <div class="nr-toggle nr-toggle-sub">
                <label class="nr-toggle-option">
                  <input type="radio" value="existente" v-model="form.tipoEspecie" />
                  <span>Especie existente</span>
                </label>
                <label class="nr-toggle-option">
                  <input type="radio" value="nueva" v-model="form.tipoEspecie" />
                  <span>Especie nueva</span>
                </label>
              </div>

              <div v-if="form.tipoEspecie === 'existente'" class="form-field">
                <label>Selecciona la especie</label>
                <select v-model="form.especieExistenteId">
                  <option value="">— Selecciona —</option>
                  <option v-for="e in especiesCatalogo" :key="e.id" :value="e.id">{{ e.nombre }}</option>
                </select>
              </div>

              <div v-else class="form-grid-2">
                <div class="form-field">
                  <label>Nombre común de la especie nueva</label>
                  <input type="text" v-model="form.nueva_especie_nombre" />
                </div>
                <div class="form-field">
                  <label>Nombre científico</label>
                  <input type="text" v-model="form.nueva_especie_nombre_cientifico" />
                </div>
                <div class="form-field">
                  <label class="checkbox-inline">
                    <input type="checkbox" v-model="form.nueva_especie_nativa" /> Especie nativa
                  </label>
                </div>
              </div>
            </template>
          </fieldset>

          <fieldset class="form-fieldset">
            <legend class="nr-legend">
              <span class="nr-legend-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </span>
              Nivel de infestación (Hawksworth)
            </legend>
            <p class="nr-hint">Cada medición va de 0.0 a 2.5; el total define la severidad general.</p>
            <div class="nr-hawk-grid">
              <div class="nr-hawk-card" :class="hawkLevelClass(form.n1)">
                <span class="nr-hawk-label">n1</span>
                <input type="number" min="0" max="2.5" step="0.1" v-model.number="form.n1" />
              </div>
              <div class="nr-hawk-card" :class="hawkLevelClass(form.n2)">
                <span class="nr-hawk-label">n2</span>
                <input type="number" min="0" max="2.5" step="0.1" v-model.number="form.n2" />
              </div>
              <div class="nr-hawk-card" :class="hawkLevelClass(form.n3)">
                <span class="nr-hawk-label">n3</span>
                <input type="number" min="0" max="2.5" step="0.1" v-model.number="form.n3" />
              </div>
              <div class="nr-hawk-card nr-hawk-total" :class="totalHawkClass">
                <span class="nr-hawk-label">Total</span>
                <span class="nr-hawk-total-value">{{ totalHawksworth !== null ? totalHawksworth : '—' }}</span>
              </div>
            </div>
          </fieldset>

          <fieldset class="form-fieldset">
            <legend class="nr-legend">
              <span class="nr-legend-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M21 16l-5.2-5.2a2 2 0 0 0-2.8 0L5 19"/></svg>
              </span>
              Evidencia (opcional)
            </legend>
            <div class="form-field">
              <div class="nr-field-header">
                <label>Observaciones</label>
                <span class="nr-counter">{{ form.observaciones.length }}/300</span>
              </div>
              <textarea v-model="form.observaciones" rows="3" maxlength="300" placeholder="Escribe alguna observación..."></textarea>
            </div>
            <div class="nr-upload-grid">
              <div class="nr-upload-card" v-for="(campo, idx) in imagenFields" :key="campo">
                <svg viewBox="0 0 24 24" class="nr-upload-icon" fill="none" stroke="currentColor" stroke-width="1.6">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <circle cx="9" cy="11" r="2" />
                  <path d="M21 16l-5.2-5.2a2 2 0 0 0-2.8 0L5 19" />
                </svg>
                <input type="text" v-model="form[campo]" :placeholder="`Imagen ${idx + 1} (URL/ruta)`" />
              </div>
            </div>
          </fieldset>

          <div class="modal-footer">
            <button type="button" class="btn-outline" @click="cerrarModal" :disabled="creando">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="creando">
              {{ creando ? 'Guardando...' : 'Guardar solicitud' }}
            </button>
          </div>
        </form>
      </template>

      <template #actions>
        <!-- acciones adicionales si se requieren pueden ir aquí -->
      </template>
    </Modal>
  </section>
</template>

<script setup>
import { reactive, ref, computed } from 'vue';
import { useReportes } from '@src/composables/useReportes';
import Modal from '@src/components/common/Modal.vue';

const {
  reportes,
  loading,
  error,
  page,
  totalPages,
  pageNumbers,
  paginationLabel,
  usaFiltroLocal,
  irAPagina,
  search,
  estadoFiltro,
  nivelFiltro,
  especieFiltro,
  especiesDisponibles,
  soloMisReportes,
  limpiarFiltros,
  verDetalle,
  puedeGestionar,
  arbolesOpciones,
  ubicacionesOpciones,
  especiesCatalogo,
  creando,
  crearError,
  crearSolicitud,
  eliminandoId,
  eliminarError,
  eliminarSolicitud,
  revisando,
  revisarError,
  revisarSolicitud,
  getCardBorderClass,
  getIconColorClass,
  getBadgeClass,
  getLevelTextClass,
  getActionBadgeClass,
} = useReportes();

// --- Modal "Ver detalles" ---
const detalleAbierto = ref(false);
const detalleAbiertoId = ref(null);
const mostrarRechazoForm = ref(false);
const motivoRechazoInput = ref('');

const detalleActual = computed(() =>
  reportes.value.find((r) => r.id === detalleAbiertoId.value) || null
);
const detalleLoadingActual = computed(() => detalleActual.value?.detalleLoading ?? false);

const abrirDetalle = async (id) => {
  detalleAbiertoId.value = id;
  detalleAbierto.value = true;
  mostrarRechazoForm.value = false;
  motivoRechazoInput.value = '';
  await verDetalle(id);
};

const cerrarDetalle = () => {
  detalleAbierto.value = false;
  detalleAbiertoId.value = null;
  mostrarRechazoForm.value = false;
  motivoRechazoInput.value = '';
};

// --- Copiar coordenadas (columna de datos del detalle) ---
const coordenadasCopiadas = ref(false);
let coordenadasCopiadasTimeout = null;

const copiarCoordenadas = async (coordenadas) => {
  if (!coordenadas) return;
  try {
    await navigator.clipboard.writeText(coordenadas);
    coordenadasCopiadas.value = true;
    clearTimeout(coordenadasCopiadasTimeout);
    coordenadasCopiadasTimeout = setTimeout(() => {
      coordenadasCopiadas.value = false;
    }, 1500);
  } catch {
    // Clipboard no disponible (permisos/HTTP no seguro): fallamos en silencio,
    // el usuario siempre puede seleccionar el texto manualmente.
  }
};

// --- Color del badge de nivel Hawksworth (mismos rangos que el filtro superior) ---
const nivelBadgeClass = (nivelNum) => {
  if (nivelNum === null || nivelNum === undefined) return 'rd-level-gray';
  if (nivelNum >= 7.5) return 'rd-level-red';
  if (nivelNum > 0) return 'rd-level-yellow';
  return 'rd-level-green';
};

const onAceptar = async (id) => {
  await revisarSolicitud(id, 'Aceptada');
};

const onRechazar = async (id) => {
  const ok = await revisarSolicitud(id, 'Rechazada', motivoRechazoInput.value);
  if (ok) {
    mostrarRechazoForm.value = false;
    motivoRechazoInput.value = '';
  }
};

// --- Modal "Nuevo reporte" ---
const mostrarModalNuevo = ref(false);
const formError = ref('');

const formInicial = () => ({
  tipoArbol: 'existente', // 'existente' | 'nuevo'
  arbolExistenteId: '',
  nueva_etiqueta: '',
  idArea: '',
  coordenadas_exactas: '',
  tipoEspecie: 'existente', // 'existente' | 'nueva'
  especieExistenteId: '',
  nueva_especie_nombre: '',
  nueva_especie_nombre_cientifico: '',
  nueva_especie_nativa: false,
  n1: null,
  n2: null,
  n3: null,
  observaciones: '',
  imagen1: '',
  imagen2: '',
  imagen3: '',
  imagen4: '',
});

const form = reactive(formInicial());

// Campos de imagen recorridos en el grid de "Evidencia" (evita repetir 4 bloques idénticos)
const imagenFields = ['imagen1', 'imagen2', 'imagen3', 'imagen4'];

// --- Color de las tarjetas Hawksworth del formulario "Nuevo reporte" ---
const hawkLevelClass = (val) => {
  if (val === null || val === '' || Number.isNaN(val)) return 'nr-hawk-neutral';
  if (val >= 2.5) return 'nr-hawk-severe';
  if (val > 0) return 'nr-hawk-mid';
  return 'nr-hawk-ok';
};

const totalHawksworth = computed(() => {
  const vals = [form.n1, form.n2, form.n3];
  if (vals.some((v) => v === null || v === '' || Number.isNaN(v))) return null;
  return Math.round((form.n1 + form.n2 + form.n3) * 10) / 10;
});

const totalHawkClass = computed(() => {
  const t = totalHawksworth.value;
  if (t === null) return 'nr-hawk-neutral';
  if (t >= 7.5) return 'nr-hawk-severe';
  if (t > 0) return 'nr-hawk-mid';
  return 'nr-hawk-ok';
});

const onNuevoReporte = () => {
  Object.assign(form, formInicial());
  formError.value = '';
  mostrarModalNuevo.value = true;
};

const cerrarModal = () => {
  mostrarModalNuevo.value = false;
};

// Réplica en cliente de las reglas de validate() del SolicitudCreateSerializer
// (ver API.md §6.3), para dar feedback inmediato antes de golpear la API.
const validarFormulario = () => {
  const nums = [form.n1, form.n2, form.n3];
  if (nums.some((n) => n === null || n === '' || Number.isNaN(n))) {
    return 'Debes indicar las tres mediciones Hawksworth (n1, n2, n3).';
  }
  if (nums.some((n) => n < 0 || n > 2.5)) {
    return 'Cada medición Hawksworth debe estar entre 0.0 y 2.5.';
  }

  if (form.tipoArbol === 'existente') {
    if (!form.arbolExistenteId) return 'Selecciona un árbol existente.';
    return '';
  }

  // Árbol nuevo
  if (!form.nueva_etiqueta) return 'La etiqueta del árbol nuevo es requerida.';
  if (!form.idArea) return 'Se requiere una ubicación para un árbol nuevo.';
  if (!form.coordenadas_exactas) return 'Se requieren coordenadas exactas para un árbol nuevo.';

  if (form.tipoEspecie === 'existente') {
    if (!form.especieExistenteId) return 'Selecciona una especie existente.';
  } else {
    if (!form.nueva_especie_nombre) return 'El nombre de la especie nueva es requerido.';
    if (!form.nueva_especie_nombre_cientifico) return 'El nombre científico es requerido para una especie nueva.';
  }

  return '';
};

const construirPayload = () => {
  const payload = {
    n1: form.n1,
    n2: form.n2,
    n3: form.n3,
  };
  if (form.observaciones) payload.observaciones = form.observaciones;
  ['imagen1', 'imagen2', 'imagen3', 'imagen4'].forEach((campo) => {
    if (form[campo]) payload[campo] = form[campo];
  });

  if (form.tipoArbol === 'existente') {
    payload.arbol_existente = form.arbolExistenteId;
    return payload;
  }

  payload.nueva_etiqueta = form.nueva_etiqueta;
  payload.id_area = form.idArea;
  payload.coordenadas_exactas = form.coordenadas_exactas;

  if (form.tipoEspecie === 'existente') {
    payload.especie_existente = form.especieExistenteId;
  } else {
    payload.nueva_especie_nombre = form.nueva_especie_nombre;
    payload.nueva_especie_nombre_cientifico = form.nueva_especie_nombre_cientifico;
    payload.nueva_especie_nativa = form.nueva_especie_nativa;
  }

  return payload;
};

const onSubmitNuevoReporte = async () => {
  formError.value = '';
  const problema = validarFormulario();
  if (problema) {
    formError.value = problema;
    return;
  }

  const ok = await crearSolicitud(construirPayload());
  if (ok) {
    mostrarModalNuevo.value = false;
  }
};

// --- Eliminar ---
const onEliminar = async (id) => {
  const confirmado = window.confirm('¿Eliminar este reporte/solicitud? Esta acción no se puede deshacer.');
  if (!confirmado) return;
  await eliminarSolicitud(id);
};
</script>

<style src="@src/assets/styles/reportes_view.css" scoped></style>

<!--
  Estilos propios del modal "Nuevo reporte" y del botón "Eliminar".
  Se separan del stylesheet externo para no depender de clases que no
  sabemos si ya existen ahí; si prefieres, muévelos a reportes_view.css.
-->
<style scoped>
.btn-action-danger {
  border: 1px solid #e11d48;
  color: #e11d48;
  background: #fff1f2;
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
  font-size: 0.875rem;
  cursor: pointer;
}
.btn-action-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-dialog {
  background: #fff;
  border-radius: 10px;
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
}
.modal-header h2 {
  margin: 0;
  font-size: 1.125rem;
}
.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  color: #6b7280;
}

.modal-body {
  padding: 1.25rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-fieldset {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.75rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.form-fieldset legend {
  padding: 0 0.4rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: #374151;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.form-field label {
  font-size: 0.8rem;
  color: #4b5563;
}
.form-field input[type='text'],
.form-field input[type='number'],
.form-field select,
.form-field textarea {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.45rem 0.6rem;
  font-size: 0.9rem;
}

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.checkbox-inline {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.875rem;
  margin-right: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e5e7eb;
}
.modal-footer-plain {
  border-top: none;
  padding-top: 0.5rem;
}
.modal-actions-right {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.detalle-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.imagenes-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.imagenes-list a {
  color: #2563eb;
  text-decoration: underline;
  font-size: 0.875rem;
}

/* ============================================================
   Formulario "Nuevo reporte" — encabezados, toggles, tarjetas
   Hawksworth, contador y grid de imágenes
   ============================================================ */

.nr-legend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.nr-legend-icon {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #f0fdf4;
  color: #15803d;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.nr-legend-icon svg { width: 15px; height: 15px; }

.nr-hint {
  margin: -0.25rem 0 0;
  font-size: 0.8rem;
  color: #6b7280;
}

/* Toggle tipo "pastilla" para los radios existente/nuevo — mismos
   inputs nativos, solo se les cambia la apariencia */
.nr-toggle {
  display: inline-flex;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 0.25rem;
  gap: 0.25rem;
  width: fit-content;
}
.nr-toggle-sub { margin-top: -0.25rem; }
.nr-toggle-option {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0.4rem 0.85rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
}
.nr-toggle-option input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
.nr-toggle-option:has(input:checked) {
  background: #fff;
  color: #15803d;
  box-shadow: 0 1px 2px rgba(0,0,0,0.08);
}

/* Campo con ícono al frente (coordenadas) */
.nr-input-icon {
  position: relative;
}
.nr-input-icon input { padding-left: 2.25rem; }
.nr-input-icon-svg {
  position: absolute;
  left: 0.6rem;
  top: 50%;
  transform: translateY(-50%);
  width: 15px;
  height: 15px;
  color: #9ca3af;
  pointer-events: none;
}

/* Tarjetas de mediciones Hawksworth */
.nr-hawk-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.6rem;
}
.nr-hawk-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  border-radius: 8px;
  padding: 0.6rem 0.4rem;
  border: 1.5px solid transparent;
}
.nr-hawk-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  opacity: 0.75;
}
.nr-hawk-card input {
  width: 100%;
  border: none;
  background: transparent;
  text-align: center;
  font-size: 1.1rem;
  font-weight: 700;
  color: inherit;
  padding: 0;
}
.nr-hawk-card input:focus { outline: none; }
.nr-hawk-total-value {
  font-size: 1.15rem;
  font-weight: 800;
}

.nr-hawk-neutral { background: #f8fafc; border-color: #e2e8f0; color: #64748b; }
.nr-hawk-ok { background: #f0fdf4; border-color: #bbf7d0; color: #15803d; }
.nr-hawk-mid { background: #fef9c3; border-color: #fde68a; color: #a16207; }
.nr-hawk-severe { background: #fee2e2; border-color: #fecaca; color: #dc2626; }
.nr-hawk-total.nr-hawk-severe { background: #dc2626; border-color: #dc2626; color: #fff; }
.nr-hawk-total.nr-hawk-ok { background: #f0fdf4; border-color: #86efac; }

/* Observaciones + contador */
.nr-field-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.nr-counter {
  font-size: 0.75rem;
  color: #94a3b8;
}

/* Grid de "imágenes" (siguen siendo campos de URL, con look de tarjeta) */
.nr-upload-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.6rem;
}
.nr-upload-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  border: 1.5px dashed #cbd5e1;
  border-radius: 10px;
  padding: 0.75rem 0.5rem;
  background: #f8fafc;
}
.nr-upload-icon {
  width: 22px;
  height: 22px;
  color: #94a3b8;
}
.nr-upload-card input {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.3rem 0.4rem;
  font-size: 0.75rem;
  text-align: center;
  background: #fff;
}
.nr-upload-card:focus-within {
  border-color: #15803d;
  background: #f0fdf4;
}

/* ============================================================
   Detalle de reporte — estilo alineado a "Detalles del árbol"
   ============================================================ */

.rd-dialog {
  max-width: 920px;
}
.rd-body {
  gap: 1.25rem;
}

.rd-grid {
  display: grid;
  grid-template-columns: 1.15fr 1.3fr 1fr;
  gap: 1rem;
}
@media (max-width: 720px) {
  .rd-grid {
    grid-template-columns: 1fr;
  }
}

/* Columna 1: foto */
.rd-photo-col {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.rd-photo {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  background: #f3f4f6;
  aspect-ratio: 4 / 3;
  border: 1.5px solid #e5e7eb;
}
.rd-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.rd-photo-empty {
  display: flex;
  align-items: center;
  justify-content: center;
}
.rd-photo-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  color: #9ca3af;
  font-size: 0.8rem;
  text-align: center;
  padding: 1rem;
}
.rd-photo-placeholder svg {
  width: 36px;
  height: 36px;
}
.rd-alert-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: #e11d48;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}
.rd-alert-badge svg {
  width: 18px;
  height: 18px;
}
.rd-photo-tag {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: #1b5e20;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  z-index: 2;
}
.rd-thumbs {
  display: flex;
  gap: 0.4rem;
}
.rd-thumb-link {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  overflow: hidden;
  border: 1.5px solid #e5e7eb;
  flex-shrink: 0;
}
.rd-thumb-link img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Columna 2: datos */
.rd-info-col {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}
.rd-field-group label {
  display: block;
  font-size: 0.75rem;
  color: #757575;
  margin-bottom: 0.15rem;
}
.rd-field-main {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}
.rd-field-group p {
  margin: 0;
  font-size: 0.875rem;
  color: #374151;
}
.rd-tag-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.3rem;
  flex-wrap: wrap;
}
.rd-sci-name {
  font-size: 0.8rem;
  color: #6b7280;
  font-style: italic;
}
.rd-native-badge {
  font-size: 0.7rem;
  font-weight: 700;
  color: #2f7e32;
  background: #eaf6ea;
  border: 1px solid #bfe3c0;
  border-radius: 999px;
  padding: 0.15rem 0.55rem;
}
.rd-coord-box {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.45rem 0.6rem;
  font-size: 0.85rem;
  color: #374151;
}
.rd-coord-box span {
  flex: 1;
}
.rd-icon-sm {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: #6b7280;
}
.rd-copy-btn {
  border: none;
  background: none;
  padding: 2px;
  cursor: pointer;
  display: flex;
  color: #6b7280;
}
.rd-copy-btn:hover {
  color: #2f7e32;
}
.rd-copied-msg {
  display: inline-block;
  margin-top: 0.25rem;
  font-size: 0.7rem;
  color: #2f7e32;
  font-weight: 600;
}

/* Columna 3: nivel + estatus */
.rd-level-col {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.rd-level-card,
.rd-status-card {
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 0.85rem;
}
.rd-level-card label,
.rd-status-card label {
  display: block;
  font-size: 0.75rem;
  color: #757575;
  margin-bottom: 0.5rem;
}
.rd-level-big {
  text-align: center;
  font-size: 1.15rem;
  font-weight: 800;
  border-radius: 10px;
  padding: 0.6rem;
  margin-bottom: 0.6rem;
}
.rd-level-mini-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.4rem;
}
.rd-level-mini {
  text-align: center;
  font-size: 0.9rem;
  font-weight: 700;
  border-radius: 8px;
  padding: 0.35rem 0;
}

.rd-level-red.rd-level-big {
  background: #dc2626;
  color: #fff;
}
.rd-level-red.rd-level-mini {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}
.rd-level-yellow.rd-level-big {
  background: #eab308;
  color: #fff;
}
.rd-level-yellow.rd-level-mini {
  background: #fef9c3;
  color: #a16207;
  border: 1px solid #fde68a;
}
.rd-level-green.rd-level-big {
  background: #22c55e;
  color: #fff;
}
.rd-level-green.rd-level-mini {
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #bbf7d0;
}
.rd-level-gray.rd-level-big {
  background: #9ca3af;
  color: #fff;
}
.rd-level-gray.rd-level-mini {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.rd-status-card .status-badge {
  margin-bottom: 0.6rem;
}
.rd-meta-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: #4b5563;
  margin-top: 0.35rem;
}
.rd-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  flex-shrink: 0;
}

/* Revisión */
.rd-review-box {
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 0.9rem 1rem;
}
.rd-review-box h3 {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
  color: #111827;
}
.rd-review-grid {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.rd-motivo {
  margin: 0.5rem 0 0;
  font-size: 0.85rem;
  color: #dc2626;
}

/* Acciones (aceptar / rechazar) */
.rd-actions-box {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.rd-btn-full {
  width: 100%;
  justify-content: center;
  padding: 0.7rem;
  font-weight: 700;
}
.rd-btn-danger-outline {
  color: #e11d48;
  border-color: #e11d48;
}
.rd-btn-danger-outline:hover {
  background: #fff1f2;
}
</style>