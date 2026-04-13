<script setup lang="ts">
definePageMeta({ layout: 'delivery', middleware: 'auth' })

const { myOrders, loading, fetchDeliveryOrders } = useOrders()

const completedOrders = computed(() =>
  myOrders.value.filter(o => o.status === 'delivered' || o.status === 'cancelled'),
)

onMounted(() => {
  fetchDeliveryOrders()
})
</script>

<template>
  <div class="space-y-3">
    <h2 class="text-lg font-semibold text-gray-900">Delivery History</h2>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="bg-white rounded-lg border p-4 animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-1/3 mb-2" />
        <div class="h-3 bg-gray-200 rounded w-2/3" />
      </div>
    </div>

    <div v-else-if="completedOrders.length === 0" class="text-center py-16">
      <p class="text-gray-500 text-sm">No delivery history yet</p>
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="order in completedOrders"
        :key="order.id"
        class="bg-white rounded-lg border border-gray-200 p-3"
      >
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-900">Order #{{ order.id.slice(0, 8) }}</span>
          <CommonStatusBadge :status="order.status" />
        </div>
        <p class="text-sm text-gray-600 mt-1">{{ order.retailerName }}</p>
        <div class="flex items-center justify-between mt-1">
          <span class="text-xs text-gray-400">{{ order.items.length }} items · {{ formatPrice(order.totalAmount) }}</span>
          <span class="text-xs text-gray-400">{{ formatDate(order.updatedAt) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
