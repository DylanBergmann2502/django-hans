<!-- src/components/ui/Toaster.vue -->
<script setup lang="ts">
import { X } from '@lucide/vue'
import { useToast } from '@/composables/useToast'

const { toasts, dismiss } = useToast()
</script>

<template>
  <div class="fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="rounded-lg border p-4 shadow-lg"
      :class="{
        'border-green-200 bg-green-50 text-green-950': toast.variant === 'success',
        'border-red-200 bg-red-50 text-red-950': toast.variant === 'error',
        'border-yellow-200 bg-yellow-50 text-yellow-950': toast.variant === 'warning',
        'border-border bg-background text-foreground': toast.variant === 'default',
      }"
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="font-semibold">{{ toast.title }}</p>
          <p v-if="toast.description" class="mt-1 whitespace-pre-line text-sm opacity-80">
            {{ toast.description }}
          </p>
        </div>
        <button
          type="button"
          class="cursor-pointer opacity-70 transition-opacity hover:opacity-100"
          aria-label="Dismiss notification"
          @click="dismiss(toast.id)"
        >
          <X :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>
