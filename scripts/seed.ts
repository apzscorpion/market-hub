/**
 * Seed script for Firebase Emulator
 * Run with: npx tsx scripts/seed.ts
 *
 * Seeds the Firestore emulator with test data:
 * - 1 wholesaler, 3 retailers, 2 delivery users
 * - 3 categories with subcategories
 * - 15 products across categories
 * - 5 sample orders in various statuses
 * - System settings
 */

import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  doc,
  setDoc,
  Timestamp,
} from 'firebase/firestore'

const app = initializeApp({
  apiKey: 'fake-api-key',
  projectId: 'wholesale-deal-hub',
})

const db = getFirestore(app)
connectFirestoreEmulator(db, 'localhost', 8080)

const now = Timestamp.now()

// ─── Users ───────────────────────────────────────────────
const users = [
  {
    id: 'wholesaler-001',
    name: 'Kerala Ice Cream Wholesale',
    phone: '+911234567890',
    role: 'wholesaler',
    active: true,
    address: 'MG Road, Thrissur, Kerala',
    fcmTokens: [],
    preferredLanguage: 'en',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'retailer-001',
    name: 'Rajan\'s Cool Corner',
    phone: '+911234567891',
    role: 'retailer',
    active: true,
    address: 'Market Road, Thrissur',
    fcmTokens: [],
    preferredLanguage: 'ml',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'retailer-002',
    name: 'Sree Krishna Store',
    phone: '+919876543211',
    role: 'retailer',
    active: true,
    address: 'Swaraj Round, Thrissur',
    fcmTokens: [],
    preferredLanguage: 'ml',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'retailer-003',
    name: 'Fresh Bite Shop',
    phone: '+919876543212',
    role: 'retailer',
    active: true,
    address: 'Round North, Thrissur',
    fcmTokens: [],
    preferredLanguage: 'en',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'delivery-001',
    name: 'Arun Kumar',
    phone: '+911234567892',
    role: 'delivery',
    active: true,
    address: 'Ollur, Thrissur',
    fcmTokens: [],
    preferredLanguage: 'ml',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'delivery-002',
    name: 'Vishnu M',
    phone: '+919876543213',
    role: 'delivery',
    active: true,
    address: 'Kunnamkulam, Thrissur',
    fcmTokens: [],
    preferredLanguage: 'ml',
    createdAt: now,
    updatedAt: now,
  },
]

// ─── Categories ──────────────────────────────────────────
const categories = [
  {
    id: 'cat-cones',
    name: 'Ice Cream Cones',
    nameML: 'ഐസ്ക്രീം കോൺ',
    sortOrder: 1,
    subcategories: [
      { id: 'sub-regular-cone', name: 'Regular Cone', nameML: 'റെഗുലർ കോൺ', sortOrder: 1 },
      { id: 'sub-waffle-cone', name: 'Waffle Cone', nameML: 'വാഫിൾ കോൺ', sortOrder: 2 },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'cat-bars',
    name: 'Ice Cream Bars',
    nameML: 'ഐസ്ക്രീം ബാർ',
    sortOrder: 2,
    subcategories: [
      { id: 'sub-choco-bar', name: 'Choco Bar', nameML: 'ചോക്കോ ബാർ', sortOrder: 1 },
      { id: 'sub-fruit-bar', name: 'Fruit Bar', nameML: 'ഫ്രൂട്ട് ബാർ', sortOrder: 2 },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'cat-family',
    name: 'Family Packs',
    nameML: 'ഫാമിലി പാക്ക്',
    sortOrder: 3,
    subcategories: [
      { id: 'sub-500ml', name: '500ml Pack', nameML: '500ml പാക്ക്', sortOrder: 1 },
      { id: 'sub-1l', name: '1 Litre Pack', nameML: '1 ലിറ്റർ പാക്ക്', sortOrder: 2 },
    ],
    createdAt: now,
    updatedAt: now,
  },
]

// ─── Products ────────────────────────────────────────────
const products = [
  {
    id: 'prod-001',
    name: 'Vanilla Cone Regular',
    nickname: 'Vanilla Cone',
    aliases: ['vanilla', 'vanila', 'വാനില', 'vanilla cone', 'van cone'],
    classification: { typeId: 'cone', flavor: 'vanilla', variant: 'regular', packagingType: 'box', temperatureSensitivity: 'standard' },
    categoryId: 'cat-cones', subcategoryId: 'sub-regular-cone',
    unitType: 'box', unitsPerPackage: 24, price: 180,
    images: [], stock: { quantity: 50, lowStockThreshold: 10, lastUpdated: now },
    badges: { isNew: false, isTrending: true, isRecommended: true },
    active: true, sortOrder: 1, createdAt: now, updatedAt: now,
  },
  {
    id: 'prod-002',
    name: 'Chocolate Cone Regular',
    nickname: 'Choco Cone',
    aliases: ['chocolate cone', 'choco cone', 'ചോക്ലേറ്റ് കോൺ', 'choco'],
    classification: { typeId: 'cone', flavor: 'chocolate', variant: 'regular', packagingType: 'box', temperatureSensitivity: 'standard' },
    categoryId: 'cat-cones', subcategoryId: 'sub-regular-cone',
    unitType: 'box', unitsPerPackage: 24, price: 200,
    images: [], stock: { quantity: 35, lowStockThreshold: 10, lastUpdated: now },
    badges: { isNew: false, isTrending: true, isRecommended: false },
    active: true, sortOrder: 2, createdAt: now, updatedAt: now,
  },
  {
    id: 'prod-003',
    name: 'Strawberry Cone Waffle',
    nickname: 'Strawberry Waffle',
    aliases: ['strawberry', 'strawberry waffle', 'സ്ട്രോബറി'],
    classification: { typeId: 'cone', flavor: 'strawberry', variant: 'premium', packagingType: 'box', temperatureSensitivity: 'standard' },
    categoryId: 'cat-cones', subcategoryId: 'sub-waffle-cone',
    unitType: 'box', unitsPerPackage: 12, price: 320,
    images: [], stock: { quantity: 20, lowStockThreshold: 5, lastUpdated: now },
    badges: { isNew: true, isTrending: false, isRecommended: true },
    active: true, sortOrder: 3, createdAt: now, updatedAt: now,
  },
  {
    id: 'prod-004',
    name: 'Butterscotch Cone Regular',
    nickname: 'Butterscotch Cone',
    aliases: ['butterscotch', 'butter scotch', 'ബട്ടർസ്കോച്ച്'],
    classification: { typeId: 'cone', flavor: 'butterscotch', variant: 'regular', packagingType: 'box', temperatureSensitivity: 'standard' },
    categoryId: 'cat-cones', subcategoryId: 'sub-regular-cone',
    unitType: 'box', unitsPerPackage: 24, price: 190,
    images: [], stock: { quantity: 40, lowStockThreshold: 10, lastUpdated: now },
    badges: { isNew: false, isTrending: false, isRecommended: false },
    active: true, sortOrder: 4, createdAt: now, updatedAt: now,
  },
  {
    id: 'prod-005',
    name: 'Mango Cone Regular',
    nickname: 'Mango Cone',
    aliases: ['mango', 'mango cone', 'മാങ്ങ'],
    classification: { typeId: 'cone', flavor: 'mango', variant: 'regular', packagingType: 'box', temperatureSensitivity: 'quick-melt' },
    categoryId: 'cat-cones', subcategoryId: 'sub-regular-cone',
    unitType: 'box', unitsPerPackage: 24, price: 195,
    images: [], stock: { quantity: 0, lowStockThreshold: 10, lastUpdated: now },
    badges: { isNew: false, isTrending: false, isRecommended: false },
    active: true, sortOrder: 5, createdAt: now, updatedAt: now,
  },
  {
    id: 'prod-006',
    name: 'Choco Bar Classic',
    nickname: 'Choco Bar',
    aliases: ['choco bar', 'chocolate bar', 'ചോക്കോ ബാർ'],
    classification: { typeId: 'bar', flavor: 'chocolate', variant: 'regular', packagingType: 'box', temperatureSensitivity: 'standard' },
    categoryId: 'cat-bars', subcategoryId: 'sub-choco-bar',
    unitType: 'box', unitsPerPackage: 30, price: 240,
    images: [], stock: { quantity: 60, lowStockThreshold: 15, lastUpdated: now },
    badges: { isNew: false, isTrending: true, isRecommended: true },
    active: true, sortOrder: 6, createdAt: now, updatedAt: now,
  },
  {
    id: 'prod-007',
    name: 'Choco Bar Premium',
    nickname: 'Premium Choco',
    aliases: ['premium choco', 'premium bar', 'പ്രീമിയം ചോക്കോ'],
    classification: { typeId: 'bar', flavor: 'chocolate', variant: 'premium', packagingType: 'box', temperatureSensitivity: 'standard' },
    categoryId: 'cat-bars', subcategoryId: 'sub-choco-bar',
    unitType: 'box', unitsPerPackage: 20, price: 350,
    images: [], stock: { quantity: 25, lowStockThreshold: 5, lastUpdated: now },
    badges: { isNew: true, isTrending: false, isRecommended: false },
    active: true, sortOrder: 7, createdAt: now, updatedAt: now,
  },
  {
    id: 'prod-008',
    name: 'Mango Fruit Bar',
    nickname: 'Mango Bar',
    aliases: ['mango bar', 'fruit bar mango', 'മാങ്ങ ബാർ'],
    classification: { typeId: 'bar', flavor: 'mango', variant: 'regular', packagingType: 'box', temperatureSensitivity: 'quick-melt' },
    categoryId: 'cat-bars', subcategoryId: 'sub-fruit-bar',
    unitType: 'box', unitsPerPackage: 30, price: 210,
    images: [], stock: { quantity: 45, lowStockThreshold: 10, lastUpdated: now },
    badges: { isNew: false, isTrending: false, isRecommended: true },
    active: true, sortOrder: 8, createdAt: now, updatedAt: now,
  },
  {
    id: 'prod-009',
    name: 'Mixed Fruit Bar',
    nickname: 'Fruit Bar',
    aliases: ['fruit bar', 'mixed fruit', 'ഫ്രൂട്ട് ബാർ'],
    classification: { typeId: 'bar', flavor: 'mixed-fruit', variant: 'regular', packagingType: 'box', temperatureSensitivity: 'quick-melt' },
    categoryId: 'cat-bars', subcategoryId: 'sub-fruit-bar',
    unitType: 'box', unitsPerPackage: 30, price: 200,
    images: [], stock: { quantity: 30, lowStockThreshold: 10, lastUpdated: now },
    badges: { isNew: false, isTrending: false, isRecommended: false },
    active: true, sortOrder: 9, createdAt: now, updatedAt: now,
  },
  {
    id: 'prod-010',
    name: 'Tender Coconut Bar',
    nickname: 'Coconut Bar',
    aliases: ['coconut', 'tender coconut', 'ഇളനീർ'],
    classification: { typeId: 'bar', flavor: 'tender-coconut', variant: 'regular', packagingType: 'box', temperatureSensitivity: 'standard' },
    categoryId: 'cat-bars', subcategoryId: 'sub-fruit-bar',
    unitType: 'box', unitsPerPackage: 30, price: 220,
    images: [], stock: { quantity: 15, lowStockThreshold: 10, lastUpdated: now },
    badges: { isNew: true, isTrending: false, isRecommended: false },
    active: true, sortOrder: 10, createdAt: now, updatedAt: now,
  },
  {
    id: 'prod-011',
    name: 'Vanilla Family Pack 500ml',
    nickname: 'Vanilla 500ml',
    aliases: ['vanilla pack', 'vanilla 500', 'വാനില പാക്ക്', 'vanilla big'],
    classification: { typeId: 'family-pack', flavor: 'vanilla', variant: 'regular', packagingType: 'single', temperatureSensitivity: 'standard' },
    categoryId: 'cat-family', subcategoryId: 'sub-500ml',
    unitType: 'piece', unitsPerPackage: 1, price: 120,
    images: [], stock: { quantity: 80, lowStockThreshold: 20, lastUpdated: now },
    badges: { isNew: false, isTrending: true, isRecommended: true },
    active: true, sortOrder: 11, createdAt: now, updatedAt: now,
  },
  {
    id: 'prod-012',
    name: 'Chocolate Family Pack 500ml',
    nickname: 'Choco 500ml',
    aliases: ['chocolate pack', 'choco 500', 'ചോക്ലേറ്റ് പാക്ക്'],
    classification: { typeId: 'family-pack', flavor: 'chocolate', variant: 'regular', packagingType: 'single', temperatureSensitivity: 'standard' },
    categoryId: 'cat-family', subcategoryId: 'sub-500ml',
    unitType: 'piece', unitsPerPackage: 1, price: 130,
    images: [], stock: { quantity: 65, lowStockThreshold: 15, lastUpdated: now },
    badges: { isNew: false, isTrending: false, isRecommended: true },
    active: true, sortOrder: 12, createdAt: now, updatedAt: now,
  },
  {
    id: 'prod-013',
    name: 'Butterscotch Family Pack 1L',
    nickname: 'Butterscotch 1L',
    aliases: ['butterscotch 1l', 'butterscotch big', 'ബട്ടർസ്കോച്ച് ലിറ്റർ'],
    classification: { typeId: 'family-pack', flavor: 'butterscotch', variant: 'premium', packagingType: 'single', temperatureSensitivity: 'standard' },
    categoryId: 'cat-family', subcategoryId: 'sub-1l',
    unitType: 'piece', unitsPerPackage: 1, price: 220,
    images: [], stock: { quantity: 30, lowStockThreshold: 10, lastUpdated: now },
    badges: { isNew: false, isTrending: false, isRecommended: false },
    active: true, sortOrder: 13, createdAt: now, updatedAt: now,
  },
  {
    id: 'prod-014',
    name: 'Pista Family Pack 1L',
    nickname: 'Pista 1L',
    aliases: ['pista', 'pista 1l', 'pistachio', 'പിസ്ത'],
    classification: { typeId: 'family-pack', flavor: 'pista', variant: 'premium', packagingType: 'single', temperatureSensitivity: 'standard' },
    categoryId: 'cat-family', subcategoryId: 'sub-1l',
    unitType: 'piece', unitsPerPackage: 1, price: 250,
    images: [], stock: { quantity: 18, lowStockThreshold: 5, lastUpdated: now },
    badges: { isNew: false, isTrending: false, isRecommended: true },
    active: true, sortOrder: 14, createdAt: now, updatedAt: now,
  },
  {
    id: 'prod-015',
    name: 'Vanilla Family Pack 1L',
    nickname: 'Vanilla 1L',
    aliases: ['vanilla 1l', 'vanilla litre', 'വാനില ലിറ്റർ'],
    classification: { typeId: 'family-pack', flavor: 'vanilla', variant: 'regular', packagingType: 'single', temperatureSensitivity: 'standard' },
    categoryId: 'cat-family', subcategoryId: 'sub-1l',
    unitType: 'piece', unitsPerPackage: 1, price: 200,
    images: [], stock: { quantity: 55, lowStockThreshold: 15, lastUpdated: now },
    badges: { isNew: false, isTrending: true, isRecommended: false },
    active: true, sortOrder: 15, createdAt: now, updatedAt: now,
  },
]

// ─── Orders ──────────────────────────────────────────────
const orders = [
  {
    id: 'order-001',
    retailerId: 'retailer-001', retailerName: 'Rajan\'s Cool Corner', retailerPhone: '+911234567891',
    items: [
      { productId: 'prod-001', productName: 'Vanilla Cone Regular', nickname: 'Vanilla Cone', quantity: 5, unitType: 'box', price: 180, lineTotal: 900 },
      { productId: 'prod-006', productName: 'Choco Bar Classic', nickname: 'Choco Bar', quantity: 3, unitType: 'box', price: 240, lineTotal: 720 },
    ],
    status: 'pending', totalAmount: 1620, notes: '', adminNotes: '', orderSource: 'manual',
    createdAt: now, updatedAt: now, statusHistory: [{ status: 'pending', changedBy: 'retailer-001', changedAt: now }],
  },
  {
    id: 'order-002',
    retailerId: 'retailer-001', retailerName: 'Rajan\'s Cool Corner', retailerPhone: '+911234567891',
    items: [
      { productId: 'prod-011', productName: 'Vanilla Family Pack 500ml', nickname: 'Vanilla 500ml', quantity: 10, unitType: 'piece', price: 120, lineTotal: 1200 },
    ],
    status: 'accepted', totalAmount: 1200, notes: 'Urgent delivery needed', adminNotes: '', orderSource: 'manual',
    createdAt: now, updatedAt: now, statusHistory: [
      { status: 'pending', changedBy: 'retailer-001', changedAt: now },
      { status: 'accepted', changedBy: 'wholesaler-001', changedAt: now },
    ],
  },
  {
    id: 'order-003',
    retailerId: 'retailer-002', retailerName: 'Sree Krishna Store', retailerPhone: '+919876543211',
    items: [
      { productId: 'prod-002', productName: 'Chocolate Cone Regular', nickname: 'Choco Cone', quantity: 4, unitType: 'box', price: 200, lineTotal: 800 },
      { productId: 'prod-008', productName: 'Mango Fruit Bar', nickname: 'Mango Bar', quantity: 2, unitType: 'box', price: 210, lineTotal: 420 },
      { productId: 'prod-014', productName: 'Pista Family Pack 1L', nickname: 'Pista 1L', quantity: 5, unitType: 'piece', price: 250, lineTotal: 1250 },
    ],
    status: 'shipped', assignedDeliveryId: 'delivery-001', assignedDeliveryName: 'Arun Kumar',
    totalAmount: 2470, notes: '', adminNotes: '', orderSource: 'manual',
    createdAt: now, updatedAt: now, statusHistory: [
      { status: 'pending', changedBy: 'retailer-002', changedAt: now },
      { status: 'accepted', changedBy: 'wholesaler-001', changedAt: now },
      { status: 'shipped', changedBy: 'wholesaler-001', changedAt: now },
    ],
  },
  {
    id: 'order-004',
    retailerId: 'retailer-003', retailerName: 'Fresh Bite Shop', retailerPhone: '+919876543212',
    items: [
      { productId: 'prod-003', productName: 'Strawberry Cone Waffle', nickname: 'Strawberry Waffle', quantity: 2, unitType: 'box', price: 320, lineTotal: 640 },
      { productId: 'prod-012', productName: 'Chocolate Family Pack 500ml', nickname: 'Choco 500ml', quantity: 8, unitType: 'piece', price: 130, lineTotal: 1040 },
    ],
    status: 'delivered', assignedDeliveryId: 'delivery-002', assignedDeliveryName: 'Vishnu M',
    totalAmount: 1680, notes: '', adminNotes: '', orderSource: 'manual', invoiceId: 'inv-001',
    createdAt: now, updatedAt: now, statusHistory: [
      { status: 'pending', changedBy: 'retailer-003', changedAt: now },
      { status: 'accepted', changedBy: 'wholesaler-001', changedAt: now },
      { status: 'shipped', changedBy: 'wholesaler-001', changedAt: now },
      { status: 'delivered', changedBy: 'delivery-002', changedAt: now },
    ],
  },
  {
    id: 'order-005',
    retailerId: 'retailer-002', retailerName: 'Sree Krishna Store', retailerPhone: '+919876543211',
    items: [
      { productId: 'prod-007', productName: 'Choco Bar Premium', nickname: 'Premium Choco', quantity: 3, unitType: 'box', price: 350, lineTotal: 1050 },
    ],
    status: 'cancelled', totalAmount: 1050, notes: 'Customer cancelled', adminNotes: 'Out of stock', orderSource: 'manual',
    createdAt: now, updatedAt: now, statusHistory: [
      { status: 'pending', changedBy: 'retailer-002', changedAt: now },
      { status: 'cancelled', changedBy: 'wholesaler-001', changedAt: now, note: 'Product out of stock' },
    ],
  },
]

// ─── System Settings ─────────────────────────────────────
const systemSettings = {
  wholesalerName: 'Kerala Ice Cream Wholesale',
  wholesalerAddress: 'MG Road, Thrissur, Kerala 680001',
  wholesalerPhone: '+911234567890',
  wholesalerGST: '32AABCU9603R1ZM',
  taxRate: 5,
  currency: 'INR',
  invoicePrefix: 'INV',
  nextInvoiceNumber: 2,
  newBadgeDurationDays: 14,
  updatedAt: now,
}

// ─── Classification Options ──────────────────────────────
const classificationConfig = {
  types: [
    { id: 'cone', name: 'Cone', nameML: 'കോൺ' },
    { id: 'bar', name: 'Bar / Stick', nameML: 'ബാർ' },
    { id: 'cup', name: 'Cup', nameML: 'കപ്പ്' },
    { id: 'family-pack', name: 'Family Pack', nameML: 'ഫാമിലി പാക്ക്' },
    { id: 'bulk-pack', name: 'Bulk Pack', nameML: 'ബൾക്ക് പാക്ക്' },
    { id: 'tub', name: 'Tub', nameML: 'ടബ്' },
    { id: 'popsicle', name: 'Popsicle', nameML: 'പോപ്സിക്കിൾ' },
  ],
  flavors: [
    { id: 'vanilla', name: 'Vanilla', nameML: 'വാനില' },
    { id: 'chocolate', name: 'Chocolate', nameML: 'ചോക്ലേറ്റ്' },
    { id: 'strawberry', name: 'Strawberry', nameML: 'സ്ട്രോബറി' },
    { id: 'mango', name: 'Mango', nameML: 'മാങ്ങ' },
    { id: 'butterscotch', name: 'Butterscotch', nameML: 'ബട്ടർസ്കോച്ച്' },
    { id: 'pista', name: 'Pista', nameML: 'പിസ്ത' },
    { id: 'mixed-fruit', name: 'Mixed Fruit', nameML: 'മിക്സഡ് ഫ്രൂട്ട്' },
    { id: 'tender-coconut', name: 'Tender Coconut', nameML: 'ഇളനീർ' },
  ],
  variants: [
    { id: 'regular', name: 'Regular', nameML: 'റെഗുലർ' },
    { id: 'premium', name: 'Premium', nameML: 'പ്രീമിയം' },
    { id: 'sugar-free', name: 'Sugar Free', nameML: 'ഷുഗർ ഫ്രീ' },
    { id: 'kids', name: 'Kids Special', nameML: 'കിഡ്‌സ് സ്‌പെഷ്യൽ' },
  ],
  packagingTypes: [
    { id: 'single', name: 'Single Piece', nameML: 'ഒറ്റ' },
    { id: 'box', name: 'Box', nameML: 'ബോക്സ്' },
    { id: 'carton', name: 'Carton', nameML: 'കാർട്ടൺ' },
    { id: 'loose', name: 'Loose', nameML: 'ലൂസ്' },
  ],
  temperatureLevels: [
    { id: 'quick-melt', name: 'Quick Melt', nameML: 'വേഗം ഉരുകും' },
    { id: 'standard', name: 'Standard', nameML: 'സ്റ്റാൻഡേർഡ്' },
    { id: 'long-hold', name: 'Long Hold', nameML: 'നീണ്ട സമയം' },
  ],
}

// ─── Seed Function ───────────────────────────────────────
async function seed() {
  console.log('Seeding Firestore emulator...\n')

  // Users
  for (const user of users) {
    const { id, ...data } = user
    await setDoc(doc(db, 'users', id), data)
    console.log(`  + users/${id} (${data.role}: ${data.name})`)
  }

  // Categories
  for (const cat of categories) {
    const { id, ...data } = cat
    await setDoc(doc(db, 'categories', id), data)
    console.log(`  + categories/${id} (${data.name})`)
  }

  // Products
  for (const product of products) {
    const { id, ...data } = product
    await setDoc(doc(db, 'products', id), data)
    console.log(`  + products/${id} (${data.nickname})`)
  }

  // Orders
  for (const order of orders) {
    const { id, ...data } = order
    await setDoc(doc(db, 'orders', id), data)
    console.log(`  + orders/${id} (${data.status})`)
  }

  // System Settings
  await setDoc(doc(db, 'systemSettings', 'config'), systemSettings)
  console.log('  + systemSettings/config')

  // Classification Options
  await setDoc(doc(db, 'classificationOptions', 'config'), classificationConfig)
  console.log('  + classificationOptions/config')

  console.log('\nSeed complete! Data written to Firestore emulator.')
  console.log('View at: http://localhost:4000/firestore')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
