<script setup lang="ts">
import type { Product } from '~/types/product'
import type { Order } from '~/types/order'

definePageMeta({ layout: 'retailer' })

const { t } = useI18n()
const router = useRouter()
const { showSuccess, showError } = useToast()
const { products, fetchProducts } = useProducts()
const { myOrders, fetchMyOrders, placeOrder } = useOrders()

const {
  rows, grandTotal, isEmpty,
  selectProduct, updateQuantity, removeRow,
  addQuickItem, loadFromOrder, clearTable, toCartItems,
} = useOrderTable()

const submitting = ref(false)
const notes = ref('')
const showReorderConfirm = ref(false)
const pendingReorder = ref<Order | null>(null)

onMounted(async () => {
  await Promise.all([fetchProducts(), fetchMyOrders()])
})

const recentOrders = computed(() =>
  myOrders.value
    .filter(o => o.status !== 'cancelled')
    .slice(0, 5),
)

const filledRowCount = computed(() =>
  rows.value.filter(r => r.productId !== '').length,
)

function onLoadOrder(order: Order): void {
  if (filledRowCount.value > 0) {
    pendingReorder.value = order
    showReorderConfirm.value = true
    return
  }
  loadFromOrder(order)
}

function confirmReorder(): void {
  if (pendingReorder.value) {
    loadFromOrder(pendingReorder.value)
  }
  showReorderConfirm.value = false
  pendingReorder.value = null
}

function cancelReorder(): void {
  showReorderConfirm.value = false
  pendingReorder.value = null
}

async function submitOrder(): Promise<void> {
  if (isEmpty.value || submitting.value) return

  submitting.value = true
  try {
    const items = toCartItems()
    await placeOrder(items, notes.value || undefined)
    showSuccess('Order placed successfully!')
    clearTable()
    notes.value = ''
    router.push('/retailer/orders')
  }
  catch (e) {
    showError('Failed to place order. Please try again.')
    console.error('[order] Submit failed:', e)
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <h2 class="text-xl font-semibold text-gray-900">New Order</h2>

    <!-- Frequent Items -->
    <RetailerFrequentItems
      :orders="myOrders"
      @add="addQuickItem"
    />

    <!-- Quick Reorder -->
    <div v-if="recentOrders.length > 0" class="space-y-2">
      <h3 class="text-sm font-medium text-gray-500 flex items-center gap-1">
        <span>📋</span> Repeat a Previous Order
      </h3>
      <div class="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <RetailerReorderCard
          v-for="order in recentOrders"
          :key="order.id"
          :order="order"
          @load="onLoadOrder"
        />
      </div>
    </div>

    <!-- Separator -->
    <div v-if="recentOrders.length > 0 || myOrders.length >= 3" class="relative">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-gray-200" />
      </div>
      <div class="relative flex justify-center">
        <span class="bg-gray-50 px-3 text-xs text-gray-400">OR build a new order below</span>
      </div>
    </div>

    <!-- Order Table -->
    <RetailerOrderTable
      :rows="rows"
      :grand-total="grandTotal"
      @select-product="selectProduct"
      @update-quantity="updateQuantity"
      @remove-row="removeRow"
    />

    <!-- Notes -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
      <input
        v-model="notes"
        type="text"
        placeholder="e.g., Please deliver before 10 AM"
        class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
    </div>

    <!-- Submit -->
    <div class="flex items-center justify-between">
      <button
        :disabled="isEmpty"
        class="text-sm text-gray-500 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
        @click="clearTable"
      >
        Clear All
      </button>
      <button
        :disabled="isEmpty || submitting"
        class="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        @click="submitOrder"
      >
        <svg v-if="submitting" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Place Order ({{ filledRowCount }} items · {{ formatPrice(grandTotal) }})
      </button>
    </div>

    <!-- Reorder Confirm Dialog -->
    <CommonConfirmDialog
      :open="showReorderConfirm"
      title="Replace current order?"
      description="This will replace your current order table with items from the selected previous order."
      confirm-text="Replace"
      @confirm="confirmReorder"
      @cancel="cancelReorder"
    />
  </div>
</template>
