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
          meta: { authRequired: undefined }, // Accessible to everyone
        },
        {
          path: 'login',
          name: 'login',
          component: () => import('@/pages/auth/LoginPage.vue'),
          meta: { authRequired: false }, // Only for non-authenticated users
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('@/pages/auth/RegisterPage.vue'),
          meta: { authRequired: false }, // Only for non-authenticated users
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/pages/auth/ProfilePage.vue'),
          meta: { authRequired: true }, // Requires authentication
        },
        // Add more routes as needed
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/pages/NotFoundPage.vue'),
      meta: { authRequired: undefined },
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
    // Redirect to login if trying to access auth-required page while not logged in
    next({ name: 'login', query: { redirect: to.fullPath } });
  } else if (to.meta.authRequired === false && isAuthenticated) {
    // If the user came from a previous route within the app, go back there
    if (from.name) {
      next(false); // Go back to where they came from
    } else {
      // If there's no previous route, go to home
      next({ name: 'home' });
    }
  } else {
    // Otherwise proceed normally
    next();
  }
});

export default router
