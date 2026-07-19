<template>
  <section>
    <h2>Reportes</h2>

    <div v-if="loading">Cargando reportes...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <ul v-else>
      <li v-for="item in reportes" :key="item.id">
        <strong>{{ item.arbol_etiqueta || item.id }}</strong>
        <span> | Estado: {{ item.status_reporte }}</span>
        <span> | Nivel: {{ item.nivel_infestacion }}</span>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../api/client';

const reportes = ref([]);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    const { data } = await apiClient.get('/reportes/');
    reportes.value = data.results ?? data;
  } catch (e) {
    error.value = e?.response?.data?.detail || 'No se pudieron cargar los reportes.';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.error {
  color: #b42318;
}
</style>
