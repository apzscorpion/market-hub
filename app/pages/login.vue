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
const showPassword = ref(false)

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
    if (err.code === 'auth/popup-closed-by-user') return
    error.value = err.message || t('common.error')
  }
  finally {
    googleLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4">
    <!-- Decorative blobs -->
    <div class="fixed top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2" />
    <div class="fixed bottom-0 right-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2" />

    <div class="w-full max-w-sm relative">
      <!-- Logo / Brand -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-blue-500/30">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">{{ t('app.name') }}</h1>
        <p class="text-sm text-gray-500 mt-1">{{ t('auth.login') }}</p>
      </div>

      <!-- Card -->
      <div class="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 border border-white/60 p-6 space-y-5">
        <!-- Error -->
        <Transition name="slide-up">
          <div v-if="error" class="p-3.5 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm flex items-start gap-2.5">
            <svg class="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>{{ error }}</span>
          </div>
        </Transition>

        <!-- Email -->
        <div>
          <label for="email" class="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
            {{ t('auth.email') }}
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="you@example.com"
            class="input"
            autocomplete="email"
          >
        </div>

        <!-- Password -->
        <div>
          <label for="password" class="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
            {{ t('auth.password') }}
          </label>
          <div class="relative">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your password"
              class="input pr-10"
              autocomplete="current-password"
              @keyup.enter="handleEmailLogin"
            >
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              @click="showPassword = !showPassword"
            >
              <svg v-if="!showPassword" class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Sign In Button -->
        <button
          :disabled="loading || !email.trim() || !password.trim()"
          class="btn-primary w-full py-3"
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

        <!-- Divider -->
        <div class="flex items-center gap-3">
          <div class="flex-1 h-px bg-gray-200" />
          <span class="text-xs text-gray-400 font-medium">{{ t('auth.or') }}</span>
          <div class="flex-1 h-px bg-gray-200" />
        </div>

        <!-- Google Sign-In -->
        <button
          :disabled="googleLoading"
          class="btn-outline w-full flex items-center justify-center gap-3"
          @click="handleGoogleLogin"
        >
          <svg v-if="!googleLoading" class="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <svg v-else class="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span class="text-sm">{{ t('auth.google_sign_in') }}</span>
        </button>
      </div>

      <!-- Footer -->
      <p class="mt-6 text-center text-xs text-gray-400">
        {{ t('auth.no_account') }}
      </p>
    </div>
  </div>
</template>
