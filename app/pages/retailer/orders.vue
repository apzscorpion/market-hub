<script setup lang="ts">
definePageMeta({
  layout: 'retailer',
})

const { t } = useI18n()
const { myOrders, loading, fetchMyOrders } = useOrders()
const { formatPrice, formatDate } = await import('~/utils/format')

onMounted(() => {
  fetchMyOrders()
})

const expandedOrder = ref<string | null>(null)

function toggleExpand(orderId: string): void {
  expandedOrder.value = expandedOrder.value === orderId ? null : orderId
}
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ t('nav.orders') }}</h2>

    <!-- Loading -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 4" :key="i" class="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-1/3 mb-2" />
        <div class="h-3 bg-gray-200 rounded w-1/2 mb-2" />
        <div class="h-6 bg-gray-200 rounded w-20" />
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="myOrders.length === 0" class="text-center py-16">
      <p class="text-gray-500 mb-4">You haven't placed any orders yet.</p>
      <NuxtLink to="/retailer/products" class="text-blue-600 hover:underline text-sm">
        Browse Products
      </NuxtLink>
    </div>

    <!-- Order List -->
    <div v-else class="space-y-3">
      <div
        v-for="order in myOrders"
        :key="order.id"
        class="bg-white rounded-lg border border-gray-200 overflow-hidden"
      >
        <button
          class="w-full p-4 text-left flex items-center justify-between"
          @click="toggleExpand(order.id)"
        >
          <div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-900">Order #{{ order.id.slice(0, 8) }}</span>
              <CommonStatusBadge :status="order.status" />
            </div>
            <p class="text-xs text-gray-500 mt-1">
              {{ order.items.length }} items &middot; {{ formatPrice(order.totalAmount) }}
              &middot; {{ formatDate(order.createdAt) }}
            </p>
          </div>
          <svg
            :class="['w-5 h-5 text-gray-400 transition-transform', expandedOrder === order.id && 'rotate-180']"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- Expanded details -->
        <div v-if="expandedOrder === order.id" class="border-t border-gray-100 p-4 bg-gray-50">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-gray-500 text-xs">
                <th class="text-left font-medium pb-2">Product</th>
                <th class="text-right font-medium pb-2">Qty</th>
                <th class="text-right font-medium pb-2">Price</th>
                <th class="text-right font-medium pb-2">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in order.items" :key="item.productId" class="border-t border-gray-100">
                <td class="py-2 text-gray-900">{{ item.nickname || item.productName }}</td>
                <td class="py-2 text-right text-gray-600">{{ item.quantity }} {{ item.unitType }}</td>
                <td class="py-2 text-right text-gray-600">{{ formatPrice(item.price) }}</td>
                <td class="py-2 text-right font-medium text-gray-900">{{ formatPrice(item.lineTotal) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="border-t border-gray-200">
                <td colspan="3" class="py-2 text-right font-medium text-gray-900">Total</td>
                <td class="py-2 text-right font-bold text-gray-900">{{ formatPrice(order.totalAmount) }}</td>
              </tr>
            </tfoot>
          </table>

          <div v-if="order.notes" class="mt-3 text-xs text-gray-500">
            Notes: {{ order.notes }}
          </div>

          <!-- Invoice link -->
          <div v-if="order.invoiceId" class="mt-3">
            <NuxtLink
              :to="`/retailer/orders/${order.id}/invoice`"
              class="text-sm text-blue-600 hover:underline"
            >
              View Invoice
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
