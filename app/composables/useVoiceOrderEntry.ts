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
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
  'twenty five': 25, thirty: 30, forty: 40, fifty: 50,
  hundred: 100, dozen: 12, 'half dozen': 6,
}

// Words that indicate "this is a quantity separator"
const ITEM_SEPARATORS = /\b(?:items?|pieces?|pcs|nos|numbers?|boxes?|packs?|units?|case|cases)\b/gi

export function useVoiceOrderEntry() {
  const productStore = useProductStore()

  const voiceOrder = ref<VoiceOrder>({
    retailerName: '',
    lines: [],
    totalAmount: 0,
  })
  const rawTranscript = ref('')
  const parsing = ref(false)

  function wordToNumber(word: string): number | null {
    const lower = word.toLowerCase().trim()
    const num = parseInt(lower, 10)
    if (!isNaN(num)) return num
    return QTY_WORDS[lower] ?? null
  }

  // Main parsing: handles natural speech like
  // "vanilla 3 item choco bar 5 item mango 10 item"
  // "3 vanilla cone, 5 mango bar, butterscotch 2 each"
  // "retailer ABC vanilla 3 choco 5 mango 10"
  function parseTranscript(text: string): VoiceOrder {
    const products = productStore.products
    let retailerName = ''

    // Normalize text
    let normalized = text.trim()

    // Step 1: Check for retailer prefix
    const retailerMatch = normalized.match(
      /^(?:retailer|shop|store|customer|for)\s*[:\-]?\s*([^,\d]+?)(?=\s+\d|\s+vanilla|\s+choco|\s+mango|\s+butter|\s+straw|\s+ice|\s+pista|,|$)/i,
    )
    if (retailerMatch) {
      retailerName = retailerMatch[1].trim()
      normalized = normalized.slice(retailerMatch[0].length).trim()
    }

    // Step 2: Split into product-quantity segments
    // Strategy: split by "item/items/piece/pieces/each" as segment boundaries,
    // AND by commas, semicolons, "and", newlines
    const segments = splitIntoSegments(normalized)

    // Step 3: Parse each segment into product + quantity
    const lines: VoiceOrderLine[] = []
    for (const segment of segments) {
      const parsed = parseSegment(segment.trim(), products)
      if (parsed) {
        lines.push(parsed)
      }
    }

    // Step 4: If first segment didn't match a product, it might be retailer name
    if (lines.length > 0 && !lines[0].matchedProduct && !retailerName) {
      retailerName = lines[0].productName
      lines.shift()
    }

    const totalAmount = lines.reduce((sum, l) => sum + l.total, 0)

    return { retailerName, lines, totalAmount }
  }

  function splitIntoSegments(text: string): string[] {
    // First, replace item separators with a unique delimiter
    // "vanilla 3 item choco bar 5 item" → "vanilla 3 ||| choco bar 5 |||"
    let processed = text.replace(ITEM_SEPARATORS, '|||')

    // Also split on "each"
    processed = processed.replace(/\beach\b/gi, '|||')

    // Split by standard separators too
    const segments = processed
      .split(/\|\|\||[,;।\n]+|\band\b|\balso\b|\bthen\b/i)
      .map(s => s.trim())
      .filter(s => s.length > 0)

    // If no separators found, try to split by "number + word" patterns
    // "vanilla 3 choco bar 5 mango 10" → ["vanilla 3", "choco bar 5", "mango 10"]
    if (segments.length <= 1 && text.length > 10) {
      const numberSplit = splitByNumberBoundaries(text)
      if (numberSplit.length > 1) return numberSplit
    }

    return segments
  }

  // Split text where a number followed by a new word starts a new product
  // "vanilla 3 choco bar 5 mango 10" → ["vanilla 3", "choco bar 5", "mango 10"]
  function splitByNumberBoundaries(text: string): string[] {
    const words = text.split(/\s+/)
    const segments: string[] = []
    let current: string[] = []

    for (let i = 0; i < words.length; i++) {
      const word = words[i]
      const num = wordToNumber(word)

      if (num !== null && current.length > 0) {
        // This is a number — check if the NEXT word starts a new product
        const nextWord = words[i + 1]
        if (nextWord && wordToNumber(nextWord) === null) {
          // Number followed by text = end of current segment
          current.push(word)
          segments.push(current.join(' '))
          current = []
          continue
        }
      }

      current.push(word)
    }

    if (current.length > 0) {
      segments.push(current.join(' '))
    }

    return segments.filter(s => s.trim().length > 0)
  }

  function parseSegment(segment: string, products: Product[]): VoiceOrderLine | null {
    if (!segment || segment.length < 2) return null

    const words = segment.split(/\s+/)
    let quantity = 1
    let productQuery = segment

    // Pattern 1: "<number> <product>" — "3 vanilla cone"
    const firstNum = wordToNumber(words[0])
    if (firstNum !== null && words.length >= 2) {
      quantity = firstNum
      productQuery = words.slice(1).join(' ')
    }
    else {
      // Pattern 2: "<product> <number>" — "vanilla cone 3"
      const lastNum = wordToNumber(words[words.length - 1])
      if (lastNum !== null && words.length >= 2) {
        quantity = lastNum
        productQuery = words.slice(0, -1).join(' ')
      }
      else {
        // Pattern 3: number in the middle — "vanilla 3 cone" (less common)
        for (let i = 1; i < words.length - 1; i++) {
          const midNum = wordToNumber(words[i])
          if (midNum !== null) {
            quantity = midNum
            productQuery = [...words.slice(0, i), ...words.slice(i + 1)].join(' ')
            break
          }
        }
      }
    }

    // Clean up product query
    productQuery = productQuery
      .replace(/\b(item|items|piece|pieces|pcs|nos|box|boxes|pack|packs|unit|units|each)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim()

    if (!productQuery) return null

    // Match against product catalog
    const matches = matchProducts(productQuery, products)
    const best = matches[0]
    const matchedProduct = best?.product ?? null
    const price = matchedProduct?.price ?? 0
    const confidence = best ? Math.max(0, 1 - (best.score / 7)) : 0

    return {
      productName: matchedProduct?.nickname || matchedProduct?.name || productQuery,
      matchedProduct,
      quantity,
      price,
      total: price * quantity,
      confidence,
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
