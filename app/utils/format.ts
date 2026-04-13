export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(price)
}

export function formatDate(timestamp: { toDate?: () => Date } | Date | null | undefined): string {
  if (!timestamp) return ''
  const date = timestamp && 'toDate' in timestamp && timestamp.toDate ? timestamp.toDate() : timestamp as Date
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function formatDateShort(timestamp: { toDate?: () => Date } | Date | null | undefined): string {
  if (!timestamp) return ''
  const date = timestamp && 'toDate' in timestamp && timestamp.toDate ? timestamp.toDate() : timestamp as Date
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
  }).format(date)
}
