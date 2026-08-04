<!--
G.E.A. Frontend
Layout de escritorio de Login. Se monta únicamente cuando el ancho de
pantalla está en o sobre el breakpoint (ver LoginView.vue) — el layout
móvil ni siquiera se instancia cuando este componente está activo.
 -->

<template>
  <div class="login-main">
    <div class="login-desktop">
      <div class="desktop-left">
        <img :src="ellipseBgLarge" class="desktop-left-bg" alt="" aria-hidden="true" />
        <img :src="rectangleShape" class="desktop-left-rect" alt="" aria-hidden="true" />

        <div class="desktop-left-content">
          <img :src="logoGea" alt="G.E.A." class="desktop-logo" />

          <div class="desktop-divider mb-4"></div>

          <p class="desktop-tagline">
            Plataforma de Control Fitosanitario<br />
            Universidad Tecnológica de Tula-Tepeji
          </p>

          <img :src="dotGrid" class="desktop-dot-grid" alt="" aria-hidden="true" />
        </div>

        <div class="desktop-tree-wrap">
          <img :src="treesImage" alt="Árboles UTTT" class="desktop-tree-image" />
        </div>

        <v-card flat theme="light" class="mission-card">
          <div class="d-flex align-center">
            <v-avatar color="#F4F7F5" size="60" class="mr-6" style="border: 2px solid #037425;">
              <img :src="leafIcon" alt="" class="mission-leaf-icon" />
            </v-avatar>

            <div>
              <p class="mission-title mb-0">Nuestra misión</p>
              <p class="mission-text">
                Contribuir a la preservación de las áreas verdes de la UTTT <br />
                mediante tecnología, participación y educación ambiental.
              </p>
            </div>
          </div>
        </v-card>
      </div>

      <div class="desktop-right">
        <v-card flat theme="light" class="desktop-form-card">
          <h2 class="desktop-form-title mb-1">Iniciar sesión</h2>
          <p class="desktop-form-subtitle mb-8">
            Ingresa tus credenciales para ingresar a la plataforma
          </p>

          <v-form @submit.prevent="handleLogin" :disabled="isLoading">
            <label class="field-label">Matrícula</label>
            <v-text-field
              v-model="matricula"
              placeholder="Ingresa tu matricula"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-account-outline"
              class="mb-5"
              hide-details
              :disabled="isLoading"
            />

            <label class="field-label">Contraseña</label>
            <v-text-field
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Ingresa tu contraseña"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-lock-outline"
              class="mb-3"
              hide-details
              :disabled="isLoading"
            >
              <template #append-inner>
                <v-icon
                  :icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  size="20"
                  color="grey"
                  @click="showPassword = !showPassword"
                />
              </template>
            </v-text-field>

            <v-checkbox
              v-model="rememberMe"
              label="Recordarme"
              density="compact"
              color="#1B5E20"
              hide-details
              class="mb-5"
              :disabled="isLoading"
            />

            <v-btn
              type="submit"
              block
              size="large"
              color="#1B5E20"
              class="text-none login-btn mb-5"
              elevation="0"
              prepend-icon="mdi-login-variant"
              :loading="isLoading"
            >
              Iniciar sesión
            </v-btn>
          </v-form>

          <p class="text-center forgot-link mb-6">¿Olvidaste tu contraseña?</p>

          <div class="d-flex align-center mb-6">
            <v-divider />
            <img :src="plantIcon" alt="" class="divider-plant-icon mx-3" />
            <v-divider />
          </div>

          <p class="text-center version-text">Versión 1.0.0</p>
        </v-card>
      </div>    
    </div>
  </div>
</template>

<script setup>
import { useLogin } from '@src/composables/useLogin';

// Solo las imágenes que usa el layout de escritorio — las del layout
// móvil (ellipseBlob1, ellipseBlob2) nunca se descargan si el usuario
// nunca ve esta vista.
import logoGea from '@src/assets/images/logo-gea.png';
import leafIcon from '@src/assets/images/leaf-icon.svg';
import plantIcon from '@src/assets/images/plant-icon.svg';
import rectangleShape from '@src/assets/images/rectangle-shape.svg';
import ellipseBgLarge from '@src/assets/images/ellipse-bg-large.svg';
import dotGrid from '@src/assets/images/dot-grid.svg';
import treesImage from '@src/assets/images/trees-image.svg';

const { matricula, password, showPassword, rememberMe, isLoading, handleLogin } = useLogin();
</script>

<style src="@src/assets/styles/login_view.css" scoped></style>