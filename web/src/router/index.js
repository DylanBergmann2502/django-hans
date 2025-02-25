// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AppLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/pages/HomePage.vue')
        },
        // Add more child routes as needed
        // {
        //   path: 'dashboard',
        //   name: 'dashboard',
        //   component: () => import('@/views/DashboardView.vue')
        // },
      ]
    }
  ],
})

export default router
