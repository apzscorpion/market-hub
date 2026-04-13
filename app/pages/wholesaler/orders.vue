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
  if (allOrders.value.length === 0) fetchAllOrders()
})
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold text-gray-900">All {{ t('nav.orders') }}</h2>
      <CommonOrderFilter v-model:status="statusFilter" />
    </div>

    <div v-if="loading && allOrders.length === 0" class="space-y-3">
      <div v-for="i in 5" :key="i" class="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-1/3 mb-2" />
        <div class="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>

    <div v-else-if="filteredOrders.length === 0" class="text-center py-12">
      <p class="text-gray-500">No orders found.</p>
    </div>

    <div v-else class="space-y-3">
      <WholesalerOrderCard
        v-for="order in filteredOrders"
        :key="order.id"
        :order="order"
      />
    </div>
  </div>
</template>
