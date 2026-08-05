<!--
G.E.A. Frontend
Vista: Cuenta (/cuenta)
Selector de layout según breakpoint (960px).
-->

<template>
  <CuentaDesktopView v-if="!isMobile" />
  <CuentaMobileView v-else />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import CuentaDesktopView from '@src/views/cuenta/CuentaDesktopView.vue';
import CuentaMobileView from '@src/views/cuenta/CuentaMobileView.vue';

// Mismo breakpoint que el resto del proyecto (960px).
const MOBILE_BREAKPOINT = 960;
const isMobile = ref(window.innerWidth < MOBILE_BREAKPOINT);

function onResize() {
  isMobile.value = window.innerWidth < MOBILE_BREAKPOINT;
}

onMounted(() => window.addEventListener('resize', onResize));
onUnmounted(() => window.removeEventListener('resize', onResize));
</script>