import {
  collection, doc, addDoc, updateDoc, getDocs, query, orderBy, serverTimestamp,
} from 'firebase/firestore'
import type { User } from '~/types/user'

export function useUserAdmin() {
  const { $firebaseDb } = useNuxtApp()
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchUsers(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const q = query(collection($firebaseDb, 'users'), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      users.value = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
      })) as User[]
    }
    catch (e) {
      error.value = (e as Error).message
    }
    finally {
      loading.value = false
    }
  }

  async function createUser(data: {
    name: string
    email: string
    phone?: string
    role: User['role']
    address?: string
  }): Promise<string> {
    const docRef = await addDoc(collection($firebaseDb, 'users'), {
      ...data,
      active: true,
      fcmTokens: [],
      preferredLanguage: 'ml',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    await fetchUsers()
    return docRef.id
  }

  async function updateUser(id: string, data: Partial<Pick<User, 'name' | 'email' | 'phone' | 'role' | 'address' | 'active'>>): Promise<void> {
    await updateDoc(doc($firebaseDb, 'users', id), {
      ...data,
      updatedAt: serverTimestamp(),
    })
    await fetchUsers()
  }

  async function toggleUserActive(id: string, active: boolean): Promise<void> {
    await updateDoc(doc($firebaseDb, 'users', id), {
      active,
      updatedAt: serverTimestamp(),
    })
    await fetchUsers()
  }

  const retailers = computed(() => users.value.filter(u => u.role === 'retailer'))
  const deliveryPersonnel = computed(() => users.value.filter(u => u.role === 'delivery'))

  return {
    users,
    retailers,
    deliveryPersonnel,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    toggleUserActive,
  }
}
