import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Product } from '~/types/product'
import type { Category } from '~/types/category'

export const useProductStore = defineStore('products', () => {
  const products = ref<Product[]>([])
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const activeProducts = computed(() =>
    products.value.filter(p => p.active),
  )

  function setProducts(newProducts: Product[]): void {
    products.value = newProducts
  }

  function setCategories(newCategories: Category[]): void {
    categories.value = newCategories
  }

  function setLoading(value: boolean): void {
    loading.value = value
  }

  function setError(message: string | null): void {
    error.value = message
  }

  function getProductsByCategory(categoryId: string): Product[] {
    return activeProducts.value.filter(p => p.categoryId === categoryId)
  }

  function searchProducts(query: string): Product[] {
    if (!query.trim()) return activeProducts.value
    const q = query.toLowerCase().trim()
    return activeProducts.value.filter(p =>
      p.name.toLowerCase().includes(q)
      || p.nickname.toLowerCase().includes(q)
      || p.aliases.some(a => a.toLowerCase().includes(q)),
    )
  }

  return {
    products,
    categories,
    loading,
    error,
    activeProducts,
    setProducts,
    setCategories,
    setLoading,
    setError,
    getProductsByCategory,
    searchProducts,
  }
})
