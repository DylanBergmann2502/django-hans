<!-- src/pages/auth/RegisterPage.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'
import type { ApiError } from '@/types'

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()
const loading = ref(false)

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Passwords do not match', life: 3000 })
    return
  }

  loading.value = true
  try {
    await authStore.register({
      email: email.value,
      password1: password.value,
      password2: confirmPassword.value,
    })

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Registration successful! You can now log in.',
      life: 5000,
    })

    router.push('/login')
  } catch (err: unknown) {
    const axiosError = err as { response?: { data?: ApiError } }
    const errors = axiosError.response?.data ?? {}
    const errorMessages: string[] = []

    Object.keys(errors).forEach((key) => {
      const val = errors[key as keyof ApiError]
      if (Array.isArray(val)) {
        errorMessages.push(`${key}: ${val.join(', ')}`)
      } else if (val) {
        errorMessages.push(`${key}: ${val}`)
      }
    })

    toast.add({
      severity: 'error',
      summary: 'Registration Failed',
      detail: errorMessages.join('\n') || 'Registration failed',
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex justify-center items-center p-4">
    <Card class="w-full max-w-md">
      <template #title>
        <h2 class="text-2xl font-bold text-center">Create Account</h2>
      </template>
      <template #content>
        <form @submit.prevent="handleRegister" class="space-y-4">
          <div class="field">
            <label for="email" class="block mb-1">Email</label>
            <InputText
              id="email"
              v-model="email"
              type="email"
              class="w-full"
              placeholder="Enter your email"
              required
            />
          </div>
          <div class="field">
            <label for="password" class="block mb-1">Password</label>
            <Password
              id="password"
              v-model="password"
              class="w-full"
              toggleMask
              inputClass="w-full"
              placeholder="Create a password"
              required
            />
          </div>
          <div class="field">
            <label for="confirmPassword" class="block mb-1">Confirm Password</label>
            <Password
              id="confirmPassword"
              v-model="confirmPassword"
              class="w-full"
              toggleMask
              inputClass="w-full"
              placeholder="Confirm your password"
              required
            />
          </div>
          <div class="flex justify-between items-center">
            <div>
              <router-link to="/login" class="text-green-600 hover:text-green-800">
                Already have an account?
              </router-link>
            </div>
            <div>
              <Button
                type="submit"
                label="Register"
                icon="pi pi-user-plus"
                class="p-button-success"
                :loading="loading"
              />
            </div>
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>
