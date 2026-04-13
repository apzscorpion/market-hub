import {
  collection, getDocs, getDoc, query, where, orderBy,
  addDoc, updateDoc, doc, serverTimestamp, arrayUnion, setDoc,
  onSnapshot, type Unsubscribe,
} from 'firebase/firestore'
import type { Order, OrderStatus } from '~/types/order'
import type { CartItem } from '~/types/cart'

// Status transition rules:
// - Wholesaler can: accept, cancel, ship, mark delivered
// - Delivery can: mark shipped (picked up), mark delivered
// - Retailer can: confirm delivery (mark delivered)
const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ['accepted', 'cancelled'],
  accepted: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
}

// Who can transition to which status
const roleTransitions: Record<string, OrderStatus[]> = {
  wholesaler: ['accepted', 'shipped', 'delivered', 'cancelled'],
  delivery: ['shipped', 'delivered'],
  retailer: ['delivered'],
}

export function useOrders() {
  const { $firebaseDb } = useNuxtApp()
  const orderStore = useOrderStore()
  const authStore = useAuthStore()

  // Track active listeners for cleanup
  let myOrdersUnsub: Unsubscribe | null = null
  let allOrdersUnsub: Unsubscribe | null = null
  let deliveryOrdersUnsub: Unsubscribe | null = null

  async function placeOrder(items: CartItem[], notes?: string): Promise<string> {
    const user = authStore.user
    if (!user) throw new Error('Not authenticated')

    const orderItems = items.map(item => ({
      productId: item.productId,
      productName: item.productName,
      nickname: item.nickname || '',
      quantity: item.quantity,
      unitType: item.unitType,
      price: item.price,
      lineTotal: item.quantity * item.price,
    }))

    const totalAmount = orderItems.reduce((sum, item) => sum + item.lineTotal, 0)

    // Build order data — ensure NO undefined values (Firestore rejects them)
    const orderData: Record<string, any> = {
      retailerId: user.id,
      retailerName: user.name || '',
      retailerEmail: user.email || '',
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
    if (user.phone) {
      orderData.retailerPhone = user.phone
    }

    const docRef = await addDoc(collection($firebaseDb, 'orders'), orderData)

    // Check if auto-accept is enabled
    try {
      const configDoc = await getDoc(doc($firebaseDb, 'systemSettings', 'config'))
      if (configDoc.exists() && configDoc.data().autoAcceptOrders) {
        await updateDoc(doc($firebaseDb, 'orders', docRef.id), {
          status: 'accepted',
          updatedAt: serverTimestamp(),
          statusHistory: arrayUnion({
            status: 'accepted',
            changedBy: 'system',
            changedAt: new Date(),
            note: 'Auto-accepted',
          }),
        })
        // Auto-generate invoice
        try {
          const { generateInvoice } = useInvoice()
          const order = await getOrder(docRef.id)
          await generateInvoice(order)
        }
        catch (e) {
          console.error('[useOrders] Auto-invoice failed:', e)
        }
      }
    }
    catch (e) {
      console.error('[useOrders] Auto-accept check failed:', e)
    }

    return docRef.id
  }

  // Real-time listener for retailer's own orders
  function subscribeMyOrders(): void {
    const user = authStore.user
    if (!user) return

    // Clean up previous listener
    if (myOrdersUnsub) myOrdersUnsub()

    orderStore.setLoading(true)
    orderStore.setError(null)

    const q = query(
      collection($firebaseDb, 'orders'),
      where('retailerId', '==', user.id),
      orderBy('createdAt', 'desc'),
    )

    myOrdersUnsub = onSnapshot(q,
      (snapshot) => {
        const orders: Order[] = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data(),
        })) as Order[]
        orderStore.setMyOrders(orders)
        orderStore.setLoading(false)
      },
      (error) => {
        console.error('[useOrders] Real-time my orders error:', error.message)
        orderStore.setError(error.message)
        orderStore.setLoading(false)
      },
    )
  }

  // Real-time listener for all orders (wholesaler)
  function subscribeAllOrders(): void {
    // Clean up previous listener
    if (allOrdersUnsub) allOrdersUnsub()

    orderStore.setLoading(true)
    orderStore.setError(null)

    const q = query(
      collection($firebaseDb, 'orders'),
      orderBy('createdAt', 'desc'),
    )

    allOrdersUnsub = onSnapshot(q,
      (snapshot) => {
        const orders: Order[] = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data(),
        })) as Order[]
        orderStore.setAllOrders(orders)
        orderStore.setLoading(false)
      },
      (error) => {
        console.error('[useOrders] Real-time all orders error:', error.message)
        orderStore.setError(error.message)
        orderStore.setLoading(false)
      },
    )
  }

  // Real-time listener for delivery person's orders
  function subscribeDeliveryOrders(): void {
    const user = authStore.user
    if (!user) return

    if (deliveryOrdersUnsub) deliveryOrdersUnsub()

    orderStore.setLoading(true)

    const q = query(
      collection($firebaseDb, 'orders'),
      where('assignedDeliveryId', '==', user.id),
      orderBy('createdAt', 'desc'),
    )

    deliveryOrdersUnsub = onSnapshot(q,
      (snapshot) => {
        const orders: Order[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Order[]
        orderStore.setMyOrders(orders)
        orderStore.setLoading(false)
      },
      (error) => {
        orderStore.setError(error.message)
        orderStore.setLoading(false)
      },
    )
  }

  // Keep the old fetch functions as fallbacks
  async function fetchMyOrders(): Promise<void> {
    subscribeMyOrders()
  }

  async function fetchAllOrders(): Promise<void> {
    subscribeAllOrders()
  }

  async function fetchDeliveryOrders(): Promise<void> {
    subscribeDeliveryOrders()
  }

  // Cleanup all listeners
  function unsubscribeAll(): void {
    if (myOrdersUnsub) { myOrdersUnsub(); myOrdersUnsub = null }
    if (allOrdersUnsub) { allOrdersUnsub(); allOrdersUnsub = null }
    if (deliveryOrdersUnsub) { deliveryOrdersUnsub(); deliveryOrdersUnsub = null }
  }

  async function getOrder(orderId: string): Promise<Order> {
    const docSnap = await getDoc(doc($firebaseDb, 'orders', orderId))
    if (!docSnap.exists()) throw new Error('Order not found')
    return { id: docSnap.id, ...docSnap.data() } as Order
  }

  async function updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<void> {
    const order = await getOrder(orderId)
    const user = authStore.user
    if (!user) throw new Error('Not authenticated')

    // Check if status transition is valid
    if (!allowedTransitions[order.status]?.includes(newStatus)) {
      throw new Error(`Cannot transition from ${order.status} to ${newStatus}`)
    }

    // Check if user's role can make this transition
    const userRole = user.role || 'retailer'
    const allowed = roleTransitions[userRole] || []
    if (!allowed.includes(newStatus)) {
      throw new Error(`${userRole} cannot change order to ${newStatus}`)
    }

    await updateDoc(doc($firebaseDb, 'orders', orderId), {
      status: newStatus,
      updatedAt: serverTimestamp(),
      statusHistory: arrayUnion({
        status: newStatus,
        changedBy: user.id,
        changedByName: user.name || '',
        changedByRole: userRole,
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
      }
    }
  }

  async function bulkUpdateStatus(orderIds: string[], newStatus: OrderStatus): Promise<{ success: number, failed: number }> {
    let success = 0
    let failed = 0
    for (const id of orderIds) {
      try {
        await updateOrderStatus(id, newStatus)
        success++
      }
      catch {
        failed++
      }
    }
    // No need to refetch — real-time listener will update automatically
    return { success, failed }
  }

  async function assignDelivery(orderId: string, deliveryId: string, deliveryName: string): Promise<void> {
    await updateDoc(doc($firebaseDb, 'orders', orderId), {
      assignedDeliveryId: deliveryId,
      assignedDeliveryName: deliveryName,
      updatedAt: serverTimestamp(),
    })
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
    bulkUpdateStatus,
    assignDelivery,
    fetchDeliveryOrders,
    unsubscribeAll,
    allowedTransitions,
    roleTransitions,
  }
}
