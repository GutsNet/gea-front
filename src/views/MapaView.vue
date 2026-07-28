<template>
  <section class="map-wrapper">

    <!--BARRA SUPERIOR (Búsqueda y Filtros)-->
    <div class="toolbar">
      <div class="search-group">
        <div class="search-box">
          <svg viewBox="0 0 24 24" class="icon-search" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Buscar árbol o ubicación..." />
        </div>
        <button class="btn-add" aria-label="Añadir nuevo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>

      <div class="filters-group">
        <div class="select-wrapper">
          <label>Filtrar por especie</label>
          <select><option>Todas</option></select>
        </div>
        <div class="select-wrapper">
          <label>Nivel de infestación</label>
          <select><option>Todos</option></select>
        </div>
        <div class="select-wrapper">
          <label>Estado</label>
          <select><option>Todos</option></select>
        </div>
      </div>
    </div>

    <!-- CONTENIDO PRINCIPAL (Mapa + Panel lateral)-->
    <div class="main-layout">

      <!-- CONTENEDOR DEL MAPA -->
      <div class="map-container">
        <!-- Controles del mapa  -->
        <div class="map-controls">
          <button class="map-btn" aria-label="Acercar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <button class="map-btn" aria-label="Alejar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <button class="map-btn mt-small" aria-label="Mi ubicación">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="10"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/></svg>
          </button>
        </div>

        <!-- Leyenda del mapa -->
        <div class="map-legend">
          <h4>Nivel de infestación (Hawksworth)</h4>
          <ul>
            <li><span class="legend-icon text-green"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8"/></svg></span> 0 - No visible</li>
            <li><span class="legend-icon text-yellow"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8"/></svg></span> 3.5 - Ligera</li>
            <li><span class="legend-icon text-red"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg></span> 7.5 - Severa</li>
            <li><span class="legend-icon text-dark"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6" stroke="white" stroke-width="2"/></svg></span> Árbol muerto - estado crítico</li>
            <li><span class="legend-icon text-blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><circle cx="12" cy="12" r="8"/></svg></span> En revisión</li>
          </ul>
        </div>
      </div>

      <!-- PANEL LATERAL DE DETALLES -->
      <aside class="details-panel" v-if="arbolSeleccionado">
        <div class="tree-image-container">
          <!--MAPIÑA -->
          <img src="" alt="Foto del árbol" class="tree-image" />
          <div class="tree-badge text-red">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          </div>
        </div>

        <div class="tree-header">
          <h3>{{ arbolSeleccionado.especie_comun }}</h3>
          <p class="subtitle">({{ arbolSeleccionado.especie_cientifica }})</p>
          <p class="tree-id">ID: {{ arbolSeleccionado.id }}</p>
        </div>

        <div class="tree-info">
          <div class="info-group">
            <label>Nivel de infestación</label>
            <p class="font-bold text-red">{{ arbolSeleccionado.nivel_infestacion }}</p>
          </div>
          <div class="info-group-inline">
            <label>Estado:</label>
            <span class="text-green font-medium">{{ arbolSeleccionado.estado }}</span>
          </div>
          <div class="info-group">
            <label>Último reporte:</label>
            <p>{{ arbolSeleccionado.ultimo_reporte }}</p>
          </div>
        </div>

        <div class="tree-actions">
          <button class="btn-primary-full">Ver detalles</button>
          <button class="btn-outline-full">Marcar como saneado</button>
        </div>
      </aside>

    </div>

    <!--TARJETAS INFERIORES DE ESTADÍSTICAS -->
    <div class="stats-row">
      <!-- Card 1 -->
      <div class="stat-card bg-light-green-card border-card-green">
        <div class="stat-icon-wrapper bg-icon-green text-green">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 11.4A5.5 5.5 0 0 0 14 5a5.5 5.5 0 0 0-8.5 4.6 4.5 4.5 0 0 0 .5 8.4H11v4h2v-4h1.5a4.5 4.5 0 0 0 2.5-8.6z"/></svg>
        </div>
        <div class="stat-text">
          <p class="stat-label">Árboles registrados</p>
          <h4 class="stat-value">128</h4>
        </div>
      </div>

      <!-- Card 2 -->
      <div class="stat-card bg-light-blue-card border-card-blue">
        <div class="stat-icon-wrapper bg-icon-blue text-blue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
        </div>
        <div class="stat-text">
          <p class="stat-label">Reportes nuevos</p>
          <h4 class="stat-value">35</h4>
        </div>
      </div>

      <!-- Card 3 -->
      <div class="stat-card bg-light-red-card border-card-red">
        <div class="stat-icon-wrapper bg-icon-red text-red">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
        </div>
        <div class="stat-text">
          <p class="stat-label">Niveles severos</p>
          <h4 class="stat-value">18</h4>
        </div>
      </div>

      <!-- Card 4 -->
      <div class="stat-card bg-light-purple-card border-card-purple">
        <div class="stat-icon-wrapper bg-icon-purple text-purple">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M16 10a4 4 0 0 1-8 0" fill="none" stroke="white" stroke-width="2"/></svg>
        </div>
        <div class="stat-text">
          <p class="stat-label">Kg recolectados</p>
          <h4 class="stat-value">256.8 kg</h4>
        </div>
      </div>

      <!-- Card 5 -->
      <div class="stat-card bg-light-orange-card border-card-orange">
        <div class="stat-icon-wrapper bg-icon-orange text-orange">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75" fill="none" stroke="currentColor" stroke-width="2"/></svg>
        </div>
        <div class="stat-text">
          <p class="stat-label">Usuarios activos</p>
          <h4 class="stat-value">10</h4>
        </div>
      </div>
    </div>

  </section>
</template>

<script setup>
import { ref } from 'vue';


const arbolSeleccionado = ref({
  id: 'ARB-0234',
  especie_comun: 'Mezquite',
  especie_cientifica: 'Prosopus laevigata',
  nivel_infestacion: '7.5 (Severo)',
  estado: 'Saneado',
  ultimo_reporte: '06/07/2026 11:11:11'
});
</script>

<style scoped>
/* VARIABLES Y BASE */
.map-wrapper {
  padding: 1.5rem;
  background-color: #f8fafc;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #334155;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/*  TOOLBAR SUPERIOR  */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.search-group {
  display: flex;
  gap: 0.75rem;
  flex: 1;
  min-width: 300px;
  max-width: 500px;
}
.search-box {
  position: relative;
  flex: 1;
}
.search-box input {
  width: 100%;
  padding: 0.6rem 1rem 0.6rem 2.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  background: white;
}
.icon-search {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #94a3b8;
}

.btn-add {
  background-color: #15803d;
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}
.btn-add:hover { background-color: #166534; }
.btn-add svg { width: 20px; height: 20px; }

.filters-group {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
}

.select-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.select-wrapper label {
  font-size: 0.75rem;
  color: #64748b;
}
.select-wrapper select {
  padding: 0.6rem 2.5rem 0.6rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: white;
  font-size: 0.85rem;
  outline: none;
  cursor: pointer;
  min-width: 140px;
}

/* GRID PRINCIPAL (Mapa + Panel)  */
.main-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1.5rem;
  min-height: 550px; /* Altura sugerida para el mapa */
}

/* Contenedor del Mapa */
.map-container {
  background: url('https://www.transparenttextures.com/patterns/cubes.png'), #2c3e50; /* Color oscuro simulando satélite */
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.map-controls {
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.map-btn {
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #334155;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}
.map-btn svg { width: 18px; height: 18px; }
.map-btn:hover { background: #f8fafc; }
.mt-small { margin-top: 0.5rem; }

.map-legend {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  font-size: 0.85rem;
}
.map-legend h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.85rem;
  color: #1e293b;
}
.map-legend ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.map-legend li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #475569;
}
.legend-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.legend-icon svg { width: 100%; height: 100%; }

/* Panel de Detalles */
.details-panel {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}

.tree-image-container {
  position: relative;
  width: 100%;
  height: 180px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.tree-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.tree-badge {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  background: white;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
}
.tree-badge svg { width: 20px; height: 20px; }

.tree-header { margin-bottom: 1.25rem; }
.tree-header h3 { margin: 0 0 0.1rem 0; font-size: 1.2rem; color: #0f172a; }
.tree-header .subtitle { margin: 0 0 0.5rem 0; font-size: 0.9rem; color: #64748b; font-style: italic;}
.tree-header .tree-id { margin: 0; font-size: 0.8rem; color: #94a3b8; }

.tree-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  flex: 1;
}
.info-group, .info-group-inline {
  font-size: 0.9rem;
}
.info-group label, .info-group-inline label {
  color: #1e293b;
  font-weight: 600;
  display: block;
  margin-bottom: 0.25rem;
}
.info-group-inline label {
  display: inline-block;
  margin-right: 0.5rem;
  margin-bottom: 0;
}
.info-group p { margin: 0; color: #475569; }

.tree-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.btn-primary-full {
  background-color: #15803d;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  text-align: center;
  width: 100%;
}
.btn-outline-full {
  background-color: white;
  color: #15803d;
  border: 1px solid #15803d;
  padding: 0.75rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  text-align: center;
  width: 100%;
}

/* TARJETAS INFERIORES */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  border-radius: 10px;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid transparent;
}
.stat-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stat-icon-wrapper svg { width: 22px; height: 22px; }

.stat-text {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.stat-text .stat-label { margin: 0; font-size: 0.75rem; font-weight: 600; color: #1e293b;}
.stat-text .stat-value { margin: 0; font-size: 1.25rem; font-weight: 700; color: #0f172a;}

/* Colores de Tarjetas */
.bg-light-green-card { background-color: #f0fdf4; }
.border-card-green { border-color: #dcfce7; }
.bg-icon-green { background-color: #bbf7d0; }

.bg-light-blue-card { background-color: #eff6ff; }
.border-card-blue { border-color: #dbeafe; }
.bg-icon-blue { background-color: #bfdbfe; }

.bg-light-red-card { background-color: #fef2f2; }
.border-card-red { border-color: #fee2e2; }
.bg-icon-red { background-color: #fecaca; }

.bg-light-purple-card { background-color: #faf5ff; }
.border-card-purple { border-color: #f3e8ff; }
.bg-icon-purple { background-color: #e9d5ff; }

.bg-light-orange-card { background-color: #fffbeb; }
.border-card-orange { border-color: #fef3c7; }
.bg-icon-orange { background-color: #fde68a; }


.text-green { color: #15803d; }
.text-yellow { color: #d97706; }
.text-red { color: #dc2626; }
.text-dark { color: #1e293b; }
.text-blue { color: #2563eb; }
.text-purple { color: #7e22ce; }
.text-orange { color: #d97706; }
.font-bold { font-weight: 700; }
.font-medium { font-weight: 500; }


@media (max-width: 1024px) {
  .main-layout {
    grid-template-columns: 1fr;
  }
  .map-container {
    min-height: 400px;
  }
}
</style>