export interface RecognizedProduct {
  name: string
  type: string
  flavor: string
  variant: string
  price: number | null
  weight: string
  barcode: string
  rawText: string
  confidence: number
  vegStatus: 'veg' | 'non-veg' | 'unknown'
}

export interface ScanProgress {
  step: 'idle' | 'scanning' | 'reading' | 'done' | 'error'
  message: string
  percent: number
  detectedFields: string[]
  suggestion: string
}

const KNOWN_BRANDS = [
  'amul', 'kwality', 'walls', 'vadilal', 'havmor', 'mother dairy', 'baskin robbins',
  'naturals', 'cream bell', 'arun', 'lazza', 'lasa', 'lhasa', 'joy', 'dinshaws',
  'top n town', 'rollick', 'polar bear', 'hatsun', 'ibaco', 'nandini', 'cornetto',
  'magnum', 'feast', 'choco bar', 'milky bar',
]

const KNOWN_FLAVORS = [
  'vanilla', 'chocolate', 'strawberry', 'mango', 'butterscotch', 'pista', 'pistachio',
  'kulfi', 'tender coconut', 'blackcurrant', 'orange', 'kesar', 'saffron',
  'rajbhog', 'malai', 'anjeer', 'fig', 'choco chip', 'cookies and cream',
  'mint', 'coffee', 'caramel', 'blueberry', 'mixed fruit', 'litchi', 'paan',
  'sitaphal', 'gulkand', 'rose', 'jamun', 'jackfruit',
]

const KNOWN_TYPES = [
  'stick', 'cup', 'cone', 'bar', 'tub', 'family pack', 'party pack',
  'sandwich', 'candy', 'lolly', 'kulfi', 'brick', 'cassata', 'roll',
  'sundae', 'bucket', 'scoop',
]

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

  function analyzeText(rawText: string, barcode: string): RecognizedProduct {
    const text = rawText.toLowerCase()
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean)

    let name = ''
    let type = ''
    let flavor = ''
    let variant = ''
    let price: number | null = null
    let weight = ''
    let vegStatus: 'veg' | 'non-veg' | 'unknown' = 'unknown'
    let confidence = 0

    // Detect brand
    for (const brand of KNOWN_BRANDS) {
      if (text.includes(brand)) {
        name = brand.charAt(0).toUpperCase() + brand.slice(1)
        addDetectedField('Brand')
        confidence += 0.2
        break
      }
    }

    // Detect flavor
    for (const f of KNOWN_FLAVORS) {
      if (text.includes(f)) {
        flavor = f.charAt(0).toUpperCase() + f.slice(1)
        addDetectedField('Flavor')
        confidence += 0.2
        break
      }
    }

    // Detect type
    for (const t of KNOWN_TYPES) {
      if (text.includes(t)) {
        type = t.charAt(0).toUpperCase() + t.slice(1)
        addDetectedField('Type')
        confidence += 0.15
        break
      }
    }

    // Detect price
    const priceMatch = text.match(/(?:₹|rs\.?|mrp\.?|price)\s*:?\s*(\d+(?:\.\d{1,2})?)/i)
    if (priceMatch) {
      price = parseFloat(priceMatch[1])
      addDetectedField('Price')
      confidence += 0.15
    }

    // Detect weight/volume
    const weightMatch = text.match(/(\d+(?:\.\d+)?)\s*(ml|l|litre|liter|g|gm|gram|kg)\b/i)
    if (weightMatch) {
      weight = `${weightMatch[1]}${weightMatch[2].toLowerCase()}`
      addDetectedField('Weight')
      confidence += 0.1
    }

    // Detect veg/non-veg
    if (text.includes('non-veg') || text.includes('non veg') || text.includes('contains egg')) {
      vegStatus = 'non-veg'
      addDetectedField('Non-Veg')
      confidence += 0.05
    }
    else if (text.includes('vegetarian') || text.includes('100% veg') || text.includes('pure veg')) {
      vegStatus = 'veg'
      addDetectedField('Veg')
      confidence += 0.05
    }

    // Detect "ice cream"
    if (text.includes('ice cream') || text.includes('icecream') || text.includes('frozen')) {
      if (!type) type = 'Ice Cream'
      confidence += 0.1
    }

    // Build name from detected parts if no brand found
    if (!name && lines.length > 0) {
      const nameLine = lines.find(l => l.length > 3 && l.length < 50 && !/^\d+$/.test(l))
      if (nameLine) {
        name = nameLine
        addDetectedField('Name')
      }
    }

    const fullName = [name, flavor, type].filter(Boolean).join(' ')

    // Suggestion based on what's missing
    let suggestion = ''
    if (confidence < 0.2) {
      suggestion = 'Move closer to the product label'
    }
    else if (!flavor) {
      suggestion = 'Show the front label to detect flavor'
    }
    else if (!price) {
      suggestion = 'Show the MRP/price on the packaging'
    }
    else if (!weight) {
      suggestion = 'Show the back for weight/volume info'
    }

    if (barcode) {
      addDetectedField('Barcode')
      confidence += 0.1
    }

    return {
      name: fullName || name || '',
      type: type || '',
      flavor: flavor || '',
      variant,
      price,
      weight,
      barcode,
      rawText,
      confidence: Math.min(confidence, 1),
      vegStatus,
    }
  }

  // Merge new scan results with existing ones (keep best data)
  function mergeResults(existing: RecognizedProduct | null, newScan: RecognizedProduct): RecognizedProduct {
    if (!existing) return newScan
    return {
      name: newScan.name || existing.name,
      type: newScan.type || existing.type,
      flavor: newScan.flavor || existing.flavor,
      variant: newScan.variant || existing.variant,
      price: newScan.price ?? existing.price,
      weight: newScan.weight || existing.weight,
      barcode: newScan.barcode || existing.barcode,
      rawText: (existing.rawText + '\n' + newScan.rawText).trim(),
      confidence: Math.max(existing.confidence, newScan.confidence),
      vegStatus: newScan.vegStatus !== 'unknown' ? newScan.vegStatus : existing.vegStatus,
    }
  }

  async function processFrame(canvas: HTMLCanvasElement, currentBarcode: string): Promise<RecognizedProduct | null> {
    processing.value = true
    updateProgress('reading', 'Reading product label...', 60)

    try {
      const ocrText = await ocrFromCanvas(canvas)
      if (!ocrText.trim() && !currentBarcode) {
        processing.value = false
        return null
      }

      const newResult = analyzeText(ocrText, currentBarcode)
      if (newResult.confidence > 0.15) {
        const merged = mergeResults(result.value, newResult)
        result.value = merged
        updateProgress('done', 'Product detected', Math.min(95, merged.confidence * 100),
          merged.confidence < 0.5 ? 'Show another side for more details' : '')
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
