import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CartItem } from '~/types/cart'
import type { Product } from '~/types/product'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  const itemCount = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))
  const totalAmount = computed(() => items.value.reduce((sum, item) => sum + item.price * item.quantity, 0))
  const isEmpty = computed(() => items.value.length === 0)

  function addItem(product: Product): void {
    const existing = items.value.find(i => i.productId === product.id)
    if (existing) {
      existing.quantity++
    }
    else {
      items.value.push({
        productId: product.id,
        productName: product.name,
        nickname: product.nickname,
        unitType: product.unitType,
        price: product.price,
        quantity: 1,
      })
    }
  }

  function removeItem(productId: string): void {
    items.value = items.value.filter(i => i.productId !== productId)
  }

  function updateQuantity(productId: string, qty: number): void {
    if (qty <= 0) {
      removeItem(productId)
      return
    }
    const item = items.value.find(i => i.productId === productId)
    if (item) item.quantity = qty
  }

  function increment(productId: string): void {
    const item = items.value.find(i => i.productId === productId)
    if (item) item.quantity++
  }

  function decrement(productId: string): void {
    const item = items.value.find(i => i.productId === productId)
    if (!item) return
    if (item.quantity <= 1) {
      removeItem(productId)
    }
    else {
      item.quantity--
    }
  }

  function getItem(productId: string): CartItem | undefined {
    return items.value.find(i => i.productId === productId)
  }

  function clearCart(): void {
    items.value = []
  }

  return {
    items,
    itemCount,
    totalAmount,
    isEmpty,
    addItem,
    removeItem,
    updateQuantity,
    increment,
    decrement,
    getItem,
    clearCart,
  }
})
