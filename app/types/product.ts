import type { Timestamp } from 'firebase/firestore'

export interface ProductClassification {
  typeId: string
  flavor: string
  variant: string
  packagingType: string
  temperatureSensitivity: string
}

export interface ProductStock {
  quantity: number
  lowStockThreshold: number
  lastUpdated: Timestamp
}

export interface ProductBadges {
  isNew: boolean
  isTrending: boolean
  isRecommended: boolean
}

export interface Product {
  id: string
  name: string
  nickname: string
  aliases: string[]
  classification: ProductClassification
  categoryId: string
  subcategoryId: string
  unitType: 'box' | 'piece' | 'pack' | 'kg' | 'litre'
  unitsPerPackage: number
  price: number
  images: string[]
  stock: ProductStock
  badges: ProductBadges
  active: boolean
  sortOrder: number
  createdAt: Timestamp
  updatedAt: Timestamp
}
