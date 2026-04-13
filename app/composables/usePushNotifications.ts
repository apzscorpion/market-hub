import { doc, updateDoc } from 'firebase/firestore'

export function usePushNotifications() {
  const supported = ref(false)
  const permission = ref<NotificationPermission>('default')
  const token = ref<string | null>(null)

  if (import.meta.client) {
    supported.value = 'Notification' in window && 'serviceWorker' in navigator
    permission.value = supported.value ? Notification.permission : 'denied'
  }

  async function requestPermission(): Promise<boolean> {
    if (!supported.value) return false

    const result = await Notification.requestPermission()
    permission.value = result
    return result === 'granted'
  }

  async function saveTokenToUser(): Promise<void> {
    if (!token.value) return
    const { $firebaseDb } = useNuxtApp()
    const authStore = useAuthStore()
    if (!authStore.user) return

    try {
      await updateDoc(doc($firebaseDb, 'users', authStore.user.id), {
        fcmToken: token.value,
      })
    }
    catch (e) {
      console.error('[push] Failed to save token:', e)
    }
  }

  function showLocalNotification(title: string, body: string): void {
    if (permission.value !== 'granted') return
    new Notification(title, { body, icon: '/icons/icon-192.png' })
  }

  return {
    supported,
    permission,
    token,
    requestPermission,
    saveTokenToUser,
    showLocalNotification,
  }
}
