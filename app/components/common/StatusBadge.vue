<script setup lang="ts">
import type { OrderStatus } from '~/types/order'

defineProps<{
  status: OrderStatus
}>()

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  accepted: { label: 'Accepted', color: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
}
</script>

<template>
  <span
    :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', statusConfig[status].color]"
  >
    {{ statusConfig[status].label }}
  </span>
</template>
