<!--
G.E.A. Frontend
Layout móvil del Dashboard. Se monta únicamente cuando el ancho de
pantalla está bajo el breakpoint (ver DashboardWrapper.vue).

Usa el mismo composable useDashboard() que DashboardDesktopView.vue,
así que ambos layouts muestran siempre los mismos números — no hay
una fuente de datos "de escritorio" y otra "de móvil" por separado.

IMPORTANTE: esta vista se monta DENTRO de <main class="content">
<slot /></main> de DefaultLayout.vue. DefaultLayout.vue ya provee:
  - topbar con botón de menú (abre el drawer real)
  - drawer con navegación completa
  - bottom-tabbar con router-link real (Mapa / Resumen / Reportes / Cuenta)
Por eso este componente NO debe traer su propio app-bar, botón de
menú ni bottom-navigation: eso ya existe un nivel arriba y usa
router-link de verdad. Repetirlo aquí solo crea una segunda barra
que no navega a ningún lado, porque cualquier evento que emitiera
(@toggle-menu, @ir-mapa, etc.) no tiene quién lo escuche —
DashboardWrapper.vue monta <DashboardMobileView /> sin listeners.
 -->

<template>
  <div class="dashboard-mobile">
    <!-- Estados de carga y error -->
    <div v-if="loading" class="loading-state">Cargando dashboard...</div>
    <div v-else-if="error" class="error-state">{{ error }}</div>

    <template v-else>
      <!-- Encabezado con última actualización + refrescar -->
      <div class="dm-header">
        <p class="dm-update-text">
          Última actualización: {{ formatUltimaActualizacion(lastUpdated) }}
        </p>
        <button
          type="button"
          class="dm-refresh-btn"
          :disabled="loading"
          @click="refrescar"
          aria-label="Refrescar dashboard"
        >
          <svg viewBox="0 0 24 24" class="dm-icon" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
      </div>

      <!-- TARJETA 1: Resumen general -->
      <section class="dm-card">
        <h2 class="dm-card-title">Resumen general</h2>
        <p class="dm-card-subtitle">(Totales del sistema)</p>

        <!-- Fila 1: Reportes registrados -->
        <div class="dm-row">
          <div class="dm-icon-box">
            <svg viewBox="0 0 24 24" class="dm-icon" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
          </div>
          <div>
            <div class="dm-row-label">Reportes registrados</div>
            <div class="dm-row-value">{{ resumen.arbolesRegistrados }}</div>
            <div class="dm-row-caption">{{ resumen.validados }} validados · {{ resumen.rechazados }} rechazados</div>
          </div>
        </div>

        <!-- Fila 2: Niveles severos -->
        <div class="dm-row">
          <div class="dm-icon-box">
            <svg viewBox="0 0 24 24" class="dm-icon" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <div class="dm-row-label">Niveles severos</div>
            <div class="dm-row-value">{{ resumen.nivelesSeveros }}</div>
            <div class="dm-row-caption">{{ infestacion.severa.pct }}% del total de árboles</div>
          </div>
        </div>

        <!-- Fila 3: Kg recolectados -->
        <div class="dm-row dm-row-last">
          <div class="dm-icon-box">
            <svg viewBox="0 0 24 24" class="dm-icon" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M9 6V4a3 3 0 0 1 6 0v2" />
              <line x1="3" y1="6" x2="21" y2="6" />
            </svg>
          </div>
          <div>
            <div class="dm-row-label">Kg recolectados</div>
            <div class="dm-row-value">{{ resumen.kgRecolectados }} kg</div>
            <div class="dm-row-caption">Total histórico acumulado</div>
          </div>
        </div>
      </section>

      <!-- TARJETA 2: Árboles por nivel de infestación -->
      <section class="dm-card">
        <h2 class="dm-card-title dm-card-title-spaced">Árboles por nivel de infestación</h2>

        <div class="dm-donut-row">
          <!-- Gráfica de dona dinámica -->
          <div class="dm-donut" :style="{ background: gradientDona }">
            <div class="dm-donut-hole">
              <span class="dm-donut-label">Total</span>
              <span class="dm-donut-value">{{ infestacion.total }}</span>
            </div>
          </div>

          <!-- Leyenda: mismas 4 categorías y colores que desktop -->
          <div class="dm-legend">
            <div class="dm-legend-item">
              <span class="dm-legend-dot" style="background:#22c55e"></span>
              <span>No visible ({{ infestacion.noVisible.count }})</span>
            </div>
            <div class="dm-legend-item">
              <span class="dm-legend-dot" style="background:#eab308"></span>
              <span>Ligera ({{ infestacion.ligera.count }})</span>
            </div>
            <div class="dm-legend-item">
              <span class="dm-legend-dot" style="background:#ef4444"></span>
              <span>Severa ({{ infestacion.severa.count }})</span>
            </div>
            <div class="dm-legend-item">
              <span class="dm-legend-dot" style="background:#a855f7"></span>
              <span>En revisión ({{ infestacion.enRevision.count }})</span>
            </div>
          </div>
        </div>

        <div class="dm-indice-row">
          <span class="dm-indice-label">Índice de afectación</span>
          <span :class="['dm-badge', indiceAfectacion.badgeClass]">
            {{ indiceAfectacion.pct }}% · {{ indiceAfectacion.label }}
          </span>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useDashboard } from '@src/composables/useDashboard';

// Mismo composable que usa DashboardDesktopView.vue: misma fuente de
// datos, mismos números, sin lógica duplicada.
const {
  resumen,
  infestacion,
  indiceAfectacion,
  donutChart,
  loading,
  error,
  lastUpdated,
  refrescar,
} = useDashboard();

const formatUltimaActualizacion = (fecha) => {
  if (!fecha) return '—';
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(fecha);
};

// === GRÁFICA DE DONA: mismos 4 segmentos y colores que donutChart ===
// (No visible / Ligera / Severa / En revisión), calculados a partir de
// infestacion.value en vez de recalcular Hawksworth a mano aquí.
const gradientDona = computed(() => {
  if (infestacion.value.total === 0) return 'conic-gradient(#E0E0E0 0% 100%)';

  const [noVisible, ligera, severa, enRevision] = donutChart.value.series;
  const [colorNoVisible, colorLigera, colorSevera, colorRevision] = donutChart.value.colors;
  const total = infestacion.value.total;

  const pct = (n) => (n / total) * 100;
  const limite1 = pct(noVisible);
  const limite2 = limite1 + pct(ligera);
  const limite3 = limite2 + pct(severa);

  return `conic-gradient(
    ${colorNoVisible} 0% ${limite1}%,
    ${colorLigera} ${limite1}% ${limite2}%,
    ${colorSevera} ${limite2}% ${limite3}%,
    ${colorRevision} ${limite3}% 100%
  )`;
});
</script>

<style src="@src/assets/styles/dashboard_view.css" scoped></style>

<style scoped>
/* Este componente solo pinta CONTENIDO. La navegación (topbar, drawer,
   bottom-tabbar) vive en DefaultLayout.vue y no se toca desde aquí. */

.dashboard-mobile {
  max-width: 480px;
  margin: 0 auto;
  padding: 0 4px 24px;
}

.loading-state,
.error-state {
  padding: 32px 8px;
  text-align: center;
  color: #616161;
}

/* Encabezado */
.dm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.dm-update-text {
  font-size: 12px;
  color: #757575;
  margin: 0;
}
.dm-refresh-btn {
  border: none;
  background: transparent;
  color: #2f7e32;
  padding: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.dm-refresh-btn:disabled {
  opacity: 0.5;
  cursor: default;
}
.dm-icon {
  width: 20px;
  height: 20px;
}

/* Tarjetas */
.dm-card {
  border: 1.5px solid #e0e0e0;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  background: #fff;
}
.dm-card-title {
  font-size: 17px;
  font-weight: 800;
  color: #000;
  line-height: 1.1;
  margin: 0;
}
.dm-card-title-spaced {
  margin-bottom: 20px;
}
.dm-card-subtitle {
  font-size: 13px;
  color: #616161;
  font-weight: 500;
  margin: 2px 0 16px;
}

/* Filas de resumen */
.dm-row {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1.5px solid #e0e0e0;
  border-radius: 12px;
  padding: 10px 12px;
  margin-bottom: 12px;
}
.dm-row-last {
  margin-bottom: 0;
}
.dm-icon-box {
  width: 48px;
  height: 48px;
  min-width: 48px;
  border-radius: 10px;
  background: #1b5e20;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dm-row-label {
  font-size: 13px;
  font-weight: 500;
  color: #424242;
}
.dm-row-value {
  font-size: 20px;
  font-weight: 800;
  color: #000;
  line-height: 1.1;
}
.dm-row-caption {
  font-size: 12px;
  color: #757575;
}

/* Dona + leyenda */
.dm-donut-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}
.dm-donut {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
}
.dm-donut-hole {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.dm-donut-label {
  font-size: 12px;
  font-weight: 700;
  color: #424242;
  margin-bottom: -2px;
}
.dm-donut-value {
  font-size: 17px;
  font-weight: 800;
  color: #000;
  line-height: 1.1;
}
.dm-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.dm-legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #424242;
}
.dm-legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

/* Índice de afectación */
.dm-indice-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding: 0 4px;
}
.dm-indice-label {
  font-size: 12px;
  color: #757575;
}
.dm-badge {
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
}
</style>