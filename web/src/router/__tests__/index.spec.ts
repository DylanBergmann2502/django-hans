// src/router/__tests__/index.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import { setActivePinia, createPinia } from 'pinia'
import type { RouteRecordRaw } from 'vue-router'

vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    isAuthenticated: false,
  })),
}))

import { useAuthStore } from '@/stores/auth'

const mockedUseAuthStore = vi.mocked(useAuthStore)

const mockComponent = (name = 'Default') => ({
  name,
  template: `<div>${name}</div>`,
})

describe('Router Guards', () => {
  let router: ReturnType<typeof createRouter>
  let authStore: { isAuthenticated: boolean }

  beforeEach(() => {
    setActivePinia(createPinia())

    authStore = { isAuthenticated: false }
    mockedUseAuthStore.mockReturnValue(authStore as ReturnType<typeof useAuthStore>)

    const routes: RouteRecordRaw[] = [
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

    router = createRouter({ history: createMemoryHistory(), routes })

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

    await router.push('/')
    expect(router.currentRoute.value.name).toBe('home')

    await router.push('/login')
    expect(router.currentRoute.value.name).toBe('home')
  })

  it('prevents navigation to login when already authenticated and coming from another route', async () => {
    authStore.isAuthenticated = true

    await router.push('/')
    expect(router.currentRoute.value.name).toBe('home')

    const currentRoute = router.currentRoute.value.name

    await router.push('/login')
    expect(router.currentRoute.value.name).toBe(currentRoute)
  })

  it('handles 404 routes', async () => {
    authStore.isAuthenticated = false

    await router.push('/non-existent-route')
    expect(router.currentRoute.value.name).toBe('not-found')
  })
})
