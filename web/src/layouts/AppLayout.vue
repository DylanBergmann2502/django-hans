<!-- src/layouts/AppLayout.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChartBar, Home, LogIn, LogOut, Settings, User, UserPlus } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import Button from '@/components/ui/Button.vue'
import Toaster from '@/components/ui/Toaster.vue'
import { useToast } from '@/composables/useToast'

const authStore = useAuthStore()
const router = useRouter()
const { add } = useToast()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)
const menuOpen = ref(false)

const handleLogout = async () => {
  await authStore.logout()
  menuOpen.value = false
  add({
    title: 'Logged Out',
    description: 'You have been successfully logged out',
    variant: 'warning',
  })
  if (router.currentRoute.value.meta.authRequired === true) router.push('/')
}

const navigateHome = () => router.push('/')
</script>

<template>
  <div class="min-h-screen bg-muted/40">
    <header class="mb-4 border-b bg-background shadow-sm">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div class="flex items-center gap-6">
          <button
            class="flex items-center text-xl font-semibold hover:text-primary"
            @click="navigateHome"
          >
            Django Hans
          </button>
          <nav class="hidden items-center gap-1 sm:flex">
            <router-link
              to="/"
              class="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
              ><Home :size="16" /> Home</router-link
            >
            <router-link
              to="/dashboard"
              class="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
              ><ChartBar :size="16" /> Dashboard</router-link
            >
          </nav>
        </div>

        <div v-if="isAuthenticated" class="relative flex items-center gap-2">
          <span class="hidden text-sm text-muted-foreground sm:block">{{ user?.email }}</span>
          <Button variant="ghost" size="icon" aria-label="User menu" @click="menuOpen = !menuOpen"
            ><User :size="18"
          /></Button>
          <div
            v-if="menuOpen"
            class="absolute right-0 top-12 z-20 w-48 rounded-md border bg-background p-1 shadow-md"
          >
            <router-link
              to="/profile"
              class="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-muted"
              @click="menuOpen = false"
              ><User :size="16" /> Profile</router-link
            >
            <router-link
              to="/settings"
              class="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-muted"
              @click="menuOpen = false"
              ><Settings :size="16" /> Settings</router-link
            >
            <div class="my-1 border-t" />
            <button
              class="flex w-full cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-left text-sm hover:bg-muted"
              @click="handleLogout"
            >
              <LogOut :size="16" /> Logout
            </button>
          </div>
        </div>
        <div v-else class="flex gap-2">
          <router-link to="/login"
            ><Button variant="secondary"><LogIn :size="16" /> Login</Button></router-link
          >
          <router-link to="/register"
            ><Button><UserPlus :size="16" /> Register</Button></router-link
          >
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"><router-view /></main>
    <Toaster />
  </div>
</template>
