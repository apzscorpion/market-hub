<script setup lang="ts">
import type { Invoice } from '~/types/invoice'
import { formatPrice, formatDateShort } from '~/utils/format'

defineProps<{
  invoice: Invoice
}>()
</script>

<template>
  <div class="bg-white p-8 max-w-2xl mx-auto print:p-0 print:max-w-none">
    <!-- Header -->
    <div class="flex justify-between items-start mb-8 border-b border-gray-200 pb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">INVOICE</h1>
        <p class="text-sm text-gray-500 mt-1">{{ invoice.invoiceNumber }}</p>
      </div>
      <div class="text-right">
        <span
          :class="[
            'inline-flex px-2 py-1 rounded text-xs font-medium',
            invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800',
          ]"
        >
          {{ invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1) }}
        </span>
      </div>
    </div>

    <!-- From / To -->
    <div class="grid grid-cols-2 gap-8 mb-8">
      <div>
        <p class="text-xs font-semibold text-gray-500 uppercase mb-2">From</p>
        <p class="font-medium text-gray-900">{{ invoice.wholesalerName || 'Wholesaler' }}</p>
        <p v-if="invoice.wholesalerAddress" class="text-sm text-gray-600">{{ invoice.wholesalerAddress }}</p>
        <p v-if="invoice.wholesalerPhone" class="text-sm text-gray-600">{{ invoice.wholesalerPhone }}</p>
        <p v-if="invoice.wholesalerGST" class="text-sm text-gray-600">GST: {{ invoice.wholesalerGST }}</p>
      </div>
      <div>
        <p class="text-xs font-semibold text-gray-500 uppercase mb-2">To</p>
        <p class="font-medium text-gray-900">{{ invoice.retailerName }}</p>
        <p v-if="invoice.retailerAddress" class="text-sm text-gray-600">{{ invoice.retailerAddress }}</p>
        <p v-if="invoice.retailerEmail" class="text-sm text-gray-600">{{ invoice.retailerEmail }}</p>
        <p v-if="invoice.retailerPhone" class="text-sm text-gray-600">{{ invoice.retailerPhone }}</p>
      </div>
    </div>

    <!-- Meta -->
    <div class="flex gap-8 mb-6 text-sm text-gray-600">
      <div>
        <span class="font-medium text-gray-700">Date:</span>
        {{ formatDateShort(invoice.generatedAt) }}
      </div>
      <div>
        <span class="font-medium text-gray-700">Order:</span>
        #{{ invoice.orderId.slice(0, 8) }}
      </div>
    </div>

    <!-- Items Table -->
    <table class="w-full text-sm mb-6">
      <thead>
        <tr class="border-b-2 border-gray-200 text-gray-500 text-xs">
          <th class="text-left font-semibold pb-2">Product</th>
          <th class="text-right font-semibold pb-2">Qty</th>
          <th class="text-right font-semibold pb-2">Unit</th>
          <th class="text-right font-semibold pb-2">Rate</th>
          <th class="text-right font-semibold pb-2">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, i) in invoice.items" :key="i" class="border-b border-gray-100">
          <td class="py-2 text-gray-900">{{ item.nickname || item.productName }}</td>
          <td class="py-2 text-right text-gray-600">{{ item.quantity }}</td>
          <td class="py-2 text-right text-gray-600">{{ item.unitType }}</td>
          <td class="py-2 text-right text-gray-600">{{ formatPrice(item.price) }}</td>
          <td class="py-2 text-right font-medium text-gray-900">{{ formatPrice(item.lineTotal) }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Totals -->
    <div class="border-t-2 border-gray-200 pt-4 space-y-1">
      <div class="flex justify-between text-sm">
        <span class="text-gray-600">Subtotal</span>
        <span class="text-gray-900">{{ formatPrice(invoice.subtotal) }}</span>
      </div>
      <div v-if="invoice.taxRate > 0" class="flex justify-between text-sm">
        <span class="text-gray-600">GST ({{ invoice.taxRate }}%)</span>
        <span class="text-gray-900">{{ formatPrice(invoice.taxAmount) }}</span>
      </div>
      <div class="flex justify-between text-lg font-bold border-t border-gray-200 pt-2 mt-2">
        <span class="text-gray-900">Total</span>
        <span class="text-gray-900">{{ formatPrice(invoice.total) }}</span>
      </div>
    </div>
  </div>
</template>
