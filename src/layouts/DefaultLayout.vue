<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        <img class="brand-logo" src="../assets/logo-gea.svg" alt="" aria-hidden="true" />
        <h1>GEA</h1>
      </div>

      <nav>
        <router-link to="/dashboard">Dashboard</router-link>
        <router-link to="/arboles">Árboles</router-link>
        <router-link to="/reportes">Reportes</router-link>
        <router-link to="/mapa">Mapa</router-link>
      </nav>

      <div v-if="user" class="sidebar-footer">
        <div class="user-info">
          <p class="user-matricula">{{ user.matricula }}</p>
          <p class="user-role">{{ user.rol }}</p>
        </div>
        <button type="button" class="logout-btn" @click="handleLogout">
          Cerrar sesión
        </button>
      </div>
    </aside>

    <main class="content">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getStoredUser, logout } from '../services/authService';

const router = useRouter();
const user = ref(null);

onMounted(() => {
  user.value = getStoredUser();
});

function handleLogout() {
  logout();
  router.push('/login');
}
</script>

<style scoped>
.app-shell {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
}

.sidebar {
  background: var(--gea-primary-dark);
  color: white;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.brand-logo {
  width: 32px;
  height: 32px;
}

.brand h1 {
  margin: 0;
  font-size: 1.25rem;
  letter-spacing: 0.05em;
}

.sidebar nav {
  display: grid;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.sidebar a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 0.6rem;
  border-radius: var(--gea-radius-sm);
  opacity: 0.85;
}

.sidebar a:hover,
.sidebar a.router-link-active {
  background: rgba(255, 255, 255, 0.12);
  opacity: 1;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  display: grid;
  gap: 0.6rem;
}

.user-matricula {
  margin: 0;
  font-weight: 600;
  font-size: 0.9rem;
}

.user-role {
  margin: 0;
  font-size: 0.75rem;
  opacity: 0.75;
}

.logout-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: var(--gea-radius-sm);
  cursor: pointer;
  font-size: 0.85rem;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.content {
  padding: 1.5rem;
  overflow-y: auto;
}
</style>
