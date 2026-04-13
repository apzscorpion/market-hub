<script setup lang="ts">
import type { Order } from '~/types/order'
import { formatPrice, formatDate } from '~/utils/format'

defineProps<{
  order: Order
}>()
</script>

<template>
  <NuxtLink
    :to="`/wholesaler/orders/${order.id}`"
    class="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
  >
    <div class="flex items-start justify-between">
      <div>
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-gray-900">Order #{{ order.id.slice(0, 8) }}</span>
          <CommonStatusBadge :status="order.status" />
        </div>
        <p class="text-sm text-gray-700 mt-1">{{ order.retailerName }}</p>
        <p class="text-xs text-gray-500 mt-0.5">
          {{ order.items.length }} items &middot; {{ formatPrice(order.totalAmount) }}
        </p>
      </div>
      <span class="text-xs text-gray-400">{{ formatDate(order.createdAt) }}</span>
    </div>
  </NuxtLink>
</template>
