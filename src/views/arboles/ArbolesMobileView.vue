<!--
G.E.A. Frontend
Layout móvil de Árboles. Se monta únicamente cuando el ancho de
pantalla está bajo el breakpoint (ver ArbolesWrapper.vue).

No existía un mock para esta vista (a diferencia de Dashboard y
Reportes); el diseño de abajo reutiliza el mismo lenguaje visual que
ya se usó en DashboardMobileView.vue y ReportesMobileView.vue
(tarjetas Vuetify con borde de color por severidad, buscador + ícono
de filtro + botón "+", hoja de filtros inferior, Modal.vue para
detalle/alta).

Usa el mismo composable useArboles() que ArbolesDesktopView.vue —
mismo listado, mismos filtros, misma paginación, mismas acciones
(crear / editar / eliminar / ver detalle). Todo lo que hace la vista
de escritorio existe aquí:

  - Búsqueda con debounce + filtros (especie, ubicación, estado)
  - Paginación real con selector de tamaño de página (10/20/50)
  - Resumen de totales
  - Crear / editar árbol (solo Administrativo/Root)
  - Eliminar árbol con confirmación (solo Administrativo/Root)
  - Ver detalle: imagen + severidad, especie, ubicación, coordenadas
    con copiar, tarjeta Hawksworth (total + n1/n2/n3 + leyenda),
    datos (registro, reportado por, estado, último reporte, veces
    reportado, prioridad, observaciones), compartir, historial de
    reportes
  - Deep link ?detalle=<id> en la URL (igual que escritorio)

IMPORTANTE: esta vista se monta DENTRO de <main class="content">
<slot /></main> de DefaultLayout.vue, que ya provee el topbar verde
(botón de menú + título "Árboles") y el bottom-tabbar real. Por eso
NO trae su propio v-app-bar ni v-bottom-navigation.
-->

<template>
  <div class="am-wrapper">
    <!-- Búsqueda + filtros + nuevo árbol -->
    <div class="d-flex align-center am-gap-2 mb-3">
      <v-text-field
        :model-value="filtros.search"
        @update:model-value="setSearch"
        @keyup.enter="searchNow"
        placeholder="Buscar árbol, especie o ubicación..."
        variant="outlined"
        density="comfortable"
        hide-details
        prepend-inner-icon="mdi-magnify"
        class="am-search-field"
        bg-color="white"
      ></v-text-field>

      <v-badge :content="activeFilterCount" :model-value="activeFilterCount > 0" color="#15803d" offset-x="4" offset-y="4">
        <v-btn height="48" width="48" min-width="48" variant="outlined" color="#15803d" class="rounded-lg" @click="filtrosAbiertos = true">
          <v-icon size="24">mdi-filter-variant</v-icon>
        </v-btn>
      </v-badge>

      <v-btn v-if="esAdministrativo" height="48" width="48" min-width="48" color="#15803d" class="rounded-lg" @click="abrirModalCrear">
        <v-icon size="x-large">mdi-plus</v-icon>
      </v-btn>
    </div>

    <!-- Resumen -->
    <p class="am-summary mb-3">Total: {{ count }} árboles registrados</p>

    <!-- Estados de carga / error / vacío -->
    <div v-if="loading" class="state-msg">Cargando árboles...</div>
    <v-alert v-else-if="error" type="error" variant="tonal" density="comfortable" class="mb-4">{{ error }}</v-alert>
    <div v-else-if="arboles.length === 0" class="state-msg">No se encontraron árboles con los filtros seleccionados.</div>

    <!-- Lista de árboles -->
    <template v-else>
      <v-card
        v-for="item in arboles"
        :key="item.id"
        variant="outlined"
        class="mb-4 rounded-xl px-4 py-3 elevation-0 bg-white am-card"
        :class="severityBorderClass(item.nivelNum)"
      >
        <div class="d-flex justify-space-between align-start mb-1">
          <div class="d-flex align-center am-gap-2">
            <v-icon :class="severityColorClass(item.nivelNum)" size="26">{{ severityIcon(item.nivelNum) }}</v-icon>
            <span class="text-subtitle-1 font-weight-bold text-black">{{ item.etiqueta }}</span>
          </div>
          <span class="status-pill" :class="statusPillClass(item.estado)">{{ item.estado }}</span>
        </div>

        <div class="am-field mb-1">
          <span class="am-field-label">Especie</span>
          <span class="am-field-value">
            {{ item.especie_comun }}
            <span v-if="item.especie_cientifica" class="am-field-sub">({{ item.especie_cientifica }})</span>
          </span>
        </div>

        <div class="am-field mb-1">
          <span class="am-field-label">Ubicación</span>
          <span class="am-field-value">{{ item.ubicacion }}</span>
          <span class="am-field-sub">{{ item.coordenadas }}</span>
        </div>

        <div class="d-flex justify-space-between align-center mb-3 mt-2">
          <div class="am-field">
            <span class="am-field-label">Nivel de infestación</span>
            <span class="infestation-badge" :class="infestationBadgeClass(item.nivelNum)">{{ item.nivelTexto }}</span>
            <span class="am-field-sub">{{ item.estadoInfestacion }}</span>
          </div>
          <div class="am-field text-right">
            <span class="am-field-label">Último reporte</span>
            <span class="am-field-value">{{ item.fechaReporte }}</span>
          </div>
        </div>

        <div class="d-flex align-center am-gap-2 w-100">
          <v-btn flat color="#15803d" class="text-none font-weight-bold rounded-lg text-white am-btn-flex" @click="abrirDetalle(item.id)">
            Ver detalles
          </v-btn>
          <v-btn v-if="esAdministrativo" icon variant="outlined" color="#475569" height="44" width="44" @click="abrirModalEditar(item)">
            <v-icon size="20">mdi-pencil-outline</v-icon>
          </v-btn>
          <v-btn v-if="esAdministrativo" icon variant="outlined" color="#e11d48" height="44" width="44" @click="confirmarEliminar(item)">
            <v-icon size="20">mdi-trash-can-outline</v-icon>
          </v-btn>
        </div>
      </v-card>
    </template>

    <!-- Paginación -->
    <div v-if="arboles.length > 0" class="am-pagination">
      <div class="d-flex align-center justify-space-between mb-2">
        <v-btn variant="text" color="#15803d" :disabled="paginacion.page === 1" @click="irAPagina(paginacion.page - 1)">Anterior</v-btn>
        <span class="pagination-info">{{ rangoMostrado.desde }}–{{ rangoMostrado.hasta }} de {{ count }}</span>
        <v-btn variant="text" color="#15803d" :disabled="paginacion.page >= totalPages" @click="irAPagina(paginacion.page + 1)">Siguiente</v-btn>
      </div>
      <div class="d-flex align-center justify-center am-gap-2">
        <span class="am-field-sub">Mostrar</span>
        <v-select
          :model-value="paginacion.pageSize"
          @update:model-value="setPageSize"
          :items="[10, 20, 50]"
          variant="outlined"
          density="compact"
          hide-details
          class="am-page-size-select"
        ></v-select>
        <span class="am-field-sub">por página</span>
      </div>
    </div>

    <div style="height: 12px"></div>

    <!-- ============================================================ -->
    <!-- BOTTOM SHEET: Filtros                                        -->
    <!-- ============================================================ -->
    <v-bottom-sheet v-model="filtrosAbiertos">
      <v-card class="am-filter-sheet pa-4">
        <h2 class="text-h6 font-weight-bold mb-3">Filtros</h2>

        <v-select
          :model-value="filtros.especie"
          @update:model-value="(v) => setFiltro('especie', v)"
          :items="especieOptions"
          item-title="title"
          item-value="value"
          label="Especie"
          variant="outlined"
          density="comfortable"
          class="mb-2"
        ></v-select>

        <v-select
          :model-value="filtros.id_area"
          @update:model-value="(v) => setFiltro('id_area', v)"
          :items="ubicacionOptions"
          item-title="title"
          item-value="value"
          label="Ubicación"
          variant="outlined"
          density="comfortable"
          class="mb-2"
        ></v-select>

        <v-select
          :model-value="filtros.estado"
          @update:model-value="(v) => setFiltro('estado', v)"
          :items="estadoOptions"
          item-title="title"
          item-value="value"
          label="Estado"
          variant="outlined"
          density="comfortable"
          class="mb-4"
        ></v-select>

        <div class="d-flex am-gap-2">
          <v-btn variant="outlined" class="flex-grow-1 text-none" @click="limpiarFiltros">Limpiar filtros</v-btn>
          <v-btn color="#15803d" class="flex-grow-1 text-none text-white" @click="filtrosAbiertos = false">Aplicar</v-btn>
        </div>
      </v-card>
    </v-bottom-sheet>

    <!-- ============================================================ -->
    <!-- MODAL: Detalle del árbol                                     -->
    <!-- ============================================================ -->
    <Modal v-model="detalleAbierto" :persistent="false">
      <template #title>
        <div class="dm-title-row">
          <div class="dm-title-left">
            <v-icon size="20" color="#15803d">mdi-view-grid-outline</v-icon>
            <div>
              <h2 class="dm-heading">Detalles del árbol</h2>
              <p class="dm-breadcrumb">Árboles &gt; <strong>{{ detalleArbol?.etiqueta || '' }}</strong></p>
            </div>
          </div>
          <button class="dm-share-btn" type="button" @click="compartirDetalle" title="Compartir">
            <v-icon size="16">mdi-share-variant-outline</v-icon>
          </button>
        </div>
      </template>

      <div v-if="detalleLoading" class="state-msg">Cargando detalle...</div>
      <div v-else-if="detalleArbol" class="dm-content">
        <!-- Imagen -->
        <div class="dm-image-wrap">
          <img v-if="detalleArbol.imagen1" :src="detalleArbol.imagen1" alt="Foto del árbol" class="dm-tree-img" />
          <div v-else class="dm-img-placeholder">
            <v-icon size="56" color="#86efac">mdi-tree-outline</v-icon>
          </div>
          <div v-if="(detalleArbol.nivel_infestacion ?? 0) >= 7.5" class="dm-sev-badge dm-sev-red">
            <v-icon size="20" color="white">mdi-alert-circle</v-icon>
          </div>
          <div v-else-if="(detalleArbol.nivel_infestacion ?? 0) > 0" class="dm-sev-badge dm-sev-yellow">
            <v-icon size="20" color="white">mdi-alert-circle</v-icon>
          </div>
          <div class="dm-etiqueta">{{ detalleArbol.etiqueta }}</div>
        </div>

        <!-- Especie -->
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
            <v-icon size="18" color="#15803d">mdi-map-marker-outline</v-icon>
            <span class="dm-coords-text">{{ detalleArbol.coordenadas || '—' }}</span>
            <button class="dm-copy-btn" type="button" @click="copiarCoordenadasDetalle" title="Copiar coordenadas">
              <v-icon size="16">mdi-content-copy</v-icon>
            </button>
          </div>
        </div>

        <!-- Hawksworth -->
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
          <div class="dm-hawk-legend">
            <h4 class="dm-hawk-legend-title">Leyenda</h4>
            <ul>
              <li><span class="dm-ldot dm-ldot-green"></span> 0 - No visible</li>
              <li><span class="dm-ldot dm-ldot-yellow"></span> 3.5 - Ligera</li>
              <li><span class="dm-ldot dm-ldot-red"></span> 7.5 - Severa</li>
              <li><span class="dm-ldot dm-ldot-gray"></span> Árbol muerto - estado crítico</li>
              <li><span class="dm-ldot dm-ldot-blue"></span> En revisión</li>
            </ul>
          </div>
        </div>

        <!-- Datos -->
        <div class="dm-data-list">
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
          <div class="dm-data-row dm-data-row-obs">
            <span class="dm-dot dm-dot-green"></span>
            <span class="dm-dlabel">Observaciones</span>
            <span class="dm-dvalue dm-obs">{{ detalleArbol.observaciones || 'Sin observaciones' }}</span>
          </div>
        </div>

        <!-- Acciones -->
        <div class="dm-actions">
          <button class="dm-btn-saneado" type="button">Árbol saneado</button>
          <button class="dm-btn-editar" type="button" @click="editarDesdeDetalle">Editar datos</button>
        </div>

        <!-- Historial de reportes -->
        <div class="dm-history">
          <h4 class="dm-history-heading">Historial de reportes</h4>
          <div v-if="detalleArbol.reportes?.length" class="dm-history-list">
            <div v-for="(rep, idx) in detalleArbol.reportes" :key="idx" class="dm-history-card">
              <div class="dm-history-top">
                <span>{{ rep.fecha || '—' }}</span>
                <span class="dm-pill-sm" :class="dmEstadoClass(rep.estado)">{{ rep.estado || '—' }}</span>
              </div>
              <div class="dm-nivel-color" :class="dmNivelClass(rep.nivel_infestacion)">
                {{ rep.nivel_infestacion != null ? `${rep.nivel_infestacion} (${dmNivelLabelFor(rep.nivel_infestacion)})` : '—' }}
              </div>
              <p v-if="rep.observaciones" class="dm-obs-cell">{{ rep.observaciones }}</p>
              <span class="am-field-sub">Reportado por {{ rep.reportado_por || '—' }}</span>
            </div>
          </div>
          <p v-else class="dm-no-history">No hay reportes registrados para este árbol.</p>
        </div>
      </div>
      <div v-else class="state-msg">No se encontró el detalle del árbol.</div>
    </Modal>

    <!-- ============================================================ -->
    <!-- MODAL: Crear / Editar árbol                                  -->
    <!-- ============================================================ -->
    <Modal v-model="modalAbierto">
      <template #title>{{ editandoId ? 'Editar árbol' : 'Nuevo árbol' }}</template>

      <div class="am-form-field">
        <label>Etiqueta</label>
        <input type="text" v-model="form.etiqueta" required />
      </div>
      <div class="am-form-field">
        <label>Especie</label>
        <select v-model="form.especie" required>
          <option value="" disabled>Selecciona una especie</option>
          <option v-for="e in especies" :key="e.id" :value="e.id">{{ e.nombre }}</option>
        </select>
      </div>
      <div class="am-form-field">
        <label>Ubicación</label>
        <select v-model="form.id_area" required>
          <option value="" disabled>Selecciona una ubicación</option>
          <option v-for="u in ubicaciones" :key="u.id" :value="u.id">{{ u.nombre }}</option>
        </select>
      </div>
      <div class="am-form-field">
        <label>Coordenadas</label>
        <input type="text" v-model="form.coordenadas" placeholder="Lat,Lng" />
      </div>
      <div class="am-form-field">
        <label>Nivel de infestación</label>
        <input type="number" min="0" max="7.5" step="0.1" v-model.number="form.nivel_infestacion" />
      </div>
      <div class="am-form-field">
        <label>Estado</label>
        <select v-model="form.estado" required>
          <option v-for="estado in ESTADOS_ARBOL" :key="estado" :value="estado">{{ estado }}</option>
        </select>
      </div>
      <div class="am-form-field">
        <label>Fecha de reporte</label>
        <input type="date" v-model="form.fecha_reporte" required />
      </div>

      <p v-if="modalError" class="state-msg error-msg am-modal-error">{{ modalError }}</p>

      <template #actions>
        <div class="am-modal-actions">
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

// --- Íconos y colores por nivel de severidad (mismo criterio que las
// SVG de escritorio: null=info, >5 severo, 0=sano, resto=ligera/moderada) ---
const severityIcon = (nivel) => {
  if (nivel === null || nivel === undefined) return 'mdi-help-circle-outline';
  if (nivel > 5) return 'mdi-alert-circle';
  if (nivel === 0) return 'mdi-check-circle';
  return 'mdi-alert';
};
const severityColorClass = (nivel) => {
  if (nivel === null || nivel === undefined) return 'am-text-blue';
  if (nivel > 5) return 'am-text-red';
  if (nivel > 0) return 'am-text-orange';
  return 'am-text-green';
};
const severityBorderClass = (nivel) => {
  if (nivel === null || nivel === undefined) return 'am-border-blue';
  if (nivel > 5) return 'am-border-red';
  if (nivel > 0) return 'am-border-orange';
  return 'am-border-green';
};
const infestationBadgeClass = (nivel) => {
  if (nivel === null || nivel === undefined) return 'am-badge-outline-blue';
  if (nivel > 5) return 'am-badge-light-red';
  if (nivel > 0) return 'am-badge-light-orange';
  return 'am-badge-light-green';
};
// Estados reales del Árbol: Sano | Infestado | Limpieza | Saneado
const statusPillClass = (estado) => {
  if (estado === 'Sano') return 'am-pill-light-green am-text-green';
  if (estado === 'Infestado') return 'am-pill-light-red am-text-red';
  if (estado === 'Limpieza') return 'am-pill-light-blue am-text-blue';
  return 'am-pill-light-gray am-text-gray';
};

// --- Filtros: bottom sheet ---
const filtrosAbiertos = ref(false);
const especieOptions = computed(() => [
  { title: 'Todas', value: '' },
  ...especies.value.map((e) => ({ title: e.nombre, value: e.id })),
]);
const ubicacionOptions = computed(() => [
  { title: 'Todas', value: '' },
  ...ubicaciones.value.map((u) => ({ title: u.nombre, value: u.id })),
]);
const estadoOptions = computed(() => [
  { title: 'Todos', value: '' },
  ...ESTADOS_ARBOL.map((estado) => ({ title: estado, value: estado })),
]);
const activeFilterCount = computed(() =>
  [filtros.especie, filtros.id_area, filtros.estado].filter(Boolean).length
);

// --- Modal Crear/Editar ---
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

// Desde el modal de detalle, "Editar datos" abre el mismo modal de
// alta/edición con los datos del árbol actualmente mostrado.
const editarDesdeDetalle = () => {
  if (!detalleArbol.value) return;
  const d = detalleArbol.value;
  editandoId.value = d.id;
  form.etiqueta = d.etiqueta;
  form.especie = d.especie_detail?.id || d.especie || '';
  form.id_area = d.ubicacion_detail?.id || d.id_area || '';
  form.coordenadas = d.coordenadas || '';
  form.nivel_infestacion = d.nivel_infestacion ?? 0;
  form.estado = d.estado || 'Sano';
  form.fecha_reporte = d.fecha_reporte || new Date().toISOString().slice(0, 10);
  modalError.value = '';
  detalleAbierto.value = false;
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

// --- Helpers del modal de detalle (idénticos a ArbolesDesktopView.vue) ---

const dmNivelLabelFor = (nivel) => {
  if (nivel === 0) return 'No visible';
  if (nivel < 3.5) return 'Ligera';
  if (nivel < 7.5) return 'Moderada';
  return 'Severa';
};

const dmNivelLabel = computed(() => dmNivelLabelFor(detalleArbol.value?.nivel_infestacion ?? 0));

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
      text: 'Ver estado e información del árbol',
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

const dmFechaReporte = computed(() => {
  const raw = detalleArbol.value?.fecha_reporte;
  if (!raw) return '—';
  const [y, m, d] = raw.split('-');
  if (!y || !m || !d) return raw;
  return `${d}/${m}/${y}`;
});

const dmPrioridadClass = (prioridad) => {
  if (prioridad === 'Crítica') return 'dm-pill-red';
  if (prioridad === 'Alta') return 'dm-pill-red';
  if (prioridad === 'Media') return 'dm-pill-blue';
  if (prioridad === 'Baja') return 'dm-pill-green';
  return 'dm-pill-gray';
};
</script>

<!-- .state-msg / .error-msg son compartidos con el escritorio (fuera
     de cualquier @media en arboles_view.css). El resto de clases del
     escritorio vive dentro de @media (min-width: 960px), así que no
     aplican aquí — se redefinen abajo para esta vista. -->
<style src="@src/assets/styles/arboles_view.css" scoped></style>

<style scoped>
.am-wrapper { max-width: 480px; margin: 0 auto; }
.am-gap-2 { gap: 8px; }
.am-search-field :deep(.v-field) { box-shadow: none; }
.am-btn-flex { flex: 1.3; height: 44px; }
.am-summary { font-size: 0.85rem; color: #64748b; margin: 0; }

.am-card { border-width: 1.5px !important; }
.am-border-blue { border-color: #3b82f6 !important; }
.am-border-red { border-color: #ef4444 !important; }
.am-border-orange { border-color: #f59e0b !important; }
.am-border-green { border-color: #10b981 !important; }

.am-text-blue { color: #3b82f6; }
.am-text-red { color: #ef4444; }
.am-text-orange { color: #f59e0b; }
.am-text-green { color: #10b981; }
.am-text-gray { color: #64748b; }

.am-field { display: flex; flex-direction: column; gap: 0.15rem; }
.am-field-label { font-size: 0.72rem; color: #94a3b8; }
.am-field-value { font-size: 0.9rem; font-weight: 500; color: #1e293b; }
.am-field-sub { font-size: 0.78rem; color: #94a3b8; }

.infestation-badge { padding: 0.15rem 0.6rem; border-radius: 4px; font-size: 0.8rem; font-weight: 600; display: inline-block; width: fit-content; }
.am-badge-light-red { background-color: #fee2e2; color: #ef4444; }
.am-badge-light-orange { background-color: #fef3c7; color: #d97706; }
.am-badge-light-green { background-color: #dcfce7; color: #16a34a; }
.am-badge-outline-blue { background-color: #eff6ff; color: #3b82f6; border: 1px solid #bfdbfe; }

.status-pill { padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; display: inline-block; }
.am-pill-light-green { background-color: #dcfce7; }
.am-pill-light-red { background-color: #fee2e2; }
.am-pill-light-blue { background-color: #eff6ff; }
.am-pill-light-gray { background-color: #f1f5f9; }

.am-pagination { padding-top: 0.5rem; border-top: 1px solid #e2e8f0; }
.pagination-info { font-size: 0.85rem; color: #64748b; }
.am-page-size-select { max-width: 90px; }

.am-filter-sheet { border-radius: 16px 16px 0 0 !important; max-height: 85vh; overflow-y: auto; }

/* ---------- Modal crear/editar ---------- */
.am-form-field { display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 0.9rem; }
.am-form-field label { font-size: 0.8rem; color: #64748b; }
.am-form-field input,
.am-form-field select {
  width: 100%;
  padding: 0.65rem 0.8rem;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: white;
  font-size: 0.95rem;
  outline: none;
}
.am-modal-error { margin-top: 0.5rem; padding: 0; text-align: left; }
.am-modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; width: 100%; }
.btn-outline {
  background-color: white; color: #475569; border: 1px solid #cbd5e1;
  padding: 0.6rem 1rem; border-radius: 8px; font-size: 0.9rem; font-weight: 500; cursor: pointer;
}
.btn-primary {
  background-color: #15803d; color: white; border: none;
  padding: 0.65rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer;
}
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

/* ---------- Modal detalle ---------- */
.dm-title-row { display: flex; justify-content: space-between; align-items: center; width: 100%; gap: 0.75rem; }
.dm-title-left { display: flex; align-items: center; gap: 0.6rem; }
.dm-heading { margin: 0; font-size: 1.02rem; font-weight: 700; color: #0f172a; }
.dm-breadcrumb { margin: 0.1rem 0 0; font-size: 0.72rem; color: #64748b; }
.dm-breadcrumb strong { color: #15803d; }
.dm-share-btn {
  display: inline-flex; align-items: center; justify-content: center;
  background: #15803d; color: white; border: none; border-radius: 8px;
  width: 34px; height: 34px; cursor: pointer; flex-shrink: 0;
}

.dm-content { display: flex; flex-direction: column; gap: 1rem; }

.dm-image-wrap { position: relative; width: 100%; height: 220px; border-radius: 14px; overflow: hidden; background: #f0fdf4; }
.dm-tree-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.dm-img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.dm-sev-badge {
  position: absolute; top: 0.6rem; left: 0.6rem; width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.25);
}
.dm-sev-red { background: #dc2626; }
.dm-sev-yellow { background: #eab308; }
.dm-etiqueta {
  position: absolute; bottom: 0.6rem; right: 0.6rem; background: rgba(0,0,0,0.6); color: white;
  padding: 0.3rem 0.7rem; border-radius: 8px; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.02em;
}

.dm-section-label { display: block; font-size: 0.72rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; font-weight: 500; margin-bottom: 0.15rem; }
.dm-species-name { margin: 0; font-size: 1.05rem; font-weight: 700; color: #0f172a; line-height: 1.3; }
.dm-species-sci { margin: 0.15rem 0 0; font-size: 0.85rem; color: #64748b; font-style: italic; }
.dm-native-pill {
  display: inline-block; margin-top: 0.4rem; padding: 0.22rem 0.7rem; background: #dcfce7; color: #15803d;
  border: 1px solid #bbf7d0; border-radius: 999px; font-size: 0.75rem; font-weight: 600;
}
.dm-info-value { margin: 0; font-size: 0.92rem; font-weight: 600; color: #0f172a; }

.dm-coords-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.55rem 0.75rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 0.2rem; }
.dm-coords-text { font-size: 0.85rem; color: #334155; font-weight: 500; flex: 1; font-variant-numeric: tabular-nums; word-break: break-word; }
.dm-copy-btn { background: transparent; border: none; cursor: pointer; color: #94a3b8; padding: 0.2rem; display: flex; align-items: center; border-radius: 4px; }

.dm-hawk-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 1rem; display: flex; flex-direction: column; gap: 0.7rem; }
.dm-hawk-title { margin: 0; font-size: 0.8rem; color: #334155; font-weight: 600; }
.dm-hawk-total { text-align: center; padding: 0.8rem; border-radius: 12px; color: white; font-size: 1.15rem; font-weight: 800; }
.dm-hawk-red { background: #dc2626; }
.dm-hawk-yellow { background: #eab308; }
.dm-hawk-green { background: #16a34a; }
.dm-hawk-comps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }
.dm-hawk-comp { text-align: center; padding: 0.6rem 0.4rem; border-radius: 10px; background: #1e293b; color: white; font-size: 0.95rem; font-weight: 700; }
.dm-hawk-legend { border-top: 1px solid #e2e8f0; padding-top: 0.7rem; margin-top: 0.2rem; }
.dm-hawk-legend-title { margin: 0 0 0.5rem; font-size: 0.72rem; color: #334155; font-weight: 600; }
.dm-hawk-legend ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.35rem; }
.dm-hawk-legend li { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: #475569; }
.dm-ldot { width: 11px; height: 11px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
.dm-ldot-green { background: #16a34a; }
.dm-ldot-yellow { background: #eab308; }
.dm-ldot-red { background: #dc2626; }
.dm-ldot-gray { background: #94a3b8; }
.dm-ldot-blue { background: #3b82f6; }

.dm-data-list { border: 1px solid #f1f5f9; border-radius: 12px; overflow: hidden; background: white; }
.dm-data-row { display: flex; align-items: center; gap: 0.6rem; padding: 0.65rem 0.9rem; border-bottom: 1px solid #f8fafc; font-size: 0.82rem; }
.dm-data-row:last-child { border-bottom: none; }
.dm-data-row-obs { align-items: flex-start; flex-wrap: wrap; }
.dm-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
.dm-dot-green { background: #16a34a; }
.dm-dlabel { color: #64748b; font-weight: 500; white-space: nowrap; }
.dm-dvalue { margin-left: auto; color: #0f172a; font-weight: 600; text-align: right; }
.dm-obs { white-space: normal; max-width: 60%; line-height: 1.35; font-size: 0.78rem; font-weight: 500; }
.dm-pill { display: inline-block; padding: 0.18rem 0.6rem; border-radius: 999px; font-size: 0.72rem; font-weight: 600; white-space: nowrap; }
.dm-pill-green { background: #dcfce7; color: #15803d; }
.dm-pill-red { background: #fee2e2; color: #dc2626; }
.dm-pill-blue { background: #dbeafe; color: #2563eb; }
.dm-pill-gray { background: #f1f5f9; color: #64748b; }

.dm-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; }
.dm-btn-saneado { padding: 0.75rem; background: #15803d; color: white; border: none; border-radius: 10px; font-size: 0.88rem; font-weight: 700; cursor: pointer; }
.dm-btn-editar { padding: 0.72rem; background: white; color: #334155; border: 1px solid #d1d5db; border-radius: 10px; font-size: 0.85rem; font-weight: 600; cursor: pointer; }

.dm-history { border-top: 1px solid #f1f5f9; padding-top: 0.9rem; }
.dm-history-heading { margin: 0 0 0.6rem; font-size: 0.88rem; color: #0f172a; font-weight: 700; }
.dm-history-list { display: flex; flex-direction: column; gap: 0.6rem; }
.dm-history-card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 0.65rem 0.8rem; display: flex; flex-direction: column; gap: 0.3rem; }
.dm-history-top { display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: #334155; }
.dm-nivel-color { font-weight: 700; font-size: 0.85rem; }
.dm-nivel-red { color: #dc2626; }
.dm-nivel-yellow { color: #eab308; }
.dm-nivel-green { color: #16a34a; }
.dm-pill-sm { display: inline-block; padding: 0.12rem 0.5rem; border-radius: 999px; font-size: 0.68rem; font-weight: 600; }
.dm-obs-cell { margin: 0; font-size: 0.8rem; color: #475569; line-height: 1.35; }
.dm-no-history { color: #94a3b8; font-size: 0.85rem; text-align: center; padding: 1rem 0; margin: 0; }
</style>