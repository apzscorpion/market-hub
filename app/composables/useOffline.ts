export function useOffline() {
  const isOnline = ref(true)
  const showOfflineBanner = ref(false)

  if (import.meta.client) {
    isOnline.value = navigator.onLine

    const updateStatus = () => {
      isOnline.value = navigator.onLine
      showOfflineBanner.value = !navigator.onLine
    }

    onMounted(() => {
      window.addEventListener('online', updateStatus)
      window.addEventListener('offline', updateStatus)
    })

    onUnmounted(() => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
    })
  }

  function dismissBanner(): void {
    showOfflineBanner.value = false
  }

  return { isOnline, showOfflineBanner, dismissBanner }
}
