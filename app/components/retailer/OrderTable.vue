<script setup lang="ts">
import type { Product } from '~/types/product'
import type { OrderRow } from '~/types/orderTable'

const props = defineProps<{
  rows: OrderRow[]
  grandTotal: number
}>()

const emit = defineEmits<{
  'select-product': [rowId: string, product: Product]
  'update-quantity': [rowId: string, qty: number]
  'remove-row': [rowId: string]
}>()

const productInputs = ref<Record<string, string>>({})

function getDisplayValue(row: OrderRow): string {
  if (row.productId) return row.nickname || row.productName
  return productInputs.value[row.id] || ''
}

function onProductInput(rowId: string, value: string): void {
  productInputs.value[rowId] = value
}

function onProductSelect(rowId: string, product: Product): void {
  delete productInputs.value[rowId]
  emit('select-product', rowId, product)
}

function onQtyChange(row: OrderRow, value: string): void {
  const qty = parseInt(value, 10)
  if (!isNaN(qty) && qty >= 1) {
    emit('update-quantity', row.id, qty)
  }
}

function onQtyKeydown(row: OrderRow, e: KeyboardEvent): void {
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    emit('update-quantity', row.id, row.quantity + 1)
  }
  else if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (row.quantity > 1) emit('update-quantity', row.id, row.quantity - 1)
  }
}
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <!-- Desktop table -->
    <div class="hidden sm:block overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left px-3 py-2 font-medium text-gray-500 w-8">#</th>
            <th class="text-left px-3 py-2 font-medium text-gray-500">Product</th>
            <th class="text-center px-3 py-2 font-medium text-gray-500 w-20">Qty</th>
            <th class="text-left px-3 py-2 font-medium text-gray-500 w-20">Unit</th>
            <th class="text-right px-3 py-2 font-medium text-gray-500 w-24">Price</th>
            <th class="text-right px-3 py-2 font-medium text-gray-500 w-24">Total</th>
            <th class="px-3 py-2 w-10" />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in rows"
            :key="row.id"
            :class="[
              'border-b border-gray-100 last:border-0',
              !row.productId && 'bg-gray-50/50',
            ]"
          >
            <td class="px-3 py-2 text-gray-400 text-xs">{{ index + 1 }}</td>
            <td class="px-3 py-2">
              <RetailerProductAutocomplete
                v-if="!row.productId"
                :model-value="productInputs[row.id] || ''"
                @update:model-value="onProductInput(row.id, $event)"
                @select="onProductSelect(row.id, $event)"
              />
              <div v-else class="flex items-center gap-2">
                <span class="text-gray-900 font-medium text-sm">{{ row.nickname || row.productName }}</span>
                <button
                  class="text-gray-300 hover:text-gray-500 text-xs"
                  title="Change product"
                  @click="emit('remove-row', row.id)"
                >
                  ✕
                </button>
              </div>
            </td>
            <td class="px-3 py-2 text-center">
              <input
                v-if="row.productId"
                type="number"
                :value="row.quantity"
                min="1"
                class="w-16 text-center px-1 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                @input="onQtyChange(row, ($event.target as HTMLInputElement).value)"
                @keydown="onQtyKeydown(row, $event)"
              >
            </td>
            <td class="px-3 py-2 text-gray-500 text-sm">{{ row.unitType }}</td>
            <td class="px-3 py-2 text-right text-gray-500 text-sm">
              <span v-if="row.productId">{{ formatPrice(row.price) }}</span>
            </td>
            <td class="px-3 py-2 text-right font-medium text-gray-900 text-sm">
              <span v-if="row.productId">{{ formatPrice(row.total) }}</span>
            </td>
            <td class="px-3 py-2 text-center">
              <button
                v-if="row.productId"
                class="text-gray-300 hover:text-red-500 transition-colors"
                title="Remove"
                @click="emit('remove-row', row.id)"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
        <tfoot v-if="grandTotal > 0" class="border-t-2 border-gray-200 bg-gray-50">
          <tr>
            <td colspan="5" class="px-3 py-3 text-right font-semibold text-gray-700">Total</td>
            <td class="px-3 py-3 text-right font-bold text-gray-900 text-base">{{ formatPrice(grandTotal) }}</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Mobile cards -->
    <div class="sm:hidden divide-y divide-gray-100">
      <div
        v-for="(row, index) in rows"
        :key="row.id"
        class="p-3"
      >
        <div v-if="!row.productId">
          <RetailerProductAutocomplete
            :model-value="productInputs[row.id] || ''"
            @update:model-value="onProductInput(row.id, $event)"
            @select="onProductSelect(row.id, $event)"
          />
        </div>
        <div v-else class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-medium text-gray-900 text-sm">
              {{ index + 1 }}. {{ row.nickname || row.productName }}
            </span>
            <button class="text-gray-300 hover:text-red-500" @click="emit('remove-row', row.id)">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <button
                class="w-7 h-7 rounded border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                @click="row.quantity > 1 && emit('update-quantity', row.id, row.quantity - 1)"
              >−</button>
              <input
                type="number"
                :value="row.quantity"
                min="1"
                class="w-12 text-center py-1 text-sm border border-gray-200 rounded"
                @input="onQtyChange(row, ($event.target as HTMLInputElement).value)"
              >
              <button
                class="w-7 h-7 rounded border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                @click="emit('update-quantity', row.id, row.quantity + 1)"
              >+</button>
              <span class="text-xs text-gray-400">{{ row.unitType }}</span>
            </div>
            <span class="font-medium text-gray-900">{{ formatPrice(row.total) }}</span>
          </div>
        </div>
      </div>

      <div v-if="grandTotal > 0" class="p-3 bg-gray-50 flex justify-between items-center">
        <span class="font-semibold text-gray-700">Total</span>
        <span class="font-bold text-gray-900 text-lg">{{ formatPrice(grandTotal) }}</span>
      </div>
    </div>
  </div>
</template>
