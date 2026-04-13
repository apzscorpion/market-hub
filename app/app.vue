<script setup lang="ts">
const authStore = useAuthStore()
const showApp = computed(() => {
  if (import.meta.server) return true
  return authStore.initialized
})
</script>

<template>
  <!-- Loading screen -->
  <Transition name="fade">
    <div v-if="!showApp" class="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div class="text-center">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-blue-500/30 bounce-in">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div class="w-32 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
          <div class="h-full w-1/2 bg-blue-500 rounded-full animate-pulse" style="animation: shimmer 1s ease-in-out infinite;" />
        </div>
      </div>
    </div>
  </Transition>

  <template v-if="showApp">
    <CommonOfflineBanner />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </template>
</template>
