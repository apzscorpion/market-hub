import type { Timestamp } from 'firebase/firestore'

export interface FrequentProduct {
  productId: string
  productName: string
  totalQuantity: number
  orderCount: number
}

export interface RetailerStats {
  totalOrders: number
  totalSpent: number
  averageOrderValue: number
  lastOrderDate: Timestamp
  frequentProducts: FrequentProduct[]
  updatedAt: Timestamp
}
