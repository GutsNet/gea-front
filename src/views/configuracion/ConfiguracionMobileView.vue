<!--
G.E.A. Frontend
Layout móvil de Configuración.
Pestañas: Apariencia, Especies, Zonas, Respaldos.
-->

<template>
  <div class="config-main">
    <div class="config-mobile">
      <!-- Tabs horizontales -->
      <div class="mobile-config-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="mobile-config-tab"
          :class="{ 'mobile-config-tab-active': activeTab === tab.key }"
          @click="onTabChange(tab.key)"
        >
          <v-icon size="16">{{ tab.icon }}</v-icon>
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <!-- Panel -->
      <div class="mobile-config-panel">

        <!-- ═══ APARIENCIA ═══ -->
        <template v-if="activeTab === 'apariencia'">
          <h3 class="mobile-config-panel-title">Apariencia</h3>
          <p class="mobile-config-panel-subtitle">Personaliza el aspecto visual de la aplicación.</p>

          <!-- Tema -->
          <div class="mobile-config-section">
            <h4>Tema</h4>
            <p class="config-desc">Selecciona el tema de la interfaz.</p>

            <div class="mobile-theme-options">
              <button
                v-for="opt in temaOptions"
                :key="opt.value"
                type="button"
                class="mobile-theme-card"
                :class="{ 'mobile-theme-card-active': tema === opt.value }"
                @click="tema = opt.value"
              >
                <span class="mobile-theme-radio" :class="{ 'mobile-theme-radio-checked': tema === opt.value }"></span>
                <v-icon size="22">{{ opt.icon }}</v-icon>
                <span class="mobile-theme-label">{{ opt.label }}</span>
              </button>
            </div>
          </div>

          <!-- Color principal -->
          <div class="mobile-config-section">
            <h4>Color principal</h4>
            <p class="config-desc">Elige el color principal de la aplicación.</p>

            <div class="mobile-color-input-group">
              <span class="color-swatch" :style="{ background: colorPrincipal }"></span>
              <v-text-field
                v-model="colorPrincipal"
                variant="outlined"
                density="compact"
                hide-details
                class="color-text-field flex-grow-1"
                append-inner-icon="mdi-chevron-down"
              ></v-text-field>
            </div>

            <div class="mobile-color-presets">
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

          <!-- Logo -->
          <div class="mobile-config-section">
            <h4>Logo del sistema</h4>
            <p class="config-desc">Este logo se muestra en el menú lateral y en la barra superior.</p>

            <div class="mobile-logo-row">
              <div class="logo-preview">
                <img :src="logoPreview" alt="Logo actual del sistema" class="logo-preview-img" />
                <span class="logo-preview-name">G.E.A.</span>
                <span class="logo-preview-sub">Gestión Ecológica Arbórea</span>
              </div>

              <div class="logo-actions">
                <v-btn block variant="outlined" color="primary" prepend-icon="mdi-tray-arrow-up" @click="triggerFileInput">
                  Cambiar logo
                </v-btn>
                <p class="logo-hint">
                  Formatos permitidos: PNG, JPG, SVG.<br />
                  Tamaño recomendado: 512x512 px.
                </p>
              </div>
            </div>
          </div>

          <!-- Animaciones -->
          <div class="mobile-config-section mobile-config-section-toggle">
            <div>
              <h4>Mostrar animaciones</h4>
              <p class="config-desc">Habilita o deshabilita las animaciones y transiciones en la interfaz.</p>
            </div>
            <v-switch v-model="mostrarAnimaciones" color="primary" hide-details inset></v-switch>
          </div>

          <div class="mobile-config-footer">
            <v-btn block color="primary" prepend-icon="mdi-content-save" :loading="guardando" @click="guardarCambios">
              Guardar cambios
            </v-btn>
            <span v-if="savedMessage" class="config-saved-msg">
              <v-icon size="16" color="primary">mdi-check-circle</v-icon>
              {{ savedMessage }}
            </span>
          </div>
        </template>

        <!-- ═══ ESPECIES ═══ -->
        <template v-else-if="activeTab === 'especies'">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <h3 class="mobile-config-panel-title" style="margin: 0;">Especies</h3>
            <button class="m-crud-btn-primary" @click="abrirModalEspecie()">+ Nueva</button>
          </div>

          <div class="m-crud-search">
            <input type="text" placeholder="Buscar especie..." v-model="especiesBusqueda" />
          </div>

          <div v-if="especiesLoading" class="m-crud-state">Cargando...</div>
          <div v-else-if="especiesError" class="m-crud-state m-crud-error">{{ especiesError }}</div>
          <div v-else-if="especiesFiltradas.length === 0" class="m-crud-state">Sin resultados.</div>

          <div v-else style="display: flex; flex-direction: column; gap: 0.5rem;">
            <div v-for="e in especiesFiltradas" :key="e.id" class="m-crud-card">
              <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 600; font-size: 0.9rem;">{{ e.nombre }}</div>
                <div style="font-style: italic; font-size: 0.8rem; color: #64748b;">{{ e.nombre_cientifico }}</div>
                <span v-if="e.nativa" style="display: inline-block; margin-top: 4px; padding: 0.1rem 0.4rem; background: #dcfce7; color: #15803d; border-radius: 3px; font-size: 0.7rem; font-weight: 600;">Nativa</span>
              </div>
              <div style="display: flex; gap: 0.4rem; align-items: flex-start;">
                <button class="m-crud-btn-icon" @click="abrirModalEspecie(e)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="m-crud-btn-icon" style="color: #ef4444; border-color: #fecaca;" @click="confirmarEliminarEspecie(e)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Modal Especie -->
          <Modal v-model="modalEspecieAbierto">
            <template #title>{{ editandoEspecie ? 'Editar especie' : 'Nueva especie' }}</template>
            <template v-slot:default>
              <form @submit.prevent="guardarEspecie">
                <div class="m-crud-field"><label>Nombre común</label><input type="text" v-model="formEspecie.nombre" required /></div>
                <div class="m-crud-field"><label>Nombre científico</label><input type="text" v-model="formEspecie.nombre_cientifico" required /></div>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;"><input type="checkbox" v-model="formEspecie.nativa" /><label style="font-size: 0.85rem;">Especie nativa</label></div>
                <p v-if="especieModalError" class="m-crud-error" style="font-size: 0.8rem;">{{ especieModalError }}</p>
              </form>
            </template>
            <template #actions>
              <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
                <button type="button" class="m-crud-btn-outline" @click="cerrarModalEspecie">Cancelar</button>
                <button type="button" class="m-crud-btn-primary" @click="guardarEspecie" :disabled="guardandoEspecie">{{ guardandoEspecie ? '...' : 'Guardar' }}</button>
              </div>
            </template>
          </Modal>
        </template>

        <!-- ═══ ZONAS ═══ -->
        <template v-else-if="activeTab === 'zonas'">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <h3 class="mobile-config-panel-title" style="margin: 0;">Zonas</h3>
            <button class="m-crud-btn-primary" @click="abrirModalZona()">+ Nueva</button>
          </div>

          <div class="m-crud-search">
            <input type="text" placeholder="Buscar zona..." v-model="zonasBusqueda" />
          </div>

          <div v-if="zonasLoading" class="m-crud-state">Cargando...</div>
          <div v-else-if="zonasError" class="m-crud-state m-crud-error">{{ zonasError }}</div>
          <div v-else-if="zonasFiltradas.length === 0" class="m-crud-state">Sin resultados.</div>

          <div v-else style="display: flex; flex-direction: column; gap: 0.5rem;">
            <div v-for="z in zonasFiltradas" :key="z.id" class="m-crud-card">
              <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 600; font-size: 0.9rem;">{{ z.nombre }}</div>
                <div style="font-family: monospace; font-size: 0.78rem; color: #64748b;">{{ z.coordenadas }}</div>
              </div>
              <div style="display: flex; gap: 0.4rem; align-items: flex-start;">
                <button class="m-crud-btn-icon" @click="abrirModalZona(z)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="m-crud-btn-icon" style="color: #ef4444; border-color: #fecaca;" @click="confirmarEliminarZona(z)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Modal Zona -->
          <Modal v-model="modalZonaAbierto">
            <template #title>{{ editandoZona ? 'Editar zona' : 'Nueva zona' }}</template>
            <template v-slot:default>
              <form @submit.prevent="guardarZona">
                <div class="m-crud-field"><label>Nombre</label><input type="text" v-model="formZona.nombre" required /></div>
                <div class="m-crud-field"><label>Coordenadas</label><input type="text" v-model="formZona.coordenadas" placeholder="20.0500, -99.3400" required /></div>
                <p v-if="zonaModalError" class="m-crud-error" style="font-size: 0.8rem;">{{ zonaModalError }}</p>
              </form>
            </template>
            <template #actions>
              <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
                <button type="button" class="m-crud-btn-outline" @click="cerrarModalZona">Cancelar</button>
                <button type="button" class="m-crud-btn-primary" @click="guardarZona" :disabled="guardandoZona">{{ guardandoZona ? '...' : 'Guardar' }}</button>
              </div>
            </template>
          </Modal>
        </template>

        <!-- Placeholders -->
        <template v-else>
          <h3 class="mobile-config-panel-title">{{ activeTabLabel }}</h3>
          <p class="mobile-config-panel-subtitle">Esta sección está en construcción.</p>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useConfiguracion } from '@src/composables/useConfiguracion';
import Modal from '@src/components/common/Modal.vue';

const {
  tabs, activeTab, activeTabLabel, onTabChange,
  temaOptions, tema, colorPrincipal, colorPresets, isSameColor,
  logoPreview, triggerFileInput, onLogoChange,
  mostrarAnimaciones, guardando, savedMessage, guardarCambios,

  especiesFiltradas, especiesLoading, especiesError, especiesBusqueda,
  fetchEspecies, crearEspecie, editarEspecie, eliminarEspecie,

  zonasFiltradas, zonasLoading, zonasError, zonasBusqueda,
  fetchZonas, crearZona, editarZona, eliminarZona,
} = useConfiguracion();

// Especies modal
const modalEspecieAbierto = ref(false);
const editandoEspecie = ref(null);
const guardandoEspecie = ref(false);
const especieModalError = ref('');
const formEspecie = reactive({ nombre: '', nombre_cientifico: '', nativa: false });

const abrirModalEspecie = (e = null) => {
  if (e) { editandoEspecie.value = e.id; Object.assign(formEspecie, { nombre: e.nombre, nombre_cientifico: e.nombre_cientifico, nativa: e.nativa }); }
  else { editandoEspecie.value = null; Object.assign(formEspecie, { nombre: '', nombre_cientifico: '', nativa: false }); }
  especieModalError.value = ''; modalEspecieAbierto.value = true;
};
const cerrarModalEspecie = () => { modalEspecieAbierto.value = false; };
const guardarEspecie = async () => {
  guardandoEspecie.value = true; especieModalError.value = '';
  const r = editandoEspecie.value ? await editarEspecie(editandoEspecie.value, { ...formEspecie }) : await crearEspecie({ ...formEspecie });
  guardandoEspecie.value = false;
  if (r.ok) cerrarModalEspecie(); else especieModalError.value = r.error;
};
const confirmarEliminarEspecie = async (e) => {
  if (!window.confirm(`¿Eliminar "${e.nombre}"?`)) return;
  const r = await eliminarEspecie(e.id); if (!r.ok) alert(r.error);
};

// Zonas modal
const modalZonaAbierto = ref(false);
const editandoZona = ref(null);
const guardandoZona = ref(false);
const zonaModalError = ref('');
const formZona = reactive({ nombre: '', coordenadas: '' });

const abrirModalZona = (z = null) => {
  if (z) { editandoZona.value = z.id; Object.assign(formZona, { nombre: z.nombre, coordenadas: z.coordenadas }); }
  else { editandoZona.value = null; Object.assign(formZona, { nombre: '', coordenadas: '' }); }
  zonaModalError.value = ''; modalZonaAbierto.value = true;
};
const cerrarModalZona = () => { modalZonaAbierto.value = false; };
const guardarZona = async () => {
  guardandoZona.value = true; zonaModalError.value = '';
  const r = editandoZona.value ? await editarZona(editandoZona.value, { ...formZona }) : await crearZona({ ...formZona });
  guardandoZona.value = false;
  if (r.ok) cerrarModalZona(); else zonaModalError.value = r.error;
};
const confirmarEliminarZona = async (z) => {
  if (!window.confirm(`¿Eliminar "${z.nombre}"?`)) return;
  const r = await eliminarZona(z.id); if (!r.ok) alert(r.error);
};
</script>

<style src="@src/assets/styles/configuracion_view.css" scoped></style>

<style scoped>
/* Mobile CRUD styles */
.m-crud-btn-primary {
  background: #15803d; color: white; border: none; padding: 0.4rem 0.75rem;
  border-radius: 6px; font-weight: 500; font-size: 0.85rem; cursor: pointer;
}
.m-crud-btn-primary:disabled { opacity: 0.6; }
.m-crud-btn-outline {
  background: white; color: #475569; border: 1px solid #cbd5e1;
  padding: 0.4rem 0.75rem; border-radius: 6px; font-size: 0.85rem; cursor: pointer;
}
.m-crud-search { margin-bottom: 0.75rem; }
.m-crud-search input {
  width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1;
  border-radius: 6px; font-size: 0.85rem; outline: none;
}
.m-crud-state { padding: 1.5rem; text-align: center; color: #64748b; font-size: 0.85rem; }
.m-crud-error { color: #ef4444; }
.m-crud-card {
  background: white; border-radius: 8px; padding: 0.75rem; border: 1px solid #e2e8f0;
  display: flex; gap: 0.75rem; align-items: flex-start;
}
.m-crud-btn-icon {
  background: white; border: 1px solid #e2e8f0; border-radius: 5px;
  padding: 0.3rem; color: #64748b; cursor: pointer; display: flex;
}
.m-crud-overlay {
  position: fixed; inset: 0; background: rgba(15,23,42,0.45);
  display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem;
}
.m-crud-modal {
  background: #fff; border-radius: 12px; padding: 20px; width: 100%;
  max-width: 95vw; max-height: 90vh; overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}
.m-crud-field { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
.m-crud-field label { font-size: 0.8rem; color: #64748b; }
.m-crud-field input {
  width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1;
  border-radius: 6px; font-size: 0.9rem;
}
</style>