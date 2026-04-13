import productKnowledge from '~/data/product-knowledge.json'

export interface RecognizedProduct {
  name: string
  brand: string
  type: string
  flavor: string
  variant: string
  price: number | null
  weight: string
  barcode: string
  rawText: string
  confidence: number
  vegStatus: 'veg' | 'non-veg' | 'unknown'
  isProductLabel: boolean
  rejectionReason: string
}

export interface ScanProgress {
  step: 'idle' | 'scanning' | 'reading' | 'analyzing' | 'done' | 'rejected' | 'error'
  message: string
  percent: number
  detectedFields: string[]
  suggestion: string
}

export function useSmartProductCreation() {
  const processing = ref(false)
  const result = ref<RecognizedProduct | null>(null)
  const error = ref<string | null>(null)
  const progress = ref<ScanProgress>({
    step: 'idle',
    message: 'Point camera at product',
    percent: 0,
    detectedFields: [],
    suggestion: '',
  })

  let tesseractWorker: any = null

  function updateProgress(step: ScanProgress['step'], message: string, percent: number, suggestion = '') {
    progress.value = { ...progress.value, step, message, percent, suggestion }
  }

  function addDetectedField(field: string) {
    if (!progress.value.detectedFields.includes(field)) {
      progress.value.detectedFields = [...progress.value.detectedFields, field]
    }
  }

  async function initOCR() {
    if (tesseractWorker) return
    const { createWorker } = await import('tesseract.js')
    tesseractWorker = await createWorker('eng')
  }

  async function ocrFromCanvas(canvas: HTMLCanvasElement): Promise<string> {
    if (!tesseractWorker) await initOCR()
    try {
      const { data } = await tesseractWorker.recognize(canvas)
      return data.text
    }
    catch {
      return ''
    }
  }

  // Score whether this text looks like a product label vs random text
  function scoreProductLabelLikelihood(text: string): { score: number, reasons: string[] } {
    const lower = text.toLowerCase()
    let score = 0
    const reasons: string[] = []

    // Strong indicators (these almost only appear on product labels)
    for (const indicator of productKnowledge.labelIndicators.strong) {
      if (lower.includes(indicator)) {
        score += 3
        reasons.push(indicator.toUpperCase())
      }
    }

    // Moderate indicators
    for (const indicator of productKnowledge.labelIndicators.moderate) {
      if (lower.includes(indicator)) {
        score += 2
        reasons.push(indicator)
      }
    }

    // Packaging terms
    for (const term of productKnowledge.labelIndicators.packaging) {
      if (lower.includes(term)) {
        score += 1
      }
    }

    // Price pattern
    for (const pattern of productKnowledge.pricePatterns) {
      if (new RegExp(pattern, 'i').test(lower)) {
        score += 3
        reasons.push('Price/MRP')
      }
    }

    // Weight pattern
    for (const pattern of productKnowledge.weightPatterns) {
      if (new RegExp(pattern, 'i').test(lower)) {
        score += 2
        reasons.push('Weight')
      }
    }

    // Known brand detection
    for (const [, brandData] of Object.entries(productKnowledge.brands)) {
      const brandName = brandData.name.toLowerCase()
      if (lower.includes(brandName) || brandData.aliases.some((a: string) => lower.includes(a))) {
        score += 5
        reasons.push(`Brand: ${brandData.name}`)
      }
    }

    return { score, reasons }
  }

  // Match against known brand products
  function matchKnownProduct(text: string): {
    brand: string
    productName: string
    type: string
    flavor: string
  } | null {
    const lower = text.toLowerCase()

    for (const [, brandData] of Object.entries(productKnowledge.brands)) {
      const brandName = brandData.name.toLowerCase()
      const isBrandMatch = lower.includes(brandName) ||
        brandData.aliases.some((a: string) => lower.includes(a))

      if (!isBrandMatch) continue

      // Try to match specific product
      for (const product of brandData.products) {
        if (new RegExp(product.pattern, 'i').test(lower)) {
          return {
            brand: brandData.name,
            productName: `${brandData.name} ${product.name}`,
            type: product.type,
            flavor: product.flavor,
          }
        }
      }

      // Brand matched but no specific product — return brand info
      return {
        brand: brandData.name,
        productName: brandData.name,
        type: '',
        flavor: '',
      }
    }

    return null
  }

  function analyzeText(rawText: string, barcode: string): RecognizedProduct {
    const text = rawText.toLowerCase()

    // Step 1: Is this a product label?
    const { score: labelScore, reasons: labelReasons } = scoreProductLabelLikelihood(text)
    const isProductLabel = labelScore >= 4 // Need at least moderate evidence

    if (!isProductLabel && rawText.length > 20) {
      return {
        name: '',
        brand: '',
        type: '',
        flavor: '',
        variant: '',
        price: null,
        weight: '',
        barcode: barcode || '',
        rawText,
        confidence: 0,
        vegStatus: 'unknown',
        isProductLabel: false,
        rejectionReason: 'This doesn\'t look like a product label. Point the camera at the product packaging.',
      }
    }

    let brand = ''
    let name = ''
    let type = ''
    let flavor = ''
    let price: number | null = null
    let weight = ''
    let vegStatus: 'veg' | 'non-veg' | 'unknown' = 'unknown'
    let confidence = 0

    // Step 2: Match against known brands and products
    const knownMatch = matchKnownProduct(text)
    if (knownMatch) {
      brand = knownMatch.brand
      name = knownMatch.productName
      type = knownMatch.type
      flavor = knownMatch.flavor
      addDetectedField('Brand')
      if (type) addDetectedField('Type')
      if (flavor) addDetectedField('Flavor')
      confidence += 0.4
    }

    // Step 3: Extract price
    for (const pattern of productKnowledge.pricePatterns) {
      const match = text.match(new RegExp(pattern, 'i'))
      if (match) {
        price = parseFloat(match[1])
        addDetectedField('Price')
        confidence += 0.15
        break
      }
    }

    // Step 4: Extract weight
    for (const pattern of productKnowledge.weightPatterns) {
      const match = text.match(new RegExp(pattern, 'i'))
      if (match) {
        weight = `${match[1]}${match[2].toLowerCase()}`
        addDetectedField('Weight')
        confidence += 0.1
        break
      }
    }

    // Step 5: Detect veg/non-veg
    if (text.includes('non-veg') || text.includes('non veg') || text.includes('contains egg') || text.includes('🔴')) {
      vegStatus = 'non-veg'
      addDetectedField('Non-Veg')
      confidence += 0.05
    }
    else if (text.includes('vegetarian') || text.includes('100% veg') || text.includes('pure veg') || text.includes('🟢')) {
      vegStatus = 'veg'
      addDetectedField('Veg')
      confidence += 0.05
    }

    // Step 6: Detect FSSAI (confirms it's a food product)
    const fssaiMatch = text.match(/fssai\s*(?:lic\.?\s*no\.?\s*)?[:\-]?\s*(\d{14})/i)
    if (fssaiMatch) {
      addDetectedField('FSSAI')
      confidence += 0.1
    }

    // Step 7: If no brand matched but label indicators found, try to extract name from text
    if (!name) {
      const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 2 && l.length < 60)
      // Find the most "name-like" line (not a number, not an indicator keyword)
      for (const line of lines) {
        const lower = line.toLowerCase()
        const isIndicator = productKnowledge.labelIndicators.strong.some(i => lower.includes(i))
        const isNumber = /^\d+$/.test(line.trim())
        if (!isIndicator && !isNumber && line.length > 3) {
          name = line
          addDetectedField('Name')
          confidence += 0.1
          break
        }
      }
    }

    if (barcode) {
      addDetectedField('Barcode')
      confidence += 0.1
    }

    // Suggestion based on what's missing
    let suggestion = ''
    if (!isProductLabel && rawText.length > 0) {
      suggestion = 'This doesn\'t look like a product label'
    }
    else if (confidence < 0.2) {
      suggestion = 'Move closer to the product label'
    }
    else if (!brand) {
      suggestion = 'Show the brand name on the packaging'
    }
    else if (!flavor && brand) {
      suggestion = 'Show the front to detect flavor'
    }
    else if (!price) {
      suggestion = 'Show the MRP printed on packaging'
    }
    else if (!weight) {
      suggestion = 'Show the back for net weight info'
    }

    return {
      name: name || '',
      brand,
      type: type || '',
      flavor: flavor || '',
      variant: '',
      price,
      weight,
      barcode: barcode || '',
      rawText,
      confidence: Math.min(confidence, 1),
      vegStatus,
      isProductLabel,
      rejectionReason: isProductLabel ? '' : 'This doesn\'t look like a product label',
    }
  }

  // Merge new scan results with existing ones
  function mergeResults(existing: RecognizedProduct | null, newScan: RecognizedProduct): RecognizedProduct {
    if (!existing) return newScan
    // Don't merge if new scan is rejected
    if (!newScan.isProductLabel && existing.isProductLabel) return existing
    return {
      name: newScan.name || existing.name,
      brand: newScan.brand || existing.brand,
      type: newScan.type || existing.type,
      flavor: newScan.flavor || existing.flavor,
      variant: newScan.variant || existing.variant,
      price: newScan.price ?? existing.price,
      weight: newScan.weight || existing.weight,
      barcode: newScan.barcode || existing.barcode,
      rawText: (existing.rawText + '\n' + newScan.rawText).trim(),
      confidence: Math.max(existing.confidence, newScan.confidence),
      vegStatus: newScan.vegStatus !== 'unknown' ? newScan.vegStatus : existing.vegStatus,
      isProductLabel: existing.isProductLabel || newScan.isProductLabel,
      rejectionReason: '',
    }
  }

  async function processFrame(canvas: HTMLCanvasElement, currentBarcode: string): Promise<RecognizedProduct | null> {
    processing.value = true
    updateProgress('reading', 'Reading product label...', 60)

    try {
      const ocrText = await ocrFromCanvas(canvas)
      if (!ocrText.trim() && !currentBarcode) {
        updateProgress('scanning', 'Point at product label...', 30)
        processing.value = false
        return null
      }

      updateProgress('analyzing', 'Analyzing product...', 80)
      const newResult = analyzeText(ocrText, currentBarcode)

      if (!newResult.isProductLabel && !result.value?.isProductLabel) {
        updateProgress('rejected', newResult.rejectionReason, 0,
          'Point the camera at the product packaging, not other text')
        processing.value = false
        return null
      }

      if (newResult.confidence > 0.1 || newResult.isProductLabel) {
        const merged = mergeResults(result.value, newResult)
        result.value = merged

        const missingFields = []
        if (!merged.brand) missingFields.push('brand')
        if (!merged.flavor) missingFields.push('flavor')
        if (!merged.price) missingFields.push('price')

        updateProgress('done', 'Product detected',
          Math.min(95, merged.confidence * 100),
          missingFields.length > 0 ? `Still looking for: ${missingFields.join(', ')}` : '')
        return merged
      }
      return null
    }
    finally {
      processing.value = false
    }
  }

  function recognizeFromVoice(transcript: string): RecognizedProduct {
    progress.value.detectedFields = []
    const recognized = analyzeText(transcript, '')
    // For voice input, always treat as product (user is intentionally entering)
    recognized.isProductLabel = true
    recognized.rejectionReason = ''
    result.value = recognized
    return recognized
  }

  function resetScan() {
    processing.value = false
    result.value = null
    error.value = null
    progress.value = {
      step: 'idle',
      message: 'Point camera at product',
      percent: 0,
      detectedFields: [],
      suggestion: '',
    }
  }

  async function cleanup() {
    if (tesseractWorker) {
      await tesseractWorker.terminate()
      tesseractWorker = null
    }
  }

  return { processing, result, error, progress, initOCR, processFrame, recognizeFromVoice, mergeResults, resetScan, cleanup }
}
