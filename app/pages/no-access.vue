<script setup lang="ts">
import { signOut } from 'firebase/auth'

definePageMeta({
  layout: 'default',
})

const { t } = useI18n()
const { $firebaseAuth } = useNuxtApp()
const authStore = useAuthStore()

async function handleLogout(): Promise<void> {
  await signOut($firebaseAuth)
  authStore.clear()
  await navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
      <div class="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
        <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h1 class="text-xl font-bold text-gray-900 mb-2">
        {{ t('auth.no_account') }}
      </h1>
      <p class="text-gray-500 text-sm mb-6">
        Your phone number is not registered in the system. Please contact your wholesaler to get access.
      </p>
      <button
        class="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
        @click="handleLogout"
      >
        {{ t('auth.logout') }}
      </button>
    </div>
  </div>
</template>
