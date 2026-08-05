/*
G.E.A. Frontend
Composable: useEstudiantes
Estado y lógica de datos del listado de Estudiantes (tabla, filtros,
tarjetas de estadísticas, helper de estado). Lo usan
EstudiantesDesktopView.vue y EstudiantesMobileView.vue — solo una de
las dos está montada a la vez (ver EstudiantesView.vue), así que no
hay riesgo de disparar la llamada a la API dos veces al mismo tiempo.
*/
import { ref, onMounted } from 'vue';
// import apiClient from '@src/api/client';

export function useEstudiantes() {
  const loading = ref(false);
  const error = ref('');

  // Datos Mockup (Reemplazar con llamada API)
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
      loading.value = true;
      const { data } = await apiClient.get('/estudiantes/');
      estudiantes.value = data.results ?? data;
    } catch (e) {
      error.value = e?.response?.data?.detail || 'No se pudieron cargar los estudiantes.';
    } finally {
      loading.value = false;
    }
    */
  });

  return {
    loading,
    error,
    estudiantes,
    getStatusBadgeClass,
  };
}