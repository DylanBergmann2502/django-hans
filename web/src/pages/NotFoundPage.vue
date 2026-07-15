<!-- src/pages/NotFoundPage.vue -->
<script setup lang="ts">
import { Home } from '@lucide/vue'
import { useRouter } from 'vue-router'
import Button from '@/components/ui/Button.vue'

const router = useRouter()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <h1 class="text-9xl font-bold text-green-600">404</h1>
    <h2 class="mb-8 mt-4 text-4xl font-bold">Page Not Found</h2>
    <p class="mb-8 text-lg text-muted-foreground">
      The page you are looking for doesn't exist or has been moved.
    </p>
    <Button @click="router.push('/')"><Home :size="16" /> Go Home</Button>
  </div>
</template>
