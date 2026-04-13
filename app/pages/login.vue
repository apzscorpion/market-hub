<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const { t } = useI18n()
const { loginWithEmail, loginWithGoogle, isAuthenticated } = useAuth()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const googleLoading = ref(false)
const error = ref<string | null>(null)

// Redirect if already authenticated
watch(
  () => authStore.isAuthenticated,
  (authenticated) => {
    if (authenticated) navigateTo('/')
  },
  { immediate: true },
)

async function handleEmailLogin(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    const profile = await loginWithEmail(email.value, password.value)
    if (!profile) {
      await navigateTo('/no-access')
      return
    }
    await navigateTo('/')
  }
  catch (e) {
    const err = e as { code?: string; message?: string }
    if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
      error.value = t('auth.error_invalid')
    }
    else if (err.code === 'auth/user-not-found') {
      error.value = t('auth.error_not_found')
    }
    else if (err.code === 'auth/too-many-requests') {
      error.value = t('auth.error_too_many')
    }
    else {
      error.value = err.message || t('common.error')
    }
  }
  finally {
    loading.value = false
  }
}

async function handleGoogleLogin(): Promise<void> {
  googleLoading.value = true
  error.value = null
  try {
    const profile = await loginWithGoogle()
    if (!profile) {
      await navigateTo('/no-access')
      return
    }
    await navigateTo('/')
  }
  catch (e) {
    const err = e as { code?: string; message?: string }
    if (err.code === 'auth/popup-closed-by-user') {
      // User closed popup, no error needed
      return
    }
    error.value = err.message || t('common.error')
  }
  finally {
    googleLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8">
      <h1 class="text-2xl font-bold text-center text-gray-900 mb-2">
        {{ t('app.name') }}
      </h1>
      <p class="text-center text-gray-500 text-sm mb-6">
        {{ t('auth.login') }}
      </p>

      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
        {{ error }}
      </div>

      <!-- Email/Password Login -->
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
          {{ t('auth.email') }}
        </label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="you@example.com"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >

        <label for="password" class="block text-sm font-medium text-gray-700 mb-1 mt-4">
          {{ t('auth.password') }}
        </label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="********"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          @keyup.enter="handleEmailLogin"
        >

        <button
          :disabled="loading || !email.trim() || !password.trim()"
          class="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          @click="handleEmailLogin"
        >
          <span v-if="loading" class="inline-flex items-center gap-2">
            <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ t('common.loading') }}
          </span>
          <span v-else>{{ t('auth.sign_in') }}</span>
        </button>
      </div>

      <!-- Divider -->
      <div class="my-6 flex items-center">
        <div class="flex-1 border-t border-gray-300" />
        <span class="px-3 text-sm text-gray-500">{{ t('auth.or') }}</span>
        <div class="flex-1 border-t border-gray-300" />
      </div>

      <!-- Google Sign-In -->
      <button
        :disabled="googleLoading"
        class="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        @click="handleGoogleLogin"
      >
        <svg v-if="!googleLoading" class="h-5 w-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        <svg v-else class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        {{ t('auth.google_sign_in') }}
      </button>

      <p class="mt-6 text-center text-xs text-gray-400">
        {{ t('auth.no_account') }}
      </p>
    </div>
  </div>
</template>
