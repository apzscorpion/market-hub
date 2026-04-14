import { defineStore } from 'pinia'

export interface EstimateLine {
  productName: string
  quantity: number
  price: number
  total: number
}

export interface Estimate {
  id: string
  retailerName: string
  lines: EstimateLine[]
  totalAmount: number
  source: 'voice' | 'manual' | 'excel' | 'image' | 'pdf'
  notes: string
  createdAt: number // timestamp
}

const STORAGE_KEY = 'mh_estimates_v1'

function loadFromStorage(): Estimate[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  }
  catch {
    return []
  }
}

function saveToStorage(estimates: Estimate[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estimates))
  }
  catch {
    // storage full — drop oldest
  }
}

export const useEstimatesStore = defineStore('estimates', () => {
  const estimates = ref<Estimate[]>([])
  const loaded = ref(false)

  function load() {
    if (loaded.value) return
    estimates.value = loadFromStorage()
    loaded.value = true
  }

  function addEstimate(data: Omit<Estimate, 'id' | 'createdAt'>): string {
    load()
    const id = `est_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const estimate: Estimate = {
      ...data,
      id,
      createdAt: Date.now(),
    }
    estimates.value = [estimate, ...estimates.value]
    saveToStorage(estimates.value)
    return id
  }

  function updateEstimate(id: string, patch: Partial<Estimate>) {
    load()
    const idx = estimates.value.findIndex(e => e.id === id)
    if (idx < 0) return
    estimates.value[idx] = { ...estimates.value[idx], ...patch }
    saveToStorage(estimates.value)
  }

  function removeEstimate(id: string) {
    load()
    estimates.value = estimates.value.filter(e => e.id !== id)
    saveToStorage(estimates.value)
  }

  function clearAll() {
    estimates.value = []
    saveToStorage([])
  }

  // Aggregated stats
  const today = computed(() => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    return estimates.value.filter(e => e.createdAt >= start.getTime())
  })

  const thisWeek = computed(() => {
    const start = new Date()
    const day = start.getDay()
    const diff = start.getDate() - day + (day === 0 ? -6 : 1)
    start.setDate(diff)
    start.setHours(0, 0, 0, 0)
    return estimates.value.filter(e => e.createdAt >= start.getTime())
  })

  const thisMonth = computed(() => {
    const start = new Date()
    start.setDate(1)
    start.setHours(0, 0, 0, 0)
    return estimates.value.filter(e => e.createdAt >= start.getTime())
  })

  function sumTotal(list: Estimate[]): number {
    return list.reduce((sum, e) => sum + e.totalAmount, 0)
  }

  return {
    estimates,
    today,
    thisWeek,
    thisMonth,
    load,
    addEstimate,
    updateEstimate,
    removeEstimate,
    clearAll,
    sumTotal,
  }
})
