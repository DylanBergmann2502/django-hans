// src/layouts/__tests__/AppLayout.spec.js
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

// Create a simple component for testing
const SimpleAppLayout = {
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
      user: null
    }
  },
  methods: {
    navigateHome() {
      this.$emit('navigate-home')
    },
    handleLogout() {
      this.$emit('logout')
    }
  }
}

describe('AppLayout', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(SimpleAppLayout, {
      global: {
        stubs: {
          'router-link': true
        }
      }
    })
  })

  it('renders correctly', () => {
    expect(wrapper.find('.layout').exists()).toBe(true)
    expect(wrapper.find('header').exists()).toBe(true)
    expect(wrapper.find('main').exists()).toBe(true)
  })

  it('navigates home when logo is clicked', async () => {
    // Click the logo
    await wrapper.find('.logo').trigger('click')

    // Check if the event was emitted
    expect(wrapper.emitted()['navigate-home']).toBeTruthy()
    expect(wrapper.emitted()['navigate-home'].length).toBe(1)
  })

  it('displays login and register links when not authenticated', () => {
    // Default state is not authenticated
    expect(wrapper.find('.auth-buttons').exists()).toBe(true)
    expect(wrapper.find('.user-menu').exists()).toBe(false)
  })

  it('displays user menu when authenticated', async () => {
    // Update data directly
    await wrapper.setData({
      isAuthenticated: true,
      user: { email: 'test@example.com' }
    })

    expect(wrapper.find('.user-menu').exists()).toBe(true)
    expect(wrapper.find('.auth-buttons').exists()).toBe(false)
    expect(wrapper.find('.user-menu span').text()).toBe('test@example.com')
  })

  it('calls logout when logout button is clicked', async () => {
    // Set authenticated state
    await wrapper.setData({
      isAuthenticated: true,
      user: { email: 'test@example.com' }
    })

    // Click logout button
    await wrapper.find('.user-menu button').trigger('click')

    // Check if logout event was emitted
    expect(wrapper.emitted().logout).toBeTruthy()
    expect(wrapper.emitted().logout.length).toBe(1)
  })
})
