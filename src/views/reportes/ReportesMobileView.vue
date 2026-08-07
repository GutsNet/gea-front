<!--
G.E.A. Frontend
Layout móvil de Reportes. Se monta únicamente cuando el ancho de
pantalla está bajo el breakpoint (ver ReportesWrapper.vue).

Usa el mismo composable useReportes() que ReportesDesktopView.vue —
mismo listado, mismos filtros, mismas acciones (crear / ver detalle /
aceptar / rechazar / eliminar), sin lógica duplicada ni fuente de
datos aparte. Todo lo que hace la vista de escritorio existe aquí:

  - Búsqueda con debounce (search)
  - Filtros: propios/todos (admin), especie, nivel Hawksworth, estado
    (con la misma nota de "filtro local" cuando el backend no lo
    soporta directamente)
  - Paginación real (Anterior/Siguiente en vez de números de página,
    por espacio, pero conectada a page/totalPages/irAPagina)
  - Crear solicitud (árbol existente o nuevo, especie existente o
    nueva, mediciones Hawksworth n1/n2/n3, observaciones, imágenes)
  - Ver detalle (foto, especie, ubicación, coordenadas con copiar,
    observaciones, desglose Hawksworth, estatus, revisión)
  - Aceptar / rechazar (con motivo) — solo Administrativo/Root
  - Eliminar — solo Administrativo/Root

IMPORTANTE: esta vista se monta DENTRO de <main class="content">
<slot /></main> de DefaultLayout.vue, que ya provee el topbar verde
(botón de menú + título "Reportes") y el bottom-tabbar real. Por eso
NO trae su propio v-app-bar ni v-bottom-navigation — el filtro que en
el mock vivía en el ícono del app-bar aquí se abre desde un botón
propio junto al buscador, ya que el app-bar no es de este componente.
-->

<template>
  <div class="rm-wrapper">
    <!-- Búsqueda + filtros + nuevo reporte -->
    <div class="d-flex align-center rm-gap-2 mb-3">
      <v-text-field
        v-model="search"
        placeholder="Buscar reporte"
        variant="outlined"
        density="comfortable"
        hide-details
        prepend-inner-icon="mdi-magnify"
        class="rm-search-field"
        bg-color="white"
      ></v-text-field>

      <v-badge :content="activeFilterCount" :model-value="activeFilterCount > 0" color="#217b35" offset-x="4" offset-y="4">
        <v-btn height="48" width="48" min-width="48" variant="outlined" color="#217b35" class="rounded-lg" @click="filtrosAbiertos = true">
          <v-icon size="24">mdi-filter-variant</v-icon>
        </v-btn>
      </v-badge>

      <v-btn height="48" width="48" min-width="48" color="#389B48" class="rounded-lg" @click="onNuevoReporte">
        <v-icon size="x-large">mdi-plus</v-icon>
      </v-btn>
    </div>

    <p v-if="usaFiltroLocal" class="filter-local-note mb-3">
      El filtro de especie/nivel se aplica sobre los primeros 100 resultados (el backend no soporta filtrarlos directamente).
    </p>

    <!-- Estados de carga / error / vacío -->
    <div v-if="loading" class="state-msg">Cargando reportes...</div>
    <v-alert v-else-if="error" type="error" variant="tonal" density="comfortable" class="mb-4">{{ error }}</v-alert>
    <div v-else-if="reportes.length === 0" class="state-msg">No se encontraron reportes.</div>

    <!-- Lista dinámica de reportes -->
    <template v-else>
      <v-card
        v-for="item in reportes"
        :key="item.id"
        variant="outlined"
        class="mb-4 rounded-xl px-4 py-3 elevation-0 bg-white rm-card"
        :class="getCardBorderClass(item.estado)"
      >
        <div class="d-flex justify-space-between align-start mb-1">
          <div class="text-subtitle-1 font-weight-bold text-black">{{ item.especie }}</div>
          <v-icon :class="getIconColorClass(item.estado)" size="30">{{ cardIcon(item.estado) }}</v-icon>
        </div>

        <div class="text-body-2 font-weight-bold text-grey-darken-1 mb-2">{{ subEstadoLabel(item) }}</div>

        <div class="text-subtitle-2 font-weight-bold text-black mb-4">
          Nivel de infestación:
          <span :class="getLevelTextClass(item.nivelNum)">{{ item.nivel_infestacion }}</span>
        </div>

        <div class="d-flex align-center rm-gap-2 w-100">
          <v-btn flat color="#1b7a35" class="text-none font-weight-bold rounded-lg text-white rm-btn-flex" @click="abrirDetalle(item.id)">
            Ver detalles
          </v-btn>

          <div class="status-badge rm-badge-flex text-center" :class="getActionBadgeClass(item.action_status)">
            {{ item.action_status }}
          </div>

          <v-btn
            v-if="puedeGestionar"
            icon
            variant="outlined"
            color="#e11d48"
            height="44"
            width="44"
            :loading="eliminandoId === item.id"
            @click="onEliminar(item.id)"
          >
            <v-icon size="20">mdi-trash-can-outline</v-icon>
          </v-btn>
        </div>
      </v-card>
    </template>

    <p v-if="eliminarError" class="state-msg error-msg">{{ eliminarError }}</p>

    <!-- Paginación -->
    <div v-if="!usaFiltroLocal && reportes.length > 0" class="rm-pagination">
      <v-btn variant="text" color="#217b35" :disabled="page === 1" @click="irAPagina(page - 1)">Anterior</v-btn>
      <span class="pagination-info">{{ paginationLabel }}</span>
      <v-btn variant="text" color="#217b35" :disabled="page === totalPages" @click="irAPagina(page + 1)">Siguiente</v-btn>
    </div>
    <p v-else-if="reportes.length > 0" class="pagination-info text-center">{{ paginationLabel }}</p>

    <div style="height: 12px"></div>

    <!-- ============================================================ -->
    <!-- BOTTOM SHEET: Filtros                                        -->
    <!-- ============================================================ -->
    <v-bottom-sheet v-model="filtrosAbiertos">
      <v-card class="rm-filter-sheet pa-4">
        <h2 class="text-h6 font-weight-bold mb-3">Filtros</h2>

        <v-select
          v-if="puedeGestionar"
          v-model="soloMisReportes"
          :items="reportesScopeOptions"
          item-title="title"
          item-value="value"
          label="Reportes"
          variant="outlined"
          density="comfortable"
          class="mb-2"
        ></v-select>

        <v-select
          v-model="especieFiltro"
          :items="especieOptions"
          item-title="title"
          item-value="value"
          label="Filtrar por especie"
          variant="outlined"
          density="comfortable"
          class="mb-2"
        ></v-select>

        <v-select
          v-model="nivelFiltro"
          :items="nivelOptions"
          item-title="title"
          item-value="value"
          label="Nivel de infestación"
          variant="outlined"
          density="comfortable"
          class="mb-2"
        ></v-select>

        <v-select
          v-model="estadoFiltro"
          :items="estadoOptions"
          item-title="title"
          item-value="value"
          label="Estado"
          variant="outlined"
          density="comfortable"
          class="mb-4"
        ></v-select>

        <div class="d-flex rm-gap-2">
          <v-btn variant="outlined" class="flex-grow-1 text-none" @click="limpiarFiltros">Limpiar filtros</v-btn>
          <v-btn color="#217b35" class="flex-grow-1 text-none text-white" @click="filtrosAbiertos = false">Aplicar</v-btn>
        </div>
      </v-card>
    </v-bottom-sheet>

    <!-- ============================================================ -->
    <!-- MODAL: Ver detalles (incluye aceptar/rechazar)                -->
    <!-- ============================================================ -->
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
              <!-- Evidencia fotográfica -->
              <div class="rd-photo-col">
                <div class="rd-photo" :class="{ 'rd-photo-empty': !detalleActual.imagenes.length }">
                  <span v-if="detalleActual.nivelNum !== null && detalleActual.nivelNum >= 7.5" class="rd-alert-badge" title="Nivel severo">
                    <v-icon size="18" color="white">mdi-alert-circle</v-icon>
                  </span>

                  <a v-if="detalleActual.imagenes.length" :href="detalleActual.imagenes[0]" target="_blank" rel="noopener">
                    <img :src="detalleActual.imagenes[0]" alt="Evidencia principal" />
                  </a>
                  <div v-else class="rd-photo-placeholder">
                    <v-icon size="36">mdi-image-off-outline</v-icon>
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

              <!-- Datos del árbol / ubicación -->
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
                    <v-icon size="16" class="rd-icon-sm">mdi-map-marker-outline</v-icon>
                    <span>{{ detalleActual.coordenadas }}</span>
                    <button type="button" class="rd-copy-btn" @click="copiarCoordenadas(detalleActual.coordenadas)" aria-label="Copiar coordenadas">
                      <v-icon size="16">mdi-content-copy</v-icon>
                    </button>
                  </div>
                  <span v-if="coordenadasCopiadas" class="rd-copied-msg">Copiado</span>
                </div>

                <div v-if="detalleActual.observaciones" class="rd-field-group">
                  <label>Observaciones</label>
                  <p>{{ detalleActual.observaciones }}</p>
                </div>
              </div>

              <!-- Nivel de infestación + estatus -->
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

    <!-- ============================================================ -->
    <!-- MODAL: Nuevo reporte (POST /api/v1/solicitudes/)              -->
    <!-- ============================================================ -->
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
              <span class="nr-legend-icon"><v-icon size="15">mdi-tree-outline</v-icon></span>
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
              <div class="form-field">
                <label>Coordenadas exactas</label>
                <div class="nr-input-icon">
                  <v-icon size="15" class="nr-input-icon-svg">mdi-map-marker-outline</v-icon>
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

              <template v-else>
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
              </template>
            </template>
          </fieldset>

          <fieldset class="form-fieldset">
            <legend class="nr-legend">
              <span class="nr-legend-icon"><v-icon size="15">mdi-alert-circle-outline</v-icon></span>
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
              <span class="nr-legend-icon"><v-icon size="15">mdi-image-multiple-outline</v-icon></span>
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
                <v-icon size="20" class="nr-upload-icon">mdi-image-outline</v-icon>
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

      <template #actions></template>
    </Modal>
  </div>
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

// --- Ícono de la tarjeta según estado (mismo criterio que el SVG de escritorio) ---
const cardIcon = (estado) => {
  if (estado === 'Severo') return 'mdi-alert-circle';
  if (estado === 'Pendiente') return 'mdi-target';
  return 'mdi-circle';
};

// --- Texto bajo el nombre de especie: Pendiente/Rechazado/ID (matching mock) ---
const subEstadoLabel = (item) => {
  if (item.status === 'Pendiente') return 'Pendiente';
  if (item.status === 'Rechazada') return 'Rechazado';
  return 'ID: ' + item.id;
};

// --- Filtros: bottom sheet ---
const filtrosAbiertos = ref(false);

const reportesScopeOptions = [
  { title: 'Todos', value: false },
  { title: 'Propios', value: true },
];
const especieOptions = computed(() => [
  { title: 'Todas', value: '' },
  ...especiesDisponibles.value.map((nombre) => ({ title: nombre, value: nombre })),
]);
const nivelOptions = [
  { title: 'Todos', value: '' },
  { title: 'No visible (0)', value: 'no_visible' },
  { title: 'Ligera (0.1 - 7.4)', value: 'ligera' },
  { title: 'Severa (7.5)', value: 'severa' },
];
const estadoOptions = [
  { title: 'Todos', value: '' },
  { title: 'Pendiente', value: 'Pendiente' },
  { title: 'Aceptada', value: 'Aceptada' },
  { title: 'Rechazada', value: 'Rechazada' },
];
const activeFilterCount = computed(() =>
  [soloMisReportes.value, especieFiltro.value, nivelFiltro.value, estadoFiltro.value].filter(Boolean).length
);

// --- Modal "Ver detalles" ---
const detalleAbierto = ref(false);
const detalleAbiertoId = ref(null);
const mostrarRechazoForm = ref(false);
const motivoRechazoInput = ref('');

const detalleActual = computed(() => reportes.value.find((r) => r.id === detalleAbiertoId.value) || null);
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

// --- Copiar coordenadas ---
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
    // Clipboard no disponible (permisos/HTTP no seguro): fallamos en silencio.
  }
};

// --- Color del badge de nivel Hawksworth (mismos rangos que el filtro) ---
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
  tipoArbol: 'existente',
  arbolExistenteId: '',
  nueva_etiqueta: '',
  idArea: '',
  coordenadas_exactas: '',
  tipoEspecie: 'existente',
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
const imagenFields = ['imagen1', 'imagen2', 'imagen3', 'imagen4'];

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
// (idéntico a ReportesDesktopView.vue, ver API.md §6.3).
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
  const payload = { n1: form.n1, n2: form.n2, n3: form.n3 };
  if (form.observaciones) payload.observaciones = form.observaciones;
  imagenFields.forEach((campo) => {
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

<!-- Clases compartidas con el escritorio: status-badge, bg-light-*, text-*,
     border-*, btn-primary, btn-outline, btn-action-primary (ver el bloque
     NO envuelto en @media de reportes_view.css). -->
<style src="@src/assets/styles/reportes_view.css" scoped></style>
  