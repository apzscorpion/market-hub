import { onAuthStateChanged, signInWithPhoneNumber, signOut, RecaptchaVerifier } from 'firebase/auth'
import type { ConfirmationResult } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import type { User } from '~/types/user'

let confirmationResult: ConfirmationResult | null = null
let recaptchaVerifier: RecaptchaVerifier | null = null

export function useAuth() {
  const { $firebaseAuth, $firebaseDb } = useNuxtApp()
  const authStore = useAuthStore()

  async function fetchUserProfile(uid: string): Promise<User | null> {
    const userDoc = await getDoc(doc($firebaseDb, 'users', uid))
    if (!userDoc.exists()) return null
    return { id: userDoc.id, ...userDoc.data() } as User
  }

  function initRecaptcha(elementId: string): void {
    if (recaptchaVerifier) return
    recaptchaVerifier = new RecaptchaVerifier($firebaseAuth, elementId, {
      size: 'invisible',
    })
  }

  async function sendOtp(phoneNumber: string): Promise<void> {
    if (!recaptchaVerifier) {
      initRecaptcha('recaptcha-container')
    }
    confirmationResult = await signInWithPhoneNumber(
      $firebaseAuth,
      phoneNumber,
      recaptchaVerifier!,
    )
  }

  async function verifyOtp(code: string): Promise<User | null> {
    if (!confirmationResult) {
      throw new Error('No OTP was sent. Please request a new OTP.')
    }
    const credential = await confirmationResult.confirm(code)
    const profile = await fetchUserProfile(credential.user.uid)
    authStore.setUser(profile)
    return profile
  }

  async function logout(): Promise<void> {
    await signOut($firebaseAuth)
    authStore.clear()
    confirmationResult = null
    recaptchaVerifier = null
    await navigateTo('/login')
  }

  function initAuthListener(): void {
    onAuthStateChanged($firebaseAuth, async (firebaseUser) => {
      authStore.setLoading(true)
      try {
        if (firebaseUser) {
          const profile = await fetchUserProfile(firebaseUser.uid)
          authStore.setUser(profile)
        }
        else {
          authStore.setUser(null)
        }
      }
      catch (e) {
        console.error('[useAuth] Failed to fetch user profile:', e)
        authStore.setUser(null)
      }
      finally {
        authStore.setLoading(false)
        authStore.setInitialized(true)
      }
    })
  }

  return {
    user: computed(() => authStore.user),
    role: computed(() => authStore.role),
    loading: computed(() => authStore.loading),
    initialized: computed(() => authStore.initialized),
    isRetailer: computed(() => authStore.isRetailer),
    isWholesaler: computed(() => authStore.isWholesaler),
    isDelivery: computed(() => authStore.isDelivery),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    sendOtp,
    verifyOtp,
    logout,
    initAuthListener,
    fetchUserProfile,
  }
}
