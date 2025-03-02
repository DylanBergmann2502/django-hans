<!-- src/pages/auth/LoginPage.vue -->
<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'

const email = ref('')
const password = ref('')
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const toast = useToast()
const loading = ref(false)

const redirectPath = route.query.redirect || '/'

const handleLogin = async () => {
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    toast.add({ severity: 'success', summary: 'Success', detail: 'Login successful', life: 3000 })
    router.push(redirectPath)
  } catch (error) {
    const errorMessage = error.response?.data?.detail || 'Login failed'
    toast.add({ severity: 'error', summary: 'Error', detail: errorMessage, life: 3000 })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex justify-center items-center p-4">
    <Card class="w-full max-w-md">
      <template #title>
        <h2 class="text-2xl font-bold text-center">Login</h2>
      </template>
      <template #content>
        <form @submit.prevent="handleLogin" class="space-y-4">
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
              :feedback="false"
              class="w-full"
              toggleMask
              inputClass="w-full"
              placeholder="Enter your password"
              required
            />
          </div>
          <div class="flex justify-between items-center">
            <div>
              <router-link to="/register" class="text-green-600 hover:text-green-800">
                Create account
              </router-link>
            </div>
            <div>
              <Button
                type="submit"
                label="Login"
                icon="pi pi-sign-in"
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
