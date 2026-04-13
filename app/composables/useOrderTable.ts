import type { Product } from '~/types/product'
import type { Order } from '~/types/order'
import type { CartItem } from '~/types/cart'
import { type OrderRow, createEmptyRow } from '~/types/orderTable'

export function useOrderTable() {
  const rows = ref<OrderRow[]>([createEmptyRow()])
  const productStore = useProductStore()

  const filledRows = computed(() =>
    rows.value.filter(r => r.productId !== ''),
  )

  const grandTotal = computed(() =>
    filledRows.value.reduce((sum, r) => sum + r.total, 0),
  )

  const isEmpty = computed(() => filledRows.value.length === 0)

  function ensureEmptyRow(): void {
    const last = rows.value[rows.value.length - 1]
    if (!last || last.productId !== '') {
      rows.value.push(createEmptyRow())
    }
  }

  function selectProduct(rowId: string, product: Product): void {
    const existing = rows.value.find(r => r.productId === product.id && r.id !== rowId)
    if (existing) {
      existing.quantity += 1
      existing.total = existing.quantity * existing.price
      removeRow(rowId)
      return
    }

    const row = rows.value.find(r => r.id === rowId)
    if (!row) return

    row.productId = product.id
    row.productName = product.name
    row.nickname = product.nickname
    row.unitType = product.unitType
    row.price = product.price
    row.total = row.quantity * product.price

    ensureEmptyRow()
  }

  function updateQuantity(rowId: string, qty: number): void {
    const row = rows.value.find(r => r.id === rowId)
    if (!row || qty < 1) return
    row.quantity = qty
    row.total = row.quantity * row.price
  }

  function removeRow(rowId: string): void {
    if (rows.value.length <= 1) {
      const row = rows.value[0]
      Object.assign(row, createEmptyRow())
      return
    }
    rows.value = rows.value.filter(r => r.id !== rowId)
    ensureEmptyRow()
  }

  function addQuickItem(product: Product): void {
    const existing = rows.value.find(r => r.productId === product.id)
    if (existing) {
      existing.quantity += 1
      existing.total = existing.quantity * existing.price
      return
    }

    const emptyRow = rows.value.find(r => r.productId === '')
    if (emptyRow) {
      selectProduct(emptyRow.id, product)
    }
    else {
      const newRow = createEmptyRow()
      rows.value.splice(rows.value.length - 1, 0, newRow)
      selectProduct(newRow.id, product)
    }
  }

  function loadFromOrder(order: Order): void {
    rows.value = []

    for (const item of order.items) {
      const product = productStore.products.find(p => p.id === item.productId)
      rows.value.push({
        id: crypto.randomUUID(),
        productId: item.productId,
        productName: product?.name ?? item.productName,
        nickname: product?.nickname ?? item.nickname,
        quantity: item.quantity,
        unitType: product?.unitType ?? item.unitType,
        price: product?.price ?? item.price,
        total: item.quantity * (product?.price ?? item.price),
      })
    }

    ensureEmptyRow()
  }

  function clearTable(): void {
    rows.value = [createEmptyRow()]
  }

  function toCartItems(): CartItem[] {
    return filledRows.value.map(r => ({
      productId: r.productId,
      productName: r.productName,
      nickname: r.nickname,
      unitType: r.unitType,
      price: r.price,
      quantity: r.quantity,
    }))
  }

  return {
    rows,
    filledRows,
    grandTotal,
    isEmpty,
    selectProduct,
    updateQuantity,
    removeRow,
    addQuickItem,
    loadFromOrder,
    clearTable,
    toCartItems,
  }
}
