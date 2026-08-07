<!--
G.E.A. Frontend
Layout de escritorio de Configuración.
Pestañas: Apariencia, Especies, Zonas, Respaldos.
-->

<template>
  <div class="config-main">
    <div class="config-desktop">
      <div class="config-layout">
        <!-- Sidebar de sub-navegación -->
        <aside class="config-nav">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            class="config-nav-item"
            :class="{ 'config-nav-item-active': activeTab === tab.key }"
            @click="onTabChange(tab.key)"
          >
            <v-icon size="20">{{ tab.icon }}</v-icon>
            <span>{{ tab.label }}</span>
          </button>
        </aside>

        <!-- Panel de contenido -->
        <div class="config-panel">

          <!-- ═══ APARIENCIA ═══ -->
          <template v-if="activeTab === 'apariencia'">
            <h3 class="config-panel-title">Apariencia</h3>
            <p class="config-panel-subtitle">Personaliza el aspecto visual de la aplicación.</p>

            <!-- Tema -->
            <div class="config-section">
              <h4>Tema</h4>
              <p class="config-desc">Selecciona el tema de la interfaz.</p>

              <div class="theme-options">
                <button
                  v-for="opt in temaOptions"
                  :key="opt.value"
                  type="button"
                  class="theme-card"
                  :class="{ 'theme-card-active': tema === opt.value }"
                  @click="tema = opt.value"
                >
                  <span class="theme-radio" :class="{ 'theme-radio-checked': tema === opt.value }"></span>
                  <v-icon size="26">{{ opt.icon }}</v-icon>
                  <span class="theme-label">{{ opt.label }}</span>
                </button>
              </div>
            </div>

            <!-- Color principal -->
            <div class="config-section">
              <h4>Color principal</h4>
              <p class="config-desc">Elige el color principal de la aplicación.</p>

              <div class="color-row">
                <div class="color-input-group">
                  <span class="color-swatch" :style="{ background: colorPrincipal }"></span>
                  <v-text-field
                    v-model="colorPrincipal"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="color-text-field"
                    append-inner-icon="mdi-chevron-down"
                  ></v-text-field>
                </div>

                <div class="color-presets">
                  <button
                    v-for="preset in colorPresets"
                    :key="preset"
                    type="button"
                    class="preset-dot"
                    :style="{ background: preset }"
                    :aria-label="`Usar color ${preset}`"
                    @click="colorPrincipal = preset"
                  >
                    <v-icon v-if="isSameColor(preset, colorPrincipal)" size="16" color="white">mdi-check</v-icon>
                  </button>
                </div>
              </div>
            </div>

            <!-- Logo -->
            <div class="config-section">
              <h4>Logo del sistema</h4>
              <p class="config-desc">Este logo se muestra en el menú lateral y en la barra superior.</p>

              <div class="logo-row">
                <div class="logo-preview">
                  <img :src="logoPreview" alt="Logo actual del sistema" class="logo-preview-img" />
                  <span class="logo-preview-name">G.E.A.</span>
                  <span class="logo-preview-sub">Gestión Ecológica Arbórea</span>
                </div>

                <div class="logo-actions">
                  <v-btn variant="outlined" color="primary" prepend-icon="mdi-tray-arrow-up" @click="triggerFileInput">
                    Cambiar logo
                  </v-btn>
                  <input
                    ref="fileInputRef"
                    type="file"
                    accept=".png,.jpg,.jpeg,.svg"
                    class="hidden-input"
                    @change="onLogoChange"
                  />
                  <p class="logo-hint">
                    Formatos permitidos: PNG, JPG, SVG.<br />
                    Tamaño recomendado: 512x512 px.
                  </p>
                </div>
              </div>
            </div>

            <!-- Animaciones -->
            <div class="config-section config-section-toggle">
              <div>
                <h4>Mostrar animaciones</h4>
                <p class="config-desc">Habilita o deshabilita las animaciones y transiciones en la interfaz.</p>
              </div>
              <v-switch v-model="mostrarAnimaciones" color="primary" hide-details inset></v-switch>
            </div>

            <div class="config-footer">
              <span v-if="savedMessage" class="config-saved-msg">
                <v-icon size="16" color="primary">mdi-check-circle</v-icon>
                {{ savedMessage }}
              </span>
              <v-btn color="primary" prepend-icon="mdi-content-save" :loading="guardando" @click="guardarCambios">
                Guardar cambios
              </v-btn>
            </div>
          </template>

          <!-- ═══ ESPECIES ═══ -->
          <template v-else-if="activeTab === 'especies'">
            <div class="crud-header">
              <div>
                <h3 class="config-panel-title">Especies</h3>
                <p class="config-panel-subtitle">Gestiona el catálogo de especies arbóreas.</p>
              </div>
              <button class="crud-btn-primary" @click="abrirModalEspecie()">+ Nueva especie</button>
            </div>

            <!-- Búsqueda -->
            <div class="crud-search">
              <svg viewBox="0 0 24 24" class="crud-search-icon" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" placeholder="Buscar especie..." v-model="especiesBusqueda" />
            </div>

            <div v-if="especiesLoading" class="crud-state">Cargando especies...</div>
            <div v-else-if="especiesError" class="crud-state crud-error">{{ especiesError }}</div>
            <div v-else-if="especiesFiltradas.length === 0" class="crud-state">No se encontraron especies.</div>

            <div v-else class="crud-table-wrap">
              <table class="crud-table">
                <thead>
                  <tr>
                    <th>Nombre común</th>
                    <th>Nombre científico</th>
                    <th class="text-center">Nativa</th>
                    <th class="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="e in especiesFiltradas" :key="e.id">
                    <td class="font-medium">{{ e.nombre }}</td>
                    <td class="text-italic text-gray">{{ e.nombre_cientifico }}</td>
                    <td class="text-center">
                      <span v-if="e.nativa" class="crud-badge crud-badge-green">Sí</span>
                      <span v-else class="crud-badge crud-badge-gray">No</span>
                    </td>
                    <td class="text-center">
                      <div class="crud-actions">
                        <button class="crud-btn-icon" @click="abrirModalEspecie(e)" aria-label="Editar">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button class="crud-btn-icon crud-btn-danger" @click="confirmarEliminarEspecie(e)" aria-label="Eliminar">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Modal Especie -->
            <Modal v-model="modalEspecieAbierto">
              <template #title>{{ editandoEspecie ? 'Editar especie' : 'Nueva especie' }}</template>
              <template v-slot:default>
                <form @submit.prevent="guardarEspecie">
                  <div class="crud-field"><label>Nombre común</label><input type="text" v-model="formEspecie.nombre" required /></div>
                  <div class="crud-field"><label>Nombre científico</label><input type="text" v-model="formEspecie.nombre_cientifico" required /></div>
                  <div class="crud-field crud-field-checkbox"><input type="checkbox" v-model="formEspecie.nativa" /><label>Especie nativa</label></div>
                  <p v-if="especieModalError" class="crud-error" style="font-size: 0.85rem;">{{ especieModalError }}</p>
                </form>
              </template>
              <template #actions>
                <div class="crud-modal-actions">
                  <button type="button" class="crud-btn-outline" @click="cerrarModalEspecie">Cancelar</button>
                  <button type="button" class="crud-btn-primary" @click="guardarEspecie" :disabled="guardandoEspecie">{{ guardandoEspecie ? 'Guardando...' : 'Guardar' }}</button>
                </div>
              </template>
            </Modal>
          </template>

          <!-- ═══ ZONAS ═══ -->
          <template v-else-if="activeTab === 'zonas'">
            <div class="crud-header">
              <div>
                <h3 class="config-panel-title">Zonas / Ubicaciones</h3>
                <p class="config-panel-subtitle">Gestiona las áreas del campus donde se registran árboles.</p>
              </div>
              <button class="crud-btn-primary" @click="abrirModalZona()">+ Nueva zona</button>
            </div>

            <div class="crud-search">
              <svg viewBox="0 0 24 24" class="crud-search-icon" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" placeholder="Buscar zona..." v-model="zonasBusqueda" />
            </div>

            <div v-if="zonasLoading" class="crud-state">Cargando zonas...</div>
            <div v-else-if="zonasError" class="crud-state crud-error">{{ zonasError }}</div>
            <div v-else-if="zonasFiltradas.length === 0" class="crud-state">No se encontraron zonas.</div>

            <div v-else class="crud-table-wrap">
              <table class="crud-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Coordenadas</th>
                    <th class="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="z in zonasFiltradas" :key="z.id">
                    <td class="font-medium">{{ z.nombre }}</td>
                    <td class="text-gray" style="font-family: monospace; font-size: 0.85rem;">{{ z.coordenadas }}</td>
                    <td class="text-center">
                      <div class="crud-actions">
                        <button class="crud-btn-icon" @click="abrirModalZona(z)" aria-label="Editar">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button class="crud-btn-icon crud-btn-danger" @click="confirmarEliminarZona(z)" aria-label="Eliminar">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Modal Zona -->
            <Modal v-model="modalZonaAbierto">
              <template #title>{{ editandoZona ? 'Editar zona' : 'Nueva zona' }}</template>
              <template v-slot:default>
                <form @submit.prevent="guardarZona">
                  <div class="crud-field"><label>Nombre</label><input type="text" v-model="formZona.nombre" required /></div>
                  <div class="crud-field"><label>Coordenadas</label><input type="text" v-model="formZona.coordenadas" placeholder="Ej. 20.0500, -99.3400" required /></div>
                  <p v-if="zonaModalError" class="crud-error" style="font-size: 0.85rem;">{{ zonaModalError }}</p>
                </form>
              </template>
              <template #actions>
                <div class="crud-modal-actions">
                  <button type="button" class="crud-btn-outline" @click="cerrarModalZona">Cancelar</button>
                  <button type="button" class="crud-btn-primary" @click="guardarZona" :disabled="guardandoZona">{{ guardandoZona ? 'Guardando...' : 'Guardar' }}</button>
                </div>
              </template>
            </Modal>
          </template>

          <!-- ═══ RESPALDOS (placeholder) ═══ -->
          <template v-else>
            <h3 class="config-panel-title">{{ activeTabLabel }}</h3>
            <p class="config-panel-subtitle">Esta sección está en construcción.</p>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useConfiguracion } from '@src/composables/useConfiguracion';
import Modal from '@src/components/common/Modal.vue';

const {
  tabs,
  activeTab,
  activeTabLabel,
  onTabChange,
  temaOptions,
  tema,
  colorPrincipal,
  colorPresets,
  isSameColor,
  logoPreview,
  fileInputRef,
  triggerFileInput,
  onLogoChange,
  mostrarAnimaciones,
  guardando,
  savedMessage,
  guardarCambios,

  // Especies
  especiesFiltradas,
  especiesLoading,
  especiesError,
  especiesBusqueda,
  fetchEspecies,
  crearEspecie,
  editarEspecie,
  eliminarEspecie,

  // Zonas
  zonasFiltradas,
  zonasLoading,
  zonasError,
  zonasBusqueda,
  fetchZonas,
  crearZona,
  editarZona,
  eliminarZona,
} = useConfiguracion();

// ═══ Especies modal ═══
const modalEspecieAbierto = ref(false);
const editandoEspecie = ref(null); // id o null
const guardandoEspecie = ref(false);
const especieModalError = ref('');
const formEspecie = reactive({ nombre: '', nombre_cientifico: '', nativa: false });

const abrirModalEspecie = (e = null) => {
  if (e) {
    editandoEspecie.value = e.id;
    formEspecie.nombre = e.nombre;
    formEspecie.nombre_cientifico = e.nombre_cientifico;
    formEspecie.nativa = e.nativa;
  } else {
    editandoEspecie.value = null;
    formEspecie.nombre = '';
    formEspecie.nombre_cientifico = '';
    formEspecie.nativa = false;
  }
  especieModalError.value = '';
  modalEspecieAbierto.value = true;
};

const cerrarModalEspecie = () => { modalEspecieAbierto.value = false; };

const guardarEspecie = async () => {
  guardandoEspecie.value = true;
  especieModalError.value = '';
  let r;
  if (editandoEspecie.value) {
    r = await editarEspecie(editandoEspecie.value, { ...formEspecie });
  } else {
    r = await crearEspecie({ ...formEspecie });
  }
  guardandoEspecie.value = false;
  if (r.ok) cerrarModalEspecie();
  else especieModalError.value = r.error;
};

const confirmarEliminarEspecie = async (e) => {
  if (!window.confirm(`¿Eliminar la especie "${e.nombre}"?`)) return;
  const r = await eliminarEspecie(e.id);
  if (!r.ok) alert(r.error);
};

// ═══ Zonas modal ═══
const modalZonaAbierto = ref(false);
const editandoZona = ref(null);
const guardandoZona = ref(false);
const zonaModalError = ref('');
const formZona = reactive({ nombre: '', coordenadas: '' });

const abrirModalZona = (z = null) => {
  if (z) {
    editandoZona.value = z.id;
    formZona.nombre = z.nombre;
    formZona.coordenadas = z.coordenadas;
  } else {
    editandoZona.value = null;
    formZona.nombre = '';
    formZona.coordenadas = '';
  }
  zonaModalError.value = '';
  modalZonaAbierto.value = true;
};

const cerrarModalZona = () => { modalZonaAbierto.value = false; };

const guardarZona = async () => {
  guardandoZona.value = true;
  zonaModalError.value = '';
  let r;
  if (editandoZona.value) {
    r = await editarZona(editandoZona.value, { ...formZona });
  } else {
    r = await crearZona({ ...formZona });
  }
  guardandoZona.value = false;
  if (r.ok) cerrarModalZona();
  else zonaModalError.value = r.error;
};

const confirmarEliminarZona = async (z) => {
  if (!window.confirm(`¿Eliminar la zona "${z.nombre}"?`)) return;
  const r = await eliminarZona(z.id);
  if (!r.ok) alert(r.error);
};
</script>

<style src="@src/assets/styles/configuracion_view.css" scoped></style>

<style scoped>
/* ═══ CRUD compartido (Especies + Zonas) ═══ */
.crud-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
  gap: 1rem;
}

.crud-btn-primary {
  background-color: #15803d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  white-space: nowrap;
}
.crud-btn-primary:hover { background-color: #166534; }
.crud-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.crud-btn-outline {
  background: white;
  color: #475569;
  border: 1px solid #cbd5e1;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
}

.crud-search {
  position: relative;
  margin-bottom: 1rem;
}
.crud-search input {
  width: 100%;
  padding: 0.6rem 1rem 0.6rem 2.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  background: white;
}
.crud-search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #94a3b8;
}

.crud-state {
  padding: 2rem;
  text-align: center;
  color: #64748b;
  font-size: 0.9rem;
}
.crud-error { color: #ef4444; }

.crud-table-wrap {
  background: white;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}
.crud-table {
  width: 100%;
  border-collapse: collapse;
}
.crud-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  font-size: 0.8rem;
  font-weight: 500;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
}
.crud-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9rem;
}
.crud-table tr:last-child td { border-bottom: none; }
.crud-table tr:hover td { background: #f8fafc; }

.font-medium { font-weight: 500; }
.text-italic { font-style: italic; }
.text-gray { color: #64748b; }
.text-center { text-align: center; }

.crud-badge {
  display: inline-block;
  padding: 0.15rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}
.crud-badge-green { background: #dcfce7; color: #15803d; }
.crud-badge-gray { background: #f1f5f9; color: #64748b; }

.crud-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.crud-btn-icon {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.35rem;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.crud-btn-icon svg { width: 15px; height: 15px; }
.crud-btn-icon:hover { background: #f8fafc; color: #334155; }
.crud-btn-danger { color: #ef4444 !important; border-color: #fecaca !important; }
.crud-btn-danger:hover { background: #fef2f2 !important; }

/* Modal CRUD */
.crud-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.crud-modal {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 440px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}
.crud-modal-title {
  margin: 0 0 16px;
  font-size: 1.1rem;
  font-weight: 600;
}
.crud-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 14px;
}
.crud-field label {
  font-size: 0.8rem;
  color: #4b5563;
}
.crud-field input[type="text"] {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
}
.crud-field-checkbox {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}
.crud-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}
</style>