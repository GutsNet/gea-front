import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import DashboardView from '../views/DashboardView.vue';
import ArbolesView from '../views/ArbolesView.vue';
import ReportesView from '../views/ReportesView.vue';
import MapaView from '../views/MapaView.vue';
import { authGuard } from './guards';

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
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(authGuard);

export default router;
