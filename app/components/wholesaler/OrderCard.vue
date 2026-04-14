<script setup lang="ts">
import type { Order, OrderStatus } from '~/types/order'
import { formatPrice, formatDate } from '~/utils/format'

const props = defineProps<{
  order: Order
}>()

const emit = defineEmits<{
  open: [order: Order]
}>()

const { updateOrderStatus } = useOrders()
const { showSuccess, showError } = useToast()
const processing = ref(false)

const quickActions = computed(() => {
  const actions: { label: string, status: OrderStatus, color: string, icon: string }[] = []
  switch (props.order.status) {
    case 'pending':
      actions.push({ label: 'Accept', status: 'accepted', color: 'bg-blue-600 hover:bg-blue-700', icon: 'M5 13l4 4L19 7' })
      break
    case 'accepted':
      actions.push({ label: 'Ship', status: 'shipped', color: 'bg-purple-600 hover:bg-purple-700', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8' })
      break
    case 'shipped':
      actions.push({ label: 'Delivered', status: 'delivered', color: 'bg-emerald-600 hover:bg-emerald-700', icon: 'M5 13l4 4L19 7' })
      break
  }
  return actions
})

async function quickAction(status: OrderStatus, e: Event) {
  e.stopPropagation()
  if (processing.value) return
  processing.value = true
  try {
    await updateOrderStatus(props.order.id, status)
    showSuccess(`Order ${status}`)
  }
  catch (err) {
    showError((err as Error).message || 'Failed to update')
  }
  finally {
    processing.value = false
  }
}

function openDrawer() {
  emit('open', props.order)
}

const statusColor: Record<OrderStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  accepted: 'bg-blue-50 text-blue-700 border-blue-200',
  shipped: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
}

const statusDot: Record<OrderStatus, string> = {
  pending: 'bg-amber-400',
  accepted: 'bg-blue-500',
  shipped: 'bg-purple-500',
  delivered: 'bg-emerald-500',
  cancelled: 'bg-red-500',
}
</script>

<template>
  <div
    class="card overflow-hidden cursor-pointer hover:shadow-lg hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-200 group"
    @click="openDrawer"
  >
    <div class="p-4">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 mb-1">
            <span class="font-semibold text-sm text-gray-900">#{{ order.id.slice(0, 8) }}</span>
            <span
              :class="[
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize',
                statusColor[order.status],
              ]"
            >
              <span :class="['w-1.5 h-1.5 rounded-full', statusDot[order.status]]" />
              {{ order.status }}
            </span>
          </div>
          <p class="text-sm font-medium text-gray-800 truncate">{{ order.retailerName }}</p>
          <p class="text-xs text-gray-500 mt-0.5">
            {{ order.items.length }} items · <span class="font-semibold text-gray-700">{{ formatPrice(order.totalAmount) }}</span>
          </p>
        </div>
        <div class="text-right shrink-0 flex flex-col items-end gap-1">
          <span class="text-[11px] text-gray-400">{{ formatDate(order.createdAt) }}</span>
          <svg class="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      <!-- Items preview (always visible) -->
      <div v-if="order.items.length > 0" class="mt-2 flex flex-wrap gap-1">
        <span
          v-for="item in order.items.slice(0, 4)"
          :key="item.productId"
          class="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600"
        >
          {{ item.quantity }}× {{ item.nickname || item.productName }}
        </span>
        <span
          v-if="order.items.length > 4"
          class="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500"
        >
          +{{ order.items.length - 4 }}
        </span>
      </div>
    </div>

    <!-- Quick action buttons (appear on hover on desktop, always visible on mobile) -->
    <div
      v-if="quickActions.length > 0"
      class="border-t border-gray-100 px-3 py-2 flex gap-2 bg-gray-50/30"
    >
      <button
        v-for="action in quickActions"
        :key="action.status"
        :disabled="processing"
        :class="[
          'flex-1 inline-flex items-center justify-center gap-1 py-1.5 text-xs font-semibold text-white rounded-lg transition-all duration-200 active:scale-95 shadow-sm disabled:opacity-50',
          action.color,
        ]"
        @click="(e) => quickAction(action.status, e)"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" :d="action.icon" />
        </svg>
        {{ action.label }}
      </button>
    </div>
  </div>
</template>
