<!--
G.E.A. Frontend
Vista: Mapa (/mapa)

NOTA: el layout móvil (MapaMobileView.vue) todavía no tiene diseño —
por ahora muestra una pantalla "En construcción" para no dejar rota
la navegación en móvil mientras se diseña (mismo criterio que se usó
para el Dashboard).
 -->

<template>
  <MapaMobileView v-if="isMobile" />
  <MapaDesktopView v-else />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import MapaDesktopView from '@src/views/mapa/MapaDesktopView.vue';
import MapaMobileView from '@src/views/mapa/MapaMobileView.vue';

// Mismo breakpoint que el resto del proyecto (ver dashboard_view.css / DashboardView.vue).
const MOBILE_BREAKPOINT = 960;
const isMobile = ref(window.innerWidth < MOBILE_BREAKPOINT);

function onResize() {
  isMobile.value = window.innerWidth < MOBILE_BREAKPOINT;
}

onMounted(() => window.addEventListener('resize', onResize));
onUnmounted(() => window.removeEventListener('resize', onResize));
</script>
