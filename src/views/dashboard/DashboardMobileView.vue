<!--
G.E.A. Frontend
Layout móvil del Dashboard ("Resumen"). Se monta únicamente cuando el
ancho de pantalla está bajo el breakpoint (ver DashboardWrapper.vue).

Usa el mismo composable useDashboard() que DashboardDesktopView.vue,
así que ambos layouts muestran siempre los mismos números — no hay
una fuente de datos "de escritorio" y otra "de móvil" por separado.

IMPORTANTE: esta vista se monta DENTRO de <main class="content">
<slot /></main> de DefaultLayout.vue. DefaultLayout.vue ya provee:
  - topbar verde con botón de menú y título "Resumen" (según la ruta)
  - drawer con navegación completa
  - bottom-tabbar con router-link real (Mapa / Resumen / Reportes / Cuenta)
Por eso este componente NO trae su propio app-bar ni bottom-navigation:
eso ya existe un nivel arriba y usa router-link de verdad. Repetirlo
aquí solo crearía una segunda barra decorativa que no navega a ningún
lado (los @click="$emit(...)" del mock original no tienen quién los
escuche una vez montado dentro de DashboardWrapper.vue).

Usa componentes de Vuetify (v-card, v-icon) para el contenido, igual
que en el mock recibido — Vuetify ya está registrado globalmente en
main.js, así que no hace falta importarlo aquí.

NOTA sobre "(Esta semana)": el backend no expone un corte semanal para
este resumen (ver comentarios de useDashboard.js sobre no inventar
tendencias que no existen como dato real), así que el subtítulo usa
"Totales del sistema" en vez del texto literal del mock. Si más
adelante el backend agrega un endpoint de rango de fechas, este
subtítulo es el único lugar que hay que tocar.

NOTA sobre la dona: el mock solo distingue 3 niveles (No visible /
Ligera / Severa), a diferencia del dashboard de escritorio que además
separa "En revisión". Aquí se respeta el diseño del mock: se muestran
solo esos 3 segmentos, pero el número central ("Total") sigue siendo
el total real de árboles (infestacion.total), para que coincida con
la tarjeta de "Árboles-reportes registrados" de arriba. Si en algún
momento existen árboles "En revisión", no tendrán segmento propio en
esta vista (quedarán fuera del arco, igual que en el mock).
-->

<template>
  <div class="dashboard-mobile">
    <!-- Estados de carga y error -->
    <div v-if="loading" class="dm-state-text">Cargando dashboard...</div>
    <v-alert v-else-if="error" type="error" variant="tonal" density="comfortable" class="mb-4">
      {{ error }}
    </v-alert>

    <template v-else>
      <!-- TARJETA 1: Resumen general -->
      <v-card variant="outlined" class="mb-4 rounded-xl dm-border px-4 py-4 elevation-0">
        <h2 class="text-h6 font-weight-black text-black dm-tight">Resumen general</h2>
        <p class="text-body-2 text-grey-darken-1 mb-4 font-weight-medium">(Totales del sistema)</p>

        <!-- Fila 1: Árboles-reportes registrados -->
        <v-card variant="outlined" class="mb-3 rounded-lg dm-border px-3 py-2 d-flex align-center dm-gap-3 elevation-0">
          <div class="dm-icon-box bg-green-darken-3 rounded-lg d-flex align-center justify-center">
            <v-icon color="white" size="28">mdi-tree-outline</v-icon>
          </div>
          <div>
            <div class="text-body-2 font-weight-medium text-grey-darken-3">Árboles-reportes registrados</div>
            <div class="text-h5 font-weight-black text-black dm-tight">{{ resumen.arbolesRegistrados }}</div>
          </div>
        </v-card>

        <!-- Fila 2: Niveles severos -->
        <v-card variant="outlined" class="mb-3 rounded-lg dm-border px-3 py-2 d-flex align-center dm-gap-3 elevation-0">
          <div class="dm-icon-box bg-green-darken-3 rounded-lg d-flex align-center justify-center">
            <v-icon color="white" size="28">mdi-alert-box-outline</v-icon>
          </div>
          <div>
            <div class="text-body-2 font-weight-medium text-grey-darken-3">Niveles severos</div>
            <div class="text-h5 font-weight-black text-black dm-tight">{{ resumen.nivelesSeveros }}</div>
          </div>
        </v-card>

        <!-- Fila 3: Kg recolectados -->
        <v-card variant="outlined" class="rounded-lg dm-border px-3 py-2 d-flex align-center dm-gap-3 elevation-0">
          <div class="dm-icon-box bg-green-darken-3 rounded-lg d-flex align-center justify-center">
            <v-icon color="white" size="28">mdi-sack</v-icon>
          </div>
          <div>
            <div class="text-body-2 font-weight-medium text-grey-darken-3">Kg recolectados</div>
            <div class="text-h5 font-weight-black text-black dm-tight">{{ resumen.kgRecolectados }} kg</div>
          </div>
        </v-card>
      </v-card>

      <!-- TARJETA 2: Árboles por nivel de infestación -->
      <v-card variant="outlined" class="rounded-xl dm-border px-4 py-5 elevation-0">
        <h2 class="text-h6 font-weight-black text-black mb-5 dm-tight">Árboles por nivel de infestación</h2>

        <div class="d-flex align-center justify-space-between pl-2 pr-1">
          <!-- Gráfica de dona dinámica -->
          <div class="dm-donut position-relative d-flex align-center justify-center" :style="{ background: gradientDona }">
            <div class="dm-donut-hole bg-white rounded-circle d-flex flex-column align-center justify-center">
              <span class="text-caption font-weight-bold text-grey-darken-2 mb-n1">Total</span>
              <span class="text-h6 font-weight-black text-black dm-tight">{{ infestacion.total }}</span>
            </div>
          </div>

          <!-- Leyenda -->
          <div class="d-flex flex-column dm-gap-2">
            <div class="d-flex align-center">
              <v-icon color="#4CAF50" size="14" class="mr-2">mdi-circle</v-icon>
              <span class="text-caption font-weight-medium text-grey-darken-3">0 - No visible ({{ infestacion.noVisible.count }})</span>
            </div>
            <div class="d-flex align-center">
              <v-icon color="#FFCA28" size="14" class="mr-2">mdi-circle</v-icon>
              <span class="text-caption font-weight-medium text-grey-darken-3">3.5 - Ligera ({{ infestacion.ligera.count }})</span>
            </div>
            <div class="d-flex align-center">
              <v-icon color="#E53935" size="14" class="mr-2">mdi-circle</v-icon>
              <span class="text-caption font-weight-medium text-grey-darken-3">7.5 - Severa ({{ infestacion.severa.count }})</span>
            </div>
          </div>
        </div>
      </v-card>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useDashboard } from '@src/composables/useDashboard';

// Mismo composable que usa DashboardDesktopView.vue: misma fuente de
// datos, mismos números, sin lógica duplicada.
const { resumen, infestacion, loading, error } = useDashboard();

// === GRÁFICA DE DONA: 3 segmentos (No visible / Ligera / Severa) ===
// calculados a partir de infestacion.value en vez de recalcular
// Hawksworth a mano aquí. El denominador es infestacion.total (todos
// los árboles), así que si existieran árboles "En revisión" el arco
// no cerraría el círculo completo — coincide con que el mock no les
// da segmento propio en esta vista.
const gradientDona = computed(() => {
  if (infestacion.value.total === 0) return 'conic-gradient(#E0E0E0 0% 100%)';

  const { noVisible, ligera, severa, total } = infestacion.value;
  const pct = (n) => (n / total) * 100;

  const limiteSano = pct(noVisible.count);
  const limiteLigero = limiteSano + pct(ligera.count);
  const limiteSevero = limiteLigero + pct(severa.count);

  return `conic-gradient(
    #4CAF50 0% ${limiteSano}%,
    #FFCA28 ${limiteSano}% ${limiteLigero}%,
    #E53935 ${limiteLigero}% ${limiteSevero}%,
    #E0E0E0 ${limiteSevero}% 100%
  )`;
});
</script>

<style scoped>
/* Este componente solo pinta CONTENIDO. La navegación (topbar, drawer,
   bottom-tabbar) vive en DefaultLayout.vue y no se toca desde aquí. */

.dashboard-mobile {
  max-width: 480px;
  margin: 0 auto;
}

.dm-state-text {
  padding: 32px 8px;
  text-align: center;
  color: #616161;
}

.dm-tight { line-height: 1.1; }
.dm-border { border: 1.5px solid #e0e0e0 !important; }
.dm-icon-box { width: 48px; height: 48px; min-width: 48px; }
.dm-gap-3 { gap: 12px; }
.dm-gap-2 { gap: 8px; }

/* Gráfica de dona */
.dm-donut {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  transition: background 0.3s ease;
}
.dm-donut-hole {
  width: 70px;
  height: 70px;
}
</style>