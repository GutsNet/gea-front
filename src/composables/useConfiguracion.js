/*
G.E.A. Frontend
Composable: useConfiguracion
Estado y lógica para la vista de Configuración.

Pestañas:
  - Apariencia: tema, color, logo, animaciones (solo local, sin API)
  - Especies: CRUD sobre /api/v1/arboles/especies/
  - Zonas: CRUD sobre /api/v1/arboles/ubicaciones/
  - Respaldos: placeholder (sin endpoint en backend)
*/
import { ref, computed, onMounted } from 'vue';
import apiClient from '@src/api/client';
import logoGea from '@src/assets/images/logo-gea.png';

export function useConfiguracion() {
  // ═══════════════════════════════════════════════════════════════════
  // Tabs
  // ═══════════════════════════════════════════════════════════════════
  const tabs = [
    { key: 'apariencia', label: 'Apariencia', icon: 'mdi-palette-swatch-outline' },
    { key: 'especies', label: 'Especies', icon: 'mdi-leaf' },
    { key: 'zonas', label: 'Zonas', icon: 'mdi-map-marker-outline' },
    { key: 'respaldos', label: 'Respaldos', icon: 'mdi-database-outline' },
  ];

  const activeTab = ref('apariencia');
  const activeTabLabel = computed(() => tabs.find((t) => t.key === activeTab.value)?.label || '');

  // ═══════════════════════════════════════════════════════════════════
  // Apariencia (sin API, todo local)
  // ═══════════════════════════════════════════════════════════════════
  const temaOptions = [
    { value: 'claro', label: 'Claro', icon: 'mdi-white-balance-sunny' },
    { value: 'oscuro', label: 'Oscuro', icon: 'mdi-weather-night' },
    { value: 'sistema', label: 'Seguir sistema', icon: 'mdi-monitor' },
  ];
  const tema = ref('claro');

  const colorPrincipal = ref('#1E7A34');
  const colorPresets = ['#1E7A34', '#2563EB', '#7C3AED', '#F97316', '#DC2626', '#6B7280'];

  function isSameColor(a, b) {
    return a.toLowerCase() === (b || '').toLowerCase();
  }

  const logoPreview = ref(logoGea);
  const fileInputRef = ref(null);

  function triggerFileInput() {
    fileInputRef.value?.click();
  }

  function onLogoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      logoPreview.value = reader.result;
    };
    reader.readAsDataURL(file);
  }

  const mostrarAnimaciones = ref(true);

  const guardando = ref(false);
  const savedMessage = ref('');
  let savedMessageTimeout = null;

  async function guardarCambios() {
    guardando.value = true;
    savedMessage.value = '';
    try {
      // TODO: si algún día hay un endpoint para guardar configuración, conectar aquí
      await new Promise((resolve) => setTimeout(resolve, 500));
      savedMessage.value = 'Cambios guardados';
    } finally {
      guardando.value = false;
      clearTimeout(savedMessageTimeout);
      savedMessageTimeout = setTimeout(() => {
        savedMessage.value = '';
      }, 3000);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // Especies — CRUD sobre /api/v1/arboles/especies/
  // ═══════════════════════════════════════════════════════════════════
  const especies = ref([]);
  const especiesLoading = ref(false);
  const especiesError = ref('');
  const especiesBusqueda = ref('');

  const especiesFiltradas = computed(() => {
    if (!especiesBusqueda.value) return especies.value;
    const q = especiesBusqueda.value.trim().toLowerCase();
    return especies.value.filter(
      (e) =>
        e.nombre.toLowerCase().includes(q) ||
        e.nombre_cientifico.toLowerCase().includes(q)
    );
  });

  const fetchEspecies = async () => {
    especiesLoading.value = true;
    especiesError.value = '';
    try {
      const { data } = await apiClient.get('/arboles/especies/', { params: { page_size: 100 } });
      especies.value = data.results ?? data;
    } catch (e) {
      especiesError.value = e?.response?.data?.message || 'No se pudieron cargar las especies.';
    } finally {
      especiesLoading.value = false;
    }
  };

  const crearEspecie = async ({ nombre, nombre_cientifico, nativa }) => {
    try {
      await apiClient.post('/arboles/especies/', { nombre, nombre_cientifico, nativa });
      await fetchEspecies();
      return { ok: true };
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.detail || 'No se pudo crear la especie.';
      // Intentar extraer errores de campo
      const details = e?.response?.data?.details || e?.response?.data;
      return { ok: false, error: msg, details };
    }
  };

  const editarEspecie = async (id, datos) => {
    try {
      await apiClient.patch(`/arboles/especies/${id}/`, datos);
      await fetchEspecies();
      return { ok: true };
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.detail || 'No se pudo editar la especie.';
      return { ok: false, error: msg };
    }
  };

  const eliminarEspecie = async (id) => {
    try {
      await apiClient.delete(`/arboles/especies/${id}/`);
      await fetchEspecies();
      return { ok: true };
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.detail ||
        'No se pudo eliminar la especie. Podría tener árboles asociados.';
      return { ok: false, error: msg };
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // Zonas (Ubicaciones) — CRUD sobre /api/v1/arboles/ubicaciones/
  // ═══════════════════════════════════════════════════════════════════
  const zonas = ref([]);
  const zonasLoading = ref(false);
  const zonasError = ref('');
  const zonasBusqueda = ref('');

  const zonasFiltradas = computed(() => {
    if (!zonasBusqueda.value) return zonas.value;
    const q = zonasBusqueda.value.trim().toLowerCase();
    return zonas.value.filter(
      (z) =>
        z.nombre.toLowerCase().includes(q) ||
        z.coordenadas.toLowerCase().includes(q)
    );
  });

  const fetchZonas = async () => {
    zonasLoading.value = true;
    zonasError.value = '';
    try {
      const { data } = await apiClient.get('/arboles/ubicaciones/', { params: { page_size: 100 } });
      zonas.value = data.results ?? data;
    } catch (e) {
      zonasError.value = e?.response?.data?.message || 'No se pudieron cargar las zonas.';
    } finally {
      zonasLoading.value = false;
    }
  };

  const crearZona = async ({ nombre, coordenadas }) => {
    try {
      await apiClient.post('/arboles/ubicaciones/', { nombre, coordenadas });
      await fetchZonas();
      return { ok: true };
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.detail || 'No se pudo crear la zona.';
      const details = e?.response?.data?.details || e?.response?.data;
      return { ok: false, error: msg, details };
    }
  };

  const editarZona = async (id, datos) => {
    try {
      await apiClient.patch(`/arboles/ubicaciones/${id}/`, datos);
      await fetchZonas();
      return { ok: true };
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.detail || 'No se pudo editar la zona.';
      return { ok: false, error: msg };
    }
  };

  const eliminarZona = async (id) => {
    try {
      await apiClient.delete(`/arboles/ubicaciones/${id}/`);
      await fetchZonas();
      return { ok: true };
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.detail ||
        'No se pudo eliminar la zona. Podría tener árboles asociados.';
      return { ok: false, error: msg };
    }
  };

  // Carga inicial de datos al montar
  onMounted(() => {
    // Solo cargar si estamos en una pestaña que necesita datos
    // Se cargan bajo demanda cuando el usuario cambia de pestaña también
  });

  // Carga bajo demanda al cambiar de pestaña
  const onTabChange = (tabKey) => {
    activeTab.value = tabKey;
    if (tabKey === 'especies' && especies.value.length === 0) {
      fetchEspecies();
    } else if (tabKey === 'zonas' && zonas.value.length === 0) {
      fetchZonas();
    }
  };

  return {
    // Tabs
    tabs,
    activeTab,
    activeTabLabel,
    onTabChange,

    // Apariencia
    temaOptions,
    tema,
    colorPrincipal,
    colorPresets,
    isSameColor,
    logoPreview,
    fileInputRef,
    triggerFileInput,
    onLogoChange,
    mostrarAnimaciones,
    guardando,
    savedMessage,
    guardarCambios,

    // Especies
    especies,
    especiesFiltradas,
    especiesLoading,
    especiesError,
    especiesBusqueda,
    fetchEspecies,
    crearEspecie,
    editarEspecie,
    eliminarEspecie,

    // Zonas
    zonas,
    zonasFiltradas,
    zonasLoading,
    zonasError,
    zonasBusqueda,
    fetchZonas,
    crearZona,
    editarZona,
    eliminarZona,
  };
}