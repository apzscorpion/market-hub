import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, query, orderBy, serverTimestamp,
} from 'firebase/firestore'
import type { Product } from '~/types/product'

export function useProductAdmin() {
  const { $firebaseDb } = useNuxtApp()
  const productStore = useProductStore()

  async function fetchAllProducts(): Promise<void> {
    productStore.setLoading(true)
    productStore.setError(null)
    try {
      const q = query(collection($firebaseDb, 'products'), orderBy('sortOrder'))
      const snapshot = await getDocs(q)
      const products: Product[] = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
      })) as Product[]
      productStore.setProducts(products)
    }
    catch (e) {
      productStore.setError((e as Error).message)
    }
    finally {
      productStore.setLoading(false)
    }
  }

  async function createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection($firebaseDb, 'products'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    await fetchAllProducts()
    return docRef.id
  }

  async function updateProduct(id: string, data: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<void> {
    await updateDoc(doc($firebaseDb, 'products', id), {
      ...data,
      updatedAt: serverTimestamp(),
    })
    await fetchAllProducts()
  }

  async function toggleActive(id: string, active: boolean): Promise<void> {
    await updateDoc(doc($firebaseDb, 'products', id), {
      active,
      updatedAt: serverTimestamp(),
    })
    await fetchAllProducts()
  }

  async function deleteProduct(id: string): Promise<void> {
    await deleteDoc(doc($firebaseDb, 'products', id))
    await fetchAllProducts()
  }

  async function updateStock(id: string, quantity: number): Promise<void> {
    await updateDoc(doc($firebaseDb, 'products', id), {
      'stock.quantity': quantity,
      'stock.lastUpdated': serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    await fetchAllProducts()
  }

  async function updateBadges(id: string, badges: Product['badges']): Promise<void> {
    await updateDoc(doc($firebaseDb, 'products', id), {
      badges,
      updatedAt: serverTimestamp(),
    })
    await fetchAllProducts()
  }

  return {
    products: computed(() => productStore.products),
    loading: computed(() => productStore.loading),
    error: computed(() => productStore.error),
    fetchAllProducts,
    createProduct,
    updateProduct,
    toggleActive,
    deleteProduct,
    updateStock,
    updateBadges,
  }
}
