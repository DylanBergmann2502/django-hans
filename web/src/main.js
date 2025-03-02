// src/main.js
import '@/assets/styles.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import App from './App.vue';
import router from './router';
import axios from '@/services/axios.js';
import { useAuthStore } from '@/stores/auth';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

app.use(PrimeVue, {
  theme: {
    preset: Aura,
  }
});
app.use(ToastService);
app.use(ConfirmationService);

app.config.globalProperties.$axios = axios;

app.mount('#app');

// Initialize auth store after mounting
const authStore = useAuthStore();
authStore.initialize();

// Clean up event listeners when app is unmounted
app.unmount = () => {
  authStore.clearListeners();
};
