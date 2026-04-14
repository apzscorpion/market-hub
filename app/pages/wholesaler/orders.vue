<script setup lang="ts">
import type { Order } from '~/types/order'

definePageMeta({ layout: 'wholesaler' })

const { t } = useI18n()
const { allOrders, loading, fetchAllOrders } = useOrders()

const statusFilter = ref('all')
const activeOrder = ref<Order | null>(null)
const drawerOpen = ref(false)

const filteredOrders = computed(() => {
  if (statusFilter.value === 'all') return allOrders.value
  return allOrders.value.filter(o => o.status === statusFilter.value)
})

function openDrawer(order: Order) {
  activeOrder.value = order
  drawerOpen.value = true
}

function closeDrawer() {
  drawerOpen.value = false
}

// When order updates in real-time, refresh the active one
watch(allOrders, (orders) => {
  if (activeOrder.value) {
    const updated = orders.find(o => o.id === activeOrder.value!.id)
    if (updated) activeOrder.value = updated
  }
}, { deep: true })

onMounted(() => {
  if (allOrders.value.length === 0) fetchAllOrders()
})
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between gap-2 flex-wrap">
      <h2 class="text-xl font-semibold text-gray-900">All {{ t('nav.orders') }}</h2>
      <CommonOrderFilter v-model:status="statusFilter" />
    </div>

    <p class="text-xs text-gray-500">
      Tap an order to see details and change status
    </p>

    <div v-if="loading && allOrders.length === 0" class="space-y-3">
      <div v-for="i in 5" :key="i" class="card-flat p-4 animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-1/3 mb-2" />
        <div class="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>

    <div v-else-if="filteredOrders.length === 0" class="text-center py-12">
      <p class="text-gray-500">No orders found.</p>
    </div>

    <TransitionGroup v-else name="list" tag="div" class="space-y-2">
      <WholesalerOrderCard
        v-for="order in filteredOrders"
        :key="order.id"
        :order="order"
        @open="openDrawer"
      />
    </TransitionGroup>

    <!-- Detail drawer -->
    <WholesalerOrderDetailDrawer
      :order="activeOrder"
      :open="drawerOpen"
      @close="closeDrawer"
    />
  </div>
</template>
