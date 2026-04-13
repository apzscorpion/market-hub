<script setup lang="ts">
import type { OrderStatus } from '~/types/order'

definePageMeta({ layout: 'wholesaler' })

const { t } = useI18n()
const { showSuccess, showError } = useToast()
const { allOrders, loading, fetchAllOrders, bulkUpdateStatus } = useOrders()

const statusFilter = ref('all')
const selectedIds = ref<Set<string>>(new Set())
const bulkProcessing = ref(false)

const filteredOrders = computed(() => {
  if (statusFilter.value === 'all') return allOrders.value
  return allOrders.value.filter(o => o.status === statusFilter.value)
})

const selectMode = computed(() => selectedIds.value.size > 0)
const allSelected = computed(() =>
  filteredOrders.value.length > 0 && filteredOrders.value.every(o => selectedIds.value.has(o.id)),
)

function toggleSelect(id: string): void {
  if (selectedIds.value.has(id)) selectedIds.value.delete(id)
  else selectedIds.value.add(id)
  selectedIds.value = new Set(selectedIds.value)
}

function toggleAll(): void {
  if (allSelected.value) {
    selectedIds.value = new Set()
  }
  else {
    selectedIds.value = new Set(filteredOrders.value.map(o => o.id))
  }
}

function clearSelection(): void {
  selectedIds.value = new Set()
}

async function bulkAction(status: OrderStatus): Promise<void> {
  if (selectedIds.value.size === 0 || bulkProcessing.value) return
  bulkProcessing.value = true
  try {
    const ids = Array.from(selectedIds.value)
    const { success, failed } = await bulkUpdateStatus(ids, status)
    if (failed === 0) showSuccess(`${success} order(s) updated to ${status}`)
    else showError(`${success} updated, ${failed} failed`)
    clearSelection()
  }
  catch {
    showError('Bulk update failed')
  }
  finally {
    bulkProcessing.value = false
  }
}

onMounted(() => {
  if (allOrders.value.length === 0) fetchAllOrders()
})
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between gap-2 flex-wrap">
      <h2 class="text-lg sm:text-xl font-semibold text-gray-900">All {{ t('nav.orders') }}</h2>
      <CommonOrderFilter v-model:status="statusFilter" />
    </div>

    <!-- Bulk action bar -->
    <div v-if="selectMode" class="bg-blue-50 border border-blue-200 rounded-lg p-3 flex flex-wrap items-center gap-2">
      <span class="text-sm text-blue-700 font-medium">{{ selectedIds.size }} selected</span>
      <div class="flex gap-1.5 flex-wrap">
        <button class="px-3 py-1 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-700" :disabled="bulkProcessing" @click="bulkAction('accepted')">Accept</button>
        <button class="px-3 py-1 text-xs font-medium bg-purple-600 text-white rounded hover:bg-purple-700" :disabled="bulkProcessing" @click="bulkAction('shipped')">Ship</button>
        <button class="px-3 py-1 text-xs font-medium bg-emerald-600 text-white rounded hover:bg-emerald-700" :disabled="bulkProcessing" @click="bulkAction('delivered')">Deliver</button>
        <button class="px-3 py-1 text-xs font-medium bg-red-600 text-white rounded hover:bg-red-700" :disabled="bulkProcessing" @click="bulkAction('cancelled')">Cancel</button>
      </div>
      <button class="ml-auto text-xs text-blue-600 hover:underline" @click="clearSelection">Clear</button>
    </div>

    <!-- Select all -->
    <div v-if="filteredOrders.length > 0" class="flex items-center gap-2">
      <label class="inline-flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
        <input type="checkbox" class="rounded border-gray-300 text-blue-600" :checked="allSelected" @change="toggleAll">
        Select all ({{ filteredOrders.length }})
      </label>
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

    <div v-else class="space-y-2">
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="flex items-start gap-2"
      >
        <input
          type="checkbox"
          class="mt-4 rounded border-gray-300 text-blue-600 shrink-0"
          :checked="selectedIds.has(order.id)"
          @change="toggleSelect(order.id)"
        >
        <div class="flex-1 min-w-0">
          <WholesalerOrderCard :order="order" />
        </div>
      </div>
    </div>
  </div>
</template>
