import type { Timestamp } from 'firebase/firestore'

export type UserRole = 'retailer' | 'wholesaler' | 'delivery'

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: UserRole
  active: boolean
  address?: string
  fcmTokens?: string[]
  preferredLanguage: 'en' | 'ml'
  createdAt: Timestamp | any
  updatedAt: Timestamp | any
}
