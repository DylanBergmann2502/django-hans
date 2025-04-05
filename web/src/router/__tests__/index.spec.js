// src/router/__tests__/index.spec.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import { setActivePinia, createPinia } from 'pinia'

// Mock the auth store
vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    isAuthenticated: false,
  })),
}))

// Mock components
const mockComponent = (name = 'Default') => ({
  name,
  template: `<div>${name}</div>`,
})

// Import the auth store
import { useAuthStore } from '@/stores/auth'

describe('Router Guards', () => {
  let router
  let authStore

  beforeEach(() => {
    // Create a fresh pinia
    setActivePinia(createPinia())

    // Get the auth store
    authStore = useAuthStore()

    // Define routes
    const routes = [
      {
        path: '/',
        component: mockComponent('Layout'),
        children: [
          {
            path: '',
            name: 'home',
            component: mockComponent('Home'),
            meta: { authRequired: undefined },
          },
          {
            path: 'login',
            name: 'login',
            component: mockComponent('Login'),
            meta: { authRequired: false },
          },
          {
            path: 'profile',
            name: 'profile',
            component: mockComponent('Profile'),
            meta: { authRequired: true },
          },
        ],
      },
      {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: mockComponent('NotFound'),
        meta: { authRequired: undefined },
      },
    ]

    // Create router
    router = createRouter({
      history: createMemoryHistory(),
      routes,
    })

    // Add guard
    router.beforeEach((to, from, next) => {
      const isAuthenticated = authStore.isAuthenticated

      if (to.meta.authRequired === true && !isAuthenticated) {
        next({ name: 'login', query: { redirect: to.fullPath } })
      } else if (to.meta.authRequired === false && isAuthenticated) {
        if (from.name) {
          next(false)
        } else {
          next({ name: 'home' })
        }
      } else {
        next()
      }
    })
  })

  it('allows access to public routes when not authenticated', async () => {
    authStore.isAuthenticated = false

    await router.push('/')
    expect(router.currentRoute.value.name).toBe('home')
  })

  it('allows access to auth-only routes when authenticated', async () => {
    authStore.isAuthenticated = true

    await router.push('/profile')
    expect(router.currentRoute.value.name).toBe('profile')
  })

  it('redirects to login when accessing auth-only route while not authenticated', async () => {
    authStore.isAuthenticated = false

    await router.push('/profile')
    expect(router.currentRoute.value.name).toBe('login')
    expect(router.currentRoute.value.query.redirect).toBe('/profile')
  })

  it('redirects to home when accessing login while authenticated', async () => {
    authStore.isAuthenticated = true

    // Start at the home page and then try to go to login
    await router.push('/')
    expect(router.currentRoute.value.name).toBe('home')

    await router.push('/login')
    expect(router.currentRoute.value.name).toBe('home')
  })

  it('prevents navigation to login when already authenticated and coming from another route', async () => {
    authStore.isAuthenticated = true

    // Navigate to home first
    await router.push('/')
    expect(router.currentRoute.value.name).toBe('home')

    // Store the current route before trying to navigate
    const currentRoute = router.currentRoute.value.name

    // Attempt to navigate to login
    await router.push('/login')

    // We should still be on the home page
    expect(router.currentRoute.value.name).toBe(currentRoute)
  })

  it('handles 404 routes', async () => {
    authStore.isAuthenticated = false

    await router.push('/non-existent-route')
    expect(router.currentRoute.value.name).toBe('not-found')
  })
})
