import { createRouter, createWebHistory } from 'vue-router';
import LoginWrapper from '@src/views/login/LoginWrapper.vue';
import DashboardWrapper from '@src/views/dashboard/DashboardWrapper.vue';
import MapaWrapper from '@src/views/mapa/MapaWrapper.vue';
import ReportesWrapper from '@src/views/reportes/ReportesWrapper.vue';
import ArbolesWrapper from '@src/views/arboles/ArbolesWrapper.vue';
import EstudiantesWrapper from "@src/views/estudiantes/EstudiantesWrapper.vue";
import RecoleccionWrapper from "@src/views/recoleccion/RecoleccionWrapper.vue";
import UsuariosWrapper from "@src/views/usuarios/UsuariosWrapper.vue"; // en construción
import ConfiguracionWrapper from '@src/views/configuracion/ConfiguracionWrapper.vue';
import CuentaWrapper from '@src/views/cuenta/CuentaWrapper.vue';
import { authGuard } from './guards';

const routes = [  
  { path: '/', redirect: '/login' },
  {
    path: '/login',
    name: 'Login',
    component: LoginWrapper,
    meta: { layout: 'auth', requiresAuth: false },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardWrapper,
    meta: { layout: 'default', requiresAuth: true },  
  },
  {
    path: '/mapa',
    name: 'Mapa',
    component: MapaWrapper,
    meta: { layout: 'default', requiresAuth: true },
  },
  {
    path: '/reportes',
    name: 'Reportes',
    component: ReportesWrapper,
    meta: { layout: 'default', requiresAuth: true },
  },
  {
    path: '/arboles',
    name: 'Arboles',
    component: ArbolesWrapper,
    meta: { layout: 'default', requiresAuth: true },
  },
  {
    path: '/estudiantes',
    name: 'Estudiantes',
    component: EstudiantesWrapper,
    meta: { layout: 'default', requiresAuth: true, roles: ['root', 'admin'] },
  },
  {
    path: '/recoleccion',
    name: 'Recoleccion',
    component: RecoleccionWrapper,
    meta: { layout: 'default', requiresAuth: true, roles: ['root', 'admin'] },
  },
  {
    path: '/usuarios',
    name: 'Usuarios',
    component: UsuariosWrapper,
    meta: { layout: 'default', requiresAuth: true, roles: ['root', 'admin'] },
  },
  {
    path: '/configuracion',
    name: 'Configuracion',
    component: ConfiguracionWrapper,
    meta: { layout: 'default', requiresAuth: true, roles: ['root', 'admin'] },
  },
  {
    path: '/cuenta',
    name: 'Cuenta',
    component: CuentaWrapper,
    meta: { layout: 'default', requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(authGuard);

export default router;
