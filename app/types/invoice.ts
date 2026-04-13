import type { Timestamp } from 'firebase/firestore'

export type InvoiceStatus = 'generated' | 'sent' | 'paid'

export interface InvoiceItem {
  productName: string
  nickname: string
  quantity: number
  unitType: string
  price: number
  lineTotal: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  orderId: string
  retailerId: string
  retailerName: string
  retailerPhone: string
  retailerAddress: string
  wholesalerName: string
  wholesalerAddress: string
  wholesalerPhone: string
  wholesalerGST: string
  items: InvoiceItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  status: InvoiceStatus
  generatedAt: Timestamp
  paidAt?: Timestamp
  pdfUrl?: string
}
