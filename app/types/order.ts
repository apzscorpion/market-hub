import type { Timestamp } from 'firebase/firestore'

export type OrderStatus = 'pending' | 'accepted' | 'shipped' | 'delivered' | 'cancelled'
export type OrderSource = 'manual' | 'voice'

export interface OrderItem {
  productId: string
  productName: string
  nickname: string
  quantity: number
  unitType: string
  price: number
  lineTotal: number
}

export interface StatusChange {
  status: OrderStatus
  changedBy: string
  changedAt: Timestamp
  note?: string
}

export interface Order {
  id: string
  retailerId: string
  retailerName: string
  retailerPhone: string
  items: OrderItem[]
  status: OrderStatus
  assignedDeliveryId?: string
  assignedDeliveryName?: string
  totalAmount: number
  notes?: string
  adminNotes?: string
  orderSource: OrderSource
  invoiceId?: string
  createdAt: Timestamp
  updatedAt: Timestamp
  statusHistory: StatusChange[]
}
