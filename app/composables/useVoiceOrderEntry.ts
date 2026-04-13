import { matchProducts } from '~/utils/productMatcher'
import type { Product } from '~/types/product'

export interface VoiceOrderLine {
  productName: string
  matchedProduct: Product | null
  quantity: number
  price: number
  total: number
  confidence: number
}

export interface VoiceOrder {
  retailerName: string
  lines: VoiceOrderLine[]
  totalAmount: number
}

const QTY_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, fifteen: 15, twenty: 20,
  'twenty five': 25, thirty: 30, forty: 40, fifty: 50,
  hundred: 100, dozen: 12, 'half dozen': 6,
}

export function useVoiceOrderEntry() {
  const productStore = useProductStore()

  const voiceOrder = ref<VoiceOrder>({
    retailerName: '',
    lines: [],
    totalAmount: 0,
  })
  const rawTranscript = ref('')
  const parsing = ref(false)

  function parseQuantity(text: string): { qty: number, remaining: string } {
    const trimmed = text.trim()

    // Check numeric at start: "3 vanilla cone"
    const numMatch = trimmed.match(/^(\d+)\s+(.+)/)
    if (numMatch) {
      return { qty: parseInt(numMatch[1], 10), remaining: numMatch[2] }
    }

    // Check numeric at end: "vanilla cone 3"
    const numEndMatch = trimmed.match(/^(.+?)\s+(\d+)$/)
    if (numEndMatch) {
      return { qty: parseInt(numEndMatch[2], 10), remaining: numEndMatch[1] }
    }

    // Check word numbers: "three vanilla cone"
    for (const [word, num] of Object.entries(QTY_WORDS)) {
      if (trimmed.toLowerCase().startsWith(word + ' ')) {
        return { qty: num, remaining: trimmed.slice(word.length).trim() }
      }
      if (trimmed.toLowerCase().endsWith(' ' + word)) {
        return { qty: num, remaining: trimmed.slice(0, -(word.length + 1)).trim() }
      }
    }

    // "each" pattern: "vanilla cone 3 each" or "3 each vanilla"
    const eachMatch = trimmed.match(/(\d+)\s*each/i)
    if (eachMatch) {
      const qty = parseInt(eachMatch[1], 10)
      const remaining = trimmed.replace(/\d+\s*each/i, '').trim()
      return { qty, remaining }
    }

    return { qty: 1, remaining: trimmed }
  }

  function parseTranscript(text: string): VoiceOrder {
    const products = productStore.products
    const lines: VoiceOrderLine[] = []
    let retailerName = ''

    // Split by common separators
    const parts = text
      .split(/[,;।\n]+|(?:\band\b)|(?:\balso\b)/i)
      .map(p => p.trim())
      .filter(p => p.length > 1)

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim()
      if (!part) continue

      // Check if this is the retailer name (usually first, or has keywords)
      const retailerMatch = part.match(
        /^(?:retailer|shop|store|customer|for)\s*[:\-]?\s*(.+)/i,
      )
      if (retailerMatch || (i === 0 && !parseQuantity(part).remaining.match(/vanilla|chocolate|ice|cream|bar|cone|cup|stick|mango|butter/i))) {
        // First part might be retailer name if it doesn't look like a product
        if (retailerMatch) {
          retailerName = retailerMatch[1].trim()
        }
        else if (i === 0) {
          // Check if it matches any product — if not, treat as retailer name
          const testMatch = matchProducts(part, products)
          if (testMatch.length === 0 || testMatch[0].score > 5) {
            retailerName = part
            continue
          }
        }
        if (retailerMatch) continue
      }

      // Parse as product line
      const { qty, remaining } = parseQuantity(part)

      // Handle "X items each" pattern: "vanilla, mango, butterscotch 3 each"
      // If this part has quantity but previous parts don't, apply to all
      if (qty > 1 && remaining.length < 3 && lines.length > 0) {
        // Apply quantity to all previous lines that have qty=1
        for (const line of lines) {
          if (line.quantity === 1) {
            line.quantity = qty
            line.total = line.price * qty
          }
        }
        continue
      }

      const productQuery = remaining || part
      const matches = matchProducts(productQuery, products)
      const best = matches[0]

      const matchedProduct = best?.product ?? null
      const price = matchedProduct?.price ?? 0
      const confidence = best ? Math.max(0, 1 - (best.score / 7)) : 0

      lines.push({
        productName: matchedProduct?.nickname || matchedProduct?.name || productQuery,
        matchedProduct,
        quantity: qty,
        price,
        total: price * qty,
        confidence,
      })
    }

    const totalAmount = lines.reduce((sum, l) => sum + l.total, 0)

    return {
      retailerName,
      lines,
      totalAmount,
    }
  }

  function processVoiceInput(text: string): void {
    parsing.value = true
    rawTranscript.value = text
    voiceOrder.value = parseTranscript(text)
    parsing.value = false
  }

  function updateLine(index: number, field: 'quantity' | 'price', value: number): void {
    const line = voiceOrder.value.lines[index]
    if (!line) return
    if (field === 'quantity') line.quantity = value
    if (field === 'price') line.price = value
    line.total = line.quantity * line.price
    voiceOrder.value.totalAmount = voiceOrder.value.lines.reduce((sum, l) => sum + l.total, 0)
  }

  function removeLine(index: number): void {
    voiceOrder.value.lines.splice(index, 1)
    voiceOrder.value.totalAmount = voiceOrder.value.lines.reduce((sum, l) => sum + l.total, 0)
  }

  function reset(): void {
    voiceOrder.value = { retailerName: '', lines: [], totalAmount: 0 }
    rawTranscript.value = ''
    parsing.value = false
  }

  return {
    voiceOrder,
    rawTranscript,
    parsing,
    processVoiceInput,
    updateLine,
    removeLine,
    reset,
  }
}
