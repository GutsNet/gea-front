import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@src/views/login/LoginView.vue';
import DashboardView from '@src/views/DashboardView.vue';
import ArbolesView from '@src/views/ArbolesView.vue';
import ReportesView from '@src/views/ReportesView.vue';
import MapaView from '@src/views/MapaView.vue';
import ConfiguracionView from '@src/views/ConfiguracionView.vue';
import CuentaView from '@src/views/CuentaView.vue';
import { authGuard } from './guards';
import EstudiantesView from "../views/EstudiantesView.vue";

const routes = [
  { path: '/', redirect: '/login' },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { layout: 'auth', requiresAuth: false },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: { layout: 'default', requiresAuth: true },
  },
  {
    path: '/arboles',
    name: 'Arboles',
    component: ArbolesView,
    meta: { layout: 'default', requiresAuth: true },
  },
  {
    path: '/reportes',
    name: 'Reportes',
    component: ReportesView,
    meta: { layout: 'default', requiresAuth: true },
  },
  {
    path: '/mapa',
    name: 'Mapa',
    component: MapaView,
    meta: { layout: 'default', requiresAuth: true },
  },
  {
    path: '/configuracion',
    name: 'Configuracion',
    component: ConfiguracionView,
    meta: { layout: 'default', requiresAuth: true, roles: ['root'] },
  },
  {
    path: '/cuenta',
    name: 'Cuenta',
    component: CuentaView,
    meta: { layout: 'default', requiresAuth: true },
  },
  {
    path: '/estudiantes',
    name: 'Estudiantes',
    component: EstudiantesView,
    meta: { layout: 'default', requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(authGuard);

export default router;
