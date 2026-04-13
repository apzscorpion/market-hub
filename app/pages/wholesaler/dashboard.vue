<script setup lang="ts">
definePageMeta({
  layout: 'wholesaler',
})

const { t } = useI18n()
const { allOrders, loading, fetchAllOrders } = useOrders()

const statusFilter = ref('all')

const filteredOrders = computed(() => {
  if (statusFilter.value === 'all') return allOrders.value
  return allOrders.value.filter(o => o.status === statusFilter.value)
})

onMounted(() => {
  fetchAllOrders()
})

function refresh(): void {
  fetchAllOrders()
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold text-gray-900">{{ t('nav.dashboard') }}</h2>
      <button
        :disabled="loading"
        class="text-sm text-blue-600 hover:underline disabled:opacity-50"
        @click="refresh"
      >
        Refresh
      </button>
    </div>

    <!-- Quick Order Entry -->
    <div class="mb-6">
      <WholesalerVoiceOrderEntry @order-created="refresh" />
    </div>

    <WholesalerOrderStats :orders="allOrders" />

    <div class="flex items-center justify-between mb-4">
      <CommonOrderFilter v-model:status="statusFilter" />
      <span class="text-sm text-gray-500">{{ filteredOrders.length }} orders</span>
    </div>

    <!-- Loading -->
    <div v-if="loading && allOrders.length === 0" class="space-y-3">
      <div v-for="i in 5" :key="i" class="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-1/3 mb-2" />
        <div class="h-3 bg-gray-200 rounded w-1/2 mb-2" />
        <div class="h-6 bg-gray-200 rounded w-20" />
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="filteredOrders.length === 0" class="text-center py-12">
      <p class="text-gray-500">No orders found.</p>
    </div>

    <!-- Order List -->
    <div v-else class="space-y-3">
      <WholesalerOrderCard
        v-for="order in filteredOrders"
        :key="order.id"
        :order="order"
      />
    </div>
  </div>
</template>
