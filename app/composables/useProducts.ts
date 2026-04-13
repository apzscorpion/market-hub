import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import type { Product } from '~/types/product'
import type { Category } from '~/types/category'

export function useProducts() {
  const { $firebaseDb } = useNuxtApp()
  const productStore = useProductStore()

  async function fetchProducts(): Promise<void> {
    productStore.setLoading(true)
    productStore.setError(null)
    try {
      const q = query(
        collection($firebaseDb, 'products'),
        where('active', '==', true),
        orderBy('sortOrder'),
      )
      const snapshot = await getDocs(q)
      const products: Product[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[]
      productStore.setProducts(products)
    }
    catch (e) {
      const message = (e as Error).message
      console.error('[useProducts] Failed to fetch:', message)
      productStore.setError(message)
    }
    finally {
      productStore.setLoading(false)
    }
  }

  async function fetchCategories(): Promise<void> {
    try {
      const q = query(collection($firebaseDb, 'categories'), orderBy('sortOrder'))
      const snapshot = await getDocs(q)
      const categories: Category[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Category[]
      productStore.setCategories(categories)
    }
    catch (e) {
      console.error('[useProducts] Failed to fetch categories:', e)
    }
  }

  return {
    products: computed(() => productStore.products),
    activeProducts: computed(() => productStore.activeProducts),
    categories: computed(() => productStore.categories),
    loading: computed(() => productStore.loading),
    error: computed(() => productStore.error),
    fetchProducts,
    fetchCategories,
    searchProducts: productStore.searchProducts,
    getProductsByCategory: productStore.getProductsByCategory,
  }
}
