<!--
G.E.A. Frontend
Layout móvil de Login. Se monta únicamente cuando el ancho de pantalla
está bajo el breakpoint (ver LoginView.vue) — a diferencia del enfoque
anterior con d-flex/d-md-none + display:none, aquí el layout de
escritorio ni siquiera se instancia cuando este componente está activo.
 -->

<template>
  <div class="login-main">
    <div class="login-mobile">
      <img :src="ellipseBlob2" class="mobile-bg-top" alt="" aria-hidden="true" />
      <img :src="ellipseBlob1" class="mobile-bg-bottom" alt="" aria-hidden="true" />

      <div class="mobile-content">
        <div class="mobile-header text-center">
          <img :src="logoGea" alt="G.E.A." class="mobile-logo" />
          <p class="mobile-tagline">
            Plataforma de Control Fitosanitario<br />
            Universidad Tecnológica de Tula-Tepeji
          </p>
        </div>

        <div class="mobile-form-container">
          <h2 class="mobile-form-title mb-5">Iniciar sesión</h2>

          <v-form @submit.prevent="handleLogin" :disabled="isLoading">
            <label class="mobile-field-label">Matrícula</label>
            <v-text-field
              v-model="matricula"
              placeholder="Ingresa tu matricula"
              variant="outlined"
              density="comfortable"
              class="mb-4"
              hide-details
              :disabled="isLoading"
            />

            <label class="mobile-field-label">Contraseña</label>
            <v-text-field
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Ingresa tu contraseña"
              variant="outlined"
              density="comfortable"
              class="mb-6"
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

            <v-btn
              type="submit"
              block
              size="large"
              color="#1B5E20"
              class="text-none login-btn mb-6"
              elevation="0"
              :loading="isLoading"
            >
              Iniciar sesión
            </v-btn>
          </v-form>

          <p class="text-center forgot-link-mobile mb-8">¿Olvidaste tu contraseña?</p>
        </div>

        <div class="mt-auto">
          <p class="text-center version-text-mobile">Versión 1.0.0</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useLogin } from '@src/composables/useLogin';

// Solo las imágenes que usa el layout móvil — las de escritorio
// (rectangleShape, ellipseBgLarge, dotGrid, treesImage, leafIcon,
// plantIcon) nunca se descargan si el usuario nunca ve esta vista.
import logoGea from '@src/assets/images/logo-gea.png';
import ellipseBlob1 from '@src/assets/images/ellipse-blob-1.svg';
import ellipseBlob2 from '@src/assets/images/ellipse-blob-2.svg';

const { matricula, password, showPassword, isLoading, handleLogin } = useLogin();
</script>

<style src="@src/assets/styles/login_view.css" scoped></style>