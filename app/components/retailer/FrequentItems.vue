<script setup lang="ts">
import type { Product } from '~/types/product'
import type { Order } from '~/types/order'

const props = defineProps<{
  orders: Order[]
}>()

const emit = defineEmits<{
  add: [product: Product]
}>()

const productStore = useProductStore()

const frequentProducts = computed(() => {
  const counts = new Map<string, { count: number, productId: string }>()

  for (const order of props.orders) {
    if (order.status === 'cancelled') continue
    const seen = new Set<string>()
    for (const item of order.items) {
      if (seen.has(item.productId)) continue
      seen.add(item.productId)
      const existing = counts.get(item.productId)
      if (existing) {
        existing.count += 1
      }
      else {
        counts.set(item.productId, { count: 1, productId: item.productId })
      }
    }
  }

  return Array.from(counts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map(c => productStore.products.find(p => p.id === c.productId))
    .filter((p): p is Product => p != null && p.active)
})
</script>

<template>
  <div v-if="frequentProducts.length > 0">
    <h3 class="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
      <span>⚡</span> Your Frequent Items
    </h3>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="product in frequentProducts"
        :key="product.id"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100 transition-colors border border-blue-100"
        @click="emit('add', product)"
      >
        <span class="font-medium">{{ product.nickname }}</span>
        <span class="text-blue-400 text-xs">{{ formatPrice(product.price) }}/{{ product.unitType }}</span>
      </button>
    </div>
  </div>
</template>
