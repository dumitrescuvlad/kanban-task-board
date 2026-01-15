import { ref } from 'vue'

export type ToastVariant = 'info' | 'success' | 'warning' | 'danger'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
  action?: ToastAction
  timeoutMs: number
}

const toasts = ref<ToastItem[]>([])

function uid(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function useToasts() {
  function show(
    message: string,
    variant: ToastVariant = 'info',
    opts?: Partial<Omit<ToastItem, 'id' | 'message' | 'variant'>>,
  ) {
    const id = uid()
    const item: ToastItem = {
      id,
      message,
      variant,
      action: opts?.action,
      timeoutMs: opts?.timeoutMs ?? 3500,
    }

    toasts.value.unshift(item)

    window.setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id)
    }, item.timeoutMs)

    return id
  }

  function dismiss(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return { toasts, show, dismiss }
}
