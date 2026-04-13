import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import type { User } from '~/types/user'

export default defineNuxtPlugin(async () => {
  const { $firebaseAuth, $firebaseDb } = useNuxtApp()
  const authStore = useAuthStore()

  // Wait for initial auth state
  await new Promise<void>((resolve) => {
    const unsubscribe = onAuthStateChanged($firebaseAuth, async (firebaseUser) => {
      authStore.setLoading(true)
      try {
        if (firebaseUser) {
          const userDoc = await getDoc(doc($firebaseDb, 'users', firebaseUser.uid))
          if (userDoc.exists()) {
            authStore.setUser({ id: userDoc.id, ...userDoc.data() } as User)
          }
          else {
            // User exists in Firebase Auth but not in Firestore (no role assigned)
            authStore.setUser(null)
          }
        }
        else {
          authStore.setUser(null)
        }
      }
      catch (e) {
        console.error('[auth plugin] Failed to fetch user profile:', e)
        authStore.setUser(null)
      }
      finally {
        authStore.setLoading(false)
        authStore.setInitialized(true)
        resolve()
      }
    })

    // Keep the listener active for the app lifetime
    // Store the unsubscribe function if needed for cleanup
    if (import.meta.hot) {
      import.meta.hot.dispose(() => unsubscribe())
    }
  })
})
