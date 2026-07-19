const { createApp, ref } = Vue;

const App = {
  setup() {
    const currentView = ref('dashboard');

    const kpis = ref([
      { label: 'Árboles', value: '128' },
      { label: 'Reportes', value: '42' },
      { label: 'Kg recolectados', value: '780' },
      { label: 'Solicitudes', value: '9' },
    ]);

    const trees = ref([
      { etiqueta: 'ARB-001', especie: 'Pino', area: 'Zona A', nivel: '3.5', estado: 'Infestado' },
      { etiqueta: 'ARB-002', especie: 'Encino', area: 'Zona B', nivel: '1.2', estado: 'Sano' },
      { etiqueta: 'ARB-003', especie: 'Roble', area: 'Zona C', nivel: '7.5', estado: 'Crítico' },
    ]);

    const reports = ref([
      { id: 'RPT-001', estado: 'Validado', tree: 'ARB-001', fecha: '2026-07-15' },
      { id: 'RPT-002', estado: 'Pendiente', tree: 'ARB-002', fecha: '2026-07-14' },
      { id: 'RPT-003', estado: 'Rechazado', tree: 'ARB-003', fecha: '2026-07-13' },
    ]);

    const students = ref([
      { matricula: 'EST-001', nombre: 'Ana López', grupo: '9A-ISC', estado: 'Activo' },
      { matricula: 'EST-002', nombre: 'Luis Ortiz', grupo: '9A-ISC', estado: 'Activo' },
      { matricula: 'EST-003', nombre: 'María Pérez', grupo: '9B-ISC', estado: 'Inactivo' },
    ]);

    const users = ref([
      { usuario: 'root', rol: 'Sysadmin', ultimoAcceso: 'Hoy' },
      { usuario: 'admin1', rol: 'Coordinador', ultimoAcceso: 'Ayer' },
      { usuario: 'est-001', rol: 'Estudiante', ultimoAcceso: 'Hace 2h' },
    ]);

    const collections = ref([
      { fecha: '2026-07-15', kg: '120', responsable: 'Ana López' },
      { fecha: '2026-07-14', kg: '95', responsable: 'Luis Ortiz' },
      { fecha: '2026-07-13', kg: '160', responsable: 'María Pérez' },
    ]);

    const views = [
      'login',
      'dashboard',
      'mapa',
      'arboles',
      'reportes',
      'recoleccion',
      'estudiantes',
      'usuarios',
      'configuracion',
    ];

    const setView = (view) => {
      currentView.value = view;
    };

    return {
      currentView,
      views,
      setView,
      kpis,
      trees,
      reports,
      students,
      users,
      collections,
    };
  },
  template: `
    <div class="topbar">
      <div>
        <h1>GEA — Vistas de prueba</h1>
        <p>Vue + grid simple, sin estilo final.</p>
      </div>
      <button class="btn">Acción rápida</button>
    </div>

    <div class="grid-layout">
      <section class="panel span-12">
        <div class="kpi-grid">
          <button class="btn" v-for="view in views" :key="view" @click="setView(view)">
            {{ view }}
          </button>
        </div>
      </section>

      <section v-if="currentView === 'login'" class="panel span-12">
        <h2>Login</h2>
        <div class="grid-layout">
          <div class="panel span-4">
            <div class="label">Matrícula</div>
            <div>EST-001</div>
          </div>
          <div class="panel span-4">
            <div class="label">Contraseña</div>
            <div>••••••••</div>
          </div>
          <div class="panel span-4">
            <div class="label">Acción</div>
            <button class="btn">Ingresar</button>
          </div>
        </div>
      </section>

      <section v-if="currentView === 'dashboard'" class="panel span-12">
        <h2>Dashboard</h2>
        <div class="kpi-grid">
          <div class="kpi" v-for="item in kpis" :key="item.label">
            <div class="label">{{ item.label }}</div>
            <div style="font-size: 24px; font-weight: bold;">{{ item.value }}</div>
          </div>
        </div>
      </section>

      <section v-if="currentView === 'mapa'" class="panel span-12">
        <h2>Mapa</h2>
        <div class="grid-layout">
          <div class="panel span-4">Mapa del campus</div>
          <div class="panel span-4">Marcadores</div>
          <div class="panel span-4">Filtros</div>
        </div>
      </section>

      <section v-if="currentView === 'arboles'" class="panel span-12">
        <h2>Árboles</h2>
        <div class="table-grid">
          <div class="row">
            <div class="label">Etiqueta</div>
            <div class="label">Especie</div>
            <div class="label">Área</div>
            <div class="label">Nivel</div>
          </div>
          <div class="row" v-for="tree in trees" :key="tree.etiqueta">
            <div>{{ tree.etiqueta }}</div>
            <div>{{ tree.especie }}</div>
            <div>{{ tree.area }}</div>
            <div>{{ tree.nivel }}</div>
          </div>
        </div>
      </section>

      <section v-if="currentView === 'reportes'" class="panel span-12">
        <h2>Reportes</h2>
        <div class="table-grid">
          <div class="row">
            <div class="label">ID</div>
            <div class="label">Estado</div>
            <div class="label">Árbol</div>
            <div class="label">Fecha</div>
          </div>
          <div class="row" v-for="report in reports" :key="report.id">
            <div>{{ report.id }}</div>
            <div>{{ report.estado }}</div>
            <div>{{ report.tree }}</div>
            <div>{{ report.fecha }}</div>
          </div>
        </div>
      </section>

      <section v-if="currentView === 'recoleccion'" class="panel span-12">
        <h2>Recolección</h2>
        <div class="table-grid">
          <div class="row">
            <div class="label">Fecha</div>
            <div class="label">Kg</div>
            <div class="label">Responsable</div>
            <div class="label">Estado</div>
          </div>
          <div class="row" v-for="item in collections" :key="item.fecha">
            <div>{{ item.fecha }}</div>
            <div>{{ item.kg }}</div>
            <div>{{ item.responsable }}</div>
            <div>Registrado</div>
          </div>
        </div>
      </section>

      <section v-if="currentView === 'estudiantes'" class="panel span-12">
        <h2>Estudiantes</h2>
        <div class="table-grid">
          <div class="row">
            <div class="label">Matrícula</div>
            <div class="label">Nombre</div>
            <div class="label">Grupo</div>
            <div class="label">Estado</div>
          </div>
          <div class="row" v-for="student in students" :key="student.matricula">
            <div>{{ student.matricula }}</div>
            <div>{{ student.nombre }}</div>
            <div>{{ student.grupo }}</div>
            <div>{{ student.estado }}</div>
          </div>
        </div>
      </section>

      <section v-if="currentView === 'usuarios'" class="panel span-12">
        <h2>Usuarios</h2>
        <div class="table-grid">
          <div class="row">
            <div class="label">Usuario</div>
            <div class="label">Rol</div>
            <div class="label">Último acceso</div>
            <div class="label">Acción</div>
          </div>
          <div class="row" v-for="user in users" :key="user.usuario">
            <div>{{ user.usuario }}</div>
            <div>{{ user.rol }}</div>
            <div>{{ user.ultimoAcceso }}</div>
            <div>Ver</div>
          </div>
        </div>
      </section>

      <section v-if="currentView === 'configuracion'" class="panel span-12">
        <h2>Configuración</h2>
        <div class="grid-layout">
          <div class="panel span-4">Tema</div>
          <div class="panel span-4">API URL</div>
          <div class="panel span-4">Notificaciones</div>
        </div>
      </section>
    </div>
  `,
};

createApp(App).mount('#app');
