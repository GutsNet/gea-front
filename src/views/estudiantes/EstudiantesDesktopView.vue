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
          <h3 class="stat-value">{{ estudiantesActivos }}</h3>
          <p class="stat-trend">Con estatus activo en el sistema</p>
        </div>
      </div>

      <!-- Kgs recolectados -->
      <div class="stat-card border-purple">
        <div class="stat-icon-wrapper bg-light-purple">
          <svg viewBox="0 0 24 24" class="icon-stat text-purple" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">Kgs recolectados</p>
          <h3 class="stat-value">{{ kgRecolectadosTotal.toFixed(1) }} kg</h3>
          <p class="stat-trend">Total acumulado del sistema</p>
        </div>
      </div>

      <!-- Grupos -->
      <div class="stat-card border-blue">
        <div class="stat-icon-wrapper bg-light-blue">
          <svg viewBox="0 0 24 24" class="icon-stat text-blue" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">Grupos</p>
          <h3 class="stat-value">{{ grupos.length }}</h3>
          <p class="stat-trend">Grupos distintos registrados</p>
        </div>
      </div>
    </div>

    <!-- Barra de Búsqueda y Filtros -->
    <div class="toolbar">
      <div class="search-group">
        <div class="search-box">
          <svg viewBox="0 0 24 24" class="icon-search" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            placeholder="Buscar estudiante por usuario o matrícula..."
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
          <label>Grupo</label>
          <select :value="filtros.grupo" @change="setFiltro('grupo', $event.target.value)">
            <option value="">Todos</option>
            <option v-for="g in grupos" :key="g" :value="g">{{ g }}</option>
          </select>
        </div>
        <div class="select-wrapper">
          <label>Cuatrimestre</label>
          <select :value="filtros.cuatrimestre" @change="setFiltro('cuatrimestre', $event.target.value)">
            <option value="">Todos</option>
            <option v-for="c in CUATRIMESTRES" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="select-wrapper">
          <label>Estado</label>
          <select :value="filtros.estatus" @change="setFiltro('estatus', $event.target.value)">
            <option value="">Todos</option>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </div>
        <button class="btn-outline btn-filter" @click="limpiarFiltros" title="Limpiar filtros">
          <svg viewBox="0 0 24 24" class="icon-sm" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          Limpiar
        </button>
      </div>
    </div>

    <!-- Barra secundaria: Totales y Nuevo Estudiante -->
    <div class="action-bar">
      <p class="summary-text">Total: {{ count }} estudiantes</p>
      <button v-if="esRoot" class="btn-primary" @click="abrirModal">
        + Nuevo estudiante
      </button>
    </div>

    <!-- Estados de carga y error -->
    <div v-if="loading" class="state-msg">Cargando estudiantes...</div>
    <div v-else-if="error" class="state-msg error-msg">{{ error }}</div>
    <div v-else-if="estudiantes.length === 0" class="state-msg">No se encontraron estudiantes con los filtros seleccionados.</div>

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
        <tr v-for="estudiante in estudiantes" :key="estudiante.id">
          <!-- Estudiante -->
          <td>
            <div class="double-text">
              <span class="primary-text font-medium">{{ estudiante.username }}</span>
              <span class="secondary-text">Cuatrimestre {{ estudiante.cuatrimestre }}</span>
            </div>
          </td>

          <!-- Matrícula -->
          <td class="text-gray">{{ estudiante.matricula }}</td>

          <!-- Grupo -->
          <td>
              <span class="primary-text" :class="{'multiline': estudiante.grupo && estudiante.grupo.length > 25}">
                {{ estudiante.grupo }}
              </span>
          </td>

          <!-- Kgs recolectados -->
          <td class="text-right text-gray">
            <span v-if="estudiante.kgsCargando">…</span>
            <span v-else>{{ estudiante.kgs.toFixed(1) }} kg</span>
          </td>

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
              <span class="secondary-text" v-if="estudiante.horaActividad">{{ estudiante.horaActividad }}</span>
            </div>
          </td>

          <!-- Acciones -->
          <td>
            <div class="actions-cell">
              <button class="btn-icon" aria-label="Ver detalles" @click="$emit('ver-detalle', estudiante.id)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button v-if="esRoot" class="btn-icon" aria-label="Editar estudiante" @click="abrirModalEditar(estudiante)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button v-if="esRoot" class="btn-icon btn-icon-danger" aria-label="Eliminar estudiante" @click="confirmarEliminar(estudiante)">
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
          Mostrando {{ rangoMostrado.desde }} a {{ rangoMostrado.hasta }} de {{ count }} estudiantes
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

    <!-- Modal: Nuevo estudiante -->
    <div v-if="modalAbierto" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal-box">
        <h3 class="modal-title">{{ editandoId ? 'Editar estudiante' : 'Nuevo estudiante' }}</h3>

        <form @submit.prevent="guardarEstudiante">
          <div class="select-wrapper modal-field">
            <label>Matrícula</label>
            <input type="text" v-model="form.matricula" required />
          </div>

          <div class="select-wrapper modal-field">
            <label>Usuario</label>
            <input type="text" v-model="form.username" required />
          </div>

          <div class="select-wrapper modal-field">
            <label>Contraseña</label>
            <input type="password" v-model="form.password" minlength="8" :required="!editandoId" />
            <p v-if="editandoId" class="secondary-text" style="font-size: 0.85rem; margin-top: 4px;">Dejar en blanco para conservar la contraseña actual.</p>
          </div>

          <div class="select-wrapper modal-field">
            <label>Grupo</label>
            <input type="text" v-model="form.grupo" placeholder="Ej. 3A" />
          </div>

          <div class="select-wrapper modal-field">
            <label>Cuatrimestre</label>
            <select v-model.number="form.cuatrimestre">
              <option v-for="c in CUATRIMESTRES" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>

          <div class="select-wrapper modal-field checkbox-field">
            <label>
              <input type="checkbox" v-model="form.estatus" />
              Activo
            </label>
          </div>

          <p v-if="modalError" class="state-msg error-msg modal-error">{{ modalError }}</p>

          <div class="modal-actions">
            <button type="button" class="btn-outline" @click="cerrarModal">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="guardando">
              {{ guardando ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { useEstudiantes } from '@src/composables/useEstudiantes.js';
import { hasRole } from '@src/services/authService';

defineEmits(['ver-detalle']);

const {
  estudiantes,
  loading,
  error,
  count,
  grupos,
  CUATRIMESTRES,

  estudiantesActivos,
  kgRecolectadosTotal,

  filtros,
  paginacion,
  totalPages,
  rangoMostrado,

  getStatusBadgeClass,
  setSearch,
  searchNow,
  setFiltro,
  limpiarFiltros,
  irAPagina,
  setPageSize,
  crearEstudiante,
  editarEstudiante,
  eliminarEstudiante,
} = useEstudiantes();

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

const esRoot = computed(() => hasRole('root'));

const modalAbierto = ref(false);
const editandoId = ref(null);
const guardando = ref(false);
const modalError = ref('');
const form = reactive({
  matricula: '',
  username: '',
  password: '',
  grupo: '',
  cuatrimestre: 1,
  estatus: true,
});

const abrirModal = () => {
  editandoId.value = null;
  form.matricula = '';
  form.username = '';
  form.password = '';
  form.grupo = '';
  form.cuatrimestre = 1;
  form.estatus = true;
  modalError.value = '';
  modalAbierto.value = true;
};

const abrirModalEditar = (estudiante) => {
  editandoId.value = estudiante.id;
  form.matricula = estudiante.matricula;
  form.username = estudiante.username;
  form.password = '';
  form.grupo = estudiante.grupo;
  form.cuatrimestre = estudiante.cuatrimestre;
  form.estatus = estudiante.estatus;
  modalError.value = '';
  modalAbierto.value = true;
};

const cerrarModal = () => {
  modalAbierto.value = false;
  editandoId.value = null;
};

const guardarEstudiante = async () => {
  guardando.value = true;
  modalError.value = '';
  const payload = {
    matricula: form.matricula,
    username: form.username,
    grupo: form.grupo,
    cuatrimestre: form.cuatrimestre,
    estatus: form.estatus,
  };
  if (form.password) payload.password = form.password;

  const resultado = editandoId.value
    ? await editarEstudiante(editandoId.value, payload)
    : await crearEstudiante({ ...payload, password: form.password });

  guardando.value = false;
  if (resultado.ok) {
    cerrarModal();
  } else {
    modalError.value = resultado.error;
  }
};

const confirmarEliminar = async (estudiante) => {
  if (!window.confirm(`¿Eliminar a ${estudiante.username} (${estudiante.matricula})?`)) return;
  const resultado = await eliminarEstudiante(estudiante.id);
  if (!resultado.ok) {
    window.alert(resultado.error);
  }
};
</script>

<style src="@src/assets/styles/estudiantes_view.css" scoped></style>

<style scoped>
/* Estilos mínimos para el modal de "Nuevo estudiante" (no dependen de
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
  max-height: 90vh;
  overflow-y: auto;
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
.modal-field input[type="text"],
.modal-field input[type="password"] {
  width: 100%;
}
.checkbox-field label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: normal;
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