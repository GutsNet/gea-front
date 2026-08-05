<!--
G.E.A. Frontend
Vista: Dashboard (/dashboard)

NOTA: el layout móvil (DashboardMobileView.vue) todavía no tiene
diseño — por ahora muestra una pantalla "En construcción" para no
dejar rota la navegación en móvil mientras se diseña.
 -->

<template>
  <DashboardMobileView v-if="isMobile" />
  <DashboardDesktopView v-else />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import DashboardDesktopView from '@src/views/dashboard/DashboardDesktopView.vue';
import DashboardMobileView from '@src/views/dashboard/DashboardMobileView.vue';

// Mismo breakpoint que el resto del proyecto (ver login_view.css / LoginView.vue).
const MOBILE_BREAKPOINT = 960;
const isMobile = ref(window.innerWidth < MOBILE_BREAKPOINT);

function onResize() {
  isMobile.value = window.innerWidth < MOBILE_BREAKPOINT;
}

onMounted(() => window.addEventListener('resize', onResize));
onUnmounted(() => window.removeEventListener('resize', onResize));
</script>