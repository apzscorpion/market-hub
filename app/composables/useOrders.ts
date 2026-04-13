import {
  collection, getDocs, getDoc, query, where, orderBy,
  addDoc, updateDoc, doc, serverTimestamp, arrayUnion,
} from 'firebase/firestore'
import type { Order, OrderStatus } from '~/types/order'
import type { CartItem } from '~/types/cart'

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ['accepted', 'cancelled'],
  accepted: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
}

export function useOrders() {
  const { $firebaseDb } = useNuxtApp()
  const orderStore = useOrderStore()
  const authStore = useAuthStore()

  async function placeOrder(items: CartItem[], notes?: string): Promise<string> {
    const user = authStore.user
    if (!user) throw new Error('Not authenticated')

    const orderItems = items.map(item => ({
      productId: item.productId,
      productName: item.productName,
      nickname: item.nickname,
      quantity: item.quantity,
      unitType: item.unitType,
      price: item.price,
      lineTotal: item.quantity * item.price,
    }))

    const totalAmount = orderItems.reduce((sum, item) => sum + item.lineTotal, 0)

    const orderData = {
      retailerId: user.id,
      retailerName: user.name,
      retailerPhone: user.phone,
      items: orderItems,
      status: 'pending' as OrderStatus,
      totalAmount,
      notes: notes || '',
      adminNotes: '',
      orderSource: 'manual' as const,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      statusHistory: [{
        status: 'pending',
        changedBy: user.id,
        changedAt: new Date(),
      }],
    }

    const docRef = await addDoc(collection($firebaseDb, 'orders'), orderData)
    return docRef.id
  }

  async function fetchMyOrders(): Promise<void> {
    const user = authStore.user
    if (!user) return

    orderStore.setLoading(true)
    orderStore.setError(null)
    try {
      const q = query(
        collection($firebaseDb, 'orders'),
        where('retailerId', '==', user.id),
        orderBy('createdAt', 'desc'),
      )
      const snapshot = await getDocs(q)
      const orders: Order[] = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
      })) as Order[]
      orderStore.setMyOrders(orders)
    }
    catch (e) {
      const message = (e as Error).message
      console.error('[useOrders] Failed to fetch my orders:', message)
      orderStore.setError(message)
    }
    finally {
      orderStore.setLoading(false)
    }
  }

  async function fetchAllOrders(): Promise<void> {
    orderStore.setLoading(true)
    orderStore.setError(null)
    try {
      const q = query(
        collection($firebaseDb, 'orders'),
        orderBy('createdAt', 'desc'),
      )
      const snapshot = await getDocs(q)
      const orders: Order[] = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
      })) as Order[]
      orderStore.setAllOrders(orders)
    }
    catch (e) {
      const message = (e as Error).message
      console.error('[useOrders] Failed to fetch all orders:', message)
      orderStore.setError(message)
    }
    finally {
      orderStore.setLoading(false)
    }
  }

  async function getOrder(orderId: string): Promise<Order> {
    const docSnap = await getDoc(doc($firebaseDb, 'orders', orderId))
    if (!docSnap.exists()) throw new Error('Order not found')
    return { id: docSnap.id, ...docSnap.data() } as Order
  }

  async function updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<void> {
    const order = await getOrder(orderId)

    if (!allowedTransitions[order.status]?.includes(newStatus)) {
      throw new Error(`Cannot transition from ${order.status} to ${newStatus}`)
    }

    const user = authStore.user
    if (!user) throw new Error('Not authenticated')

    await updateDoc(doc($firebaseDb, 'orders', orderId), {
      status: newStatus,
      updatedAt: serverTimestamp(),
      statusHistory: arrayUnion({
        status: newStatus,
        changedBy: user.id,
        changedAt: new Date(),
      }),
    })

    // Auto-generate invoice when order is accepted
    if (newStatus === 'accepted') {
      try {
        const { generateInvoice } = useInvoice()
        await generateInvoice({ ...order, status: newStatus })
      }
      catch (e) {
        console.error('[useOrders] Failed to generate invoice:', e)
        // Don't throw — the status change succeeded, invoice can be retried
      }
    }
  }

  return {
    myOrders: computed(() => orderStore.myOrders),
    allOrders: computed(() => orderStore.allOrders),
    loading: computed(() => orderStore.loading),
    error: computed(() => orderStore.error),
    placeOrder,
    fetchMyOrders,
    fetchAllOrders,
    getOrder,
    updateOrderStatus,
    allowedTransitions,
  }
}
