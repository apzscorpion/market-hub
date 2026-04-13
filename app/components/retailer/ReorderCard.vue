<script setup lang="ts">
import type { Order } from '~/types/order'

defineProps<{
  order: Order
}>()

const emit = defineEmits<{
  load: [order: Order]
}>()
</script>

<template>
  <button
    class="flex-shrink-0 w-36 bg-white border border-gray-200 rounded-lg p-3 text-left hover:border-blue-300 hover:shadow-sm transition-all"
    @click="emit('load', order)"
  >
    <p class="text-xs text-gray-500">{{ formatDateShort(order.createdAt) }}</p>
    <p class="text-sm font-medium text-gray-900 mt-1">{{ order.items.length }} items</p>
    <p class="text-sm font-semibold text-gray-700">{{ formatPrice(order.totalAmount) }}</p>
    <p class="text-xs text-blue-600 mt-2">Load →</p>
  </button>
</template>
