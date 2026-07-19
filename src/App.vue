<template>
  <div class="app-shell">
    <aside class="sidebar">
      <h1>GEA</h1>
      <nav>
        <router-link to="/dashboard">Dashboard</router-link>
        <router-link to="/arboles">Árboles</router-link>
        <router-link to="/reportes">Reportes</router-link>
        <router-link to="/mapa">Mapa</router-link>
      </nav>
    </aside>

    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
  font-family: Arial, sans-serif;
  background: #f6f8fb;
}
.sidebar {
  background: #16324f;
  color: white;
  padding: 1rem;
}
.sidebar nav {
  display: grid;
  gap: 0.5rem;
  margin-top: 1rem;
}
.sidebar a {
  color: white;
  text-decoration: none;
}
.content {
  padding: 1rem;
}
</style>
