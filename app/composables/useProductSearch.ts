import type { Product } from '~/types/product'
import { matchProducts, type MatchResult } from '~/utils/productMatcher'

export function useProductSearch() {
  const productStore = useProductStore()

  function search(query: string, limit = 8): MatchResult[] {
    return matchProducts(query, productStore.products).slice(0, limit)
  }

  function searchWithFrequencyBoost(
    query: string,
    frequentProductIds: string[],
    limit = 8,
  ): MatchResult[] {
    const results = matchProducts(query, productStore.products)

    return results
      .sort((a, b) => {
        const aBoost = frequentProductIds.includes(a.product.id) ? -0.5 : 0
        const bBoost = frequentProductIds.includes(b.product.id) ? -0.5 : 0
        return (a.score + aBoost) - (b.score + bBoost)
      })
      .slice(0, limit)
  }

  return { search, searchWithFrequencyBoost }
}
