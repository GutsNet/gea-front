<!--
G.E.A. Frontend
Layout móvil de Configuración.
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
          @click="activeTab = tab.key"
        >
          <v-icon size="16">{{ tab.icon }}</v-icon>
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <!-- Panel -->
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
  triggerFileInput,
  onLogoChange,
  mostrarAnimaciones,
  guardando,
  savedMessage,
  guardarCambios,
} = useConfiguracion();
</script>

<style src="@src/assets/styles/configuracion_view.css" scoped></style>