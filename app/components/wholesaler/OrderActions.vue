<script setup lang="ts">
import type { OrderStatus } from '~/types/order'

const props = defineProps<{
  orderId: string
  currentStatus: OrderStatus
}>()

const emit = defineEmits<{
  statusChanged: [newStatus: OrderStatus]
}>()

const { updateOrderStatus } = useOrders()
const { showSuccess, showError } = useToast()

const loading = ref(false)
const confirmDialog = ref(false)
const pendingAction = ref<OrderStatus | null>(null)

const actionConfig: Record<string, { label: string; color: string; status: OrderStatus }[]> = {
  pending: [
    { label: 'Accept Order', color: 'bg-blue-600 hover:bg-blue-700', status: 'accepted' },
    { label: 'Cancel Order', color: 'bg-red-600 hover:bg-red-700', status: 'cancelled' },
  ],
  accepted: [
    { label: 'Mark as Shipped', color: 'bg-purple-600 hover:bg-purple-700', status: 'shipped' },
  ],
  shipped: [
    { label: 'Mark as Delivered', color: 'bg-green-600 hover:bg-green-700', status: 'delivered' },
  ],
}

const availableActions = computed(() => actionConfig[props.currentStatus] || [])

function requestAction(status: OrderStatus): void {
  pendingAction.value = status
  confirmDialog.value = true
}

async function executeAction(): Promise<void> {
  if (!pendingAction.value) return
  loading.value = true
  try {
    await updateOrderStatus(props.orderId, pendingAction.value)
    showSuccess(`Order ${pendingAction.value} successfully`)
    emit('statusChanged', pendingAction.value)
  }
  catch (e) {
    showError((e as Error).message || 'Failed to update order status')
  }
  finally {
    loading.value = false
    confirmDialog.value = false
    pendingAction.value = null
  }
}
</script>

<template>
  <div v-if="availableActions.length > 0" class="flex gap-3">
    <button
      v-for="action in availableActions"
      :key="action.status"
      :disabled="loading"
      :class="['px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50 transition-colors', action.color]"
      @click="requestAction(action.status)"
    >
      {{ action.label }}
    </button>

    <CommonConfirmDialog
      :open="confirmDialog"
      :title="`${pendingAction === 'cancelled' ? 'Cancel' : 'Update'} this order?`"
      :description="`This will change the order status to '${pendingAction}'.`"
      :confirm-text="pendingAction === 'cancelled' ? 'Cancel Order' : 'Confirm'"
      :confirm-color="pendingAction === 'cancelled' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'"
      :loading="loading"
      @confirm="executeAction"
      @cancel="confirmDialog = false"
    />
  </div>
</template>
