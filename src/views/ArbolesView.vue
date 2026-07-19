<template>
  <section>
    <h2>Árboles</h2>

    <div v-if="loading">Cargando árboles...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <ul v-else>
      <li v-for="item in arboles" :key="item.id">
        <strong>{{ item.etiqueta || item.id }}</strong>
        <span> | {{ item.coordenadas || 'Sin coordenadas' }}</span>
        <span> | Infestación: {{ item.nivel_infestacion }}</span>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../api/client';

const arboles = ref([]);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    const { data } = await apiClient.get('/arboles/');
    arboles.value = data.results ?? data;
  } catch (e) {
    error.value = e?.response?.data?.detail || 'No se pudieron cargar los árboles.';
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
