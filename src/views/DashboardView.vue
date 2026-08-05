<template>
  <section class="dashboard-wrapper">
    <!-- Estado de Carga / Error -->
    <div v-if="loading" class="loading-state">Cargando dashboard...</div>
    <div v-else-if="error" class="error-state">{{ error }}</div>

    <!--CONTENIDO DEL DASHBOARD DESKTOP LAYOUT-->
    <div v-else class="dashboard-content">

      <!--Resumen y Gráfica de Líneas -->
      <div class="dashboard-row">
        <!-- Resumen General -->
        <div class="panel flex-6">
          <div class="panel-header">
            <h3>Resumen general <span class="subtitle">(Esta semana)</span></h3>
          </div>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon bg-green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22v-8"/><path d="M12 14A6 6 0 1 0 6 8c0 3.31 2.69 6 6 6z"/></svg>
              </div>
              <p class="stat-label">Árboles-reportes registrados</p>
              <h4 class="stat-value">{{ resumen.arbolesRegistrados || 128 }}</h4>
              <p class="stat-trend text-green">↑ 18 vs semana anterior</p>
            </div>
            <div class="stat-card">
              <div class="stat-icon bg-red">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <p class="stat-label">Niveles severos (7.5)</p>
              <h4 class="stat-value">{{ resumen.nivelesSeveros || 18 }}</h4>
              <p class="stat-trend text-red">↑ 5 vs semana anterior</p>
            </div>
            <div class="stat-card">
              <div class="stat-icon bg-purple">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              </div>
              <p class="stat-label">Kg recolectados</p>
              <h4 class="stat-value">{{ resumen.kgRecolectados || '256.8' }} kg</h4>
              <p class="stat-trend text-green">↑ 42.3 kg vs semana anterior</p>
            </div>
            <div class="stat-card">
              <div class="stat-icon bg-orange">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <p class="stat-label">Estudiantes activos</p>
              <h4 class="stat-value">{{ resumen.estudiantesActivos || 42 }}</h4>
              <p class="stat-trend text-green">↑ 6 vs semana anterior</p>
            </div>
          </div>
        </div>

        <!-- Evoluciom de reportes -->
        <div class="panel flex-4">
          <div class="panel-header space-between">
            <h3>Evolución de reportes</h3>
            <select class="custom-select">
              <option>Últimas 4 semanas</option>
            </select>
          </div>>
          <div class="chart-container line-chart-placeholder">
            <p class="placeholder-text">[ Espacio para Gráfica de Líneas ]</p>
          </div>
        </div>
      </div>

      <!-- infestación y Top Especies -->
      <div class="dashboard-row">
        <!-- Niveles de infestación -->
        <div class="panel flex-5">
          <div class="panel-header">
            <h3>Árboles por nivel de infestación <span class="subtitle">(Hawksworth)</span></h3>
          </div>
          <div class="infestation-content">
            <div class="donut-chart">
              <div class="donut-hole">
                <span class="donut-label">Total</span>
                <span class="donut-value">128</span>
              </div>
            </div>
            <div class="infestation-legend">
              <ul>
                <li><span class="dot color-green"></span> 0 - No visible <strong>45</strong> <small>(35.2%)</small></li>
                <li><span class="dot color-yellow"></span> 3.5 - Ligera <strong>48</strong> <small>(37.5%)</small></li>
                <li><span class="dot color-red"></span> 7.5 - Severa <strong>35</strong> <small>(27.3%)</small></li>
                <li><span class="dot color-purple"></span> En revisión <strong>20</strong> <small>(15.6%)</small></li>
              </ul>
            </div>
            <div class="infestation-index">
              <h4>Índice de afectación</h4>
              <h2 class="text-green">42%</h2>
              <span class="badge bg-light-yellow text-yellow">● Nivel moderado</span>
              <p>Basado en el promedio ponderado de infestación</p>
            </div>
          </div>
        </div>

        <!-- Top Especies -->
        <div class="panel flex-5">
          <div class="panel-header">
            <h3>Especies más afectadas <span class="subtitle">(Top 5)</span></h3>
          </div>
          <table class="data-table">
            <thead>
            <tr>
              <th>Especie</th>
              <th>Árboles</th>
              <th>% Severos</th>
              <th>Tendencia</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(item, index) in topEspecies" :key="index">
              <td class="species-cell">
                <svg class="leaf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/></svg>
                {{ item.nombre }}
              </td>
              <td>{{ item.arboles }}</td>
              <td>{{ item.severos }}%</td>
              <td>
                  <span :class="['trend-badge', item.tendencia > 0 ? 'bg-light-red text-red' : 'bg-light-green text-green']">
                    {{ item.tendencia > 0 ? '↑' : '↓' }} {{ Math.abs(item.tendencia) }}%
                  </span>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mapa de Calor y Reportes  -->
      <div class="dashboard-row">
        <!-- mapa de calor -->
        <div class="panel flex-4 map-panel">
          <div class="panel-header">
            <h3>Mapa de calor de infestación</h3>
          </div>
          <div class="map-placeholder">
            <button class="btn-expand">Ver mapa completo ↗</button>
          </div>
        </div>

        <!--eportes recientes -->
        <div class="panel flex-6">
          <div class="panel-header">
            <h3>Reportes recientes</h3>
          </div>
          <table class="data-table">
            <thead>
            <tr>
              <th>ID</th>
              <th>Especie</th>
              <th>Nivel</th>
              <th>Ubicación</th>
              <th>Fecha</th>
              <th>Estado</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="reporte in reportesRecientes" :key="reporte.id">
              <td>{{ reporte.id }}</td>
              <td>{{ reporte.especie }}</td>
              <td>
                <span :class="getLevelColor(reporte.nivelNum)">{{ reporte.nivel }}</span>
              </td>
              <td>{{ reporte.ubicacion }}</td>
              <td>{{ reporte.fecha }}</td>
              <td>
                <span :class="['status-pill', getStatusClass(reporte.estado)]">{{ reporte.estado }}</span>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Footer -->
      <div class="dashboard-footer">
        <div class="footer-left">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <span>Los datos se actualizan automáticamente cada 10 minutos.</span>
        </div>
        <div class="footer-right">
          <span>Última actualización: 06/07/2026 11:11 a.m.</span>
          <button class="btn-refresh"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg></button>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
// import apiClient from '../api/client'; //

const resumen = ref({});
const loading = ref(false); //
const error = ref('');

// Datos Mockup (Reemplazar con llamada API)
const topEspecies = ref([
  { nombre: 'Mezquite (Prosopis laevigata)', arboles: 38, severos: 52.6, tendencia: 12 },
  { nombre: 'Huizache (Vachellia farnesiana)', arboles: 28, severos: 46.4, tendencia: 8 },
  { nombre: 'Pirúl (Schinus molle)', arboles: 22, severos: 27.3, tendencia: -5 },
  { nombre: 'Casuarina (Casuarina equisetifolia)', arboles: 16, severos: 18.8, tendencia: -3 },
  { nombre: 'Eucalipto (Eucalyptus spp.)', arboles: 12, severos: 10.0, tendencia: -2 },
]);

const reportesRecientes = ref([
  { id: 'ARB-0234', especie: 'Mezquite', nivel: '7.5 (Severo)', nivelNum: 7.5, ubicacion: 'Área Verde 3', fecha: '06/07/2026 11:11 a.m.', estado: 'Validado' },
  { id: 'ARB-0233', especie: 'Huizache', nivel: '3.5 (Ligera)', nivelNum: 3.5, ubicacion: 'Área Verde 2', fecha: '06/07/2026 10:45 a.m.', estado: 'En revisión' },
  { id: 'ARB-0232', especie: 'Pirúl', nivel: '0.0 (No visible)', nivelNum: 0, ubicacion: 'Área Verde 1', fecha: '06/07/2026 09:30 a.m.', estado: 'Pendiente' },
  { id: 'ARB-0231', especie: 'Mezquite', nivel: '7.5 (Severo)', nivelNum: 7.5, ubicacion: 'Área Verde 3', fecha: '05/07/2026 04:20 p.m.', estado: 'Validado' },
  { id: 'ARB-0230', especie: 'Casuarina', nivel: '3.5 (Ligera)', nivelNum: 3.5, ubicacion: 'Área Verde 2', fecha: '05/07/2026 03:15 p.m.', estado: 'En revisión' },
]);

const getLevelColor = (nivel) => {
  if (nivel >= 7.5) return 'text-red font-semibold';
  if (nivel >= 3.5) return 'text-yellow font-semibold';
  return 'text-green font-semibold';
};

const getStatusClass = (estado) => {
  if (estado === 'Validado') return 'status-validado';
  if (estado === 'En revisión') return 'status-revision';
  return 'status-pendiente';
};

onMounted(async () => {
  /*
  try {
    const { data } = await apiClient.get('/dashboard/resumen/');
    resumen.value = data;
  } catch (e) {
    error.value = e?.response?.data?.detail || 'No se pudo cargar el dashboard.';
  } finally {
    loading.value = false;
  }
  */
});
</script>

<style scoped>
/* VARIABLES Y BASE*/
.dashboard-wrapper {
  padding: 1.5rem;
  background-color: #f8fafc;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #334155;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.dashboard-row {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

/* Sistema de columnas Flexbox ) */
.flex-4 { flex: 4 1 350px; }
.flex-5 { flex: 5 1 450px; }
.flex-6 { flex: 6 1 500px; }

/*PANELES*/
.panel {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}

.panel-header {
  margin-bottom: 1.25rem;
}
.panel-header.space-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.panel-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
}
.subtitle {
  font-weight: 400;
  color: #94a3b8;
  font-size: 0.9rem;
}

/* gRID DE TARJETAS SUPERIORES */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 10px;
  padding: 1.25rem;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}
.stat-icon svg { width: 20px; height: 20px; color: white; }

.stat-label { margin: 0; font-size: 0.85rem; color: #64748b; font-weight: 500;}
.stat-value { margin: 0; font-size: 1.75rem; font-weight: 700; color: #0f172a;}
.stat-trend { margin: 0; font-size: 0.8rem; font-weight: 500;}

/* GRÁFICA DONA E iNDICE */
.infestation-content {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

/*Gráfica de Dona CSS */
.donut-chart {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: conic-gradient(
      #ef4444 0% 27%,
      #f59e0b 27% 64%,
      #10b981 64% 84%,
      #8b5cf6 84% 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
}
.donut-hole {
  width: 100px;
  height: 100px;
  background: white;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.donut-label { font-size: 0.8rem; color: #64748b; }
.donut-value { font-size: 1.2rem; font-weight: bold; color: #1e293b; }

.infestation-legend ul {
  list-style: none;
  padding: 0; margin: 0;
}
.infestation-legend li {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.infestation-legend small { color: #94a3b8; margin-left: auto; }
.dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }

.infestation-index {
  background: #f8fafc;
  padding: 1.25rem;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  text-align: center;
  flex: 1;
  min-width: 150px;
}
.infestation-index h4 { margin: 0 0 0.5rem 0; font-size: 0.9rem; color: #64748b; }
.infestation-index h2 { margin: 0 0 0.5rem 0; font-size: 2.5rem; font-weight: bold; }
.infestation-index p { margin: 0.75rem 0 0 0; font-size: 0.75rem; color: #94a3b8; }
.badge { font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: 600;}

/* TABLAS  */
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
.data-table th {
  text-align: left;
  padding: 0.75rem 0;
  color: #94a3b8;
  font-weight: 500;
  border-bottom: 1px solid #e2e8f0;
}
.data-table td {
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}
.data-table tr:last-child td { border-bottom: none; }
.species-cell { display: flex; align-items: center; gap: 0.5rem; font-weight: 500;}
.leaf-icon { width: 16px; height: 16px; color: #10b981; }

.trend-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}
.status-pill {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
}
.status-validado { background: #dcfce7; color: #15803d; }
.status-revision { background: #e0f2fe; color: #0369a1; }
.status-pendiente { background: #f1f5f9; color: #475569; }

/* PLACEHOLDERS (Gráfica y Mapa)  */
.chart-container {
  height: 250px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px dashed #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.placeholder-text { color: #94a3b8; }

.map-panel {
  display: flex;
  flex-direction: column;
}
.map-placeholder {
  flex: 1;
  min-height: 250px;
  background: url('https://www.transparenttextures.com/patterns/cubes.png'), #1e293b;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}
.btn-expand {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* FOOTER  */
.dashboard-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
  font-size: 0.85rem;
  color: #64748b;
  flex-wrap: wrap;
  gap: 1rem;
}
.footer-left, .footer-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.footer-left svg { width: 16px; height: 16px; }
.btn-refresh {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 0.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-refresh svg { width: 16px; height: 16px; color: #475569; }

/* UTILIDADES DE COLOR */
.bg-green { background-color: #10b981; }
.bg-red { background-color: #ef4444; }
.bg-purple { background-color: #8b5cf6; }
.bg-orange { background-color: #f59e0b; }
.bg-light-red { background-color: #fee2e2; }
.bg-light-green { background-color: #dcfce7; }
.bg-light-yellow { background-color: #fef3c7; }

.text-green { color: #10b981; }
.text-red { color: #ef4444; }
.text-yellow { color: #f59e0b; }
.color-green { background-color: #10b981; }
.color-yellow { background-color: #f59e0b; }
.color-red { background-color: #ef4444; }
.color-purple { background-color: #8b5cf6; }

.custom-select {
  padding: 0.4rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #475569;
  font-size: 0.85rem;
  outline: none;
}
.font-semibold { font-weight: 600; }
</style>