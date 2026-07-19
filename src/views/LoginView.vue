<template>
  <div class="login-page">
    <!-- Panel de marca: header verde en móvil, columna izquierda en escritorio -->
    <section class="brand-panel">
      <div class="brand-content">
        <img class="brand-logo" src="../assets/logo-gea.png" alt="GEA" />
        <h1>G.E.A.</h1>
        <p class="brand-tagline">Gestión Ecológica Arbórea</p>
        <p class="brand-sub">Control fitosanitario del arbolado — UTTT</p>
      </div>
    </section>

    <!-- Panel de formulario -->
    <section class="form-panel">
      <div class="login-card">
        <header class="login-card-header">
          <h2>Iniciar sesión</h2>
          <p>Ingresa con tu matrícula institucional.</p>
        </header>

        <p v-if="sessionExpiredNotice" class="notice" role="status">
          Tu sesión anterior expiró. Vuelve a iniciar sesión.
        </p>

        <form class="login-form" novalidate @submit.prevent="submitLogin">
          <label class="field">
            <span class="field-label">Matrícula</span>
            <div class="field-control">
              <svg class="field-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5Z"
                  fill="currentColor"
                />
              </svg>
              <input
                v-model.trim="matricula"
                type="text"
                name="matricula"
                autocomplete="username"
                placeholder="Ej. 21040001"
                :disabled="loading"
                required
              />
            </div>
          </label>

          <label class="field">
            <span class="field-label">Contraseña</span>
            <div class="field-control">
              <svg class="field-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M17 9V7a5 5 0 0 0-10 0v2a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-7a3 3 0 0 0-3-3ZM9 7a3 3 0 0 1 6 0v2H9V7Z"
                  fill="currentColor"
                />
              </svg>
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                name="password"
                autocomplete="current-password"
                placeholder="********"
                :disabled="loading"
                required
              />
              <button
                type="button"
                class="toggle-visibility"
                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                @click="showPassword = !showPassword"
              >
                <svg v-if="showPassword" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7-10-7-10-7Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                    fill="currentColor"
                  />
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M3 3l18 18M10.6 10.7a3 3 0 0 0 4.2 4.2M7.4 7.5C4.9 8.9 3 12 3 12s3.8 7 10 7c1.6 0 3-.4 4.2-1.1M14.1 5.3A10.6 10.6 0 0 1 21 12s-1 1.9-2.7 3.5"
                    stroke="currentColor"
                    stroke-width="1.6"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </label>

          <div class="field-row">
            <label class="checkbox">
              <input v-model="remember" type="checkbox" :disabled="loading" />
              <span>Recordar mi matrícula</span>
            </label>
          </div>

          <p v-if="errorMessage" class="error-banner" role="alert">{{ errorMessage }}</p>

          <button type="submit" class="submit-btn" :disabled="loading || !isFormValid">
            <span v-if="!loading">Iniciar sesión</span>
            <span v-else class="spinner" aria-hidden="true"></span>
          </button>
        </form>

        <footer class="login-card-footer">
          <p>Universidad Tecnológica de Tula-Tepeji</p>
        </footer>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { loginWithCredentials, getRememberedMatricula } from '../services/authService';

const router = useRouter();
const route = useRoute();

const matricula = ref('');
const password = ref('');
const remember = ref(false);
const showPassword = ref(false);
const loading = ref(false);
const errorMessage = ref('');

const sessionExpiredNotice = computed(() => route.query.expired === '1');
const isFormValid = computed(() => matricula.value.length > 0 && password.value.length > 0);

onMounted(() => {
  const rememberedMatricula = getRememberedMatricula();
  if (rememberedMatricula) {
    matricula.value = rememberedMatricula;
    remember.value = true;
  }
});

async function submitLogin() {
  if (!isFormValid.value || loading.value) return;

  errorMessage.value = '';
  loading.value = true;

  try {
    await loginWithCredentials(matricula.value, password.value, remember.value);

    const redirectTarget =
      typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
        ? route.query.redirect
        : '/dashboard';

    router.replace(redirectTarget);
  } catch (error) {
    if (!error.response) {
      errorMessage.value = 'No se pudo conectar con el servidor. Verifica tu conexión.';
    } else if (error.response.status === 400 || error.response.status === 401) {
      errorMessage.value = error.response.data?.message || 'Matrícula o contraseña incorrectos.';
    } else {
      errorMessage.value = 'Ocurrió un error inesperado. Intenta de nuevo.';
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

/* ---------- Panel de marca ---------- */
.brand-panel {
  background: linear-gradient(160deg, var(--gea-primary) 0%, var(--gea-primary-dark) 100%);
  color: #fff;
  padding: 2.5rem 1.5rem 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.brand-content {
  max-width: 320px;
}

.brand-logo {
  width: 60px;
  height: 60px;
  margin-bottom: 1rem;
}

.brand-content h1 {
  margin: 0;
  font-size: 1.75rem;
  letter-spacing: 0.08em;
}

.brand-tagline {
  margin: 0.5rem 0 0;
  font-weight: 600;
}

.brand-sub {
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.85);
}

/* ---------- Panel de formulario ---------- */
.form-panel {
  flex: 1;
  background: var(--gea-bg);
  display: flex;
  justify-content: center;
  padding: 0 1.25rem;
  margin-top: -2rem;
}

.login-card {
  width: 100%;
  max-width: 380px;
  background: var(--gea-surface);
  border-radius: var(--gea-radius);
  box-shadow: var(--gea-shadow);
  padding: 2rem 1.5rem 1.5rem;
  margin-bottom: 2rem;
}

.login-card-header h2 {
  margin: 0 0 0.25rem;
  font-size: 1.35rem;
}

.login-card-header p {
  margin: 0 0 1.25rem;
  color: var(--gea-muted);
  font-size: 0.9rem;
}

.notice {
  background: #eaf3ee;
  color: var(--gea-primary-dark);
  border: 1px solid #cfe6d9;
  border-radius: var(--gea-radius-sm);
  padding: 0.6rem 0.75rem;
  font-size: 0.85rem;
  margin: 0 0 1rem;
}

.login-form {
  display: grid;
  gap: 1rem;
}

.field {
  display: grid;
  gap: 0.35rem;
}

.field-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--gea-text);
}

.field-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid var(--gea-border);
  border-radius: var(--gea-radius-sm);
  padding: 0.55rem 0.65rem;
  background: var(--gea-surface);
  transition: border-color 0.15s ease;
}

.field-control:focus-within {
  border-color: var(--gea-primary);
}

.field-icon {
  width: 18px;
  height: 18px;
  color: var(--gea-muted);
  flex-shrink: 0;
}

.field-control input {
  border: none;
  outline: none;
  flex: 1;
  font-size: 0.95rem;
  background: transparent;
  color: var(--gea-text);
  min-width: 0;
}

.toggle-visibility {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--gea-muted);
  display: flex;
  align-items: center;
}

.toggle-visibility svg {
  width: 18px;
  height: 18px;
}

.field-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--gea-muted);
  cursor: pointer;
}

.error-banner {
  background: var(--gea-danger-bg);
  color: var(--gea-danger);
  border: 1px solid #f3c9c4;
  border-radius: var(--gea-radius-sm);
  padding: 0.6rem 0.75rem;
  font-size: 0.85rem;
  margin: 0;
}

.submit-btn {
  background: var(--gea-primary);
  color: #fff;
  border: none;
  border-radius: var(--gea-radius-sm);
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  min-height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease;
}

.submit-btn:hover:not(:disabled) {
  background: var(--gea-primary-dark);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.login-card-footer {
  margin-top: 1.25rem;
  text-align: center;
}

.login-card-footer p {
  margin: 0;
  font-size: 0.75rem;
  color: var(--gea-muted);
}

/* ---------- Escritorio: panel de marca a la izquierda, formulario a la derecha ---------- */
@media (min-width: 960px) {
  .login-page {
    flex-direction: row;
  }

  .brand-panel {
    flex: 1 1 45%;
    padding: 4rem;
    text-align: left;
    justify-content: flex-start;
  }

  .brand-content {
    max-width: 420px;
    margin: auto 0;
  }

  .brand-content h1 {
    font-size: 2.75rem;
  }

  .brand-tagline {
    font-size: 1.1rem;
  }

  .form-panel {
    flex: 1 1 55%;
    margin-top: 0;
    align-items: center;
  }

  .login-card {
    max-width: 420px;
    padding: 2.75rem;
    margin-bottom: 0;
  }
}
</style>
