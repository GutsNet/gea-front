<!--
G.E.A. Frontend
Layout móvil de Usuarios — listado funcional con CRUD.
-->

<template>
  <section class="usuarios-wrapper" style="padding: 0.75rem;">

    <!-- Búsqueda -->
    <div style="margin-bottom: 0.75rem;">
      <div class="search-box" style="width: 100%;">
        <svg viewBox="0 0 24 24" class="icon-search" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          type="text"
          placeholder="Buscar usuario..."
          :value="filtros.search"
          @input="setSearch($event.target.value)"
          @keyup.enter="searchNow"
          style="width: 100%;"
        />
      </div>
    </div>

    <!-- Filtros en fila -->
    <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem; flex-wrap: wrap;">
      <select :value="filtros.rol" @change="setFiltro('rol', $event.target.value)" style="flex: 1; min-width: 100px; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.85rem;">
        <option value="">Todos los roles</option>
        <option v-for="r in ROLES" :key="r.value" :value="r.value">{{ r.label }}</option>
      </select>
      <select :value="filtros.estatus" @change="setFiltro('estatus', $event.target.value)" style="flex: 1; min-width: 100px; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.85rem;">
        <option value="">Todos</option>
        <option value="true">Activo</option>
        <option value="false">Inactivo</option>
      </select>
    </div>

    <!-- Barra acciones -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
      <span style="font-size: 0.85rem; color: #64748b;">{{ count }} usuarios</span>
      <button v-if="esRoot" class="btn-primary" @click="abrirModalCrear" style="font-size: 0.85rem; padding: 0.4rem 0.75rem;">+ Nuevo</button>
    </div>

    <!-- Estados -->
    <div v-if="loading" class="state-msg">Cargando...</div>
    <div v-else-if="error" class="state-msg error-msg">{{ error }}</div>
    <div v-else-if="usuarios.length === 0" class="state-msg">Sin resultados.</div>

    <!-- Lista de tarjetas -->
    <div v-else style="display: flex; flex-direction: column; gap: 0.75rem;">
      <div
        v-for="u in usuarios"
        :key="u.id"
        style="background: white; border-radius: 10px; padding: 1rem; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.03);"
      >
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
          <div>
            <div style="font-weight: 600; font-size: 0.95rem; color: #1e293b;">{{ u.username }}</div>
            <div style="font-size: 0.8rem; color: #64748b;">{{ u.matricula }}</div>
          </div>
          <span class="status-pill" :class="getRolBadgeClass(u.rol)" style="font-size: 0.7rem;">{{ u.rolLabel }}</span>
        </div>

        <div style="display: flex; gap: 1rem; font-size: 0.8rem; color: #64748b; margin-bottom: 0.5rem;">
          <span>Grupo: {{ u.grupo }}</span>
          <span>Cuatri: {{ u.cuatrimestre }}</span>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="status-pill" :class="getStatusBadgeClass(u.estado)" style="font-size: 0.7rem;">{{ u.estado }}</span>
          <div v-if="esRoot" style="display: flex; gap: 0.5rem;">
            <button class="btn-icon" @click="abrirModalEditar(u)" aria-label="Editar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn-icon" style="color: #ef4444; border-color: #fecaca;" @click="confirmarEliminar(u)" aria-label="Eliminar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Paginación móvil -->
    <div style="display: flex; justify-content: center; align-items: center; gap: 0.5rem; margin-top: 1rem;" v-if="totalPages > 1">
      <button class="page-arrow" :disabled="paginacion.page <= 1" @click="irAPagina(paginacion.page - 1)">&lt;</button>
      <span style="font-size: 0.85rem; color: #64748b;">{{ paginacion.page }} / {{ totalPages }}</span>
      <button class="page-arrow" :disabled="paginacion.page >= totalPages" @click="irAPagina(paginacion.page + 1)">&gt;</button>
    </div>

    <!-- Modal: Crear / Editar (reutilizado del desktop) -->
    <Modal v-model="modalAbierto">
      <template #title>{{ editandoId ? 'Editar usuario' : 'Nuevo usuario' }}</template>

      <template v-slot:default>
        <form @submit.prevent="guardarUsuario">
          <div class="modal-field"><label>Matrícula</label><input type="text" v-model="form.matricula" required :disabled="!!editandoId" style="width: 100%;" /></div>
          <div class="modal-field"><label>Usuario</label><input type="text" v-model="form.username" required style="width: 100%;" /></div>
          <div class="modal-field"><label>{{ editandoId ? 'Nueva contraseña' : 'Contraseña' }}</label><input type="password" v-model="form.password" :required="!editandoId" style="width: 100%;" /></div>
          <div class="modal-field"><label>Rol</label><select v-model="form.rol" required style="width: 100%;"><option v-for="r in ROLES" :key="r.value" :value="r.value">{{ r.label }}</option></select></div>
          <div class="modal-field"><label>Grupo</label><input type="text" v-model="form.grupo" style="width: 100%;" /></div>
          <div class="modal-field"><label>Cuatrimestre</label><select v-model.number="form.cuatrimestre" style="width: 100%;"><option v-for="c in CUATRIMESTRES" :key="c" :value="c">{{ c }}</option></select></div>
          <div class="modal-field" style="display: flex; align-items: center; gap: 8px;"><input type="checkbox" v-model="form.estatus" /><label>Activo</label></div>
          <p v-if="modalError" class="state-msg error-msg" style="font-size: 0.85rem;">{{ modalError }}</p>
        </form>
      </template>

      <template #actions>
        <div style="display:flex; gap:0.5rem;">
          <button type="button" class="btn-outline" @click="cerrarModal">Cancelar</button>
          <button type="button" class="btn-primary" @click="guardarUsuario" :disabled="guardandoModal">{{ guardandoModal ? 'Guardando...' : 'Guardar' }}</button>
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
  usuarios, loading, error, count, esRoot, ROLES,
  filtros, paginacion, totalPages, rangoMostrado, paginasVisibles,
  getRolBadgeClass, getStatusBadgeClass,
  setSearch, searchNow, setFiltro, limpiarFiltros,
  irAPagina, setPageSize,
  crearUsuario, editarUsuario, eliminarUsuario,
} = useUsuarios();

const modalAbierto = ref(false);
const editandoId = ref(null);
const guardandoModal = ref(false);
const modalError = ref('');

const form = reactive({
  matricula: '', username: '', password: '',
  rol: 'user', grupo: '', cuatrimestre: 1, estatus: true,
});

const abrirModalCrear = () => {
  editandoId.value = null;
  Object.assign(form, { matricula: '', username: '', password: '', rol: 'user', grupo: '', cuatrimestre: 1, estatus: true });
  modalError.value = '';
  modalAbierto.value = true;
};

const abrirModalEditar = (u) => {
  editandoId.value = u.id;
  Object.assign(form, { matricula: u.matricula, username: u.username, password: '', rol: u.rol, grupo: u.grupo, cuatrimestre: u.cuatrimestre, estatus: u.estatus });
  modalError.value = '';
  modalAbierto.value = true;
};

const cerrarModal = () => { modalAbierto.value = false; editandoId.value = null; };

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
  if (resultado.ok) cerrarModal();
  else modalError.value = resultado.error;
};

const confirmarEliminar = async (u) => {
  if (!window.confirm(`¿Eliminar a ${u.matricula}?`)) return;
  const r = await eliminarUsuario(u.id);
  if (!r.ok) alert(r.error);
};
</script>

<style src="@src/assets/styles/estudiantes_view.css" scoped></style>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(15,23,42,0.45);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal-box {
  background: #fff; border-radius: 12px; padding: 20px;
  width: 100%; max-height: 90vh; overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}
.modal-title { margin: 0 0 14px; font-size: 1rem; font-weight: 600; }
.modal-field { margin-bottom: 12px; display: flex; flex-direction: column; gap: 4px; }
.modal-field label { font-size: 0.8rem; color: #64748b; }
.modal-field input, .modal-field select {
  padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9rem;
}
</style>