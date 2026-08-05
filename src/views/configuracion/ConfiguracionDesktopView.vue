<!--
G.E.A. Frontend
Layout de escritorio de Configuración.
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

          <!-- Placeholders -->
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
import { useConfiguracion } from '@src/composables/useConfiguracion';

const {
  tabs,
  activeTab,
  activeTabLabel,
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
} = useConfiguracion();
</script>

<style src="@src/assets/styles/configuracion_view.css" scoped></style>