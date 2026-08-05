/*
G.E.A. Frontend
Composable: useConfiguracion
Estado y lógica para la vista de Configuración (Apariencia).
*/
import { ref, computed } from 'vue';
import logoGea from '@src/assets/images/logo-gea.png';

export function useConfiguracion() {
  // Tabs
  const tabs = [
    { key: 'apariencia', label: 'Apariencia', icon: 'mdi-palette-swatch-outline' },
    { key: 'especies', label: 'Especies', icon: 'mdi-leaf' },
    { key: 'zonas', label: 'Zonas', icon: 'mdi-map-marker-outline' },
    { key: 'respaldos', label: 'Respaldos', icon: 'mdi-database-outline' },
  ];

  const activeTab = ref('apariencia');
  const activeTabLabel = computed(() => tabs.find((t) => t.key === activeTab.value)?.label || '');

  // Tema
  const temaOptions = [
    { value: 'claro', label: 'Claro', icon: 'mdi-white-balance-sunny' },
    { value: 'oscuro', label: 'Oscuro', icon: 'mdi-weather-night' },
    { value: 'sistema', label: 'Seguir sistema', icon: 'mdi-monitor' },
  ];
  const tema = ref('claro');

  // Color principal
  const colorPrincipal = ref('#1E7A34');
  const colorPresets = ['#1E7A34', '#2563EB', '#7C3AED', '#F97316', '#DC2626', '#6B7280'];

  function isSameColor(a, b) {
    return a.toLowerCase() === (b || '').toLowerCase();
  }

  // Logo
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

  // Animaciones
  const mostrarAnimaciones = ref(true);

  // Guardar
  const guardando = ref(false);
  const savedMessage = ref('');
  let savedMessageTimeout = null;

  async function guardarCambios() {
    guardando.value = true;
    savedMessage.value = '';

    try {
      // TODO: llamada a API
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

  return {
    tabs,
    activeTab,
    activeTabLabel,
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
  };
}