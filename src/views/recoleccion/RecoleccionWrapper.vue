<template>
  <RecoleccionDesktopView v-if="!isMobile" />
  <RecoleccionMobileView v-else />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import RecoleccionDesktopView from '@src/views/recoleccion/RecoleccionDesktopView.vue';
import RecoleccionMobileView from '@src/views/recoleccion/RecoleccionMobileView.vue';

const MOBILE_BREAKPOINT = 960;
const isMobile = ref(window.innerWidth < MOBILE_BREAKPOINT);

function onResize() {
  isMobile.value = window.innerWidth < MOBILE_BREAKPOINT;
}

onMounted(() => window.addEventListener('resize', onResize));
onUnmounted(() => window.removeEventListener('resize', onResize));
</script>