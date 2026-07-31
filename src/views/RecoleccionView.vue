<template>
  <section class="collections-wrapper">

    <!-- ================= TARJETAS ESTADÍSTICAS ================= -->
    <div class="stats-grid">
      <!-- Card 1: Kg totales -->
      <div class="stat-card bg-light-green-card">
        <div class="stat-icon-wrapper bg-icon-green text-green">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">Kg totales recolectados</p>
          <h3 class="stat-value">256.8 kg</h3>
          <p class="stat-trend text-green">+ 42.3 kg vs mes anterior ↗</p>
        </div>
      </div>

      <!-- Card 2: Recolecciones realizadas -->
      <div class="stat-card bg-light-blue-card">
        <div class="stat-icon-wrapper bg-icon-blue text-blue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">Recolecciones realizadas</p>
          <h3 class="stat-value">35</h3>
          <p class="stat-trend text-green">+ 5 vs mes anterior ↗</p>
        </div>
      </div>

      <!-- Card 3: Árboles procesados -->
      <div class="stat-card bg-light-purple-card">
        <div class="stat-icon-wrapper bg-icon-purple text-purple">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">Árboles procesados</p>
          <h3 class="stat-value">28</h3>
          <p class="stat-trend text-green">+ 4 vs mes anterior ↗</p>
        </div>
      </div>

      <!-- Card 4: Promedio por recolección -->
      <div class="stat-card bg-light-orange-card">
        <div class="stat-icon-wrapper bg-icon-orange text-orange">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10z"/></svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">Promedio por recolección</p>
          <h3 class="stat-value">7.3 kg</h3>
          <p class="stat-trend text-green">+ 1.2 kg vs mes anterior ↗</p>
        </div>
      </div>
    </div>

    <!-- ================= BARRA DE BÚSQUEDA Y FILTROS ================= -->
    <div class="toolbar">
      <div class="search-group">
        <div class="search-box">
          <svg viewBox="0 0 24 24" class="icon-search" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Buscar por fecha, ubicación o responsable..." />
        </div>
        <button class="btn-search">
          <svg viewBox="0 0 24 24" class="icon-sm" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          Buscar
        </button>
      </div>

      <div class="filters-group">
        <div class="input-wrapper">
          <label>Rango de fechas</label>
          <div class="date-input-container">
            <input type="text" value="01 Jun 2026 - 06 Jul 2026" readonly />
            <svg viewBox="0 0 24 24" class="icon-calendar" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
        </div>
        <div class="select-wrapper">
          <label>Ubicación</label>
          <select><option>Todas</option></select>
        </div>
        <div class="select-wrapper">
          <label>Responsable</label>
          <select><option>Todos</option></select>
        </div>
        <button class="btn-outline btn-filter">
          <svg viewBox="0 0 24 24" class="icon-sm" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          Filtros
        </button>
      </div>
    </div>

    <!-- ================= BARRA DE ACCIÓN SECUNDARIA ================= -->
    <div class="action-bar">
      <p class="summary-text">Total: 35 recolecciones</p>
      <button class="btn-primary">
        + Nueva recolección
      </button>
    </div>

    <!-- Estados de carga y error -->
    <div v-if="loading" class="state-msg">Cargando recolecciones...</div>
    <div v-else-if="error" class="state-msg error-msg">{{ error }}</div>

    <!-- ================= TABLA PRINCIPAL ================= -->
    <div v-else class="table-container">
      <table class="data-table">
        <thead>
        <tr>
          <th>Fecha y hora</th>
          <th>Ubicación</th>
          <th class="text-center">Kg recolectados</th>
          <th>Responsable</th>
          <th>Última actualización</th>
          <th class="text-center">Acciones</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, index) in recolecciones" :key="index">

          <!-- Col 1: Fecha y hora -->
          <td>
            <div class="double-text">
              <span class="primary-text">{{ item.fecha }}</span>
              <span class="secondary-text">{{ item.hora }}</span>
            </div>
          </td>

          <!-- Col 2: Ubicación -->
          <td>
            <span class="primary-text">{{ item.ubicacion }}</span>
          </td>

          <!-- Col 3: Kg recolectados -->
          <td class="text-center">
            <span class="text-green font-bold text-lg">{{ item.kg.toFixed(1) }} kg</span>
          </td>

          <!-- Col 4: Responsable -->
          <td>
            <span class="primary-text">{{ item.responsable }}</span>
          </td>

          <!-- Col 5: Última actualización -->
          <td>
            <div class="double-text">
              <span class="primary-text">{{ item.updatedFecha }}</span>
              <span class="secondary-text">{{ item.updatedHora }}</span>
            </div>
          </td>

          <!-- Col 6: Acciones -->
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

    <!-- ================= PAGINACIÓN ================= -->
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
        <span class="pagination-info">Mostrando 1 a 10 de 35 recolecciones</span>
        <div class="pagination-controls">
          <button class="page-arrow">&lt;</button>
          <button class="page-num active">1</button>
          <button class="page-num">2</button>
          <button class="page-num">3</button>
          <button class="page-num">4</button>
          <button class="page-arrow">&gt;</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
// import apiClient from '../api/client'; // Para conexión real

const loading = ref(false);
const error = ref('');

// Datos simulados idénticos a los de la imagen
const recolecciones = ref([
  { fecha: '06/07/2026', hora: '11:11 a.m.', ubicacion: 'Área Verde 3', kg: 12.5, responsable: 'Ana Martínez', updatedFecha: '06/07/2026', updatedHora: '11:11 a.m.' },
  { fecha: '05/07/2026', hora: '04:30 p.m.', ubicacion: 'Área Verde 2', kg: 6.8, responsable: 'Luis Ramírez', updatedFecha: '05/07/2026', updatedHora: '04:30 p.m.' },
  { fecha: '05/07/2026', hora: '09:15 a.m.', ubicacion: 'Área Verde 1', kg: 4.2, responsable: 'María González', updatedFecha: '06/07/2026', updatedHora: '09:15 a.m.' },
  { fecha: '04/07/2026', hora: '03:20 p.m.', ubicacion: 'Área Verde 2', kg: 8.1, responsable: 'Jorge Hernández', updatedFecha: '04/07/2026', updatedHora: '03:20 p.m.' },
  { fecha: '03/07/2026', hora: '10:45 a.m.', ubicacion: 'Área Verde 3', kg: 15.6, responsable: 'Fernanda López', updatedFecha: '03/07/2026', updatedHora: '10:45 a.m.' },
  { fecha: '02/07/2026', hora: '02:15 p.m.', ubicacion: 'Jardín Central', kg: 3.9, responsable: 'Carlos Pérez', updatedFecha: '02/07/2026', updatedHora: '02:15 p.m.' },
  { fecha: '01/07/2026', hora: '11:30 a.m.', ubicacion: 'Área Verde 1', kg: 5.7, responsable: 'Sofía Torres', updatedFecha: '01/07/2026', updatedHora: '11:30 a.m.' },
]);

onMounted(async () => {
  /* Lógica original para la API
  try {
    const { data } = await apiClient.get('/recoleccion/');
    recolecciones.value = data.results ?? data;
  } catch (e) {
    error.value = e?.response?.data?.detail || 'No se pudieron cargar las recolecciones.';
  } finally {
    loading.value = false;
  }
  */
});
</script>

<style scoped>
/* ================= VARIABLES Y BASE ================= */
.collections-wrapper {
  padding: 1.5rem;
  background-color: #f8fafc;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #334155;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ================= TARJETAS ESTADÍSTICAS ================= */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
  margin-bottom: 0.5rem;
}

.stat-card {
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  border: 1px solid rgba(0,0,0,0.03);
}

.bg-light-green-card { background-color: #f0fdf4; }
.bg-light-blue-card { background-color: #eff6ff; }
.bg-light-purple-card { background-color: #faf5ff; }
.bg-light-orange-card { background-color: #fffbeb; }

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bg-icon-green { background-color: #dcfce7; }
.bg-icon-blue { background-color: #dbeafe; }
.bg-icon-purple { background-color: #f3e8ff; }
.bg-icon-orange { background-color: #fef3c7; }

.stat-icon-wrapper svg { width: 22px; height: 22px; }

.stat-content {
  display: flex;
  flex-direction: column;
}
.stat-label { margin: 0; font-size: 0.8rem; color: #475569; font-weight: 500;}
.stat-value { margin: 0.2rem 0; font-size: 1.5rem; font-weight: 700; color: #0f172a;}
.stat-trend { margin: 0; font-size: 0.75rem; font-weight: 500;}

/* ================= TOOLBAR Y FILTROS ================= */
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
  min-width: 350px;
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

.input-wrapper, .select-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.input-wrapper label, .select-wrapper label {
  font-size: 0.75rem;
  color: #64748b;
}

.date-input-container {
  position: relative;
}
.date-input-container input {
  padding: 0.6rem 2.5rem 0.6rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: white;
  font-size: 0.85rem;
  outline: none;
  cursor: pointer;
  width: 220px;
  color: #334155;
}
.icon-calendar {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #64748b;
  pointer-events: none;
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

/* ================= ACTION BAR SECUNDARIA ================= */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: -0.5rem;
}
.summary-text {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0;
}
.btn-primary {
  background-color: #15803d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.btn-primary:hover { background-color: #166534; }

/* ================= TABLA ================= */
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

.data-table tr:last-child td { border-bottom: none; }

.double-text {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.primary-text { font-weight: 400; color: #1e293b; font-size: 0.9rem; }
.secondary-text { color: #94a3b8; font-size: 0.8rem; }

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
.btn-icon:hover { background: #f8fafc; color: #334155; }
.btn-icon svg { width: 16px; height: 16px; }

/* Utilidades de texto y colores */
.text-center { text-align: center !important; }
.font-bold { font-weight: 600; }
.text-lg { font-size: 1rem; }
.text-green { color: #15803d; }
.text-blue { color: #2563eb; }
.text-purple { color: #7e22ce; }
.text-orange { color: #d97706; }

/* ================= PAGINACIÓN ================= */
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

/* Mensajes de estado */
.state-msg { padding: 2rem; text-align: center; color: #64748b; }
.error-msg { color: #ef4444; }
</style>