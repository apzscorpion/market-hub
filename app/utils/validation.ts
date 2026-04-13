export function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/[<>"'&]/g, '')
    .trim()
}

export function isValidPhone(phone: string): boolean {
  return /^\+?[1-9]\d{7,14}$/.test(phone.replace(/[\s-]/g, ''))
}

export function isValidPrice(price: number): boolean {
  return typeof price === 'number' && price >= 0 && price <= 100000 && isFinite(price)
}

export function isValidQuantity(qty: number): boolean {
  return Number.isInteger(qty) && qty > 0 && qty <= 10000
}

export function isNonEmpty(val: string): boolean {
  return typeof val === 'string' && val.trim().length > 0
}

export function clampNumber(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val))
}

export function rateLimiter(intervalMs: number) {
  let lastCall = 0
  return function canProceed(): boolean {
    const now = Date.now()
    if (now - lastCall < intervalMs) return false
    lastCall = now
    return true
  }
}
