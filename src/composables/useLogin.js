/*
G.E.A. Frontend
Composable: useLogin
Estado y lógica del formulario de login (matrícula, contraseña,
"recordarme", submit). Lo usan LoginDesktopView.vue y
LoginMobileView.vue — solo una de las dos está montada a la vez
(ver LoginView.vue), así que no hay riesgo de tener dos instancias
vivas del formulario al mismo tiempo.
*/
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { loginWithCredentials, getRememberedMatricula } from '@src/services/authService';
import { notify } from '@src/services/notifications';

export function useLogin() {
  const router = useRouter();
  const route = useRoute();

  const matricula = ref('');
  const password = ref('');
  const showPassword = ref(false);
  const rememberMe = ref(false);

  // Estado de la interfaz (el error se muestra como notificación
  // flotante mediante notify.error, no vive aquí).
  const isLoading = ref(false);

  // Si el usuario marcó "Recordarme" la última vez, precarga su matrícula.
  onMounted(() => {
    const remembered = getRememberedMatricula();
    if (remembered) {
      matricula.value = remembered;
      rememberMe.value = true;
    }
  });

  async function handleLogin() {
    if (!matricula.value || !password.value) {
      notify.warning('Por favor, ingresa tu matrícula y contraseña.');
      return;
    }

    isLoading.value = true;

    try {
      await loginWithCredentials(matricula.value, password.value, rememberMe.value);

      // Si el guard nos mandó al login desde otra ruta (?redirect=...),
      // regresamos ahí; si no, al dashboard.
      router.push(route.query.redirect || { name: 'Dashboard' });
    } catch (error) {
      // Formato estándar de error de la API: { error: true, message, details }
      notify.error(error.response?.data?.message || 'Error al conectar con el servidor.');
    } finally {
      isLoading.value = false;
    }
  }

  return {
    matricula,
    password,
    showPassword,
    rememberMe,
    isLoading,
    handleLogin,
  };
}