// src/main.ts
import '@/assets/styles.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import axios from '@/services/axios'
import { useAuthStore } from '@/stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.config.globalProperties.$axios = axios

app.mount('#app')

const authStore = useAuthStore()
authStore.initialize()
