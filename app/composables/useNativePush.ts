import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'
import { doc, updateDoc } from 'firebase/firestore'

export function useNativePush() {
  const isNative = Capacitor.isNativePlatform()
  const token = ref<string | null>(null)
  const permissionGranted = ref(false)

  async function register(): Promise<void> {
    if (!isNative) return

    const permission = await PushNotifications.requestPermissions()
    if (permission.receive !== 'granted') return

    permissionGranted.value = true
    await PushNotifications.register()

    PushNotifications.addListener('registration', async (regToken) => {
      token.value = regToken.value
      await saveTokenToFirestore(regToken.value)
    })

    PushNotifications.addListener('registrationError', (err) => {
      console.error('[push] Registration error:', err.error)
    })

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('[push] Received:', notification)
    })

    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('[push] Action:', action)
      const data = action.notification.data
      if (data?.orderId) {
        navigateTo(`/retailer/orders/${data.orderId}`)
      }
    })
  }

  async function saveTokenToFirestore(fcmToken: string): Promise<void> {
    const { $firebaseDb } = useNuxtApp()
    const authStore = useAuthStore()
    if (!authStore.user) return

    try {
      await updateDoc(doc($firebaseDb, 'users', authStore.user.id), {
        fcmToken,
        fcmPlatform: Capacitor.getPlatform(),
      })
    }
    catch (e) {
      console.error('[push] Failed to save token:', e)
    }
  }

  return { isNative, token, permissionGranted, register }
}
