<!-- src/pages/auth/RegisterPage.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { UserPlus } from '@lucide/vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import type { ApiError } from '@/types'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Input from '@/components/ui/Input.vue'
import PasswordInput from '@/components/ui/PasswordInput.vue'

const email = ref(''),
  password = ref(''),
  confirmPassword = ref(''),
  loading = ref(false)
const authStore = useAuthStore(),
  router = useRouter(),
  { add } = useToast()

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    add({ title: 'Error', description: 'Passwords do not match', variant: 'error' })
    return
  }
  loading.value = true
  try {
    await authStore.register({
      email: email.value,
      password: password.value,
    })
    add({
      title: 'Success',
      description: 'Registration successful! You can now log in.',
      variant: 'success',
    })
    router.push('/login')
  } catch (err: unknown) {
    const errors = (err as { response?: { data?: ApiError } }).response?.data
    const messages = errors?.errors?.map((error) => error.message).filter(Boolean) ?? []
    if (errors?.detail) messages.push(errors.detail)
    add({
      title: 'Registration Failed',
      description: messages.join('\n') || 'Registration failed',
      variant: 'error',
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex items-center justify-center p-4">
    <Card class="w-full max-w-md">
      <CardHeader><CardTitle class="text-center text-2xl">Create Account</CardTitle></CardHeader>
      <CardContent
        ><form class="space-y-4" @submit.prevent="handleRegister">
          <div>
            <label for="email" class="mb-1 block text-sm font-medium">Email</label
            ><Input
              id="email"
              v-model="email"
              type="email"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label for="password" class="mb-1 block text-sm font-medium">Password</label
            ><PasswordInput
              id="password"
              v-model="password"
              placeholder="Create a password"
              required
            />
          </div>
          <div>
            <label for="confirmPassword" class="mb-1 block text-sm font-medium"
              >Confirm Password</label
            ><PasswordInput
              id="confirmPassword"
              v-model="confirmPassword"
              placeholder="Confirm your password"
              required
            />
          </div>
          <div class="flex items-center justify-between gap-4">
            <router-link to="/login" class="text-sm text-primary hover:underline"
              >Already have an account?</router-link
            ><Button type="submit" :disabled="loading"
              ><UserPlus :size="16" />{{ loading ? 'Registering...' : 'Register' }}</Button
            >
          </div>
        </form></CardContent
      >
    </Card>
  </div>
</template>
