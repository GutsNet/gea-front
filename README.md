# GEA - Frontend (gea-front)

Plataforma de Control Fitosanitario — Universidad Tecnológica de Tula-Tepeji (UTTT).

SPA desarrollada en **Vue 3 + Vuetify 3**, que consume la API expuesta por [`gea-back`](../gea-back). El resultado del build (`dist/`) se integra dentro del contenedor del backend; este repositorio **no** genera su propio contenedor de producción.

---

## 1. Descripción del proyecto

Interfaz de usuario para G.E.A. (Gestión Ecológica Arbórea): dashboard con indicadores fitosanitarios, mapa del campus con niveles de infestación (escala Hawksworth), gestión de árboles y su historial de reportes, captura de nuevos reportes, control de recolección de biomasa (kg), gestión de estudiantes y administración de usuarios/roles.

## 2. Stack tecnológico

| Componente        | Tecnología                          |
|-------------------|---------------------------------------|
| Framework         | Vue 3 (Composition API)              |
| UI Kit            | Vuetify 3                            |
| Bundler           | Vite                                  |
| Estado global     | Pinia                                 |
| Enrutamiento      | Vue Router 4                         |
| HTTP client       | Axios                                 |
| Gráficas          | Chart.js / ApexCharts (a definir)     |
| Mapas             | Leaflet (o Google Maps API)          |
| Gestor de paquetes| Yarn                                   |
| CI/CD             | GitHub Actions y/o Jenkins            |

## 3. Roles del sistema (consumidos desde el back)

| Rol          | Vistas/acciones habilitadas                                          |
|--------------|-----------------------------------------------------------------------|
| Sysadmin (root)    | Todo, incluyendo Usuarios y Configuración                             |
| Coordinador (admin)  | Dashboard, Mapa, Árboles, Reportes (validar/rechazar), Recolección, Estudiantes |
| Brigadista (user)   | Dashboard (limitado), Nuevo reporte, Recolección propia                |

## 4. Vistas principales

| Ruta                     | Vista                     | Descripción                                            |
|--------------------------|----------------------------|----------------------------------------------------------|
| `/login`                 | `LoginView`                | Autenticación por matrícula/contraseña                   |
| `/`                      | `ResumenView`               | Dashboard: KPIs, evolución de reportes, especies afectadas, mapa de calor |
| `/mapa`                  | `MapaCampusView`            | Mapa interactivo del campus con marcadores por árbol      |
| `/arboles`               | `ArbolesView`                | Listado/inventario de árboles con filtros                |
| `/arboles/:id`           | `DetalleArbolView`          | Ficha completa del árbol + historial de reportes          |
| `/reportes`              | `ReportesView`               | Listado de reportes con estado (Validado/Rechazado/Pendiente) |
| `/reportes/nuevo`        | `NuevoReporteView`           | Formulario de captura con selección en mapa e imágenes     |
| `/recoleccion`           | `RecoleccionView`            | Registro y KPIs de kg recolectados                        |
| `/estudiantes`           | `EstudiantesView`            | Listado y estado de estudiantes participantes              |
| `/usuarios`              | `UsuariosView`               | Administración de usuarios y roles (solo Sysadmin)         |
| `/configuracion`         | `ConfiguracionView`          | Ajustes generales de la plataforma                        |

## 5. Estructura de carpetas

```
gea-front/
├── public/
├── src/
│   ├── main.js
│   ├── App.vue
│   ├── assets/
│   │   ├── logo-gea.png
│   │   └── styles/
│   ├── plugins/
│   │   ├── vuetify.js
│   │   └── axios.js
│   ├── router/
│   │   ├── index.js
│   │   └── guards.js
│   ├── store/                  # Pinia
│   │   ├── auth.js
│   │   ├── arboles.js
│   │   ├── reportes.js
│   │   ├── recoleccion.js
│   │   ├── estudiantes.js
│   │   ├── usuarios.js
│   │   └── dashboard.js
│   ├── services/               # llamadas a la API
│   ├── layouts/
│   │   ├── AuthLayout.vue
│   │   └── DefaultLayout.vue
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   ├── arboles/
│   │   ├── mapa/
│   │   ├── reportes/
│   │   └── dashboard/
│   └── views/
│       ├── auth/
│       ├── dashboard/
│       ├── mapa/
│       ├── arboles/
│       ├── reportes/
│       ├── recoleccion/
│       ├── estudiantes/
│       ├── usuarios/
│       └── configuracion/
├── .env.development
├── .env.production
├── vite.config.js
├── package.json
├── .github/workflows/
│   └── build.yml
└── README.md
```

## 6. Convenciones de UI

- **Colores de marca**: verdes institucionales G.E.A. definidos en `assets/styles/variables.scss` y en el tema de Vuetify (`plugins/vuetify.js`).
- **Semáforo de infestación (Hawksworth)**:
  - `0 - No visible` → verde
  - `3.5 - Ligera` → naranja
  - `7.5 - Severa` → rojo
  - `Árbol muerto - estado crítico` → rojo oscuro/negro
  - `En revisión` → azul
- **Estados de reporte**: `Pendiente`, `En revisión`, `Validado`, `Rechazado` representados con `StatusChip.vue`.
- Componentes reutilizables (`AppTable`, `AppSearchBar`, `StatusChip`, `InfestationBadge`) para mantener consistencia entre Árboles, Reportes, Recolección, Estudiantes y Usuarios (todos comparten patrón de listado + filtros + paginación).

## 7. Variables de entorno

**`.env.development`**
```
VITE_API_URL=http://localhost:8000/api
```

**`.env.production`**
```
VITE_API_URL=/api
```

> En producción el front se sirve desde el mismo dominio/origen que el backend, por lo que las llamadas usan ruta relativa `/api`.

## 8. Desarrollo local

```bash
yarn install
yarn dev
```

Requiere que `gea-back` esté corriendo (local o vía `docker-compose up -d`) en `http://localhost:8000`.

## 9. Build de producción

```bash
yarn build
```

Genera la carpeta `dist/`, la cual debe copiarse a `gea-back/frontend_dist/` antes de construir la imagen Docker del backend. Este paso lo realiza el pipeline de CI/CD, no se ejecuta manualmente en producción.

## 10. CI/CD

- **`build.yml`**: en cada push/PR:
  1. `yarn install`
  2. Lint (`eslint`) y, si aplica, pruebas unitarias (`vitest`).
  3. `yarn build`.
  4. Publica `dist/` como **artifact** (o lo empuja a un branch/tag) para que el pipeline de `gea-back` lo consuma.
- Si se usa **Jenkins**, un job "padre" puede orquestar: build de `gea-front` → build de `gea-back` (con el `dist/` ya inyectado) → push de imagen.

## 11. Convenciones de código

- Composition API con `<script setup>`.
- Nombres de componentes en `PascalCase`, archivos de vistas con sufijo `View.vue`.
- Un store de Pinia por dominio (alineado 1:1 con las apps del backend).
- Branching: `main`, `develop`, `feature/*`, `hotfix/*`.

## 12. Conventional Commits

Este repo sigue [Conventional Commits](https://www.conventionalcommits.org/). Formato:

```
<tipo>(<scope>): <descripción en minúsculas, modo imperativo>
```

**Tipos permitidos**

| Tipo       | Uso                                                              |
|------------|-------------------------------------------------------------------|
| `feat`     | Nueva vista, componente o interacción                            |
| `fix`      | Corrección de bug visual o funcional                              |
| `refactor` | Reestructuración de componentes/stores sin cambiar comportamiento |
| `style`    | Cambios de estilos, theme de Vuetify, espaciados (sin lógica)     |
| `test`     | Agregar o corregir pruebas (unitarias/e2e)                        |
| `docs`     | Cambios en documentación (README, comentarios)                    |
| `chore`    | Mantenimiento (dependencias, configuración de Vite/Yarn)          |
| `perf`     | Mejoras de rendimiento (lazy loading, bundle size)                |
| `build`    | Cambios en build, `vite.config.js`, empaquetado                   |
| `ci`       | Cambios en pipelines de GitHub Actions / Jenkins                  |

**Scopes sugeridos** (alineados a los módulos/vistas del proyecto): `login`, `dashboard`, `mapa`, `arboles`, `reportes`, `recoleccion`, `estudiantes`, `usuarios`, `configuracion`, `router`, `store`, `ui`.

**Ejemplos**

```
feat(reportes): agregar formulario de nuevo reporte con selección en mapa
fix(mapa): corregir posición del marcador al editar ubicación
refactor(store): unificar manejo de filtros en arboles.js
style(ui): ajustar paleta de verdes del tema Vuetify
test(usuarios): agregar pruebas de guard por rol sysadmin
docs(reportes): documentar props de ReporteCard.vue
chore(build): actualizar Vuetify a 3.7.x
fix(auth)!: forzar logout cuando el token expira
```

> Usar `!` después del scope (o `BREAKING CHANGE:` en el pie del commit) cuando el cambio rompa compatibilidad con la API del backend, por ejemplo un cambio en el formato esperado de un endpoint consumido por un `service`.