<script setup lang="ts">
definePageMeta({
  layout: 'retailer',
})

const { t } = useI18n()
const cartStore = useCartStore()
const { placeOrder } = useOrders()
const { showSuccess, showError } = useToast()

const notes = ref('')
const placing = ref(false)

const { formatPrice } = await import('~/utils/format')

async function handlePlaceOrder(): Promise<void> {
  if (cartStore.isEmpty || placing.value) return

  placing.value = true
  try {
    await placeOrder(cartStore.items, notes.value)
    cartStore.clearCart()
    notes.value = ''
    showSuccess('Order placed successfully!')
    await navigateTo('/retailer/orders')
  }
  catch (e) {
    showError((e as Error).message || 'Failed to place order. Please try again.')
  }
  finally {
    placing.value = false
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <NuxtLink to="/retailer/products" class="text-gray-500 hover:text-gray-700">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </NuxtLink>
        <h2 class="text-xl font-semibold text-gray-900">
          {{ t('nav.cart') }}
          <span v-if="!cartStore.isEmpty" class="text-sm font-normal text-gray-500">({{ cartStore.itemCount }} items)</span>
        </h2>
      </div>
    </div>

    <!-- Empty Cart -->
    <div v-if="cartStore.isEmpty" class="text-center py-16">
      <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
      </svg>
      <p class="text-gray-500 mb-4">Your cart is empty</p>
      <NuxtLink to="/retailer/products" class="text-blue-600 hover:underline text-sm">
        Browse Products
      </NuxtLink>
    </div>

    <!-- Cart Items -->
    <div v-else class="space-y-4">
      <div class="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
        <div
          v-for="item in cartStore.items"
          :key="item.productId"
          class="p-4 flex items-center justify-between"
        >
          <div class="flex-1 min-w-0">
            <h3 class="font-medium text-sm text-gray-900">{{ item.nickname || item.productName }}</h3>
            <p class="text-xs text-gray-500">{{ formatPrice(item.price) }} / {{ item.unitType }}</p>
          </div>
          <div class="flex items-center gap-4">
            <CommonQuantityControl
              :quantity="item.quantity"
              :min="0"
              @update:quantity="(qty: number) => qty === 0 ? cartStore.removeItem(item.productId) : cartStore.updateQuantity(item.productId, qty)"
            />
            <span class="text-sm font-medium text-gray-900 w-20 text-right">
              {{ formatPrice(item.quantity * item.price) }}
            </span>
            <button
              class="text-gray-400 hover:text-red-500 transition-colors"
              @click="cartStore.removeItem(item.productId)"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div>
        <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">{{ t('order.notes') }}</label>
        <textarea
          id="notes"
          v-model="notes"
          rows="2"
          class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Any special instructions..."
        />
      </div>

      <!-- Total + Place Order -->
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="flex items-center justify-between mb-4">
          <span class="text-lg font-semibold text-gray-900">{{ t('order.total') }}</span>
          <span class="text-lg font-bold text-gray-900">{{ formatPrice(cartStore.totalAmount) }}</span>
        </div>
        <button
          :disabled="placing || cartStore.isEmpty"
          class="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          @click="handlePlaceOrder"
        >
          <span v-if="placing" class="inline-flex items-center gap-2">
            <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Placing Order...
          </span>
          <span v-else>{{ t('order.place') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
