<template>
  <section>
    <h2>Login de prueba</h2>
    <p>Autentica con el backend real de GEA.</p>

    <form class="login-form" @submit.prevent="submitLogin">
      <label>
        Matrícula
        <input v-model="matricula" placeholder="EST-TEST" />
      </label>

      <label>
        Contraseña
        <input v-model="password" type="password" placeholder="testpass123" />
      </label>

      <button type="submit">Entrar</button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { loginWithCredentials } from '../services/authService';

const router = useRouter();
const matricula = ref('EST-TEST');
const password = ref('testpass123');
const error = ref('');

async function submitLogin() {
  try {
    error.value = '';
    await loginWithCredentials(matricula.value, password.value);
    router.push('/dashboard');
  } catch (e) {
    error.value = e?.response?.data?.message || 'No se pudo iniciar sesión.';
  }
}
</script>

<style scoped>
.login-form {
  display: grid;
  gap: 0.75rem;
  max-width: 340px;
}
input {
  width: 100%;
  padding: 0.5rem;
}
button {
  padding: 0.65rem 1rem;
}
.error {
  color: #b42318;
}
</style>
