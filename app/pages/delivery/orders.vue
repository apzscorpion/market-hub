<script setup lang="ts">
import type { OrderStatus } from '~/types/order'

definePageMeta({ layout: 'delivery', middleware: 'auth' })

const { showSuccess, showError } = useToast()
const { myOrders, loading, fetchDeliveryOrders, updateOrderStatus } = useOrders()

const activeOrders = computed(() =>
  myOrders.value.filter(o => o.status === 'accepted' || o.status === 'shipped'),
)

onMounted(() => {
  fetchDeliveryOrders()
})

async function markShipped(orderId: string): Promise<void> {
  try {
    await updateOrderStatus(orderId, 'shipped')
    showSuccess('Marked as picked up')
    fetchDeliveryOrders()
  }
  catch (e) {
    showError('Failed to update')
  }
}

async function markDelivered(orderId: string): Promise<void> {
  try {
    await updateOrderStatus(orderId, 'delivered')
    showSuccess('Marked as delivered')
    fetchDeliveryOrders()
  }
  catch (e) {
    showError('Failed to update')
  }
}
</script>

<template>
  <div class="space-y-3">
    <h2 class="text-lg font-semibold text-gray-900">My Deliveries</h2>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="bg-white rounded-lg border p-4 animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-1/3 mb-2" />
        <div class="h-3 bg-gray-200 rounded w-2/3" />
      </div>
    </div>

    <div v-else-if="activeOrders.length === 0" class="text-center py-16">
      <svg class="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p class="text-gray-500 text-sm">No pending deliveries</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="order in activeOrders"
        :key="order.id"
        class="bg-white rounded-lg border border-gray-200 overflow-hidden"
      >
        <div class="p-3 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-900">Order #{{ order.id.slice(0, 8) }}</span>
            <CommonStatusBadge :status="order.status" />
          </div>

          <div class="text-sm text-gray-700">
            <p class="font-medium">{{ order.retailerName }}</p>
            <a :href="`tel:${order.retailerPhone}`" class="text-blue-600 text-xs">{{ order.retailerPhone }}</a>
          </div>

          <div class="text-xs text-gray-500">
            {{ order.items.length }} items · {{ formatPrice(order.totalAmount) }}
          </div>

          <div class="flex gap-2 pt-1">
            <button
              v-if="order.status === 'accepted'"
              class="flex-1 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              @click="markShipped(order.id)"
            >
              Picked Up
            </button>
            <button
              v-if="order.status === 'shipped'"
              class="flex-1 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700"
              @click="markDelivered(order.id)"
            >
              Delivered
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
