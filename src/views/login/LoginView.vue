<!--
G.E.A. Frontend
Vista: Login (/login)
Este componente ya no dibuja el formulario — solo decide, en JS, cuál
de los dos layouts montar según el ancho de pantalla. El que no aplica
ni siquiera se instancia (a diferencia del enfoque anterior, que
mantenía ambos en el DOM y alternaba con CSS display:none). El estado
del formulario vive en el composable useLogin, compartido por ambos.
 -->

<template>
  <LoginMobileView v-if="isMobile" />
  <LoginDesktopView v-else />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import LoginDesktopView from '@src/views/login/LoginDesktopView.vue';
import LoginMobileView from '@src/views/login/LoginMobileView.vue';

// Mismo breakpoint que ya usaba login_view.css (@media (min-width: 960px)).
const MOBILE_BREAKPOINT = 960;
const isMobile = ref(window.innerWidth < MOBILE_BREAKPOINT);

function onResize() {
  isMobile.value = window.innerWidth < MOBILE_BREAKPOINT;
}

onMounted(() => window.addEventListener('resize', onResize));
onUnmounted(() => window.removeEventListener('resize', onResize));
</script>