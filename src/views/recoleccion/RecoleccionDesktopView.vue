<!--
G.E.A. Frontend
Layout de escritorio de Recolección.

Conectado a GET/POST /api/v1/recoleccion/. El modelo real no tiene
`ubicacion`, `hora` ni `updated_at`, así que esas columnas del mock
se quitaron en vez de simularse (ver useRecoleccion.js). El filtro
de fecha es puntual (`?fecha=`) porque el backend no soporta rango.
-->

<template>
  <div class="recoleccion-main">
    <div class="recoleccion-desktop">
      <!-- ================= TARJETAS ESTADÍSTICAS ================= -->
      <div class="stats-grid">
        <div class="stat-card bg-light-green-card">
          <div class="stat-icon-wrapper bg-icon-green text-green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </div>
          <div class="stat-content">
            <p class="stat-label">Kg totales recolectados</p>
            <h3 class="stat-value">{{ kgTotales.toFixed(1) }} kg</h3>
            <p class="stat-trend">Total acumulado del sistema</p>
          </div>
        </div>

        <div class="stat-card bg-light-blue-card">
          <div class="stat-icon-wrapper bg-icon-blue text-blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div class="stat-content">
            <p class="stat-label">Recolecciones realizadas</p>
            <h3 class="stat-value">{{ totalRecolecciones }}</h3>
            <p class="stat-trend">Total histórico</p>
          </div>
        </div>

        <div class="stat-card bg-light-purple-card">
          <div class="stat-icon-wrapper bg-icon-purple text-purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
          </div>
          <div class="stat-content">
            <p class="stat-label">Árboles procesados</p>
            <h3 class="stat-value">{{ arbolesProcesados }}</h3>
            <p class="stat-trend">Con estado "Saneado"</p>
          </div>
        </div>

        <div class="stat-card bg-light-orange-card">
          <div class="stat-icon-wrapper bg-icon-orange text-orange">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10z"/></svg>
          </div>
          <div class="stat-content">
            <p class="stat-label">Promedio por recolección</p>
            <h3 class="stat-value">{{ promedioKg.toFixed(1) }} kg</h3>
            <p class="stat-trend">Calculado sobre el total</p>
          </div>
        </div>
      </div>

      <!-- ================= BARRA DE BÚSQUEDA Y FILTROS ================= -->
      <div class="toolbar">
        <div class="search-group">
          <div class="search-box">
            <svg viewBox="0 0 24 24" class="icon-search" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              placeholder="Buscar por matrícula o fecha en esta página..."
              :value="filtros.busqueda"
              @input="setBusqueda($event.target.value)"
            />
          </div>
          <button class="btn-search" @click="fetchRecolecciones">
            <svg viewBox="0 0 24 24" class="icon-sm" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Buscar
          </button>
        </div>

        <div class="filters-group">
          <div class="input-wrapper">
            <label>Fecha</label>
            <div class="date-input-container">
              <input
                type="date"
                :value="filtros.fecha"
                @change="setFiltro('fecha', $event.target.value)"
              />
              <svg viewBox="0 0 24 24" class="icon-calendar" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
          </div>
          <div class="select-wrapper">
            <label>Responsable</label>
            <select :value="filtros.responsable" @change="setFiltro('responsable', $event.target.value)">
              <option value="">Todos</option>
              <option v-for="est in estudiantes" :key="est.id" :value="est.id">{{ est.matricula }}</option>
            </select>
          </div>
          <button class="btn-outline btn-filter" @click="limpiarFiltros" title="Limpiar filtros">
            <svg viewBox="0 0 24 24" class="icon-sm" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Limpiar
          </button>
        </div>
      </div>

      <!-- ================= BARRA DE ACCIÓN SECUNDARIA ================= -->
      <div class="action-bar">
        <p class="summary-text">Total: {{ count }} recolecciones</p>
        <button v-if="esAdministrativo" class="btn-primary" @click="abrirModal">
          + Nueva recolección
        </button>
      </div>

      <!-- Estados de carga y error -->
      <div v-if="loading" class="state-msg">Cargando recolecciones...</div>
      <div v-else-if="error" class="state-msg error-msg">{{ error }}</div>
      <div v-else-if="recolecciones.length === 0" class="state-msg">No se encontraron recolecciones con los filtros seleccionados.</div>

      <!-- ================= TABLA PRINCIPAL ================= -->
      <div v-else class="table-container">
        <table class="data-table">
          <thead>
          <tr>
            <th>Fecha</th>
            <th>Responsable</th>
            <th class="text-center">Kg recolectados</th>
            <th class="text-center">Acciones</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in recolecciones" :key="item.id">
            <td>
              <span class="primary-text">{{ item.fecha }}</span>
            </td>
            <td>
              <span class="primary-text">{{ item.responsable }}</span>
            </td>
            <td class="text-center">
              <span class="text-green font-bold text-lg">{{ item.kg.toFixed(1) }} kg</span>
            </td>
            <td>
              <div class="actions-cell">
                <button class="btn-icon" aria-label="Ver detalles" @click="$emit('ver-detalle', item.id)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button v-if="esAdministrativo" class="btn-icon" aria-label="Editar recolección" @click="abrirModalEditar(item)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button v-if="esAdministrativo" class="btn-icon btn-icon-danger" aria-label="Eliminar recolección" @click="confirmarEliminar(item)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                </button>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- ================= PAGINACIÓN ================= -->
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
            Mostrando {{ rangoMostrado.desde }} a {{ rangoMostrado.hasta }} de {{ count }} recolecciones
          </span>
          <div class="pagination-controls">
            <button class="page-arrow" :disabled="paginacion.page <= 1" @click="irAPagina(paginacion.page - 1)">&lt;</button>
            <button
              v-for="p in paginasVisibles"
              :key="p"
              class="page-num"
              :class="{ active: p === paginacion.page }"
              @click="irAPagina(p)"
            >{{ p }}</button>
            <button class="page-arrow" :disabled="paginacion.page >= totalPages" @click="irAPagina(paginacion.page + 1)">&gt;</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= MODAL: NUEVA RECOLECCIÓN ================= -->
    <div v-if="modalAbierto" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal-box">
        <h3 class="modal-title">{{ editandoId ? 'Editar recolección' : 'Nueva recolección' }}</h3>

        <form @submit.prevent="guardarRecoleccion">
          <div class="select-wrapper modal-field">
            <label>Responsable (estudiante)</label>
            <select v-model="form.responsable" required>
              <option value="" disabled>Selecciona un estudiante</option>
              <option v-for="est in estudiantes" :key="est.id" :value="est.id">{{ est.matricula }}</option>
            </select>
          </div>

          <div class="select-wrapper modal-field">
            <label>Kilos</label>
            <input type="number" step="0.1" min="0" v-model.number="form.kilos" required />
          </div>

          <div class="select-wrapper modal-field">
            <label>Fecha</label>
            <input type="date" v-model="form.fecha" required />
          </div>

          <p v-if="modalError" class="state-msg error-msg modal-error">{{ modalError }}</p>

          <div class="modal-actions">
            <button type="button" class="btn-outline" @click="cerrarModal">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="guardando">
              {{ guardando ? 'Guardando...' : editandoId ? 'Actualizar' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { useRecoleccion } from '@src/composables/useRecoleccion';
import { hasRole } from '@src/services/authService';

defineEmits(['ver-detalle']);

const {
  loading,
  error,
  recolecciones,
  count,
  estudiantes,

  kgTotales,
  totalRecolecciones,
  arbolesProcesados,
  promedioKg,

  filtros,
  paginacion,
  totalPages,
  rangoMostrado,

  setBusqueda,
  setFiltro,
  limpiarFiltros,
  irAPagina,
  setPageSize,
  crearRecoleccion,
  editarRecoleccion,
  eliminarRecoleccion,
  fetchRecolecciones,
} = useRecoleccion();

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

const esAdministrativo = computed(() => hasRole('admin', 'root'));

// --- Modal "Nueva recolección" -----------------------------------------

const modalAbierto = ref(false);
const editandoId = ref(null);
const guardando = ref(false);
const modalError = ref('');
const form = reactive({ responsable: '', kilos: null, fecha: '' });

const abrirModal = () => {
  editandoId.value = null;
  form.responsable = '';
  form.kilos = null;
  form.fecha = new Date().toISOString().slice(0, 10);
  modalError.value = '';
  modalAbierto.value = true;
};

const abrirModalEditar = (item) => {
  editandoId.value = item.id;
  form.responsable = item.responsableId;
  form.kilos = item.kg;
  form.fecha = item.fecha.split('/').reverse().join('-');
  modalError.value = '';
  modalAbierto.value = true;
};

const cerrarModal = () => {
  modalAbierto.value = false;
  editandoId.value = null;
};

const guardarRecoleccion = async () => {
  guardando.value = true;
  modalError.value = '';
  const datos = {
    responsable: form.responsable,
    kilos: form.kilos,
    fecha: form.fecha,
  };

  const resultado = editandoId.value
    ? await editarRecoleccion(editandoId.value, datos)
    : await crearRecoleccion(datos);

  guardando.value = false;
  if (resultado.ok) {
    cerrarModal();
  } else {
    modalError.value = resultado.error;
  }
};

const confirmarEliminar = async (item) => {
  if (!window.confirm(`¿Eliminar la recolección de ${item.responsable} del ${item.fecha}?`)) return;
  const resultado = await eliminarRecoleccion(item.id);
  if (!resultado.ok) {
    window.alert(resultado.error);
  }
};
</script>

<style src="@src/assets/styles/recoleccion_view.css" scoped></style>

<style scoped>
/* Estilos mínimos para el modal de "Nueva recolección" (no dependen de
   clases del CSS existente, para no asumir nombres que no conocemos). */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-box {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}
.modal-title {
  margin: 0 0 16px;
  font-size: 1.1rem;
  font-weight: 600;
}
.modal-field {
  margin-bottom: 14px;
}
.modal-field select,
.modal-field input {
  width: 100%;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}
.modal-error {
  margin-top: 4px;
}
</style>