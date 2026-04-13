<script setup lang="ts">
definePageMeta({
  layout: 'retailer',
})

const route = useRoute()
const { getInvoiceByOrder } = useInvoice()

const invoice = ref<Awaited<ReturnType<typeof getInvoiceByOrder>>>(null)
const loading = ref(true)

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

function printInvoice(): void {
  window.print()
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4 print:hidden">
      <NuxtLink :to="`/retailer/orders`" class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Orders
      </NuxtLink>
      <button
        v-if="invoice"
        class="text-sm text-blue-600 hover:underline"
        @click="printInvoice"
      >
        Print
      </button>
    </div>

    <div v-if="loading" class="bg-white rounded-lg border p-6 animate-pulse">
      <div class="h-6 bg-gray-200 rounded w-1/4 mb-4" />
      <div class="h-4 bg-gray-200 rounded w-1/2 mb-2" />
      <div class="h-4 bg-gray-200 rounded w-1/3" />
    </div>

    <div v-else-if="!invoice" class="text-center py-12">
      <p class="text-gray-500">Invoice not found for this order.</p>
    </div>

    <CommonInvoiceView v-else :invoice="invoice" />
  </div>
</template>
