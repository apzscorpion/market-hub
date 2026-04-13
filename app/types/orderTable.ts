export interface OrderRow {
  id: string
  productId: string
  productName: string
  nickname: string
  quantity: number
  unitType: string
  price: number
  total: number
}

export function createEmptyRow(): OrderRow {
  return {
    id: crypto.randomUUID(),
    productId: '',
    productName: '',
    nickname: '',
    quantity: 1,
    unitType: '',
    price: 0,
    total: 0,
  }
}
