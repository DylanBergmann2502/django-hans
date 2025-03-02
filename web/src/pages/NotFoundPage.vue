// src/pages/NotFoundPage.vue
<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12">
    <div class="text-center">
      <h1 class="text-9xl font-bold text-green-600">404</h1>
      <h2 class="text-4xl font-bold mt-4 mb-8 text-gray-800">Page Not Found</h2>
      <p class="text-lg text-gray-600 mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Button
        label="Go Home"
        icon="pi pi-home"
        class="p-button-success p-button-lg"
        @click="goHome"
      />
    </div>
  </div>
</template>
