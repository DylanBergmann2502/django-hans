<!-- src/pages/ProfilePage.vue -->
<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const user = authStore.user
</script>

<template>
  <div>
    <div class="bg-white p-6 rounded-lg shadow-lg mb-6">
      <h1 class="text-2xl font-bold mb-4">Profile</h1>
      <p class="text-lg text-gray-700">Welcome to your profile, {{ user?.name || user?.email }}</p>
      <div class="mt-4 p-4 bg-green-50 rounded border border-green-200">
        <h2 class="text-xl font-semibold text-green-700">Your Account Information</h2>
        <div class="mt-2">
          <div><span class="font-bold">Email:</span> {{ user?.email }}</div>
          <div v-if="user?.name"><span class="font-bold">Name:</span> {{ user.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
