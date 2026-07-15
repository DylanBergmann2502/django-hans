// src/composables/useToast.ts
import { ref } from 'vue'

export type ToastVariant = 'default' | 'success' | 'error' | 'warning'
export type Toast = { id: number; title: string; description?: string; variant: ToastVariant }

const toasts = ref<Toast[]>([])
let nextId = 0

export function useToast() {
  const add = (toast: Omit<Toast, 'id'>) => {
    const id = nextId++
    toasts.value.push({ ...toast, id })
    window.setTimeout(() => dismiss(id), 5000)
  }

  const dismiss = (id: number) => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  return { toasts, add, dismiss }
}
