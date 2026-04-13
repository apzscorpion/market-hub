interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

const toasts = ref<Toast[]>([])
let nextId = 0

export function useToast() {
  function addToast(message: string, type: Toast['type'], duration = 3000): void {
    const id = nextId++
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duration)
  }

  function showSuccess(message: string): void {
    addToast(message, 'success')
  }

  function showError(message: string): void {
    addToast(message, 'error', 5000)
  }

  function showInfo(message: string): void {
    addToast(message, 'info')
  }

  function dismiss(id: number): void {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return { toasts, showSuccess, showError, showInfo, dismiss }
}
