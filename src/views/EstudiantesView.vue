<template>
  <section class="students-wrapper">

    <!-- Tarjetas de Estadísticas Top -->
    <div class="stats-grid">
      <!--  Estudiantes activos -->
      <div class="stat-card border-green">
        <div class="stat-icon-wrapper bg-light-green">
          <svg viewBox="0 0 24 24" class="icon-stat text-green" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">Estudiantes activos</p>
          <h3 class="stat-value">42</h3>
          <p class="stat-trend text-green">+ 6 vs mes anterior ↗</p>
        </div>yar
      </div>

      <!-- Kgs recolectados -->
      <div class="stat-card border-purple">
        <div class="stat-icon-wrapper bg-light-purple">
          <svg viewBox="0 0 24 24" class="icon-stat text-purple" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">Kgs recolectados</p>
          <h3 class="stat-value">256.8 kg</h3>
          <p class="stat-trend text-green">+ 32.5 kg vs mes anterior ↗</p>
        </div>
      </div>

      <!-- Grupos -->
      <div class="stat-card border-blue">
        <div class="stat-icon-wrapper bg-light-blue">
          <svg viewBox="0 0 24 24" class="icon-stat text-blue" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">Grupos</p>
          <h3 class="stat-value">18</h3>
          <p class="stat-trend text-green">+ 2 vs mes anterior ↗</p>
        </div>
      </div>
    </div>

    <!-- Barra de Búsqueda y Filtros -->
    <div class="toolbar">
      <div class="search-group">
        <div class="search-box">
          <svg viewBox="0 0 24 24" class="icon-search" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Buscar estudiante por nombre, matrícula o grupo..." />
        </div>
        <button class="btn-search">
          <svg viewBox="0 0 24 24" class="icon-sm" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          Buscar
        </button>
      </div>

      <div class="filters-group">
        <div class="select-wrapper">
          <label>Grupo</label>
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

    <!-- Barra secundaria: Totales y Nuevo Estudiante -->
    <div class="action-bar">
      <p class="summary-text">Total: 42 estudiantes</p>
      <button class="btn-primary">
        + Nuevo estudiante
      </button>
    </div>

    <!-- Estados de carga y error -->
    <div v-if="loading" class="state-msg">Cargando estudiantes...</div>
    <div v-else-if="error" class="state-msg error-msg">{{ error }}</div>

    <!-- Tabla Principal -->
    <div v-else class="table-container">
      <table class="data-table">
        <thead>
        <tr>
          <th>Estudiante</th>
          <th>Matrícula</th>
          <th>Grupo</th>
          <th class="text-right">Kgs recolectados</th>
          <th class="text-center">Estado</th>
          <th>Última actividad</th>
          <th class="text-center">Acciones</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="estudiante in estudiantes" :key="estudiante.matricula">
          <!-- Estudiante -->
          <td>
            <div class="double-text">
              <span class="primary-text font-medium">{{ estudiante.nombre }}</span>
              <span class="secondary-text">{{ estudiante.correo }}</span>
            </div>
          </td>

          <!-- Matrícula -->
          <td class="text-gray">{{ estudiante.matricula }}</td>

          <!-- Grupo -->
          <td>
              <span class="primary-text" :class="{'multiline': estudiante.grupo.length > 25}">
                {{ estudiante.grupo }}
              </span>
          </td>

          <!-- Kgs recolectados -->
          <td class="text-right text-gray">{{ estudiante.kgs.toFixed(1) }} kg</td>

          <!-- Estado -->
          <td class="text-center">
              <span class="status-pill" :class="getStatusBadgeClass(estudiante.estado)">
                {{ estudiante.estado }}
              </span>
          </td>

          <!-- ultima actividad -->
          <td>
            <div class="double-text">
              <span class="primary-text">{{ estudiante.fechaActividad }}</span>
              <span class="secondary-text">{{ estudiante.horaActividad }}</span>
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
        <span class="pagination-info">Mostrando 1 a 10 de 42 estudiantes</span>
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
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
// import apiClient from '../api/client';

const loading = ref(false);
const error = ref('');

// Datos simulados
const estudiantes = ref([
  { nombre: 'Ana Martínez', correo: 'ana.martinez@uttt.edu.mx', matricula: '202210123', grupo: 'Ingeniería Ambiental', kgs: 48.5, estado: 'Activo', fechaActividad: '06/07/2026', horaActividad: '11:11 a.m.' },
  { nombre: 'Luis Ramírez', correo: 'luis.ramirez@uttt.edu.mx', matricula: '202210456', grupo: 'Ingeniería Ambiental', kgs: 36.0, estado: 'Activo', fechaActividad: '05/07/2026', horaActividad: '04:30 p.m.' },
  { nombre: 'María González', correo: 'maria.gonzalez@uttt.edu.mx', matricula: '202210789', grupo: 'Biotecnología', kgs: 28.0, estado: 'Activo', fechaActividad: '06/07/2026', horaActividad: '09:15 a.m.' },
  { nombre: 'Jorge Hernández', correo: 'jorge.hernandez@uttt.edu.mx', matricula: '202211012', grupo: 'Ingeniería en Sistemas Productivos', kgs: 40.0, estado: 'Activo', fechaActividad: '04/07/2026', horaActividad: '03:20 p.m.' },
  { nombre: 'Fernanda López', correo: 'fernanda.lopez@uttt.edu.mx', matricula: '202211234', grupo: 'Ingeniería Ambiental', kgs: 24.5, estado: 'Activo', fechaActividad: '03/07/2026', horaActividad: '10:45 a.m.' },
  { nombre: 'Carlos Pérez', correo: 'carlos.perez@uttt.edu.mx', matricula: '202211567', grupo: 'Biotecnología', kgs: 32.0, estado: 'Inactivo', fechaActividad: '28/06/2026', horaActividad: '09:30 a.m.' },
  { nombre: 'Sofía Torres', correo: 'sofia.torres@uttt.edu.mx', matricula: '202211890', grupo: 'Ingeniería Ambiental', kgs: 16.0, estado: 'En pausa', fechaActividad: '02/07/2026', horaActividad: '02:15 p.m.' },
]);

// Helper Functions
const getStatusBadgeClass = (estado) => {
  if (estado === 'Activo') return 'pill-light-green text-green';
  if (estado === 'Inactivo') return 'pill-light-red text-red';
  if (estado === 'En pausa') return 'pill-light-orange text-orange';
  return 'pill-light-gray text-gray';
};

onMounted(async () => {
  /* Lógica original
  try {
    const { data } = await apiClient.get('/estudiantes/');
    estudiantes.value = data.results ?? data;
  } catch (e) {
    error.value = e?.response?.data?.detail || 'No se pudieron cargar los estudiantes.';
  } finally {
    loading.value = false;
  }
  */
});
</script>

<style scoped>

.students-wrapper {
  padding: 1.5rem;
  background-color: #f8fafc;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #334155;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 0.5rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  border: 1px solid #f1f5f9;
}
.border-green { border-left: 4px solid #10b981; }
.border-purple { border-left: 4px solid #8b5cf6; }
.border-blue { border-left: 4px solid #3b82f6; }

.stat-icon-wrapper {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-stat { width: 24px; height: 24px; }

.stat-content {
  display: flex;
  flex-direction: column;
}
.stat-label { margin: 0; font-size: 0.85rem; color: #64748b; font-weight: 500;}
.stat-value { margin: 0.2rem 0; font-size: 1.6rem; font-weight: 700; color: #0f172a;}
.stat-trend { margin: 0; font-size: 0.8rem; font-weight: 500;}

.bg-light-green { background-color: #ecfdf5; }
.bg-light-purple { background-color: #f5f3ff; }
.bg-light-blue { background-color: #eff6ff; }
.text-green { color: #10b981; }
.text-purple { color: #8b5cf6; }
.text-blue { color: #3b82f6; }


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
  max-width: 600px;
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
  min-width: 150px;
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
}
.btn-primary:hover { background-color: #166534; }



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


.double-text {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.primary-text {
  font-weight: 400;
  color: #1e293b;
  font-size: 0.9rem;
}
.font-medium {
  font-weight: 500;
}
.secondary-text {
  color: #94a3b8;
  font-size: 0.8rem;
}
.multiline {
  white-space: normal;
  display: block;
  max-width: 200px;
  line-height: 1.4;
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
.btn-icon svg { width: 16px; height: 16px; }


.text-center { text-align: center !important; }
.text-right { text-align: right !important; }
.text-gray { color: #64748b; }
.text-red { color: #ef4444; }
.text-orange { color: #f59e0b; }

.status-pill {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
}
.pill-light-green { background-color: #dcfce7; }
.pill-light-red { background-color: #fee2e2; }
.pill-light-orange { background-color: #fef3c7; }
.pill-light-gray { background-color: #f1f5f9; }


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


.state-msg { padding: 2rem; text-align: center; color: #64748b; }
.error-msg { color: #ef4444; }
</style>