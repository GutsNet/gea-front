<template>
  <section class="reports-wrapper">

    <!-- Barra superior de acciones y filtros -->
    <div class="toolbar">
      <div class="toolbar-top">
        <button class="btn-primary">
          <svg viewBox="0 0 24 24" class="icon-sm" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nuevo reporte
        </button>
      </div>

      <div class="filters-bar">
        <div class="search-box">
          <svg viewBox="0 0 24 24" class="icon-search" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Buscar reporte" />
        </div>

        <div class="filter-group">
          <div class="select-wrapper">
            <label>Filtrar por especie</label>
            <select><option>Todas</option></select>
          </div>
          <div class="select-wrapper">
            <label>Nivel de Infestación</label>
            <select><option>Todos</option></select>
          </div>
          <div class="select-wrapper">
            <label>Estado</label>
            <select><option>Todos</option></select>
          </div>
          <button class="btn-outline">Limpiar filtros</button>
        </div>
      </div>
    </div>

    <!-- Estados de carga y error -->
    <div v-if="loading" class="state-msg">Cargando reportes...</div>
    <div v-else-if="error" class="state-msg error-msg">{{ error }}</div>

    <!-- Lista de Reportes -->
    <div v-else class="reports-list">
      <div
          v-for="item in reportes"
          :key="item.id"
          class="report-card"
          :class="getCardBorderClass(item.estado)"
      >

        <div class="card-icon" :class="getIconColorClass(item.estado)">
          <svg v-if="item.estado === 'Severo'" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          <svg v-else-if="item.estado === 'Pendiente'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><circle cx="12" cy="12" r="8"/></svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
        </div>

        <!-- Contenido principal  -->
        <div class="card-grid">
          <!-- Info Principal -->
          <div class="grid-col">
            <h3 class="tree-name">{{ item.nombre }}</h3>
            <p class="text-sm text-gray">ID: {{ item.id }}</p>
            <span class="status-badge" :class="getBadgeClass(item.estado)">{{ item.estado }}</span>
          </div>

          <!--  Especie y Ubicación -->
          <div class="grid-col">
            <div class="data-group">
              <label>Especie</label>
              <p class="font-medium">{{ item.especie }}</p>
            </div>
            <div class="data-group">
              <label>Ubicación</label>
              <p>{{ item.ubicacion }}</p>
            </div>
          </div>

          <!-- nfestación y Fecha -->
          <div class="grid-col">
            <div class="data-group">
              <label>Nivel de infestación</label>
              <p :class="getLevelTextClass(item.nivelNum)" class="font-medium">{{ item.nivel_infestacion }}</p>
            </div>
            <div class="data-group">
              <label>Fecha del reporte</label>
              <p>{{ item.fecha }}</p>
            </div>
          </div>

          <!-- Reportador y Coordenadas -->
          <div class="grid-col">
            <div class="data-group">
              <label>Reportado por</label>
              <p class="font-medium">{{ item.reportado_por }}</p>
            </div>
            <div class="data-group">
              <label>Coordenadas</label>
              <p>{{ item.coordenadas }}</p>
            </div>
          </div>
        </div>

        <div class="card-actions">
          <button class="btn-action-primary">Ver detalles</button>
          <button class="btn-action-secondary" :class="getActionBadgeClass(item.action_status)">
            {{ item.action_status }}
          </button>
        </div>
      </div>
    </div>

    <!-- Paginación -->
    <div class="pagination-footer">
      <span class="pagination-info">Mostrando 1 a 3 de 24 reportes</span>
      <div class="pagination-controls">
        <button class="page-arrow">&lt;</button>
        <button class="page-num active">1</button>
        <button class="page-num">2</button>
        <button class="page-num">3</button>
        <button class="page-num">4</button>
        <button class="page-num">5</button>
        <button class="page-arrow">&gt;</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
// import apiClient from '../api/client'; //

const loading = ref(false);//
const error = ref('');

// Datos simulados
const reportes = ref([
  {
    id: 'ARB-0156',
    nombre: 'Pirúl',
    especie: 'Schinus molle',
    estado: 'Pendiente',
    nivel_infestacion: '0.0 (No visible)',
    nivelNum: 0,
    reportado_por: 'Ana Martínez',
    ubicacion: 'UTTT - Área Verde 1',
    fecha: '06/07/2026 09:15 a.m.',
    coordenadas: '20.009856, -99.340125',
    action_status: 'En revisión'
  },
  {
    id: 'ARB-0198',
    nombre: 'Huizache',
    especie: 'Vachellia farnesiana',
    estado: 'Rechazado',
    nivel_infestacion: '3.5 (Ligera)',
    nivelNum: 3.5,
    reportado_por: 'Luis Ramírez',
    ubicacion: 'UTTT - Área Verde 2',
    fecha: '05/07/2026 04:30 p.m.',
    coordenadas: '20.011245, -99.342678',
    action_status: 'Rechazado'
  },
  {
    id: 'ARB-0234',
    nombre: 'Mezquite (Prosopus laevigata)',
    especie: 'Prosopis laevigata',
    estado: 'Severo',
    nivel_infestacion: '7.5 (Severo)',
    nivelNum: 7.5,
    reportado_por: 'Ana Martínez',
    ubicacion: 'UTTT - Área Verde 3',
    fecha: '06/07/2026 11:11 a.m.',
    coordenadas: '20.010284, -99.345047',
    action_status: 'Validado'
  }
]);

// Helper Functions para clases dinámicas
const getCardBorderClass = (estado) => {
  if (estado === 'Pendiente') return 'border-blue';
  if (estado === 'Severo') return 'border-red';
  return 'border-gray';
};

const getIconColorClass = (estado) => {
  if (estado === 'Pendiente') return 'text-blue';
  if (estado === 'Severo') return 'text-red';
  return 'text-gray';
};

const getBadgeClass = (estado) => {
  if (estado === 'Pendiente') return 'bg-light-blue text-blue';
  if (estado === 'Severo') return 'bg-light-red text-red';
  return 'bg-light-gray text-gray-dark';
};

const getLevelTextClass = (nivel) => {
  if (nivel >= 7.5) return 'text-red';
  if (nivel >= 3.5) return 'text-yellow';
  return 'text-green';
};

const getActionBadgeClass = (status) => {
  if (status === 'En revisión') return 'bg-light-blue text-blue';
  if (status === 'Rechazado') return 'bg-light-red text-red';
  if (status === 'Validado') return 'bg-light-green text-green';
  return 'bg-light-gray text-gray-dark';
};

onMounted(async () => {
  /* Lógica original
  try {
    const { data } = await apiClient.get('/reportes/');
    reportes.value = data.results ?? data;
  } catch (e) {
    error.value = e?.response?.data?.detail || 'No se pudieron cargar los reportes.';
  } finally {
    loading.value = false;
  }
  */
});
</script>

<style scoped>
/*VARIABLES Y BASE  */
.reports-wrapper {
  padding: 1.5rem;
  background-color: #f8fafc;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #334155;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* TOOLBAR Y FILTROS */
.toolbar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.toolbar-top {
  display: flex;
  justify-content: flex-end;
}

.filters-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 250px;
  max-width: 400px;
}
.search-box input {
  width: 100%;
  padding: 0.6rem 1rem 0.6rem 2.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
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

.filter-group {
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

/*BOTONES*/
.btn-primary {
  background-color: #15803d;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}
.btn-primary:hover { background-color: #166534; }
.icon-sm { width: 18px; height: 18px; }

.btn-outline {
  background-color: white;
  color: #334155;
  border: 1px solid #cbd5e1;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
}

/*  LISTA DE TARJETAS  */
.reports-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.report-card {
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1.5px solid transparent; /* default */
  gap: 1.5rem;
  align-items: center;
}


.border-blue { border-color: #3b82f6; }
.border-red { border-color: #ef4444; }
.border-gray { border-color: #cbd5e1; }

.card-icon {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 24px;
}
.card-icon svg { width: 24px; height: 24px; }

.card-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr 1.2fr;
  flex: 1;
  gap: 1rem;
}

.grid-col {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tree-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
}

.data-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.data-group label {
  font-size: 0.75rem;
  color: #94a3b8;
}
.data-group p {
  margin: 0;
  font-size: 0.85rem;
  color: #334155;
}

.card-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 120px;
}

.btn-action-primary {
  background-color: #15803d;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
}
.btn-action-secondary {
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: default;
  width: 100%;
}

/* BADGES Y COLORES  */
.status-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  width: fit-content;
  margin-top: 0.25rem;
}

.bg-light-blue { background-color: #eff6ff; }
.bg-light-red { background-color: #fef2f2; }
.bg-light-gray { background-color: #f1f5f9; }
.bg-light-green { background-color: #f0fdf4; }

.text-blue { color: #2563eb; }
.text-red { color: #ef4444; }
.text-gray-dark { color: #64748b; }
.text-gray { color: #94a3b8; }
.text-yellow { color: #d97706; }
.text-green { color: #16a34a; }

.text-sm { font-size: 0.8rem; }
.font-medium { font-weight: 500; }

/* PAGINACIÓN */
.pagination-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.pagination-info {
  font-size: 0.85rem;
  color: #64748b;
}

.pagination-controls {
  display: flex;
  gap: 0.25rem;
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


.state-msg { padding: 2rem; text-align: center; color: #64748b; }
.error-msg { color: #ef4444; }

@media (max-width: 1024px) {
  .card-grid {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 768px) {
  .report-card {
    flex-direction: column;
    align-items: flex-start;
  }
  .card-grid {
    grid-template-columns: 1fr;
    width: 100%;
  }
  .card-actions {
    width: 100%;
    flex-direction: row;
  }
}
</style>