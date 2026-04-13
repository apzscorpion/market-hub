<script setup lang="ts">
import type { Order } from '~/types/order'

const props = defineProps<{
  orders: Order[]
}>()

const stats = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayOrders = props.orders.filter((o) => {
    const date = o.createdAt && 'toDate' in o.createdAt ? o.createdAt.toDate() : new Date(o.createdAt as unknown as string)
    return date >= today
  })

  return {
    total: props.orders.length,
    pending: props.orders.filter(o => o.status === 'pending').length,
    inTransit: props.orders.filter(o => o.status === 'shipped').length,
    deliveredToday: todayOrders.filter(o => o.status === 'delivered').length,
  }
})

const { formatPrice } = import.meta.client ? await import('~/utils/format') : { formatPrice: (n: number) => `₹${n}` }
</script>

<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <div class="bg-white rounded-lg border border-gray-200 p-4">
      <p class="text-sm text-gray-500">Total Orders</p>
      <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
    </div>
    <div class="bg-white rounded-lg border border-yellow-200 p-4">
      <p class="text-sm text-yellow-600">Pending</p>
      <p class="text-2xl font-bold text-yellow-700">{{ stats.pending }}</p>
    </div>
    <div class="bg-white rounded-lg border border-purple-200 p-4">
      <p class="text-sm text-purple-600">In Transit</p>
      <p class="text-2xl font-bold text-purple-700">{{ stats.inTransit }}</p>
    </div>
    <div class="bg-white rounded-lg border border-green-200 p-4">
      <p class="text-sm text-green-600">Delivered Today</p>
      <p class="text-2xl font-bold text-green-700">{{ stats.deliveredToday }}</p>
    </div>
  </div>
</template>
