<template>
  <component :is="layoutComponent">
    <router-view />
  </component>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DefaultLayout from './layouts/DefaultLayout.vue';
import AuthLayout from './layouts/AuthLayout.vue';

const route = useRoute();
const router = useRouter();

const layoutComponent = computed(() => {
  return route.meta.layout === 'auth' ? AuthLayout : DefaultLayout;
});

// Disparado por src/api/client.js cuando el refresh token también expiró/es inválido.
function handleSessionExpired() {
  if (route.name !== 'Login') {
    router.replace({ name: 'Login', query: { expired: '1' } });
  }
}

onMounted(() => {
  window.addEventListener('gea:session-expired', handleSessionExpired);
});

onBeforeUnmount(() => {
  window.removeEventListener('gea:session-expired', handleSessionExpired);
});
</script>
