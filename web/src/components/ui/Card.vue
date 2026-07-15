<!-- src/components/ui/Card.vue -->
<script setup lang="ts">
import { cn } from '@/lib/utils'

defineProps<{ class?: string }>()
</script>

<template>
  <div :class="cn('rounded-xl border bg-background text-foreground shadow-sm', $props.class)">
    <slot />
  </div>
</template>
