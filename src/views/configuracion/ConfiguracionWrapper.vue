<template>
  <ConfiguracionDesktopView v-if="!isMobile" />
  <ConfiguracionMobileView v-else />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import ConfiguracionDesktopView from '@src/views/configuracion/ConfiguracionDesktopView.vue';
import ConfiguracionMobileView from '@src/views/configuracion/ConfiguracionMobileView.vue';

const MOBILE_BREAKPOINT = 960;
const isMobile = ref(window.innerWidth < MOBILE_BREAKPOINT);

function onResize() {
  isMobile.value = window.innerWidth < MOBILE_BREAKPOINT;
}

onMounted(() => window.addEventListener('resize', onResize));
onUnmounted(() => window.removeEventListener('resize', onResize));
</script>