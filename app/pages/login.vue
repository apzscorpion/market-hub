<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const { t } = useI18n()
const { sendOtp, verifyOtp, isAuthenticated } = useAuth()
const authStore = useAuthStore()

const phone = ref('')
const otp = ref('')
const otpSent = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const resendTimer = ref(0)
let resendInterval: ReturnType<typeof setInterval> | null = null

// Redirect if already authenticated
watch(
  () => authStore.isAuthenticated,
  (authenticated) => {
    if (authenticated) navigateTo('/')
  },
  { immediate: true },
)

function formatPhone(value: string): string {
  // Ensure +91 prefix for Indian numbers
  const digits = value.replace(/\D/g, '')
  if (digits.startsWith('91') && digits.length >= 12) return `+${digits}`
  if (digits.length === 10) return `+91${digits}`
  return value.startsWith('+') ? value : `+${value}`
}

function startResendTimer(): void {
  resendTimer.value = 30
  resendInterval = setInterval(() => {
    resendTimer.value--
    if (resendTimer.value <= 0 && resendInterval) {
      clearInterval(resendInterval)
      resendInterval = null
    }
  }, 1000)
}

async function handleSendOtp(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    const formatted = formatPhone(phone.value)
    await sendOtp(formatted)
    otpSent.value = true
    startResendTimer()
  }
  catch (e) {
    const err = e as { code?: string; message?: string }
    if (err.code === 'auth/invalid-phone-number') {
      error.value = 'Invalid phone number. Please enter a valid Indian number.'
    }
    else if (err.code === 'auth/too-many-requests') {
      error.value = 'Too many attempts. Please try again later.'
    }
    else {
      error.value = err.message || 'Failed to send OTP. Please try again.'
    }
  }
  finally {
    loading.value = false
  }
}

async function handleVerifyOtp(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    const profile = await verifyOtp(otp.value)
    if (!profile) {
      // User authenticated but no Firestore profile
      await navigateTo('/no-access')
      return
    }
    await navigateTo('/')
  }
  catch (e) {
    const err = e as { code?: string; message?: string }
    if (err.code === 'auth/invalid-verification-code') {
      error.value = 'Invalid OTP. Please check and try again.'
    }
    else if (err.code === 'auth/code-expired') {
      error.value = 'OTP expired. Please request a new one.'
    }
    else {
      error.value = err.message || 'Verification failed. Please try again.'
    }
  }
  finally {
    loading.value = false
  }
}

function resetToPhone(): void {
  otpSent.value = false
  otp.value = ''
  error.value = null
  if (resendInterval) {
    clearInterval(resendInterval)
    resendInterval = null
  }
}

onUnmounted(() => {
  if (resendInterval) clearInterval(resendInterval)
})
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

      <!-- Phone Input -->
      <div v-if="!otpSent">
        <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
          {{ t('auth.phone') }}
        </label>
        <input
          id="phone"
          v-model="phone"
          type="tel"
          placeholder="+91 98765 43210"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          @keyup.enter="handleSendOtp"
        >
        <button
          :disabled="loading || !phone.trim()"
          class="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          @click="handleSendOtp"
        >
          <span v-if="loading" class="inline-flex items-center gap-2">
            <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Sending...
          </span>
          <span v-else>{{ t('auth.send_otp') }}</span>
        </button>
      </div>

      <!-- OTP Input -->
      <div v-else>
        <label for="otp" class="block text-sm font-medium text-gray-700 mb-1">
          {{ t('auth.otp') }}
        </label>
        <input
          id="otp"
          v-model="otp"
          type="text"
          inputmode="numeric"
          maxlength="6"
          placeholder="123456"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent tracking-widest text-center text-lg"
          @keyup.enter="handleVerifyOtp"
        >
        <button
          :disabled="loading || otp.length < 6"
          class="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          @click="handleVerifyOtp"
        >
          <span v-if="loading" class="inline-flex items-center gap-2">
            <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Verifying...
          </span>
          <span v-else>{{ t('auth.verify') }}</span>
        </button>

        <div class="mt-3 flex items-center justify-between">
          <button
            class="text-sm text-gray-500 hover:text-gray-700"
            @click="resetToPhone"
          >
            {{ t('auth.change_phone') }}
          </button>
          <button
            v-if="resendTimer <= 0"
            class="text-sm text-blue-600 hover:text-blue-700"
            @click="handleSendOtp"
          >
            Resend OTP
          </button>
          <span v-else class="text-sm text-gray-400">
            Resend in {{ resendTimer }}s
          </span>
        </div>
      </div>

      <div id="recaptcha-container" />
    </div>
  </div>
</template>
