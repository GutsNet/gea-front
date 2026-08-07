<template>
  <UsuariosDesktopView v-if="!isMobile" />
  <UsuariosMobileView v-else />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import UsuariosDesktopView from '@src/views/usuarios/UsuariosDesktopView.vue';
import UsuariosMobileView from '@src/views/usuarios/UsuariosMobileView.vue';

const MOBILE_BREAKPOINT = 960;
const isMobile = ref(window.innerWidth < MOBILE_BREAKPOINT);

function onResize() {
  isMobile.value = window.innerWidth < MOBILE_BREAKPOINT;
}

onMounted(() => window.addEventListener('resize', onResize));
onUnmounted(() => window.removeEventListener('resize', onResize));
</script>