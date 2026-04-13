<script setup lang="ts">
import type { Product } from '~/types/product'

const props = defineProps<{
  product: Product
}>()

const cartStore = useCartStore()
const cartItem = computed(() => cartStore.getItem(props.product.id))
const inCart = computed(() => !!cartItem.value)
const isOutOfStock = computed(() => props.product.stock.quantity <= 0)
const justAdded = ref(false)

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(price)
}

function addToCart(): void {
  cartStore.addItem(props.product)
  justAdded.value = true
  setTimeout(() => { justAdded.value = false }, 600)
}
</script>

<template>
  <div class="card overflow-hidden group">
    <!-- Image -->
    <div class="h-36 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center relative overflow-hidden">
      <img
        v-if="product.images.length > 0"
        :src="product.images[0]"
        :alt="product.name"
        class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
      >
      <div v-else class="flex flex-col items-center gap-1">
        <svg class="w-10 h-10 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      <!-- Badges -->
      <div v-if="product.badges.isNew || product.badges.isTrending" class="absolute top-2 left-2 flex gap-1">
        <span v-if="product.badges.isNew" class="badge bg-emerald-500 text-white shadow-sm">New</span>
        <span v-if="product.badges.isTrending" class="badge bg-orange-500 text-white shadow-sm">Hot</span>
      </div>

      <!-- Out of stock overlay -->
      <div v-if="isOutOfStock" class="absolute inset-0 bg-gray-900/40 flex items-center justify-center">
        <span class="text-white text-xs font-bold bg-red-500 px-3 py-1 rounded-full">Out of Stock</span>
      </div>
    </div>

    <div class="p-3 space-y-2">
      <div>
        <h3 class="font-semibold text-sm text-gray-900 line-clamp-1">{{ product.nickname || product.name }}</h3>
        <p class="text-[11px] text-gray-400 line-clamp-1">{{ product.name }}</p>
      </div>

      <div class="flex items-end justify-between">
        <div>
          <span class="text-lg font-bold text-gray-900 tabular-nums">{{ formatPrice(product.price) }}</span>
          <span class="text-[10px] text-gray-400 ml-0.5">/ {{ product.unitType }}</span>
        </div>
      </div>

      <!-- Add to cart / Quantity controls -->
      <div v-if="!isOutOfStock">
        <div v-if="inCart" class="space-y-2">
          <div class="flex items-center justify-between">
            <CommonQuantityControl
              :quantity="cartItem!.quantity"
              :min="0"
              @update:quantity="(qty: number) => qty === 0 ? cartStore.removeItem(product.id) : cartStore.updateQuantity(product.id, qty)"
            />
          </div>
          <div class="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-1.5">
            <span class="text-xs text-blue-500">{{ cartItem!.quantity }} x {{ formatPrice(product.price) }}</span>
            <span class="text-sm font-bold text-blue-700 tabular-nums">
              {{ formatPrice(cartItem!.quantity * product.price) }}
            </span>
          </div>
        </div>
        <button
          v-else
          :class="[
            'w-full py-2.5 text-sm font-semibold rounded-xl transition-all duration-300',
            justAdded
              ? 'bg-emerald-500 text-white scale-95'
              : 'text-blue-600 bg-blue-50 hover:bg-blue-100 active:scale-95',
          ]"
          @click="addToCart"
        >
          <Transition name="fade" mode="out-in">
            <span v-if="justAdded" class="inline-flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              Added!
            </span>
            <span v-else>Add to Cart</span>
          </Transition>
        </button>
      </div>
    </div>
  </div>
</template>
