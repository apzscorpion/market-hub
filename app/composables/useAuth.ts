import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import type { User } from '~/types/user'

const googleProvider = new GoogleAuthProvider()

export function useAuth() {
  const { $firebaseAuth, $firebaseDb } = useNuxtApp()
  const authStore = useAuthStore()

  async function fetchUserProfile(uid: string): Promise<User | null> {
    const userDoc = await getDoc(doc($firebaseDb, 'users', uid))
    if (!userDoc.exists()) return null
    return { id: userDoc.id, ...userDoc.data() } as User
  }

  async function loginWithEmail(email: string, password: string): Promise<User | null> {
    const credential = await signInWithEmailAndPassword($firebaseAuth, email, password)
    const profile = await fetchUserProfile(credential.user.uid)
    authStore.setUser(profile)
    return profile
  }

  async function registerWithEmail(email: string, password: string): Promise<User | null> {
    const credential = await createUserWithEmailAndPassword($firebaseAuth, email, password)
    const profile = await fetchUserProfile(credential.user.uid)
    authStore.setUser(profile)
    return profile
  }

  async function loginWithGoogle(): Promise<User | null> {
    const credential = await signInWithPopup($firebaseAuth, googleProvider)
    let profile = await fetchUserProfile(credential.user.uid)

    // Auto-create profile for Google sign-in users if they don't have one
    if (!profile && credential.user.email) {
      const newUser: Omit<User, 'id'> = {
        name: credential.user.displayName || credential.user.email,
        email: credential.user.email,
        role: 'retailer',
        active: true,
        preferredLanguage: 'en',
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any,
      }
      await setDoc(doc($firebaseDb, 'users', credential.user.uid), newUser)
      profile = { id: credential.user.uid, ...newUser }
    }

    authStore.setUser(profile)
    return profile
  }

  async function logout(): Promise<void> {
    await signOut($firebaseAuth)
    authStore.clear()
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
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    logout,
    initAuthListener,
    fetchUserProfile,
  }
}
