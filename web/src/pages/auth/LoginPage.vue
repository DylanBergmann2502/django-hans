<!-- src/pages/auth/LoginPage.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { LogIn } from '@lucide/vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Input from '@/components/ui/Input.vue'
import PasswordInput from '@/components/ui/PasswordInput.vue'

const email = ref('')
const password = ref('')
const loading = ref(false)
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const { add } = useToast()
const redirectPath = (route.query.redirect as string) || '/'

const handleLogin = async () => {
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    add({ title: 'Success', description: 'Login successful', variant: 'success' })
    router.push(redirectPath)
  } catch (err: unknown) {
    const axiosError = err as { response?: { data?: { detail?: string } } }
    add({
      title: 'Error',
      description: axiosError.response?.data?.detail || 'Login failed',
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
      <CardHeader><CardTitle class="text-center text-2xl">Login</CardTitle></CardHeader>
      <CardContent>
        <form class="space-y-4" @submit.prevent="handleLogin">
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
              placeholder="Enter your password"
              required
            />
          </div>
          <div class="flex items-center justify-between gap-4">
            <router-link to="/register" class="text-sm text-primary hover:underline"
              >Create account</router-link
            ><Button type="submit" :disabled="loading"
              ><LogIn :size="16" />{{ loading ? 'Logging in...' : 'Login' }}</Button
            >
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
