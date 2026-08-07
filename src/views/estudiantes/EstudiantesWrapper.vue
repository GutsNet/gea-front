<!--
G.E.A. Frontend
Vista: Estudiantes (/estudiantes)

NOTA: el layout móvil (EstudiantesMobileView.vue) todavía no tiene
diseño — por ahora muestra una pantalla "En construcción" para no
dejar rota la navegación en móvil mientras se diseña.
 -->

<template>
  <EstudiantesMobileView v-if="isMobile" />
  <EstudiantesDesktopView v-else />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import EstudiantesDesktopView from '@src/views/estudiantes/EstudiantesDesktopView.vue';
import EstudiantesMobileView from '@src/views/estudiantes/EstudiantesMobileView.vue';

// Mismo breakpoint que el resto del proyecto (ver login_view.css / LoginView.vue).
const MOBILE_BREAKPOINT = 960;
const isMobile = ref(window.innerWidth < MOBILE_BREAKPOINT);

function onResize() {
  isMobile.value = window.innerWidth < MOBILE_BREAKPOINT;
}

onMounted(() => window.addEventListener('resize', onResize));
onUnmounted(() => window.removeEventListener('resize', onResize));
</script>