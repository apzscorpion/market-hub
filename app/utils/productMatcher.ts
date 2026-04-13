import type { Product } from '~/types/product'

export interface MatchResult {
  product: Product
  score: number
  matchedField: 'nickname' | 'name' | 'alias'
  matchedValue: string
}

function normalizeText(text: string): string {
  return text.normalize('NFC').toLowerCase().trim()
}

export function matchProducts(queryText: string, products: Product[]): MatchResult[] {
  const q = normalizeText(queryText)
  if (!q) return []

  const results: MatchResult[] = []

  for (const product of products) {
    if (!product.active) continue

    const nick = normalizeText(product.nickname)
    const name = normalizeText(product.name)

    // Tier 0: Exact nickname match
    if (nick === q) {
      results.push({ product, score: 0, matchedField: 'nickname', matchedValue: product.nickname })
      continue
    }

    // Tier 1: Nickname starts with query
    if (nick.startsWith(q)) {
      results.push({ product, score: 1, matchedField: 'nickname', matchedValue: product.nickname })
      continue
    }

    // Tier 2: Alias exact match
    const exactAlias = product.aliases.find(a => normalizeText(a) === q)
    if (exactAlias) {
      results.push({ product, score: 2, matchedField: 'alias', matchedValue: exactAlias })
      continue
    }

    // Tier 3: Alias starts with query
    const startsAlias = product.aliases.find(a => normalizeText(a).startsWith(q))
    if (startsAlias) {
      results.push({ product, score: 3, matchedField: 'alias', matchedValue: startsAlias })
      continue
    }

    // Tier 4: Nickname contains query
    if (nick.includes(q)) {
      results.push({ product, score: 4, matchedField: 'nickname', matchedValue: product.nickname })
      continue
    }

    // Tier 5: Full name contains query
    if (name.includes(q)) {
      results.push({ product, score: 5, matchedField: 'name', matchedValue: product.name })
      continue
    }

    // Tier 6: Any alias contains query
    const containsAlias = product.aliases.find(a => normalizeText(a).includes(q))
    if (containsAlias) {
      results.push({ product, score: 6, matchedField: 'alias', matchedValue: containsAlias })
    }
  }

  return results.sort((a, b) => a.score - b.score)
}
