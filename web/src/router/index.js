// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { useAuthStore } from '@/stores/auth'

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
          component: () => import('@/pages/HomePage.vue'),
          meta: { authRequired: false },
        },
        // Add more child routes as needed
        // {
        //   path: 'dashboard',
        //   name: 'dashboard',
        //   component: () => import('@/views/DashboardView.vue'),
        //   meta: { authRequired: false },
        // },
      ],
    },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;

  // authRequired: true = requires authentication
  // authRequired: false = only for non-authenticated users
  // authRequired: undefined or not present = accessible to everyone

  if (to.meta.authRequired === true && !isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } });
  } else if (to.meta.authRequired === false && isAuthenticated) {
    next({ name: 'dashboard' });
  } else {
    next();
  }
});
export default router
