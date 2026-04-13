<script setup lang="ts">
import type { OrderStatus } from '~/types/order'
import { formatPrice, formatDate } from '~/utils/format'

definePageMeta({
  layout: 'wholesaler',
})

const route = useRoute()
const { showSuccess, showError } = useToast()
const { getOrder, assignDelivery } = useOrders()
const { deliveryPersonnel, fetchUsers } = useUserAdmin()

const selectedDeliveryId = ref('')
const assigning = ref(false)

const order = ref<Awaited<ReturnType<typeof getOrder>> | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

async function loadOrder(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    order.value = await getOrder(route.params.id as string)
  }
  catch (e) {
    error.value = (e as Error).message
  }
  finally {
    loading.value = false
  }
}

function handleStatusChanged(newStatus: OrderStatus): void {
  if (order.value) {
    order.value.status = newStatus
    // Reload to get fresh data
    loadOrder()
  }
}

async function handleAssignDelivery(): Promise<void> {
  if (!order.value || !selectedDeliveryId.value || assigning.value) return
  const person = deliveryPersonnel.value.find(u => u.id === selectedDeliveryId.value)
  if (!person) return

  assigning.value = true
  try {
    await assignDelivery(order.value.id, person.id, person.name)
    showSuccess(`Assigned to ${person.name}`)
    loadOrder()
  }
  catch { showError('Failed to assign') }
  finally { assigning.value = false }
}

onMounted(() => {
  loadOrder()
  fetchUsers()
})
</script>

<template>
  <div>
    <NuxtLink to="/wholesaler/dashboard" class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Back to Dashboard
    </NuxtLink>

    <!-- Loading -->
    <div v-if="loading" class="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
      <div class="h-6 bg-gray-200 rounded w-1/3 mb-4" />
      <div class="h-4 bg-gray-200 rounded w-1/2 mb-2" />
      <div class="h-4 bg-gray-200 rounded w-1/4" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-600">{{ error }}</p>
    </div>

    <!-- Order Detail -->
    <div v-else-if="order" class="space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Order #{{ order.id.slice(0, 12) }}</h2>
            <p class="text-sm text-gray-500 mt-1">Placed {{ formatDate(order.createdAt) }}</p>
          </div>
          <CommonStatusBadge :status="order.status" />
        </div>
      </div>

      <!-- Retailer Info -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">Retailer</h3>
        <p class="text-gray-900">{{ order.retailerName }}</p>
        <a :href="`tel:${order.retailerPhone}`" class="text-sm text-blue-600 hover:underline">
          {{ order.retailerPhone }}
        </a>
      </div>

      <!-- Items -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">Items</h3>
        <table class="w-full text-sm">
          <thead>
            <tr class="text-gray-500 text-xs border-b border-gray-200">
              <th class="text-left font-medium pb-2">Product</th>
              <th class="text-right font-medium pb-2">Qty</th>
              <th class="text-right font-medium pb-2">Unit</th>
              <th class="text-right font-medium pb-2">Price</th>
              <th class="text-right font-medium pb-2">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in order.items" :key="item.productId" class="border-b border-gray-100">
              <td class="py-2 text-gray-900">{{ item.nickname || item.productName }}</td>
              <td class="py-2 text-right text-gray-600">{{ item.quantity }}</td>
              <td class="py-2 text-right text-gray-600">{{ item.unitType }}</td>
              <td class="py-2 text-right text-gray-600">{{ formatPrice(item.price) }}</td>
              <td class="py-2 text-right font-medium text-gray-900">{{ formatPrice(item.lineTotal) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="border-t-2 border-gray-200">
              <td colspan="4" class="py-3 text-right font-semibold text-gray-900">Total</td>
              <td class="py-3 text-right font-bold text-gray-900 text-lg">{{ formatPrice(order.totalAmount) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Notes -->
      <div v-if="order.notes || order.adminNotes" class="bg-white rounded-lg border border-gray-200 p-6">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">Notes</h3>
        <p v-if="order.notes" class="text-sm text-gray-600">Retailer: {{ order.notes }}</p>
        <p v-if="order.adminNotes" class="text-sm text-gray-600 mt-1">Admin: {{ order.adminNotes }}</p>
      </div>

      <!-- Actions -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">Actions</h3>
        <WholesalerOrderActions
          :order-id="order.id"
          :current-status="order.status"
          @status-changed="handleStatusChanged"
        />
        <p v-if="order.status === 'delivered' || order.status === 'cancelled'" class="text-sm text-gray-500">
          No actions available — order is {{ order.status }}.
        </p>
      </div>

      <!-- Delivery Assignment -->
      <div v-if="order.status === 'accepted' || order.status === 'shipped'" class="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">Delivery Assignment</h3>
        <div v-if="order.assignedDeliveryName" class="text-sm text-gray-700 mb-2">
          Currently assigned to: <span class="font-medium">{{ order.assignedDeliveryName }}</span>
        </div>
        <div class="flex flex-col sm:flex-row gap-2">
          <select v-model="selectedDeliveryId" class="flex-1 px-3 py-2 text-sm border rounded-lg">
            <option value="">Select delivery person...</option>
            <option v-for="person in deliveryPersonnel" :key="person.id" :value="person.id">
              {{ person.name }} ({{ person.phone }})
            </option>
          </select>
          <button
            :disabled="!selectedDeliveryId || assigning"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            @click="handleAssignDelivery"
          >
            {{ assigning ? 'Assigning...' : 'Assign' }}
          </button>
        </div>
      </div>

      <!-- Invoice link -->
      <div v-if="order.invoiceId" class="bg-white rounded-lg border border-gray-200 p-6">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">Invoice</h3>
        <NuxtLink
          :to="`/wholesaler/orders/${order.id}/invoice`"
          class="text-blue-600 hover:underline text-sm"
        >
          View Invoice
        </NuxtLink>
      </div>

      <!-- Status History -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">Status History</h3>
        <CommonStatusHistory :history="order.statusHistory || []" />
      </div>
    </div>
  </div>
</template>
