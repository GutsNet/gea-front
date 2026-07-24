<template>
  <div class="app-shell">
    <!-- ================= MOBILE LAYOUT (topbar + drawer + bottom tabs) ================= -->
    <div class="mobile-layout">
      <header class="mobile-topbar">
        <button type="button" class="icon-btn" @click="drawerOpen = true" aria-label="Abrir menú">
          <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" v-html="icons.menu"></svg>
        </button>
        <h2 class="mobile-title">{{ currentTitle }}</h2>
        <span class="mobile-topbar-spacer"></span>
      </header>

      <div v-if="drawerOpen" class="mobile-drawer-overlay" @click="drawerOpen = false"></div>

      <aside class="mobile-drawer" :class="{ 'mobile-drawer-open': drawerOpen }">
        <button type="button" class="icon-btn mobile-drawer-close" @click="drawerOpen = false" aria-label="Cerrar menú">
          <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" v-html="icons.close"></svg>
        </button>

        <div class="mobile-brand">
          <img class="mobile-brand-logo" :src="logoGea" alt="G.E.A." />
        </div>

        <nav class="mobile-nav">
          <router-link
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="mobile-nav-item"
            @click="drawerOpen = false"
          >
            <svg viewBox="0 0 24 24" class="mobile-nav-icon" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" v-html="icons[item.icon]"></svg>
            <span>{{ item.label }}</span>
          </router-link>
        </nav>

        <!-- User info: only exists in the mobile drawer. On desktop the
             equivalent card lives in .desktop-topbar instead. -->
        <div v-if="user" class="mobile-drawer-footer">
          <div class="mobile-user-avatar">
            <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" v-html="icons.userCircle"></svg>
          </div>
          <div class="mobile-user-info">
            <p class="mobile-user-matricula">{{ user.matricula }}</p>
            <p class="mobile-user-rol">
              <span v-if="user.rol === 'root'">Sysadmin (root)</span>
              <span v-else-if="user.rol === 'admin'">Coordinador</span>
              <span v-else-if="user.rol === 'user'">Brigadista</span>
            </p>
          </div>
          <button type="button" class="mobile-logout-btn" @click="handleLogout">
            <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" v-html="icons.logOut"></svg>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <nav class="mobile-bottom-tabbar">
        <router-link
          v-for="tab in mobileTabs"
          :key="tab.to"
          :to="tab.to"
          class="mobile-tab-item"
        >
          <svg viewBox="0 0 24 24" class="mobile-tab-icon" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" v-html="icons[tab.icon]"></svg>
          <span>{{ tab.label }}</span>
        </router-link>
      </nav>
    </div>

    <!-- ================= DESKTOP LAYOUT (sidebar + topbar) ================= -->
    <aside class="desktop-sidebar">
      <div class="desktop-brand">
        <img class="desktop-brand-logo" :src="logoGea" alt="G.E.A." />
      </div>

      <nav class="desktop-nav">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="desktop-nav-item"
        >
          <svg viewBox="0 0 24 24" class="desktop-nav-icon" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" v-html="icons[item.icon]"></svg>
          <span>{{ item.label }}</span>
        </router-link>
      </nav>
    </aside>

    <header class="desktop-topbar">
      <div class="desktop-topbar-left">
        <span class="desktop-page-icon">
          <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" v-html="icons[currentIcon]"></svg>
        </span>
        <div>
          <h2 class="desktop-page-title">{{ currentTitle }}</h2>
          <p v-if="currentSubtitle" class="desktop-page-subtitle">{{ currentSubtitle }}</p>
        </div>
      </div>

      <div v-if="user" class="desktop-topbar-right" ref="userMenuRef">
        <button type="button" class="desktop-user-card" @click="userMenuOpen = !userMenuOpen">
          <span class="desktop-user-avatar">
            <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" v-html="icons.userCircle"></svg>
          </span>
          <span class="desktop-user-info">
            <span class="desktop-user-matricula">{{ user.matricula }}</span>
            <span class="desktop-user-rol">
              <span v-if="user.rol === 'root'">Sysadmin (root)</span>
              <span v-else-if="user.rol === 'admin'">Coordinador</span>
              <span v-else-if="user.rol === 'user'">Brigadista</span>
            </span>
          </span>
          <svg viewBox="0 0 24 24" class="desktop-chevron" :class="{ 'desktop-chevron-open': userMenuOpen }" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            v-html="icons.chevronDown"></svg>
        </button>

        <div v-if="userMenuOpen" class="desktop-user-dropdown">
          <button type="button" class="desktop-dropdown-item" @click="handleLogout">
            <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" v-html="icons.logOut"></svg>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </header>

    <!-- ================= SHARED CONTENT AREA =================
         Single instance on purpose: duplicating <slot /> inside both the
         mobile and desktop blocks would mount the routed page TWICE at the
         same time (double API calls, timers, etc.), even if one copy is
         hidden with CSS. Only the chrome above is duplicated per breakpoint. -->
    <main class="content">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getStoredUser, logout } from '../services/authService';

import logoGea from '../assets/images/logo-gea.png';

const router = useRouter();
const route = useRoute();
const user = ref(null);
const drawerOpen = ref(false);
const userMenuOpen = ref(false);
const userMenuRef = ref(null);

onMounted(() => {
  user.value = getStoredUser();
  document.addEventListener('click', handleClickOutsideUserMenu);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutsideUserMenu);
});

function handleClickOutsideUserMenu(event) {
  if (userMenuOpen.value && userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    userMenuOpen.value = false;
  }
}

function handleLogout() {
  logout();
  router.push('/login');
}

// Menú completo (usado en el sidebar de escritorio y en el drawer móvil)
const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'home' },
  { to: '/mapa', label: 'Mapa del Campus', icon: 'map' },
  { to: '/reportes', label: 'Reportes', icon: 'fileText' },
  { to: '/arboles', label: 'Árboles', icon: 'leaf' },
  { to: '/estudiantes', label: 'Estudiantes', icon: 'users' },
  { to: '/recoleccion', label: 'Recolección (kg)', icon: 'trash' },
  { to: '/usuarios', label: 'Usuarios', icon: 'users' },
  { to: '/configuracion', label: 'Configuración', icon: 'settings' },
];

// Título / subtítulo / ícono mostrados en la barra superior (móvil y escritorio).
// Se resuelven automáticamente a partir del navItem cuya ruta coincide con la
// ruta activa, así el ícono del título SIEMPRE es el mismo que el del
// sidebar/drawer para esa vista. Si quieres personalizar el título o subtítulo
// de una ruta puntual, puedes seguir definiendo meta: { title, subtitle } y
// tendrá prioridad; el ícono en cambio siempre sigue al navItem activo
// (salvo que la ruta no tenga ningún navItem asociado, en cuyo caso usa
// meta.icon o 'fileText' como último recurso).
const currentNavItem = computed(() =>
  navItems.find((item) => route.path === item.to || route.path.startsWith(item.to + '/'))
);
const currentTitle = computed(() => route.meta?.title || currentNavItem.value?.label || route.name || 'GEA');
const currentSubtitle = computed(() => route.meta?.subtitle || '');
const currentIcon = computed(() => currentNavItem.value?.icon || route.meta?.icon || 'fileText');

// Accesos rápidos de la barra inferior móvil (ajusta las rutas a las tuyas)
const mobileTabs = [
  { to: '/mapa', label: 'Mapa', icon: 'map' },
  { to: '/dashboard', label: 'Resumen', icon: 'grid' },
  { to: '/reportes', label: 'Reportes', icon: 'fileText' },
  { to: '/cuenta', label: 'Cuenta', icon: 'userCircle' },
];

// Paths de íconos estilo "lucide" (trazo simple), insertados vía v-html
// dentro de un <svg> ya configurado con stroke/fill/viewBox.
const icons = {
  home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  map: '<rect x="4" y="4" width="4" height="16" rx="1"/><rect x="10" y="4" width="4" height="16" rx="1"/><rect x="16" y="4" width="4" height="16" rx="1"/>',
  fileText:
    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  users:
    '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  trash:
    '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
  settings:
    '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  logOut:
    '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  menu: '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
  close: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  userCircle: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/>',
  chevronDown: '<polyline points="6 9 12 15 18 9"/>',
};
</script>

<style src="../assets/styles/default_layout.css" scoped></style>