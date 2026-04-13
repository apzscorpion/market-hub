import type { Product } from '~/types/product'
import { matchProducts } from '~/utils/productMatcher'

export interface ParsedOrderItem {
  raw: string
  quantity: number
  productQuery: string
  matchedProduct: Product | null
  confidence: number
}

const MALAYALAM_NUMBERS: Record<string, number> = {
  'ഒന്ന്': 1, 'ഒരു': 1,
  'രണ്ട്': 2, 'രണ്ടു': 2,
  'മൂന്ന്': 3, 'മൂന്നു': 3,
  'നാല്': 4, 'നാലു': 4,
  'അഞ്ച്': 5, 'അഞ്ചു': 5,
  'ആറ്': 6, 'ആറു': 6,
  'ഏഴ്': 7, 'ഏഴു': 7,
  'എട്ട്': 8, 'എട്ടു': 8,
  'ഒൻപത്': 9, 'ഒൻപതു': 9,
  'പത്ത്': 10, 'പത്തു': 10,
  'ഇരുപത്': 20, 'ഇരുപതു': 20,
  'മുപ്പത്': 30, 'നാല്പത്': 40,
  'അൻപത്': 50,
}

const ENGLISH_WORDS_TO_NUMBERS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, fifteen: 15, twenty: 20,
  twentyfive: 25, thirty: 30, forty: 40, fifty: 50,
  hundred: 100,
}

const MALAYALAM_TO_ENGLISH: Record<string, string> = {
  'വാനില': 'vanilla',
  'ചോക്ലേറ്റ്': 'chocolate',
  'ചോക്കലേറ്റ്': 'chocolate',
  'ചോകോ': 'choco',
  'സ്ട്രോബെറി': 'strawberry',
  'മാങ്ങ': 'mango',
  'മാംഗോ': 'mango',
  'ബട്ടർസ്കോച്ച്': 'butterscotch',
  'പിസ്ത': 'pista',
  'കോൺ': 'cone',
  'ബാർ': 'bar',
  'കപ്പ്': 'cup',
  'ബോക്സ്': 'box',
  'പാക്ക്': 'pack',
  'ഐസ്ക്രീം': 'ice cream',
  'ഐസ്': 'ice',
}

function parseNumber(text: string): number | null {
  const trimmed = text.trim()

  const numericMatch = trimmed.match(/^\d+$/)
  if (numericMatch) return parseInt(numericMatch[0], 10)

  const lower = trimmed.toLowerCase()
  if (ENGLISH_WORDS_TO_NUMBERS[lower]) return ENGLISH_WORDS_TO_NUMBERS[lower]

  if (MALAYALAM_NUMBERS[trimmed]) return MALAYALAM_NUMBERS[trimmed]

  return null
}

function translateMalayalam(text: string): string {
  let result = text
  for (const [ml, en] of Object.entries(MALAYALAM_TO_ENGLISH)) {
    result = result.replace(new RegExp(ml, 'g'), en)
  }
  return result
}

function splitIntoSegments(text: string): string[] {
  return text
    .split(/[,;।\n]+/)
    .map(s => s.trim())
    .filter(Boolean)
}

function parseSegment(segment: string, products: Product[]): ParsedOrderItem {
  const translated = translateMalayalam(segment)
  const words = translated.split(/\s+/)

  let quantity = 1
  let productQuery = translated

  // Pattern: "<number> <product name>"
  if (words.length >= 2) {
    const num = parseNumber(words[0])
    if (num !== null) {
      quantity = num
      productQuery = words.slice(1).join(' ')
    }
    else {
      // Pattern: "<product name> <number>"
      const lastNum = parseNumber(words[words.length - 1])
      if (lastNum !== null) {
        quantity = lastNum
        productQuery = words.slice(0, -1).join(' ')
      }
    }
  }

  const matches = matchProducts(productQuery, products)
  const bestMatch = matches[0] || null

  return {
    raw: segment,
    quantity,
    productQuery,
    matchedProduct: bestMatch?.product ?? null,
    confidence: bestMatch?.score != null ? Math.max(0, 1 - bestMatch.score * 0.15) : 0,
  }
}

export function parseVoiceOrder(text: string, products: Product[]): ParsedOrderItem[] {
  if (!text.trim()) return []
  const segments = splitIntoSegments(text)
  return segments.map(seg => parseSegment(seg, products))
}

// Voice command detection
const CONFIRM_PHRASES = [
  'confirm', 'confirmed', 'submit', 'place order', 'done', 'okay',
  'കൺഫേം', 'ഓക്കേ', 'ശരി', 'ഓർഡർ',
]

const CANCEL_PHRASES = [
  'cancel', 'stop', 'clear', 'remove all', 'reset',
  'ക്യാൻസൽ', 'നിർത്തൂ', 'മായ്ക്കൂ',
]

export type VoiceCommand = 'confirm' | 'cancel' | null

export function detectVoiceCommand(text: string): VoiceCommand {
  const lower = text.toLowerCase().trim()
  if (CONFIRM_PHRASES.some(p => lower.includes(p))) return 'confirm'
  if (CANCEL_PHRASES.some(p => lower.includes(p))) return 'cancel'
  return null
}
