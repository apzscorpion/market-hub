<script setup lang="ts">
definePageMeta({
  layout: 'wholesaler',
})

const route = useRoute()
const { getInvoiceByOrder, markAsPaid } = useInvoice()
const { showSuccess, showError } = useToast()

const invoice = ref<Awaited<ReturnType<typeof getInvoiceByOrder>>>(null)
const loading = ref(true)
const marking = ref(false)

onMounted(async () => {
  try {
    invoice.value = await getInvoiceByOrder(route.params.id as string)
  }
  catch (e) {
    console.error('[invoice] Failed to load:', e)
  }
  finally {
    loading.value = false
  }
})

async function handleMarkPaid(): Promise<void> {
  if (!invoice.value || marking.value) return
  marking.value = true
  try {
    await markAsPaid(invoice.value.id)
    invoice.value.status = 'paid' as const
    showSuccess('Invoice marked as paid')
  }
  catch (e) {
    showError('Failed to update invoice')
  }
  finally {
    marking.value = false
  }
}

function printInvoice(): void {
  window.print()
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4 print:hidden">
      <NuxtLink :to="`/wholesaler/orders/${route.params.id}`" class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Order
      </NuxtLink>
      <div class="flex gap-3">
        <button
          v-if="invoice && invoice.status !== 'paid'"
          :disabled="marking"
          class="text-sm px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          @click="handleMarkPaid"
        >
          {{ marking ? 'Marking...' : 'Mark as Paid' }}
        </button>
        <button
          v-if="invoice"
          class="text-sm text-blue-600 hover:underline"
          @click="printInvoice"
        >
          Print
        </button>
      </div>
    </div>

    <div v-if="loading" class="bg-white rounded-lg border p-6 animate-pulse">
      <div class="h-6 bg-gray-200 rounded w-1/4 mb-4" />
      <div class="h-4 bg-gray-200 rounded w-1/2" />
    </div>

    <div v-else-if="!invoice" class="text-center py-12">
      <p class="text-gray-500">Invoice not found for this order.</p>
    </div>

    <CommonInvoiceView v-else :invoice="invoice" />
  </div>
</template>
