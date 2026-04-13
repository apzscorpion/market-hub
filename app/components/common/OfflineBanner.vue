<script setup lang="ts">
const { showOfflineBanner, dismissBanner } = useOffline()
</script>

<template>
  <Transition name="slide">
    <div v-if="showOfflineBanner" class="fixed top-0 inset-x-0 z-50 bg-amber-500 text-white text-center text-xs py-1.5 px-4 flex items-center justify-center gap-2">
      <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728M5.636 5.636a9 9 0 000 12.728M12 12h.01" />
      </svg>
      <span>You're offline. Some features may be unavailable.</span>
      <button class="ml-1 font-semibold underline" @click="dismissBanner">Dismiss</button>
    </div>
  </Transition>
</template>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: transform 0.3s ease, opacity 0.3s ease; }
.slide-enter-from, .slide-leave-to { transform: translateY(-100%); opacity: 0; }
</style>
