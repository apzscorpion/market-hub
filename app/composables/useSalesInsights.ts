import type { Order } from '~/types/order'

export interface SalesInsight {
  totalRevenue: number
  totalOrders: number
  avgOrderValue: number
  topProducts: { productName: string, quantity: number, revenue: number }[]
  topRetailers: { name: string, orderCount: number, totalSpent: number }[]
  ordersByStatus: Record<string, number>
  revenueByDay: { date: string, revenue: number }[]
}

export function useSalesInsights() {
  function computeInsights(orders: Order[]): SalesInsight {
    const nonCancelled = orders.filter(o => o.status !== 'cancelled')

    const totalRevenue = nonCancelled.reduce((sum, o) => sum + o.totalAmount, 0)
    const totalOrders = nonCancelled.length
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

    // Top products
    const productMap = new Map<string, { productName: string, quantity: number, revenue: number }>()
    for (const order of nonCancelled) {
      for (const item of order.items) {
        const key = item.productId
        const existing = productMap.get(key)
        if (existing) {
          existing.quantity += item.quantity
          existing.revenue += item.lineTotal
        }
        else {
          productMap.set(key, {
            productName: item.nickname || item.productName,
            quantity: item.quantity,
            revenue: item.lineTotal,
          })
        }
      }
    }
    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Top retailers
    const retailerMap = new Map<string, { name: string, orderCount: number, totalSpent: number }>()
    for (const order of nonCancelled) {
      const key = order.retailerId
      const existing = retailerMap.get(key)
      if (existing) {
        existing.orderCount += 1
        existing.totalSpent += order.totalAmount
      }
      else {
        retailerMap.set(key, {
          name: order.retailerName,
          orderCount: 1,
          totalSpent: order.totalAmount,
        })
      }
    }
    const topRetailers = Array.from(retailerMap.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10)

    // Orders by status
    const ordersByStatus: Record<string, number> = {}
    for (const order of orders) {
      ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1
    }

    // Revenue by day (last 30 days)
    const dayMap = new Map<string, number>()
    for (const order of nonCancelled) {
      const d = order.createdAt?.toDate?.() ?? new Date()
      const key = d.toISOString().slice(0, 10)
      dayMap.set(key, (dayMap.get(key) || 0) + order.totalAmount)
    }
    const revenueByDay = Array.from(dayMap.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30)

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      topProducts,
      topRetailers,
      ordersByStatus,
      revenueByDay,
    }
  }

  return { computeInsights }
}
