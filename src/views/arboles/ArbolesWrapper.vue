<!--
G.E.A. Frontend
Vista: Árboles (/arboles)

NOTA: el layout móvil (ArbolesMobileView.vue) todavía no tiene
diseño — por ahora muestra una pantalla "En construcción" para no
dejar rota la navegación en móvil mientras se diseña.
 -->

<template>
  <ArbolesMobileView v-if="isMobile" />
  <ArbolesDesktopView v-else />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import ArbolesDesktopView from '@src/views/arboles/ArbolesDesktopView.vue';
import ArbolesMobileView from '@src/views/arboles/ArbolesMobileView.vue';

// Mismo breakpoint que el resto del proyecto (ver dashboard_view.css / DashboardView.vue).
const MOBILE_BREAKPOINT = 960;
const isMobile = ref(window.innerWidth < MOBILE_BREAKPOINT);

function onResize() {
  isMobile.value = window.innerWidth < MOBILE_BREAKPOINT;
}

onMounted(() => window.addEventListener('resize', onResize));
onUnmounted(() => window.removeEventListener('resize', onResize));
</script>
