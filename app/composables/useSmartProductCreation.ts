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
}

export interface ScanProgress {
  step: 'camera' | 'capturing' | 'ocr' | 'barcode' | 'analyzing' | 'done' | 'error'
  message: string
  percent: number
  detectedFields: string[]
  suggestion: string
}

const KNOWN_BRANDS = [
  'amul', 'kwality', 'walls', 'vadilal', 'havmor', 'mother dairy', 'baskin robbins',
  'naturals', 'cream bell', 'arun', 'lazza', 'lasa', 'lhasa', 'joy', 'dinshaws',
  'top n town', 'rollick', 'polar bear', 'hatsun', 'ibaco', 'nandini',
]

const KNOWN_FLAVORS = [
  'vanilla', 'chocolate', 'strawberry', 'mango', 'butterscotch', 'pista', 'pistachio',
  'kulfi', 'tender coconut', 'blackcurrant', 'orange', 'kesar', 'saffron',
  'rajbhog', 'malai', 'anjeer', 'fig', 'choco chip', 'cookies and cream',
  'mint', 'coffee', 'caramel', 'blueberry', 'mixed fruit', 'litchi',
]

const KNOWN_TYPES = [
  'stick', 'cup', 'cone', 'bar', 'tub', 'family pack', 'party pack',
  'sandwich', 'candy', 'lolly', 'kulfi', 'brick', 'cassata', 'roll',
]

export function useSmartProductCreation() {
  const processing = ref(false)
  const result = ref<RecognizedProduct | null>(null)
  const error = ref<string | null>(null)
  const progress = ref<ScanProgress>({
    step: 'camera',
    message: 'Ready to scan',
    percent: 0,
    detectedFields: [],
    suggestion: '',
  })

  function updateProgress(step: ScanProgress['step'], message: string, percent: number, suggestion = '') {
    progress.value = {
      ...progress.value,
      step,
      message,
      percent,
      suggestion,
    }
  }

  function addDetectedField(field: string) {
    if (!progress.value.detectedFields.includes(field)) {
      progress.value.detectedFields = [...progress.value.detectedFields, field]
    }
  }

  async function recognizeFromImage(file: File): Promise<RecognizedProduct> {
    processing.value = true
    error.value = null
    result.value = null
    progress.value.detectedFields = []

    try {
      // Step 1: OCR
      updateProgress('ocr', 'Reading text from image...', 20)
      const ocrText = await performOCR(file)

      // Step 2: Barcode scan
      updateProgress('barcode', 'Scanning for barcodes...', 50)
      const barcode = await scanBarcode(file)

      // Step 3: Analyze extracted text
      updateProgress('analyzing', 'Analyzing product details...', 75)
      const recognized = analyzeText(ocrText, barcode)

      // Step 4: Done
      updateProgress('done', 'Scan complete', 100,
        recognized.confidence < 0.5
          ? 'Try showing the other side of the product for more details'
          : '',
      )

      result.value = recognized
      return recognized
    }
    catch (e) {
      const msg = (e as Error).message
      error.value = msg
      updateProgress('error', msg, 0)
      throw e
    }
    finally {
      processing.value = false
    }
  }

  async function performOCR(file: File): Promise<string> {
    const { createWorker } = await import('tesseract.js')
    const worker = await createWorker('eng')

    try {
      const { data } = await worker.recognize(file)
      return data.text
    }
    finally {
      await worker.terminate()
    }
  }

  async function scanBarcode(file: File): Promise<string> {
    try {
      const { Html5Qrcode } = await import('html5-qrcode')

      return new Promise((resolve) => {
        const img = new Image()
        img.onload = async () => {
          // Create a canvas to pass to the scanner
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')!
          ctx.drawImage(img, 0, 0)

          try {
            const result = await Html5Qrcode.scanFile(file, false)
            addDetectedField('Barcode')
            resolve(result)
          }
          catch {
            resolve('')
          }
        }
        img.onerror = () => resolve('')
        img.src = URL.createObjectURL(file)
      })
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

    // Detect price (₹XX, Rs.XX, MRP XX, etc.)
    const priceMatch = text.match(/(?:₹|rs\.?|mrp\.?|price)\s*:?\s*(\d+(?:\.\d{1,2})?)/i)
    if (priceMatch) {
      price = parseFloat(priceMatch[1])
      addDetectedField('Price')
      confidence += 0.15
    }

    // Detect weight/volume (XXml, XXg, XXL, etc.)
    const weightMatch = text.match(/(\d+(?:\.\d+)?)\s*(ml|l|litre|liter|g|gm|gram|kg)\b/i)
    if (weightMatch) {
      weight = `${weightMatch[1]}${weightMatch[2].toLowerCase()}`
      addDetectedField('Weight')
      confidence += 0.1
    }

    // Detect "ice cream" mention
    if (text.includes('ice cream') || text.includes('icecream') || text.includes('frozen')) {
      if (!type) type = 'Ice Cream'
      confidence += 0.1
    }

    // Build product name from detected parts
    if (!name && lines.length > 0) {
      // Use the first non-trivial line as name
      const nameLine = lines.find(l => l.length > 3 && l.length < 50 && !/^\d+$/.test(l))
      if (nameLine) {
        name = nameLine
        addDetectedField('Name (from label)')
      }
    }

    const fullName = [name, flavor, type].filter(Boolean).join(' ')

    // Generate suggestion based on what's missing
    let suggestion = ''
    if (confidence < 0.3) {
      suggestion = 'Try showing the product label more clearly'
    }
    else if (!flavor) {
      suggestion = 'Show the front of the product to detect flavor'
    }
    else if (!price) {
      suggestion = 'Show the price tag or MRP printed on the product'
    }
    else if (!weight) {
      suggestion = 'Show the back for weight/volume details'
    }

    if (barcode) {
      confidence += 0.1
    }

    return {
      name: fullName || name || 'Unknown Product',
      type: type || 'Ice Cream',
      flavor: flavor || '',
      variant,
      price,
      weight,
      barcode,
      rawText,
      confidence: Math.min(confidence, 1),
    }
  }

  function recognizeFromVoice(transcript: string): RecognizedProduct {
    return analyzeText(transcript, '')
  }

  function resetScan() {
    processing.value = false
    result.value = null
    error.value = null
    progress.value = {
      step: 'camera',
      message: 'Ready to scan',
      percent: 0,
      detectedFields: [],
      suggestion: '',
    }
  }

  return { processing, result, error, progress, recognizeFromImage, recognizeFromVoice, resetScan }
}
