<!--
G.E.A. Frontend
Layout de escritorio de Usuarios — CRUD completo.
Solo accesible por Root (crear/editar/eliminar) y Administrativo (listar).
-->

<template>
  <section class="usuarios-wrapper">

    <!-- Barra de Búsqueda y Filtros -->
    <div class="toolbar">
      <div class="search-group">
        <div class="search-box">
          <svg viewBox="0 0 24 24" class="icon-search" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            placeholder="Buscar por matrícula o usuario..."
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
          <label>Rol</label>
          <select :value="filtros.rol" @change="setFiltro('rol', $event.target.value)">
            <option value="">Todos</option>
            <option v-for="r in ROLES" :key="r.value" :value="r.value">{{ r.label }}</option>
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

    <!-- Barra: Total y Nuevo Usuario -->
    <div class="action-bar">
      <p class="summary-text">Total: {{ count }} usuarios</p>
      <button v-if="esRoot" class="btn-primary" @click="abrirModalCrear">
        + Nuevo usuario
      </button>
    </div>

    <!-- Estados de carga y error -->
    <div v-if="loading" class="state-msg">Cargando usuarios...</div>
    <div v-else-if="error" class="state-msg error-msg">{{ error }}</div>
    <div v-else-if="usuarios.length === 0" class="state-msg">No se encontraron usuarios con los filtros seleccionados.</div>

    <!-- Tabla Principal -->
    <div v-else class="table-container">
      <table class="data-table">
        <thead>
        <tr>
          <th>Usuario</th>
          <th>Matrícula</th>
          <th class="text-center">Rol</th>
          <th>Grupo</th>
          <th class="text-center">Estado</th>
          <th>Último acceso</th>
          <th v-if="esRoot" class="text-center">Acciones</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="u in usuarios" :key="u.id">
          <td>
            <div class="double-text">
              <span class="primary-text font-medium">{{ u.username }}</span>
              <span class="secondary-text">Cuatrimestre {{ u.cuatrimestre }}</span>
            </div>
          </td>
          <td class="text-gray">{{ u.matricula }}</td>
          <td class="text-center">
            <span class="status-pill" :class="getRolBadgeClass(u.rol)">{{ u.rolLabel }}</span>
          </td>
          <td>{{ u.grupo }}</td>
          <td class="text-center">
            <span class="status-pill" :class="getStatusBadgeClass(u.estado)">{{ u.estado }}</span>
          </td>
          <td>
            <div class="double-text">
              <span class="primary-text">{{ u.ultimoAccesoFecha }}</span>
              <span class="secondary-text" v-if="u.ultimoAccesoHora">{{ u.ultimoAccesoHora }}</span>
            </div>
          </td>
          <td v-if="esRoot">
            <div class="actions-cell">
              <button class="btn-icon" aria-label="Editar usuario" @click="abrirModalEditar(u)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="btn-icon btn-icon-danger" aria-label="Eliminar usuario" @click="confirmarEliminar(u)">
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
          Mostrando {{ rangoMostrado.desde }} a {{ rangoMostrado.hasta }} de {{ count }} usuarios
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

    <!-- Modal: Crear / Editar usuario -->
    <Modal v-model="modalAbierto">
      <template #title>{{ editandoId ? 'Editar usuario' : 'Nuevo usuario' }}</template>

      <template v-slot:default>
        <form @submit.prevent="guardarUsuario">
          <div class="select-wrapper modal-field">
            <label>Matrícula</label>
            <input type="text" v-model="form.matricula" required :disabled="!!editandoId" />
          </div>

          <div class="select-wrapper modal-field">
            <label>Usuario</label>
            <input type="text" v-model="form.username" required />
          </div>

          <div class="select-wrapper modal-field">
            <label>{{ editandoId ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña' }}</label>
            <input type="password" v-model="form.password" :minlength="editandoId ? 0 : 8" :required="!editandoId" />
          </div>

          <div class="select-wrapper modal-field">
            <label>Rol</label>
            <select v-model="form.rol" required>
              <option v-for="r in ROLES" :key="r.value" :value="r.value">{{ r.label }}</option>
            </select>
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
        </form>
      </template>

      <template #actions>
        <div class="modal-actions">
          <button type="button" class="btn-outline" @click="cerrarModal">Cancelar</button>
          <button type="button" class="btn-primary" @click="guardarUsuario" :disabled="guardandoModal">
            {{ guardandoModal ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </template>
    </Modal>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useUsuarios, CUATRIMESTRES } from '@src/composables/useUsuarios';
import Modal from '@src/components/common/Modal.vue';

const {
  usuarios,
  loading,
  error,
  count,
  esRoot,
  ROLES,

  filtros,
  paginacion,
  totalPages,
  rangoMostrado,
  paginasVisibles,

  getRolBadgeClass,
  getStatusBadgeClass,

  setSearch,
  searchNow,
  setFiltro,
  limpiarFiltros,
  irAPagina,
  setPageSize,

  crearUsuario,
  editarUsuario,
  eliminarUsuario,
} = useUsuarios();

// --- Modal Crear/Editar ---
const modalAbierto = ref(false);
const editandoId = ref(null);
const guardandoModal = ref(false);
const modalError = ref('');

const form = reactive({
  matricula: '',
  username: '',
  password: '',
  rol: 'user',
  grupo: '',
  cuatrimestre: 1,
  estatus: true,
});

const abrirModalCrear = () => {
  editandoId.value = null;
  form.matricula = '';
  form.username = '';
  form.password = '';
  form.rol = 'user';
  form.grupo = '';
  form.cuatrimestre = 1;
  form.estatus = true;
  modalError.value = '';
  modalAbierto.value = true;
};

const abrirModalEditar = (u) => {
  editandoId.value = u.id;
  form.matricula = u.matricula;
  form.username = u.username;
  form.password = '';
  form.rol = u.rol;
  form.grupo = u.grupo;
  form.cuatrimestre = u.cuatrimestre;
  form.estatus = u.estatus;
  modalError.value = '';
  modalAbierto.value = true;
};

const cerrarModal = () => {
  modalAbierto.value = false;
  editandoId.value = null;
};

const guardarUsuario = async () => {
  guardandoModal.value = true;
  modalError.value = '';

  let resultado;
  if (editandoId.value) {
    const datos = { ...form };
    if (!datos.password) delete datos.password;
    resultado = await editarUsuario(editandoId.value, datos);
  } else {
    resultado = await crearUsuario({ ...form });
  }

  guardandoModal.value = false;
  if (resultado.ok) {
    cerrarModal();
  } else {
    modalError.value = resultado.error;
  }
};

const confirmarEliminar = async (u) => {
  const ok = window.confirm(`¿Eliminar al usuario ${u.matricula} (${u.username})? Esta acción no se puede deshacer.`);
  if (!ok) return;
  const resultado = await eliminarUsuario(u.id);
  if (!resultado.ok) {
    alert(resultado.error);
  }
};
</script>

<style src="@src/assets/styles/estudiantes_view.css" scoped></style>

<style scoped>
/* Reutilizamos los estilos de estudiantes_view.css (misma estructura de tabla).
   Wrapper class diferente para no colisionar. */
.usuarios-wrapper {
  padding: 0;
}

.pill-light-blue { background-color: #dbeafe; }
.text-blue { color: #2563eb; }

.btn-icon-danger {
  color: #ef4444 !important;
  border-color: #fecaca !important;
}
.btn-icon-danger:hover {
  background: #fef2f2 !important;
}

/* Modal */
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
  max-width: 480px;
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