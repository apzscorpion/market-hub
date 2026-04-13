import type { Timestamp } from 'firebase/firestore'

export interface Subcategory {
  id: string
  name: string
  nameML: string
  sortOrder: number
}

export interface Category {
  id: string
  name: string
  nameML: string
  sortOrder: number
  subcategories: Subcategory[]
  createdAt: Timestamp
  updatedAt: Timestamp
}
