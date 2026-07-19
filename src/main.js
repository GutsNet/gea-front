import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/styles/theme.css';

import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css';

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light', // fuerza claro, ignora el modo oscuro del SO
  },
});

createApp(App).use(router).use(vuetify).mount('#app');