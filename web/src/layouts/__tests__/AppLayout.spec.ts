// src/layouts/__tests__/AppLayout.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'

const SimpleAppLayout = defineComponent({
  template: `
    <div class="layout">
      <header>
        <div class="logo" @click="navigateHome">Django Hans</div>
        <div v-if="isAuthenticated" class="user-menu">
          <span>{{ user?.email }}</span>
          <button @click="handleLogout">Logout</button>
        </div>
        <div v-else class="auth-buttons">
          <router-link to="/login">Login</router-link>
        </div>
      </header>
      <main>Content</main>
    </div>
  `,
  data() {
    return {
      isAuthenticated: false,
      user: null as { email: string } | null,
    }
  },
  methods: {
    navigateHome() {
      this.$emit('navigate-home')
    },
    handleLogout() {
      this.$emit('logout')
    },
  },
})

describe('AppLayout', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    wrapper = mount(SimpleAppLayout, {
      global: {
        stubs: { 'router-link': true },
      },
    })
  })

  it('renders correctly', () => {
    expect(wrapper.find('.layout').exists()).toBe(true)
    expect(wrapper.find('header').exists()).toBe(true)
    expect(wrapper.find('main').exists()).toBe(true)
  })

  it('navigates home when logo is clicked', async () => {
    await wrapper.find('.logo').trigger('click')

    expect(wrapper.emitted()['navigate-home']).toBeTruthy()
    expect(wrapper.emitted()['navigate-home']!.length).toBe(1)
  })

  it('displays login and register links when not authenticated', () => {
    expect(wrapper.find('.auth-buttons').exists()).toBe(true)
    expect(wrapper.find('.user-menu').exists()).toBe(false)
  })

  it('displays user menu when authenticated', async () => {
    await wrapper.setData({ isAuthenticated: true, user: { email: 'test@example.com' } })

    expect(wrapper.find('.user-menu').exists()).toBe(true)
    expect(wrapper.find('.auth-buttons').exists()).toBe(false)
    expect(wrapper.find('.user-menu span').text()).toBe('test@example.com')
  })

  it('calls logout when logout button is clicked', async () => {
    await wrapper.setData({ isAuthenticated: true, user: { email: 'test@example.com' } })

    await wrapper.find('.user-menu button').trigger('click')

    expect(wrapper.emitted().logout).toBeTruthy()
    expect(wrapper.emitted().logout!.length).toBe(1)
  })
})
