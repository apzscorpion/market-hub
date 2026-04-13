<script setup lang="ts">
const authStore = useAuthStore()

watch(
  () => [authStore.initialized, authStore.isAuthenticated, authStore.role],
  ([initialized, authenticated]) => {
    if (!initialized) return

    if (!authenticated) {
      navigateTo('/login')
      return
    }

    if (authStore.isWholesaler) {
      navigateTo('/wholesaler/dashboard')
    }
    else if (authStore.isRetailer) {
      navigateTo('/retailer/products')
    }
    else if (authStore.isDelivery) {
      navigateTo('/delivery/orders')
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-gray-900">Wholesale Deal Hub</h1>
      <p class="mt-2 text-gray-500">Loading...</p>
    </div>
  </div>
</template>
