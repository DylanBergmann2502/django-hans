<!-- src/components/ui/Button.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { cva } from 'class-variance-authority'

const props = withDefaults(
  defineProps<{
    variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
  }>(),
  { variant: 'default', size: 'default', type: 'button', disabled: false },
)

const buttonVariants = cva(
  'inline-flex cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:-translate-y-px hover:shadow-md active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline: 'border border-input bg-background hover:border-primary/50 hover:bg-muted',
        secondary: 'bg-muted text-foreground hover:bg-muted/80',
        ghost: 'shadow-none hover:bg-muted hover:text-foreground hover:shadow-sm',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

const classes = computed(() => buttonVariants({ variant: props.variant, size: props.size }))
</script>

<template>
  <button :type="type" :disabled="disabled" :class="classes">
    <slot />
  </button>
</template>
