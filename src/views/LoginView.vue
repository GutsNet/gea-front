<template>
  <div class="login-main">
    <!-- MOBILE LAYOUT -->
    <div class="d-flex d-md-none flex-column login-mobile">
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

          <!-- Alerta de error para móvil -->
          <v-alert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            density="compact"
            class="mb-4 text-left"
          >
            {{ errorMessage }}
          </v-alert>

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

    <!-- DESKTOP LAYOUT -->
    <div class="d-none d-md-block login-desktop">
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

          <!-- Alerta de error para escritorio -->
          <v-alert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            density="compact"
            class="mb-4 text-left"
          >
            {{ errorMessage }}
          </v-alert>

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
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { loginWithCredentials, getRememberedMatricula } from '../services/authService'

// Imágenes y SVGs
import logoGea from '../assets/images/logo-gea.png'
import leafIcon from '../assets/images/leaf-icon.svg'
import plantIcon from '../assets/images/plant-icon.svg'
import rectangleShape from '../assets/images/rectangle-shape.svg'
import ellipseBgLarge from '../assets/images/ellipse-bg-large.svg'
import ellipseBlob1 from '../assets/images/ellipse-blob-1.svg'
import ellipseBlob2 from '../assets/images/ellipse-blob-2.svg'
import dotGrid from '../assets/images/dot-grid.svg'
import treesImage from '../assets/images/trees-image.svg'

const router = useRouter()
const route = useRoute()

const matricula = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)

// Estados de la interfaz
const isLoading = ref(false)
const errorMessage = ref('')

// Si el usuario marcó "Recordarme" la última vez, precarga su matrícula.
onMounted(() => {
  const remembered = getRememberedMatricula()
  if (remembered) {
    matricula.value = remembered
    rememberMe.value = true
  }
})

async function handleLogin() {
  errorMessage.value = ''

  if (!matricula.value || !password.value) {
    errorMessage.value = 'Por favor, ingresa tu matrícula y contraseña.'
    return
  }

  isLoading.value = true

  try {
    await loginWithCredentials(matricula.value, password.value, rememberMe.value)

    // Si el guard nos mandó al login desde otra ruta (?redirect=...),
    // regresamos ahí; si no, al dashboard.
    router.push(route.query.redirect || { name: 'Dashboard' })
  } catch (error) {
    // Formato estándar de error de la API: { error: true, message, details }
    errorMessage.value =
      error.response?.data?.message || 'Error al conectar con el servidor.'
  } finally {
    isLoading.value = false
  }
}
</script>
<style src="../assets/styles/login_view.css" scoped></style>