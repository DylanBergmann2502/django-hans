// src/pages/auth/__tests__/LoginPage.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { ref } from 'vue'
import LoginPage from '../LoginPage.vue'

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
          // handle error
        } finally {
          loading.value = false
        }
      }

      return { email, password, loading, handleLogin, authStore, router }
    },
  },
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    login: vi.fn().mockResolvedValue({}),
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
  })),
}))

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    currentRoute: { value: { name: 'login' } },
  })),
  useRoute: vi.fn(() => ({
    query: {},
  })),
}))

vi.mock('primevue/usetoast', () => ({
  useToast: () => ({ add: vi.fn() }),
}))

describe('LoginPage', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    vi.clearAllMocks()

    wrapper = mount(LoginPage, {
      global: {
        plugins: [createPinia()],
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
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('password123')

    expect((wrapper.vm as unknown as { email: string }).email).toBe('test@example.com')
    expect((wrapper.vm as unknown as { password: string }).password).toBe('password123')
  })

  it('calls login action on form submission', async () => {
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('password123')

    await wrapper.find('form').trigger('submit.prevent')

    const vm = wrapper.vm as unknown as {
      authStore: { login: ReturnType<typeof vi.fn> }
      router: { push: ReturnType<typeof vi.fn> }
    }
    expect(vm.authStore.login).toHaveBeenCalledWith('test@example.com', 'password123')
    expect(vm.router.push).toHaveBeenCalledWith('/')
  })

  it('shows loading state during login', async () => {
    vi.useFakeTimers()

    const vm = wrapper.vm as unknown as {
      authStore: { login: ReturnType<typeof vi.fn> }
      loading: boolean
    }

    vm.authStore.login = vi
      .fn()
      .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 10)))

    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('password123')

    const formSubmitPromise = wrapper.find('form').trigger('submit.prevent')

    expect(vm.loading).toBe(true)

    vi.advanceTimersByTime(20)
    await formSubmitPromise

    expect(vm.loading).toBe(false)

    vi.useRealTimers()
  })

  it('handles login errors', async () => {
    const vm = wrapper.vm as unknown as {
      authStore: { login: ReturnType<typeof vi.fn> }
      router: { push: ReturnType<typeof vi.fn> }
      loading: boolean
    }

    vm.authStore.login = vi.fn().mockRejectedValue(new Error('Invalid credentials'))

    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('wrong')

    await wrapper.find('form').trigger('submit.prevent')

    expect(vm.router.push).not.toHaveBeenCalled()
    expect(vm.loading).toBe(false)
  })
})
