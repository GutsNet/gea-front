import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import DashboardView from '../views/DashboardView.vue';
import ArbolesView from '../views/ArbolesView.vue';
import ReportesView from '../views/ReportesView.vue';
import MapaView from '../views/MapaView.vue';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/dashboard', name: 'Dashboard', component: DashboardView },
  { path: '/arboles', name: 'Arboles', component: ArbolesView },
  { path: '/reportes', name: 'Reportes', component: ReportesView },
  { path: '/mapa', name: 'Mapa', component: MapaView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
