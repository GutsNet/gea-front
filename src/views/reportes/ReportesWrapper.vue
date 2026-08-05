<!--
G.E.A. Frontend
Vista: Reportes (/reportes)

NOTA: el layout móvil (ReportesMobileView.vue) todavía no tiene
diseño — por ahora muestra una pantalla "En construcción" para no
dejar rota la navegación en móvil mientras se diseña (mismo criterio
que Dashboard y Mapa).
 -->

<template>
  <ReportesMobileView v-if="isMobile" />
  <ReportesDesktopView v-else />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import ReportesDesktopView from '@src/views/reportes/ReportesDesktopView.vue';
import ReportesMobileView from '@src/views/reportes/ReportesMobileView.vue';

// Mismo breakpoint que el resto del proyecto (ver dashboard_view.css / DashboardView.vue).
const MOBILE_BREAKPOINT = 960;
const isMobile = ref(window.innerWidth < MOBILE_BREAKPOINT);

function onResize() {
  isMobile.value = window.innerWidth < MOBILE_BREAKPOINT;
}

onMounted(() => window.addEventListener('resize', onResize));
onUnmounted(() => window.removeEventListener('resize', onResize));
</script>