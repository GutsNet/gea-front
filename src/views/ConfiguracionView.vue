<!--
G.E.A. Frontend
Vista: Configuración > Apariencia
-->

<template>
  <section class="config-view">
    <!-- DESKTOP LAYOUT (≥960px) -->
    <!-- Sidebar de sub-navegación con panel, sin cambios respecto a la versión
         original. Se oculta por completo debajo del breakpoint estándar. -->
    <div class="d-none d-md-flex flex-column config-desktop">
      <div class="config-layout">
        <!-- Sub-navegación de Configuración -->
        <aside class="config-nav">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            class="config-nav-item"
            :class="{ 'config-nav-item-active': activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            <v-icon size="20">{{ tab.icon }}</v-icon>
            <span>{{ tab.label }}</span>
          </button>
        </aside>

        <!-- Panel de contenido -->
        <div class="config-panel">
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

            <!-- Logo del sistema -->
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

            <!-- Mostrar animaciones -->
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

          <!-- Placeholders para las demás secciones de Configuración -->
          <template v-else>
            <h3 class="config-panel-title">{{ activeTabLabel }}</h3>
            <p class="config-panel-subtitle">Esta sección está en construcción.</p>
          </template>
        </div>
      </div>
    </div>

    <!-- MOBILE LAYOUT (<960px) -->
    <!-- Vista exclusiva de móvil: en vez de sidebar con panel de dos columnas,
         las secciones se navegan con chips horizontales y el contenido se
         apila a lo ancho completo, pensado para uso con el pulgar. -->
    <div class="d-flex d-md-none flex-column config-mobile">
      <div class="mobile-config-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="mobile-config-tab"
          :class="{ 'mobile-config-tab-active': activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <v-icon size="16">{{ tab.icon }}</v-icon>
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <div class="mobile-config-panel">
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

          <!-- Logo del sistema -->
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
                <!-- Reutiliza el mismo <input type="file"> oculto del bloque
                     desktop (fileInputRef); solo hace falta un elemento en
                     el DOM aunque esté invisible en esta vista. -->
                <p class="logo-hint">
                  Formatos permitidos: PNG, JPG, SVG.<br />
                  Tamaño recomendado: 512x512 px.
                </p>
              </div>
            </div>
          </div>

          <!-- Mostrar animaciones -->
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

        <!-- Placeholders para las demás secciones de Configuración -->
        <template v-else>
          <h3 class="mobile-config-panel-title">{{ activeTabLabel }}</h3>
          <p class="mobile-config-panel-subtitle">Esta sección está en construcción.</p>
        </template>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import logoGea from '../assets/images/logo-gea.png';

const tabs = [
  { key: 'apariencia', label: 'Apariencia', icon: 'mdi-palette-swatch-outline' },
  { key: 'especies', label: 'Especies', icon: 'mdi-leaf' },
  { key: 'zonas', label: 'Zonas', icon: 'mdi-map-marker-outline' },
  { key: 'respaldos', label: 'Respaldos', icon: 'mdi-database-outline' },
];

const activeTab = ref('apariencia');
const activeTabLabel = computed(() => tabs.find((t) => t.key === activeTab.value)?.label || '');

// --- Tema ---
const temaOptions = [
  { value: 'claro', label: 'Claro', icon: 'mdi-white-balance-sunny' },
  { value: 'oscuro', label: 'Oscuro', icon: 'mdi-weather-night' },
  { value: 'sistema', label: 'Seguir sistema', icon: 'mdi-monitor' },
];
const tema = ref('claro');

// --- Color principal ---
const colorPrincipal = ref('#1E7A34');
const colorPresets = ['#1E7A34', '#2563EB', '#7C3AED', '#F97316', '#DC2626', '#6B7280'];

function isSameColor(a, b) {
  return a.toLowerCase() === (b || '').toLowerCase();
}

// --- Logo del sistema ---
const logoPreview = ref(logoGea);
const fileInputRef = ref(null);

function triggerFileInput() {
  fileInputRef.value?.click();
}

function onLogoChange(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    logoPreview.value = reader.result;
  };
  reader.readAsDataURL(file);
}

// --- Animaciones ---
const mostrarAnimaciones = ref(true);

// --- Guardar cambios ---
const guardando = ref(false);
const savedMessage = ref('');
let savedMessageTimeout = null;

async function guardarCambios() {
  guardando.value = true;
  savedMessage.value = '';

  try {
    // TODO: reemplazar por apiClient.patch('/configuracion/apariencia/', { ... })
    // cuando el backend exponga el endpoint correspondiente.
    await new Promise((resolve) => setTimeout(resolve, 500));
    savedMessage.value = 'Cambios guardados';
  } finally {
    guardando.value = false;
    clearTimeout(savedMessageTimeout);
    savedMessageTimeout = setTimeout(() => {
      savedMessage.value = '';
    }, 3000);
  }
}
</script>

<style src="../assets/styles/configuracion_view.css" scoped></style>