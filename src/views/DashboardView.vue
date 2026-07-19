<template>
  <section>
    <h2>Dashboard</h2>

    <div v-if="loading">Cargando dashboard...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="cards">
      <div class="card">
        <strong>Árboles totales</strong>
        <p>{{ resumen.arboles?.total ?? 0 }}</p>
      </div>
      <div class="card">
        <strong>Infestados</strong>
        <p>{{ resumen.arboles?.infestados ?? 0 }}</p>
      </div>
      <div class="card">
        <strong>Reportes</strong>
        <p>{{ resumen.reportes?.total ?? 0 }}</p>
      </div>
      <div class="card">
        <strong>Estudiantes activos</strong>
        <p>{{ resumen.estudiantes_activos ?? 0 }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../api/client';

const resumen = ref({});
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    const { data } = await apiClient.get('/dashboard/resumen/');
    resumen.value = data;
  } catch (e) {
    error.value = e?.response?.data?.detail || 'No se pudo cargar el dashboard.';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}
.card {
  background: white;
  border: 1px solid #d9e2ec;
  padding: 1rem;
  border-radius: 8px;
}
.error {
  color: #b42318;
}
</style>
