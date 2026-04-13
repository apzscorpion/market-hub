import type { Product } from '~/types/product'

export interface MatchResult {
  product: Product
  score: number
  matchedField: 'nickname' | 'name' | 'alias' | 'fuzzy'
  matchedValue: string
}

function normalizeText(text: string): string {
  return text.normalize('NFC').toLowerCase().trim()
    .replace(/[^a-z0-9\u0D00-\u0D7F\s]/g, '') // keep alphanumeric, Malayalam, spaces
    .replace(/\s+/g, ' ')
}

// Levenshtein distance for fuzzy matching
function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

// Normalized similarity score (0 = identical, 1 = completely different)
function similarity(a: string, b: string): number {
  const dist = levenshtein(a, b)
  return dist / Math.max(a.length, b.length, 1)
}

// Common Indian English accent phonetic substitutions
// These pairs are commonly confused by speech recognition with Indian accents
const PHONETIC_SUBSTITUTIONS: [RegExp, string][] = [
  // Consonant confusions
  [/\bd/g, 'l'], [/\bl/g, 'd'],     // d ↔ l (Dasha ↔ Lasha)
  [/\bth/g, 't'], [/\bt(?!h)/g, 'th'],
  [/v/g, 'w'], [/w/g, 'v'],         // v ↔ w
  [/sh/g, 's'], [/s(?!h)/g, 'sh'],  // sh ↔ s
  [/z/g, 's'], [/s/g, 'z'],         // z ↔ s
  [/f/g, 'p'], [/p(?!h)/g, 'f'],    // f ↔ p
  // Vowel confusions
  [/corn/g, 'cone'], [/cone/g, 'corn'],
  [/cream/g, 'creme'], [/creme/g, 'cream'],
  // Common ice cream mishears
  [/ice\s*cream/gi, 'icecream'],
  [/i\s*scream/gi, 'icecream'],
]

// Generate phonetic variants of a word
function phoneticVariants(text: string): string[] {
  const variants = new Set<string>([text])
  for (const [pattern, replacement] of PHONETIC_SUBSTITUTIONS) {
    const variant = text.replace(pattern, replacement)
    if (variant !== text) variants.add(variant)
  }
  return Array.from(variants)
}

// Score how well query words match against a target string
// Returns 0-1 (0 = perfect match, 1 = no match)
function wordOverlapScore(queryWords: string[], targetWords: string[]): number {
  if (queryWords.length === 0 || targetWords.length === 0) return 1

  let matchedCount = 0
  let totalSimilarity = 0

  for (const qw of queryWords) {
    let bestSim = 1
    for (const tw of targetWords) {
      const sim = similarity(qw, tw)
      if (sim < bestSim) bestSim = sim
    }
    // Consider it a match if similarity is below threshold
    if (bestSim < 0.45) {
      matchedCount++
      totalSimilarity += bestSim
    }
  }

  if (matchedCount === 0) return 1

  // Combine: ratio of matched words + average similarity of matches
  const matchRatio = matchedCount / queryWords.length
  const avgSim = totalSimilarity / matchedCount

  return 1 - (matchRatio * (1 - avgSim))
}

export function matchProducts(queryText: string, products: Product[]): MatchResult[] {
  const q = normalizeText(queryText)
  if (!q) return []

  const queryWords = q.split(/\s+/).filter(w => w.length > 1)
  const queryVariants = phoneticVariants(q)

  const results: MatchResult[] = []

  for (const product of products) {
    if (!product.active) continue

    const nick = normalizeText(product.nickname)
    const name = normalizeText(product.name)
    const nickWords = nick.split(/\s+/).filter(w => w.length > 1)
    const nameWords = name.split(/\s+/).filter(w => w.length > 1)

    let bestScore = Infinity
    let bestField: MatchResult['matchedField'] = 'name'
    let bestValue = product.name

    // Tier 0: Exact nickname match
    if (nick === q) {
      results.push({ product, score: 0, matchedField: 'nickname', matchedValue: product.nickname })
      continue
    }

    // Tier 1: Exact name match
    if (name === q) {
      bestScore = 0.5
      bestField = 'name'
      bestValue = product.name
    }

    // Tier 2: Nickname starts with or contains query
    if (nick.startsWith(q)) {
      bestScore = Math.min(bestScore, 1)
      bestField = 'nickname'
      bestValue = product.nickname
    }
    else if (nick.includes(q)) {
      bestScore = Math.min(bestScore, 2)
      bestField = 'nickname'
      bestValue = product.nickname
    }

    // Tier 3: Name contains query
    if (name.includes(q)) {
      const s = 2.5
      if (s < bestScore) {
        bestScore = s
        bestField = 'name'
        bestValue = product.name
      }
    }

    // Tier 4: Alias matches
    for (const alias of (product.aliases || [])) {
      const a = normalizeText(alias)
      if (a === q) {
        bestScore = Math.min(bestScore, 1)
        bestField = 'alias'
        bestValue = alias
        break
      }
      if (a.includes(q) || q.includes(a)) {
        const s = 3
        if (s < bestScore) {
          bestScore = s
          bestField = 'alias'
          bestValue = alias
        }
      }
    }

    // Tier 5: Phonetic variant matching (for accent issues)
    if (bestScore > 3) {
      for (const variant of queryVariants) {
        if (variant === q) continue
        const vNorm = normalizeText(variant)
        if (nick.includes(vNorm) || name.includes(vNorm)) {
          bestScore = Math.min(bestScore, 4)
          bestField = 'fuzzy'
          bestValue = product.name
          break
        }
      }
    }

    // Tier 6: Fuzzy word-level matching (handles "Dasha Vanilla corn" → "Lhasa Vanilla Cone")
    if (bestScore > 4) {
      const nickOverlap = wordOverlapScore(queryWords, nickWords)
      const nameOverlap = wordOverlapScore(queryWords, nameWords)
      const bestOverlap = Math.min(nickOverlap, nameOverlap)

      if (bestOverlap < 0.6) {
        const s = 5 + bestOverlap // 5.0 to 5.6
        if (s < bestScore) {
          bestScore = s
          bestField = 'fuzzy'
          bestValue = nameOverlap < nickOverlap ? product.name : product.nickname
        }
      }
    }

    // Tier 7: Levenshtein on full string (last resort)
    if (bestScore > 5.5) {
      const nickSim = similarity(q, nick)
      const nameSim = similarity(q, name)
      const best = Math.min(nickSim, nameSim)

      if (best < 0.5) {
        const s = 6 + best // 6.0 to 6.5
        if (s < bestScore) {
          bestScore = s
          bestField = 'fuzzy'
          bestValue = nameSim < nickSim ? product.name : product.nickname
        }
      }
    }

    if (bestScore < Infinity) {
      results.push({ product, score: bestScore, matchedField: bestField, matchedValue: bestValue })
    }
  }

  return results.sort((a, b) => a.score - b.score)
}
