// src/router/routes.ts
import type { RouteRecordRaw } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'

// Augment Vue Router's RouteMeta to type our custom fields
declare module 'vue-router' {
  interface RouteMeta {
    // true = auth required, false = guests only, undefined = public
    authRequired?: boolean
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/pages/HomePage.vue'),
        meta: { authRequired: undefined },
      },
      {
        path: 'login',
        name: 'login',
        component: () => import('@/pages/auth/LoginPage.vue'),
        meta: { authRequired: false },
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('@/pages/auth/RegisterPage.vue'),
        meta: { authRequired: false },
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/pages/auth/ProfilePage.vue'),
        meta: { authRequired: true },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/NotFoundPage.vue'),
    meta: { authRequired: undefined },
  },
]

export default routes
