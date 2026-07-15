<!-- src/components/ui/PasswordInput.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { Eye, EyeOff } from '@lucide/vue'
import { cn } from '@/lib/utils'
import Input from './Input.vue'

defineProps<{ class?: string }>()
const model = defineModel<string>({ default: '' })
const visible = ref(false)
</script>

<template>
  <div class="relative">
    <Input
      v-model="model"
      :type="visible ? 'text' : 'password'"
      :class="cn('pr-10', $props.class)"
      v-bind="$attrs"
    />
    <button
      type="button"
      class="absolute right-0 top-0 h-10 cursor-pointer px-3 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      :aria-label="visible ? 'Hide password' : 'Show password'"
      @click="visible = !visible"
    >
      <EyeOff v-if="visible" :size="16" />
      <Eye v-else :size="16" />
    </button>
  </div>
</template>
