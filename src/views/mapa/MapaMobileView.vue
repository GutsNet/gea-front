<!--
G.E.A. Frontend
Layout móvil del Mapa. Se monta únicamente cuando el ancho de
pantalla está bajo el breakpoint (ver MapaView.vue).

Todavía no existe diseño para esta vista, así que mientras tanto se
muestra una pantalla "En construcción" para no dejar rota la
navegación en móvil (mismo criterio que DashboardMobileView.vue).

Cuando se diseñe el layout real: importar y usar useMapa() aquí
igual que hace MapaDesktopView.vue, para reutilizar los mismos datos
y lógica (arbolSeleccionado, estadisticas, etc.).
 -->

<template>
  <div class="map-main">
    <div class="map-mobile">
      <div class="construction-content">
        <div class="construction-icon-wrap">
          <svg class="construction-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
        </div>
        <h2 class="construction-title">Estamos trabajando en esto</h2>
        <p class="construction-text">
          La vista móvil del mapa todavía está en construcción.<br />
          Por ahora, consulta el mapa desde una computadora.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Sin lógica todavía. Cuando exista el diseño móvil real, conectar
// aquí el composable useMapa (ver comentario arriba).
</script>

<style src="@src/assets/styles/mapa_view.css" scoped></style>
