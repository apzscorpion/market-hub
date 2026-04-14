<script setup lang="ts">
import type { Order, OrderStatus } from '~/types/order'
import { formatPrice, formatDate } from '~/utils/format'

const props = defineProps<{
  order: Order | null
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  'status-changed': [status: OrderStatus]
}>()

const { updateOrderStatus, assignDelivery } = useOrders()
const { deliveryPersonnel, fetchUsers } = useUserAdmin()
const { showSuccess, showError } = useToast()
const processing = ref(false)
const selectedDeliveryId = ref('')

onMounted(() => {
  fetchUsers()
})

const quickActions = computed(() => {
  if (!props.order) return []
  const actions: { label: string, status: OrderStatus, color: string }[] = []
  switch (props.order.status) {
    case 'pending':
      actions.push({ label: 'Accept Order', status: 'accepted', color: 'btn-primary' })
      actions.push({ label: 'Cancel', status: 'cancelled', color: 'btn-danger' })
      break
    case 'accepted':
      actions.push({ label: 'Mark as Shipped', status: 'shipped', color: 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/25 px-4 py-2.5 text-sm font-semibold rounded-xl active:scale-[0.98] transition-all' })
      actions.push({ label: 'Cancel', status: 'cancelled', color: 'btn-danger' })
      break
    case 'shipped':
      actions.push({ label: 'Mark as Delivered', status: 'delivered', color: 'btn-success' })
      break
  }
  return actions
})

async function changeStatus(status: OrderStatus) {
  if (!props.order || processing.value) return
  processing.value = true
  try {
    await updateOrderStatus(props.order.id, status)
    showSuccess(`Order marked as ${status}`)
    emit('status-changed', status)
  }
  catch (e) {
    showError((e as Error).message || 'Failed to update')
  }
  finally {
    processing.value = false
  }
}

async function assignTo() {
  if (!props.order || !selectedDeliveryId.value) return
  const person = deliveryPersonnel.value.find(d => d.id === selectedDeliveryId.value)
  if (!person) return
  try {
    await assignDelivery(props.order.id, person.id, person.name)
    showSuccess(`Assigned to ${person.name}`)
    selectedDeliveryId.value = ''
  }
  catch {
    showError('Failed to assign delivery')
  }
}

const statusColor: Record<OrderStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  accepted: 'bg-blue-50 text-blue-700 border-blue-200',
  shipped: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open && order"
        class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        @click="emit('close')"
      />
    </Transition>
    <Transition name="slide-up">
      <div
        v-if="open && order"
        class="fixed inset-x-0 bottom-0 sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[420px] z-50 bg-white rounded-t-3xl sm:rounded-none shadow-2xl flex flex-col max-h-[92vh] sm:max-h-screen"
        @click.stop
      >
        <!-- Handle (mobile) -->
        <div class="sm:hidden flex justify-center pt-2">
          <div class="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        <!-- Header -->
        <div class="px-5 pt-4 pb-3 border-b border-gray-100 flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-base font-bold text-gray-900">Order #{{ order.id.slice(0, 8) }}</h3>
              <span
                :class="[
                  'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize',
                  statusColor[order.status],
                ]"
              >
                {{ order.status }}
              </span>
            </div>
            <p class="text-xs text-gray-500">Placed {{ formatDate(order.createdAt) }}</p>
          </div>
          <button
            class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 shrink-0"
            @click="emit('close')"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Scrollable body -->
        <div class="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <!-- Retailer -->
          <div>
            <div class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Retailer</div>
            <div class="card-flat p-3">
              <p class="font-semibold text-sm text-gray-900">{{ order.retailerName }}</p>
              <p v-if="order.retailerEmail" class="text-xs text-gray-500 mt-0.5">{{ order.retailerEmail }}</p>
              <a
                v-if="order.retailerPhone"
                :href="`tel:${order.retailerPhone}`"
                class="text-xs text-blue-600 hover:underline block mt-0.5"
              >
                {{ order.retailerPhone }}
              </a>
            </div>
          </div>

          <!-- Items -->
          <div>
            <div class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Items ({{ order.items.length }})
            </div>
            <div class="card-flat divide-y divide-gray-100">
              <div
                v-for="item in order.items"
                :key="item.productId"
                class="p-3 flex items-center justify-between gap-2"
              >
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ item.nickname || item.productName }}</p>
                  <p class="text-xs text-gray-500">{{ item.quantity }} × {{ formatPrice(item.price) }} / {{ item.unitType }}</p>
                </div>
                <span class="text-sm font-semibold text-gray-900 tabular-nums">{{ formatPrice(item.lineTotal) }}</span>
              </div>
              <div class="p-3 bg-gray-50 flex items-center justify-between">
                <span class="text-sm font-semibold text-gray-700">Total</span>
                <span class="text-base font-bold text-gray-900 tabular-nums">{{ formatPrice(order.totalAmount) }}</span>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="order.notes || order.adminNotes">
            <div class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Notes</div>
            <div class="card-flat p-3 space-y-1">
              <p v-if="order.notes" class="text-xs text-gray-600">
                <strong>Retailer:</strong> {{ order.notes }}
              </p>
              <p v-if="order.adminNotes" class="text-xs text-gray-600">
                <strong>Admin:</strong> {{ order.adminNotes }}
              </p>
            </div>
          </div>

          <!-- Delivery assignment -->
          <div v-if="order.status === 'accepted' || order.status === 'shipped'">
            <div class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Delivery</div>
            <div class="card-flat p-3">
              <p v-if="order.assignedDeliveryName" class="text-sm text-gray-700 mb-2">
                Assigned to: <span class="font-semibold">{{ order.assignedDeliveryName }}</span>
              </p>
              <div class="flex gap-2">
                <select v-model="selectedDeliveryId" class="input-sm flex-1 text-xs">
                  <option value="">Select delivery person...</option>
                  <option v-for="d in deliveryPersonnel" :key="d.id" :value="d.id">{{ d.name }}</option>
                </select>
                <button
                  :disabled="!selectedDeliveryId"
                  class="px-3 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  @click="assignTo"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>

          <!-- Status history -->
          <div v-if="order.statusHistory && order.statusHistory.length > 0">
            <div class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">History</div>
            <div class="card-flat p-3 space-y-2">
              <div
                v-for="(change, idx) in order.statusHistory"
                :key="idx"
                class="flex items-center gap-2 text-xs"
              >
                <span
                  :class="[
                    'w-2 h-2 rounded-full',
                    change.status === 'pending' ? 'bg-amber-400'
                    : change.status === 'accepted' ? 'bg-blue-500'
                    : change.status === 'shipped' ? 'bg-purple-500'
                    : change.status === 'delivered' ? 'bg-emerald-500'
                    : 'bg-red-500',
                  ]"
                />
                <span class="capitalize text-gray-700">{{ change.status }}</span>
                <span class="text-gray-400 ml-auto">{{ formatDate(change.changedAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Cancelled note -->
          <div
            v-if="order.status === 'cancelled'"
            class="bg-red-50 border border-red-100 rounded-xl p-3"
          >
            <p class="text-xs text-red-700">
              This order was cancelled. The retailer can place a new order from their dashboard.
            </p>
          </div>
        </div>

        <!-- Actions (sticky bottom) -->
        <div v-if="quickActions.length > 0" class="p-4 border-t border-gray-100 bg-gray-50/50 flex gap-2">
          <button
            v-for="action in quickActions"
            :key="action.status"
            :disabled="processing"
            :class="[action.color, 'flex-1']"
            @click="changeStatus(action.status)"
          >
            {{ processing ? 'Working...' : action.label }}
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
