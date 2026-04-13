<script setup lang="ts">
const authStore = useAuthStore()
const showApp = computed(() => {
  // On server, always render (for prerender/SEO)
  if (import.meta.server) return true
  // On client, wait for auth to initialize
  return authStore.initialized
})
</script>

<template>
  <div v-if="!showApp" class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <svg class="animate-spin h-8 w-8 text-blue-600 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <p class="text-sm text-gray-500">Loading...</p>
    </div>
  </div>
  <template v-else>
    <CommonOfflineBanner />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </template>
</template>
