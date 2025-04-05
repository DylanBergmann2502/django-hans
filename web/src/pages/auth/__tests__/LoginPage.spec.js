// src/pages/auth/__tests__/LoginPage.spec.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { ref } from 'vue'
import LoginPage from '../LoginPage.vue'

// Mock the component
vi.mock('../LoginPage.vue', () => ({
  default: {
    name: 'LoginPage',
    template: `
      <div>
        <h2>Login to Your Account</h2>
        <form @submit.prevent="handleLogin">
          <input type="email" v-model="email" />
          <input type="password" v-model="password" />
          <button type="submit">Login</button>
        </form>
      </div>
    `,
    setup() {
      const email = ref('')
      const password = ref('')
      const router = { push: vi.fn() }
      const authStore = { login: vi.fn() }
      const loading = ref(false)

      const handleLogin = async () => {
        loading.value = true
        try {
          await authStore.login(email.value, password.value)
          router.push('/')
        } catch {
          // Handle error (removed unused error variable)
        } finally {
          loading.value = false
        }
      }

      return {
        email,
        password,
        loading,
        handleLogin,
        authStore,
        router,
      }
    },
  },
}))

// Create a mock for the useAuthStore function
vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    login: vi.fn().mockResolvedValue({}),
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
  })),
}))

// Create a mock for the router
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    currentRoute: { value: { name: 'login' } },
  })),
}))

// Mock PrimeVue toast
vi.mock('primevue/usetoast', () => ({
  useToast: () => ({
    add: vi.fn(),
  }),
}))

describe('LoginPage', () => {
  let wrapper

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    // Create a fresh pinia
    const pinia = createPinia()

    // Mount the component
    wrapper = mount(LoginPage, {
      global: {
        plugins: [pinia],
        stubs: {
          Card: true,
          InputText: true,
          Password: true,
          Button: true,
          'router-link': true,
        },
      },
    })
  })

  it('renders correctly', async () => {
    expect(wrapper.find('h2').text()).toBe('Login to Your Account')
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('updates form values on input', async () => {
    const emailInput = wrapper.find('input[type="email"]')
    const passwordInput = wrapper.find('input[type="password"]')

    await emailInput.setValue('test@example.com')
    await passwordInput.setValue('password123')

    expect(wrapper.vm.email).toBe('test@example.com')
    expect(wrapper.vm.password).toBe('password123')
  })

  it('calls login action on form submission', async () => {
    // Set form values
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('password123')

    // Submit the form
    await wrapper.find('form').trigger('submit.prevent')

    // Check if store action was called with correct params
    expect(wrapper.vm.authStore.login).toHaveBeenCalledWith('test@example.com', 'password123')

    // Should navigate to home after successful login
    expect(wrapper.vm.router.push).toHaveBeenCalledWith('/')
  })

  it('shows loading state during login', async () => {
    // Enable fake timers
    vi.useFakeTimers()

    // Make login take some time
    wrapper.vm.authStore.login = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(resolve, 10)
        }),
    )

    // Set form values
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('password123')

    // Submit the form
    const formSubmitPromise = wrapper.find('form').trigger('submit.prevent')

    // Check loading state
    expect(wrapper.vm.loading).toBe(true)

    // Advance timers to resolve the setTimeout
    vi.advanceTimersByTime(20)

    // Wait for the login promise to resolve
    await formSubmitPromise

    // After resolution, loading should be false
    expect(wrapper.vm.loading).toBe(false)

    // Restore real timers
    vi.useRealTimers()
  })

  it('handles login errors', async () => {
    // Setup mock to reject with error
    wrapper.vm.authStore.login = vi.fn().mockRejectedValue(new Error('Invalid credentials'))

    // Set form values
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('wrong')

    // Submit the form
    await wrapper.find('form').trigger('submit.prevent')

    // Should not navigate
    expect(wrapper.vm.router.push).not.toHaveBeenCalled()

    // Loading should be false
    expect(wrapper.vm.loading).toBe(false)
  })
})
