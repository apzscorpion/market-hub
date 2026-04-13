import {
  doc, getDoc, setDoc, updateDoc, runTransaction,
  collection, query, where, getDocs, serverTimestamp,
} from 'firebase/firestore'
import type { Order } from '~/types/order'
import type { Invoice, InvoiceItem } from '~/types/invoice'

export function useInvoice() {
  const { $firebaseDb } = useNuxtApp()

  async function getNextInvoiceNumber(): Promise<string> {
    const configRef = doc($firebaseDb, 'systemSettings', 'config')

    return runTransaction($firebaseDb, async (transaction) => {
      const configDoc = await transaction.get(configRef)
      const data = configDoc.data()
      const current = data?.nextInvoiceNumber ?? 1
      const prefix = data?.invoicePrefix ?? 'INV'
      const year = new Date().getFullYear()

      transaction.update(configRef, { nextInvoiceNumber: current + 1 })

      return `${prefix}-${year}-${String(current).padStart(4, '0')}`
    })
  }

  async function generateInvoice(order: Order): Promise<string> {
    // Get system settings for wholesaler info
    const configDoc = await getDoc(doc($firebaseDb, 'systemSettings', 'config'))
    const config = configDoc.data() || {}

    const invoiceNumber = await getNextInvoiceNumber()

    const items: InvoiceItem[] = order.items.map(item => ({
      productName: item.productName,
      nickname: item.nickname,
      quantity: item.quantity,
      unitType: item.unitType,
      price: item.price,
      lineTotal: item.lineTotal,
    }))

    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0)
    const taxRate = config.taxRate || 0
    const taxAmount = Math.round(subtotal * (taxRate / 100))
    const total = subtotal + taxAmount

    const invoiceId = `inv-${order.id}`

    const invoiceData = {
      invoiceNumber,
      orderId: order.id,
      retailerId: order.retailerId,
      retailerName: order.retailerName,
      retailerPhone: order.retailerPhone,
      retailerAddress: '',
      wholesalerName: config.wholesalerName || '',
      wholesalerAddress: config.wholesalerAddress || '',
      wholesalerPhone: config.wholesalerPhone || '',
      wholesalerGST: config.wholesalerGST || '',
      items,
      subtotal,
      taxRate,
      taxAmount,
      total,
      status: 'generated',
      generatedAt: serverTimestamp(),
    }

    await setDoc(doc($firebaseDb, 'invoices', invoiceId), invoiceData)

    // Update order with invoice reference
    await updateDoc(doc($firebaseDb, 'orders', order.id), {
      invoiceId,
      updatedAt: serverTimestamp(),
    })

    return invoiceId
  }

  async function getInvoice(invoiceId: string): Promise<Invoice | null> {
    const docSnap = await getDoc(doc($firebaseDb, 'invoices', invoiceId))
    if (!docSnap.exists()) return null
    return { id: docSnap.id, ...docSnap.data() } as Invoice
  }

  async function getInvoiceByOrder(orderId: string): Promise<Invoice | null> {
    const q = query(collection($firebaseDb, 'invoices'), where('orderId', '==', orderId))
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null
    const d = snapshot.docs[0]
    return { id: d.id, ...d.data() } as Invoice
  }

  async function markAsPaid(invoiceId: string): Promise<void> {
    await updateDoc(doc($firebaseDb, 'invoices', invoiceId), {
      status: 'paid',
      paidAt: serverTimestamp(),
    })
  }

  return { generateInvoice, getInvoice, getInvoiceByOrder, markAsPaid }
}
