<!-- src/components/ui/Input.vue -->
<script setup lang="ts">
import { cn } from '@/lib/utils'

defineProps<{ class?: string }>()
const model = defineModel<string>({ default: '' })
</script>

<template>
  <input
    v-model="model"
    v-bind="$attrs"
    :class="
      cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        $props.class,
      )
    "
  />
</template>
