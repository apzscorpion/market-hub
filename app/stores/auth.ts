import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '~/types/user'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const initialized = ref(false)

  const role = computed(() => user.value?.role ?? null)
  const isRetailer = computed(() => role.value === 'retailer')
  const isWholesaler = computed(() => role.value === 'wholesaler')
  const isDelivery = computed(() => role.value === 'delivery')
  const isAuthenticated = computed(() => user.value !== null)

  function setUser(newUser: User | null): void {
    user.value = newUser
  }

  function setLoading(value: boolean): void {
    loading.value = value
  }

  function setInitialized(value: boolean): void {
    initialized.value = value
  }

  function clear(): void {
    user.value = null
    initialized.value = false
  }

  return {
    user,
    loading,
    initialized,
    role,
    isRetailer,
    isWholesaler,
    isDelivery,
    isAuthenticated,
    setUser,
    setLoading,
    setInitialized,
    clear,
  }
})
