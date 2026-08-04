<!--  
G.E.A. Frontend 
Vista: Cuenta (/cuenta)
Muestra el perfil del usuario en sesión, sus estadísticas de participación
(árboles reportados, reportes enviados, kg recolectados) y su actividad
reciente, combinando datos de /reportes/ y /recoleccion/ filtrados por el
usuario autenticado.
 -->

<template>
  <section class="cuenta-view">
    <div v-if="loading" class="cuenta-loading">Cargando información de la cuenta...</div>

    <template v-else>
      <div class="cuenta-desktop-only">
      <!-- ---------- Tarjeta de perfil ---------- -->
      <div class="cuenta-card cuenta-profile">
        <div class="cuenta-profile-main">
          <span class="cuenta-avatar">
            <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" v-html="icons.userCircle"></svg>
          </span>

          <div class="cuenta-profile-info">
            <h3 class="cuenta-name">{{ fullName }}</h3>
            <span class="cuenta-role-badge">{{ roleLabel }}</span>

            <p v-if="user.email" class="cuenta-meta-line">
              <svg viewBox="0 0 24 24" class="icon-sm" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" v-html="icons.mail"></svg>
              {{ user.email }}
            </p>
            <p class="cuenta-meta-line">
              <svg viewBox="0 0 24 24" class="icon-sm" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" v-html="icons.idCard"></svg>
              Matrícula: {{ user.matricula }}
            </p>
          </div>
        </div>

        <div class="cuenta-profile-side">
          <div class="cuenta-side-item">
            <span class="cuenta-side-icon">
              <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" v-html="icons.calendar"></svg>
            </span>
            <div>
              <p class="cuenta-side-label">Miembro desde</p>
              <p class="cuenta-side-value">{{ miembroDesde }}</p>
            </div>
          </div>

          <span class="cuenta-side-divider"></span>

          <div class="cuenta-side-item">
            <span class="cuenta-side-icon">
              <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" v-html="icons.clock"></svg>
            </span>
            <div>
              <p class="cuenta-side-label">Último acceso</p>
              <p class="cuenta-side-value">{{ ultimoAcceso }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ---------- Estadísticas ---------- -->
      <div class="cuenta-stats">
        <div class="cuenta-card cuenta-stat">
          <span class="cuenta-stat-icon cuenta-stat-icon-green">
            <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" v-html="icons.tree"></svg>
          </span>
          <div>
            <p class="cuenta-stat-label">Árboles registrados</p>
            <p class="cuenta-stat-value">{{ arbolesRegistrados }}</p>
            <p class="cuenta-stat-hint">Total de árboles capturados en la plataforma</p>
          </div>
        </div>

        <div class="cuenta-card cuenta-stat">
          <span class="cuenta-stat-icon cuenta-stat-icon-green">
            <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" v-html="icons.fileText"></svg>
          </span>
          <div>
            <p class="cuenta-stat-label">Reportes enviados</p>
            <p class="cuenta-stat-value">{{ reportes.length }}</p>
            <p class="cuenta-stat-hint">Reportes realizados en el sistema</p>
          </div>
        </div>

        <div class="cuenta-card cuenta-stat">
          <span class="cuenta-stat-icon cuenta-stat-icon-green">
            <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" v-html="icons.droplet"></svg>
          </span>
          <div>
            <p class="cuenta-stat-label">Kg recolectados</p>
            <p class="cuenta-stat-value">{{ kgRecolectados }} kg</p>
            <p class="cuenta-stat-hint">Kilogramos totales recolectados</p>
          </div>
        </div>
      </div>

      <!-- ---------- Actividad reciente (ancho completo) ---------- -->
      <div class="cuenta-card cuenta-activity">
        <h3 class="cuenta-activity-title">
          <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" v-html="icons.clock"></svg>
          Actividad reciente
        </h3>

        <div v-if="actividad.length === 0" class="cuenta-activity-empty">
          Aún no hay actividad registrada para tu cuenta.
        </div>

        <ul v-else class="cuenta-activity-list">
          <li v-for="item in actividad" :key="item.id" class="cuenta-activity-item">
            <span class="cuenta-activity-icon" :class="`cuenta-activity-icon-${item.color}`">
              <svg viewBox="0 0 24 24" class="icon-sm" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" v-html="icons[item.icon]"></svg>
            </span>
            <div class="cuenta-activity-body">
              <p class="cuenta-activity-label">{{ item.label }}</p>
              <p class="cuenta-activity-detail">{{ item.detail }}</p>
            </div>
            <span class="cuenta-activity-time">{{ formatRelativeTime(item.date) }}</span>
          </li>
        </ul>
      </div>
      </div>

      <!-- ============================================================
           VISTA MÓVIL — mismo patrón de DefaultLayout.vue: contenido
           alterno mostrado/ocultado por CSS según el breakpoint, en vez
           de duplicar la lógica con otro componente.
           ============================================================ -->
      <div class="cuenta-mobile-only">
        <!-- ---------- Tarjeta de perfil ---------- -->
        <div class="cuenta-card">
          <div class="cuenta-profile-main">
            <span class="cuenta-avatar">
              <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" v-html="icons.userCircle"></svg>
            </span>

            <div class="cuenta-profile-info">
              <h3 class="cuenta-name">{{ fullName }}</h3>
              <p class="cuenta-role-text">{{ roleLabel }}</p>
              <p class="cuenta-meta-line-plain">Matrícula: {{ user.matricula }}</p>
              <p v-if="user.email" class="cuenta-meta-line-plain">{{ user.email }}</p>
            </div>
          </div>
        </div>

        <!-- ---------- Mi actividad ---------- -->
        <div class="cuenta-mobile-section">
          <h3 class="cuenta-section-title">
            <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" v-html="icons.barChart"></svg>
            Mi actividad
          </h3>

          <div class="cuenta-card cuenta-mobile-list">
            <div class="cuenta-mobile-row">
              <span class="cuenta-mobile-row-icon">
                <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" v-html="icons.tree"></svg>
              </span>
              <div>
                <p class="cuenta-mobile-row-label">Árboles registrados</p>
                <p class="cuenta-mobile-row-value">{{ arbolesRegistrados }}</p>
              </div>
            </div>

            <div class="cuenta-mobile-row">
              <span class="cuenta-mobile-row-icon">
                <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" v-html="icons.fileText"></svg>
              </span>
              <div>
                <p class="cuenta-mobile-row-label">Reportes enviados</p>
                <p class="cuenta-mobile-row-value">{{ reportes.length }}</p>
              </div>
            </div>

            <div class="cuenta-mobile-row">
              <span class="cuenta-mobile-row-icon">
                <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" v-html="icons.droplet"></svg>
              </span>
              <div>
                <p class="cuenta-mobile-row-label">Kg recolectados</p>
                <p class="cuenta-mobile-row-value">{{ kgRecolectados }} kg</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ---------- Información ---------- -->
        <div class="cuenta-mobile-section">
          <h3 class="cuenta-section-title">
            <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" v-html="icons.info"></svg>
            Información
          </h3>

          <div class="cuenta-card cuenta-mobile-list">
            <div class="cuenta-mobile-row">
              <span class="cuenta-mobile-row-icon">
                <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" v-html="icons.shield"></svg>
              </span>
              <div>
                <p class="cuenta-mobile-row-label">Rol</p>
                <p class="cuenta-mobile-row-value cuenta-mobile-row-value--info">{{ roleLabel }}</p>
              </div>
            </div>

            <div class="cuenta-mobile-row">
              <span class="cuenta-mobile-row-icon">
                <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" v-html="icons.calendar"></svg>
              </span>
              <div>
                <p class="cuenta-mobile-row-label">Miembro desde</p>
                <p class="cuenta-mobile-row-value cuenta-mobile-row-value--info">{{ miembroDesde }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ---------- Cerrar sesión ---------- -->
      <button type="button" class="cuenta-logout-btn" @click="handleLogout">
        <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" v-html="icons.logOut"></svg>
        Cerrar sesión
      </button>

      <p class="cuenta-footer"><span class="cuenta-footer-brand">G.E.A. - Gestión Ecológica Arbórea &nbsp;•&nbsp; </span>Versión 1.0.0</p>
    </template>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '../api/client';
import { getStoredUser, logout } from '../services/authService';

const router = useRouter();

const user = ref(getStoredUser() || {});
const reportes = ref([]);
const recolecciones = ref([]);
const loading = ref(true);

const roleLabels = {
  root: 'Sysadmin (root)',
  admin: 'Administrador',
  user: 'Brigadista',
};

const fullName = computed(() => {
  const nombre = `${user.value.first_name || ''} ${user.value.last_name || ''}`.trim();
  if (nombre) return nombre;
  // La matrícula ya se muestra debajo del nombre, así que nunca la
  // usamos aquí como respaldo para evitar mostrarla duplicada.
  if (user.value.username && user.value.username !== user.value.matricula) {
    return user.value.username;
  }
  return 'Usuario';
});

const roleLabel = computed(() => roleLabels[user.value.rol] || user.value.rol || '');

const miembroDesde = computed(() => formatMesAnio(user.value.fecha_registro));
const ultimoAcceso = computed(() => formatFechaHora(user.value.ultimo_acceso));

const arbolesRegistrados = computed(() => {
  const ids = new Set(reportes.value.map((r) => r.id_arbol));
  return ids.size;
});

const kgRecolectados = computed(() => {
  const total = recolecciones.value.reduce((acc, r) => acc + Number(r.kilos || 0), 0);
  return total.toFixed(1);
});

// Combina reportes + recolecciones en una sola línea de tiempo ordenada
// por fecha descendente, para el bloque de "Actividad reciente".
const actividad = computed(() => {
  const deReportes = reportes.value.map((r) => ({
    id: `reporte-${r.id}`,
    date: r.hora,
    label: r.status_reporte === 'Validado' ? 'Reporte validado' : 'Reporte rechazado',
    detail: `${r.arbol_etiqueta || 'Árbol'} · Nivel ${r.nivel_infestacion}`,
    icon: r.status_reporte === 'Validado' ? 'checkCircle' : 'xCircle',
    color: r.status_reporte === 'Validado' ? 'green' : 'red',
  }));

  const deRecolecciones = recolecciones.value.map((r) => ({
    id: `recoleccion-${r.id}`,
    date: r.fecha,
    label: 'Recolección registrada',
    detail: `${r.kilos} kg de residuos`,
    icon: 'droplet',
    color: 'blue',
  }));

  return [...deReportes, ...deRecolecciones]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);
});

onMounted(async () => {
  try {
    // Refresca el perfil desde la API (por si cambió desde el último login)
    const perfil = await apiClient.get('/auth/perfil/').catch(() => null);
    if (perfil?.data) {
      user.value = { ...user.value, ...perfil.data };
    }

    const userId = user.value.id;

    const [reportesRes, recoleccionRes] = await Promise.all([
      apiClient.get('/reportes/', { params: { responsable: userId, ordering: '-hora' } }).catch(() => null),
      apiClient.get('/recoleccion/', { params: { responsable: userId, ordering: '-fecha' } }).catch(() => null),
    ]);

    reportes.value = reportesRes?.data?.results ?? reportesRes?.data ?? [];
    recolecciones.value = recoleccionRes?.data?.results ?? recoleccionRes?.data ?? [];
  } finally {
    loading.value = false;
  }
});

function handleLogout() {
  logout();
  router.push('/login');
}

function formatMesAnio(fecha) {
  if (!fecha) return '—';
  const d = new Date(fecha);
  const texto = new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' }).format(d);
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function formatFechaHora(fecha) {
  if (!fecha) return '—';
  const d = new Date(fecha);
  const fechaTexto = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
  const horaTexto = new Intl.DateTimeFormat('es-MX', { hour: 'numeric', minute: '2-digit', hour12: true }).format(d);
  return `${fechaTexto}, ${horaTexto}`;
}

function formatRelativeTime(fecha) {
  if (!fecha) return '';
  const d = new Date(fecha);
  const diffMs = Date.now() - d.getTime();
  const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDias = Math.floor(diffHoras / 24);

  if (diffHoras < 1) return 'Hace unos minutos';
  if (diffHoras < 24) return `Hace ${diffHoras} hora${diffHoras === 1 ? '' : 's'}`;
  if (diffDias === 1) return 'Ayer';
  if (diffDias < 7) return `Hace ${diffDias} días`;
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' }).format(d);
}

// Íconos estilo "lucide" (trazo simple), insertados vía v-html dentro de
// un <svg> ya configurado con stroke/fill/viewBox — mismo patrón usado en DefaultLayout.
const icons = {
  userCircle: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>',
  idCard: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h4"/><circle cx="7" cy="10" r="1.5"/><path d="M13 9h5"/><path d="M13 12.5h5"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  tree: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  fileText: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>',
  droplet: '<path d="M12 2.69s5.66 5.6 8.5 10.15a9 9 0 1 1-17 0C7.34 8.29 12 2.69 12 2.69z"/>',
  checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  xCircle: '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
  logOut: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  barChart: '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>',
  info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
};
</script>

<style src="../assets/styles/cuenta_view.css" scoped></style>