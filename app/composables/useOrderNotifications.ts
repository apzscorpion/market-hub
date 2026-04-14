import type { Order, OrderStatus } from '~/types/order'

// Global state to track which orders we've already notified about
const notifiedOrders = new Map<string, { status: OrderStatus, count: number }>()
let initialized = false

export function useOrderNotifications() {
  const { showSuccess, showInfo } = useToast()
  const authStore = useAuthStore()
  const orderStore = useOrderStore()

  function startWatching(source: 'all' | 'my' | 'delivery'): void {
    const orders = source === 'all' ? orderStore.allOrders : orderStore.myOrders

    // On first run, just cache current state - don't notify
    if (!initialized) {
      for (const order of orders) {
        notifiedOrders.set(order.id, { status: order.status, count: order.items.length })
      }
      initialized = true

      // Watch for changes from now on
      watchOrders(source)
      return
    }
  }

  function watchOrders(source: 'all' | 'my' | 'delivery') {
    const ordersRef = computed(() => source === 'all' ? orderStore.allOrders : orderStore.myOrders)

    watch(ordersRef, (newOrders) => {
      const userRole = authStore.user?.role

      for (const order of newOrders) {
        const prev = notifiedOrders.get(order.id)

        // New order
        if (!prev) {
          notifiedOrders.set(order.id, { status: order.status, count: order.items.length })

          // Notify wholesaler about new pending orders
          if (userRole === 'wholesaler' && order.status === 'pending') {
            showInfo(`🔔 New order from ${order.retailerName}`)
          }
          continue
        }

        // Status changed
        if (prev.status !== order.status) {
          notifiedOrders.set(order.id, { status: order.status, count: order.items.length })

          const msg = buildNotificationMessage(order, prev.status, userRole)
          if (msg) {
            showSuccess(msg)
          }
        }
      }
    }, { deep: true })
  }

  function buildNotificationMessage(
    order: Order,
    prevStatus: OrderStatus,
    userRole: string | undefined,
  ): string | null {
    const shortId = `#${order.id.slice(0, 8)}`

    switch (order.status) {
      case 'accepted':
        if (userRole === 'retailer') return `✓ Your order ${shortId} was accepted`
        if (userRole === 'delivery') return `📦 Order ${shortId} ready for pickup`
        return `Order ${shortId} accepted`
      case 'shipped':
        if (userRole === 'retailer') return `🚚 Order ${shortId} is out for delivery`
        if (userRole === 'wholesaler') return `Order ${shortId} shipped`
        return `Order ${shortId} shipped`
      case 'delivered':
        if (userRole === 'wholesaler') return `✓ Order ${shortId} delivered to ${order.retailerName}`
        if (userRole === 'retailer') return `✓ Your order ${shortId} was delivered`
        return `Order ${shortId} delivered`
      case 'cancelled':
        if (userRole === 'retailer') return `✗ Order ${shortId} was cancelled`
        return `Order ${shortId} cancelled`
      default:
        return null
    }
  }

  function reset(): void {
    notifiedOrders.clear()
    initialized = false
  }

  return { startWatching, reset }
}
