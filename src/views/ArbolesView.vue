<template>
  <section class="trees-wrapper">
    <!-- Barra superior de búsqueda y filtros -->
    <div class="toolbar">
      <div class="search-group">
        <div class="search-box">
          <svg viewBox="0 0 24 24" class="icon-search" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Buscar árbol, especie o ubicación..." />
        </div>
        <button class="btn-search">
          <svg viewBox="0 0 24 24" class="icon-sm" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          Buscar
        </button>
      </div>

      <div class="filters-group">
        <div class="select-wrapper">
          <label>Especie</label>
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
        <button class="btn-outline btn-filter">
          <svg viewBox="0 0 24 24" class="icon-sm" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          Filtros
        </button>
      </div>
    </div>

    <!-- Resumen de totales -->
    <div class="summary-bar">
      <p>Total: 128 árboles registrados</p>
    </div>

    <!-- Estados de carga y error -->
    <div v-if="loading" class="state-msg">Cargando árboles...</div>
    <div v-else-if="error" class="state-msg error-msg">{{ error }}</div>

    <!-- Tabla Principal -->
    <div v-else class="table-container">
      <table class="data-table">
        <thead>
        <tr>
          <th>ID del árbol</th>
          <th>Especie</th>
          <th>Ubicación</th>
          <th class="text-center">Nivel de infestación</th>
          <th class="text-center">Estado</th>
          <th>Último reporte</th>
          <th class="text-center">Acciones</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in arboles" :key="item.id">

          <!--ID e Ícono -->
          <td>
            <div class="id-cell">
              <div class="severity-icon" :class="getSeverityColorClass(item.nivelNum, item.estadoInfestacion)">
                <svg v-if="item.nivelNum >= 7.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                <svg v-else-if="item.estadoInfestacion === 'En revisión'" viewBox="0 0 24 24" fill="currentColor"><path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                <svg v-else-if="item.nivelNum === 0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                <svg v-else viewBox="0 0 24 24" fill="currentColor"><path d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.48 2.54l2.6 1.53c.56-1.24.88-2.62.88-4.07 0-5.18-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-5.06.5-9 4.76-9 9.95 0 5.52 4.47 10 9.99 10 3.31 0 6.24-1.61 8.06-4.09l-2.6-1.53C16.17 17.98 14.21 19 12 19z"/></svg>
              </div>
              <span class="font-semibold">{{ item.id }}</span>
              <span class="status-dot" :class="getSeverityBgClass(item.nivelNum, item.estadoInfestacion)"></span>
            </div>
          </td>

          <!-- especie -->
          <td>
            <div class="double-text">
              <span class="primary-text">{{ item.especie_comun }}</span>
              <span class="secondary-text">({{ item.especie_cientifica }})</span>
            </div>
          </td>

          <!-- Ubicación -->
          <td>
            <div class="double-text">
              <span class="primary-text">{{ item.ubicacion }}</span>
              <span class="secondary-text">{{ item.coordenadas }}</span>
            </div>
          </td>

          <!-- nivel de Infestación -->
          <td class="text-center">
            <div class="infestation-cell">
                <span class="infestation-badge" :class="getInfestationBadgeClass(item.nivelNum, item.estadoInfestacion)">
                  {{ item.nivelTexto }}
                </span>
              <span class="secondary-text">{{ item.estadoInfestacion }}</span>
            </div>
          </td>

          <!-- Estado -->
          <td class="text-center">
              <span class="status-pill" :class="getStatusBadgeClass(item.estado)">
                {{ item.estado }}
              </span>
          </td>

          <!-- Último reporte -->
          <td>
            <div class="double-text">
              <span class="primary-text">{{ item.fechaReporte }}</span>
              <span class="secondary-text" v-if="item.horaReporte">{{ item.horaReporte }}</span>
            </div>
          </td>

          <!-- Acciones -->
          <td>
            <div class="actions-cell">
              <button class="btn-icon" aria-label="Ver detalles">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button class="btn-icon" aria-label="Más opciones">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
              </button>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div class="pagination-footer">
      <div class="per-page">
        <span>Mostrar</span>
        <select class="select-sm">
          <option>10</option>
          <option>20</option>
          <option>50</option>
        </select>
        <span>por página</span>
      </div>
      <div class="pagination-right">
        <span class="pagination-info">Mostrando 1 a 10 de 128 árboles</span>
        <div class="pagination-controls">
          <button class="page-arrow">&lt;</button>
          <button class="page-num active">1</button>
          <button class="page-num">2</button>
          <button class="page-num">3</button>
          <button class="page-num">4</button>
          <button class="page-num">5</button>
          <span class="page-dots">...</span>
          <button class="page-num">13</button>
          <button class="page-arrow">&gt;</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
// import apiClient from '../api/client';

const loading = ref(false);
const error = ref('');

// Datos simulados
const arboles = ref([
  { id: 'ARB-0234', especie_comun: 'Mezquite', especie_cientifica: 'Prosopis laevigata', ubicacion: 'Área Verde 3', coordenadas: '20.010284, -99.345047', nivelTexto: '7.5', nivelNum: 7.5, estadoInfestacion: 'Severo', estado: 'Validado', fechaReporte: '06/07/2026', horaReporte: '11:11 a.m.' },
  { id: 'ARB-0198', especie_comun: 'Huizache', especie_cientifica: 'Vachellia farnesiana', ubicacion: 'Área Verde 2', coordenadas: '20.011245, -99.342678', nivelTexto: '3.5', nivelNum: 3.5, estadoInfestacion: 'Ligera', estado: 'Rechazado', fechaReporte: '05/07/2026', horaReporte: '04:30 p.m.' },
  { id: 'ARB-0156', especie_comun: 'Pirúl', especie_cientifica: 'Schinus molle', ubicacion: 'Área Verde 1', coordenadas: '20.009856, -99.340125', nivelTexto: '0.0', nivelNum: 0, estadoInfestacion: 'No visible', estado: 'En revisión', fechaReporte: '06/07/2026', horaReporte: '09:15 a.m.' },
  { id: 'ARB-0123', especie_comun: 'Casuarina', especie_cientifica: 'Casuarina equisetifolia', ubicacion: 'Área Verde 2', coordenadas: '20.011876, -99.341890', nivelTexto: '1.0', nivelNum: 1.0, estadoInfestacion: 'Moderado', estado: 'Validado', fechaReporte: '04/07/2026', horaReporte: '03:20 p.m.' },
  { id: 'ARB-0099', especie_comun: 'Eucalipto', especie_cientifica: 'Eucalyptus spp.', ubicacion: 'Área Verde 3', coordenadas: '20.010945, -99.344567', nivelTexto: '3.5', nivelNum: 3.5, estadoInfestacion: 'Ligera', estado: 'Validado', fechaReporte: '03/07/2026', horaReporte: '10:45 a.m.' },
  { id: 'ARB-0088', especie_comun: 'Lluvia de oro', especie_cientifica: 'Cassia fistula', ubicacion: 'Jardín Central', coordenadas: '20.010123, -99.345890', nivelTexto: 'En revisión', nivelNum: null, estadoInfestacion: '--', estado: 'Pendiente', fechaReporte: 'En revisión', horaReporte: '' },
  { id: 'ARB-0077', especie_comun: 'Laurel de la india', especie_cientifica: 'Ficus microcarpa', ubicacion: 'Estacionamiento', coordenadas: '20.009654, -99.346789', nivelTexto: '0.0', nivelNum: 0, estadoInfestacion: 'No visible', estado: 'Validado', fechaReporte: '02/07/2026', horaReporte: '02:15 p.m.' },
  { id: 'ARB-0065', especie_comun: 'Neem', especie_cientifica: 'Azadirachta indica', ubicacion: 'Área Verde 1', coordenadas: '20.009234, -99.341234', nivelTexto: '2.5', nivelNum: 2.5, estadoInfestacion: 'Moderado', estado: 'En revisión', fechaReporte: '01/07/2026', horaReporte: '11:30 a.m.' }
]);

// Helper Functions
const getSeverityColorClass = (nivel, texto) => {
  if (texto === 'En revisión' || nivel === null) return 'text-blue';
  if (nivel >= 7.5) return 'text-red';
  if (nivel > 0) return 'text-orange';
  return 'text-green';
};

const getSeverityBgClass = (nivel, texto) => {
  if (texto === 'En revisión' || nivel === null) return 'bg-blue';
  if (nivel >= 7.5) return 'bg-red';
  if (nivel > 0) return 'bg-orange';
  return 'bg-green';
};

const getInfestationBadgeClass = (nivel, texto) => {
  if (texto === '--') return 'badge-outline-blue';
  if (nivel >= 7.5) return 'badge-light-red';
  if (nivel > 0) return 'badge-light-orange';
  return 'badge-light-green';
};

const getStatusBadgeClass = (estado) => {
  if (estado === 'Validado') return 'pill-light-green text-green';
  if (estado === 'Rechazado') return 'pill-light-red text-red';
  if (estado === 'En revisión') return 'pill-light-blue text-blue';
  return 'pill-light-gray text-gray';
};

onMounted(async () => {
  /* Lógica original
  try {
    const { data } = await apiClient.get('/arboles/');
    arboles.value = data.results ?? data;
  } catch (e) {
    error.value = e?.response?.data?.detail || 'No se pudieron cargar los árboles.';
  } finally {
    loading.value = false;
  }
  */
});
</script>

<style scoped>
/*  VARIABLES Y BASE  */
.trees-wrapper {
  padding: 1.5rem;
  background-color: #f8fafc;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #334155;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* TOOLBAR Y FILTROS */
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

.btn-search {
  background-color: #15803d;
  color: white;
  border: none;
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}
.btn-search:hover { background-color: #166534; }

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
  padding: 0.6rem 2rem 0.6rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: white;
  font-size: 0.9rem;
  outline: none;
  cursor: pointer;
}

.btn-outline {
  background-color: white;
  color: #475569;
  border: 1px solid #cbd5e1;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}
.icon-sm { width: 16px; height: 16px; }

/*  RESUMEN  */
.summary-bar {
  font-size: 0.9rem;
  color: #64748b;
}
.summary-bar p { margin: 0; }

/* TABLA */
.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap;
}

.data-table th {
  text-align: left;
  padding: 1rem 1.5rem;
  color: #64748b;
  font-weight: 500;
  font-size: 0.85rem;
  border-bottom: 1px solid #e2e8f0;
}

.data-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.data-table tr:last-child td {
  border-bottom: none;
}

/* Celdas  */
.id-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.severity-icon {
  width: 24px;
  height: 24px;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-left: 0.25rem;
}

.double-text {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.primary-text {
  font-weight: 500;
  color: #1e293b;
  font-size: 0.9rem;
}
.secondary-text {
  color: #94a3b8;
  font-size: 0.8rem;
}

.infestation-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}

.actions-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.btn-icon {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.4rem;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-icon:hover {
  background: #f8fafc;
  color: #334155;
}
.btn-icon svg {
  width: 16px;
  height: 16px;
}

/* BADGES Y COLORES */
.font-semibold { font-weight: 600; color: #334155; }
.text-center { text-align: center !important; }

/* Textos de los iconos */
.text-red { color: #ef4444; }
.text-orange { color: #f59e0b; }
.text-green { color: #10b981; }
.text-blue { color: #3b82f6; }
.text-gray { color: #64748b; }

/*  fondos para los Puntos */
.bg-red { background-color: #ef4444; }
.bg-orange { background-color: #f59e0b; }
.bg-green { background-color: #10b981; }
.bg-blue { background-color: #3b82f6; }

/*  Infestación */
.infestation-badge {
  padding: 0.15rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-block;
}
.badge-light-red { background-color: #fee2e2; color: #ef4444; }
.badge-light-orange { background-color: #fef3c7; color: #d97706; }
.badge-light-green { background-color: #dcfce7; color: #16a34a; }
.badge-outline-blue { background-color: #eff6ff; color: #3b82f6; border: 1px solid #bfdbfe;}

/* Pills de Estado */
.status-pill {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
}
.pill-light-green { background-color: #dcfce7; }
.pill-light-red { background-color: #fee2e2; }
.pill-light-blue { background-color: #eff6ff; }
.pill-light-gray { background-color: #f1f5f9; }

/*  PAGINACIÓN  */
.pagination-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding-top: 0.5rem;
}

.per-page {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #64748b;
}
.select-sm {
  padding: 0.3rem 0.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: white;
  outline: none;
}

.pagination-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.pagination-info {
  font-size: 0.85rem;
  color: #64748b;
}

.pagination-controls {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}
.page-num, .page-arrow {
  background: transparent;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  color: #475569;
  font-size: 0.9rem;
  cursor: pointer;
}
.page-num.active {
  background: #dcfce7;
  color: #15803d;
  font-weight: 600;
}
.page-num:hover:not(.active), .page-arrow:hover {
  background: #f1f5f9;
}
.page-dots {
  color: #94a3b8;
  padding: 0 0.2rem;
}

/* Mensajes de estado */
.state-msg { padding: 2rem; text-align: center; color: #64748b; }
.error-msg { color: #ef4444; }
</style>