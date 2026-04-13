<script setup lang="ts">
import type { Product } from '~/types/product'

const props = defineProps<{
  product: Product
}>()

const cartStore = useCartStore()
const cartItem = computed(() => cartStore.getItem(props.product.id))
const inCart = computed(() => !!cartItem.value)
const isOutOfStock = computed(() => props.product.stock.quantity <= 0)

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(price)
}
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
    <!-- Image placeholder -->
    <div class="h-32 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
      <img
        v-if="product.images.length > 0"
        :src="product.images[0]"
        :alt="product.name"
        class="h-full w-full object-cover"
      >
      <svg v-else class="w-12 h-12 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>

    <div class="p-3">
      <!-- Badges -->
      <div v-if="product.badges.isNew || product.badges.isTrending || product.badges.isRecommended" class="flex gap-1 mb-1">
        <span v-if="product.badges.isNew" class="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium">New</span>
        <span v-if="product.badges.isTrending" class="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 font-medium">Trending</span>
        <span v-if="product.badges.isRecommended" class="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">Recommended</span>
      </div>

      <h3 class="font-medium text-sm text-gray-900 line-clamp-1">{{ product.nickname || product.name }}</h3>
      <p class="text-xs text-gray-500 line-clamp-1">{{ product.name }}</p>

      <div class="mt-2 flex items-center justify-between">
        <span class="text-sm font-semibold text-gray-900">
          {{ formatPrice(product.price) }}
          <span class="text-xs font-normal text-gray-500">/ {{ product.unitType }}</span>
        </span>
      </div>

      <!-- Out of stock -->
      <div v-if="isOutOfStock" class="mt-2">
        <span class="text-xs text-red-600 font-medium">Out of Stock</span>
      </div>

      <!-- Add to cart / Quantity controls -->
      <div v-else class="mt-2">
        <div v-if="inCart" class="flex items-center justify-between">
          <CommonQuantityControl
            :quantity="cartItem!.quantity"
            :min="0"
            @update:quantity="(qty: number) => qty === 0 ? cartStore.removeItem(product.id) : cartStore.updateQuantity(product.id, qty)"
          />
          <span class="text-xs text-gray-500">{{ formatPrice(cartItem!.quantity * product.price) }}</span>
        </div>
        <button
          v-else
          class="w-full py-1.5 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
          @click="cartStore.addItem(product)"
        >
          Add to Cart
        </button>
      </div>
    </div>
  </div>
</template>
