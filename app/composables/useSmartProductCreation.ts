export interface RecognizedProduct {
  name: string
  type: string
  flavor: string
  variant: string
  confidence: number
}

export function useSmartProductCreation() {
  const processing = ref(false)
  const result = ref<RecognizedProduct | null>(null)
  const error = ref<string | null>(null)

  async function recognizeFromImage(file: File): Promise<RecognizedProduct> {
    processing.value = true
    error.value = null
    result.value = null

    try {
      const base64 = await fileToBase64(file)
      const recognized = analyzeImageLocally(base64, file.name)
      result.value = recognized
      return recognized
    }
    catch (e) {
      error.value = (e as Error).message
      throw e
    }
    finally {
      processing.value = false
    }
  }

  function recognizeFromVoice(transcript: string): RecognizedProduct {
    const lower = transcript.toLowerCase().trim()
    const knownTypes = ['stick', 'cup', 'cone', 'bar', 'tub', 'family pack', 'party pack']
    const knownFlavors = [
      'vanilla', 'chocolate', 'strawberry', 'mango', 'butterscotch',
      'pista', 'kulfi', 'tender coconut', 'blackcurrant', 'orange',
    ]

    let type = ''
    let flavor = ''
    for (const t of knownTypes) {
      if (lower.includes(t)) { type = t; break }
    }
    for (const f of knownFlavors) {
      if (lower.includes(f)) { flavor = f; break }
    }

    const recognized: RecognizedProduct = {
      name: transcript,
      type: type || 'unknown',
      flavor: flavor || 'unknown',
      variant: '',
      confidence: type && flavor ? 0.8 : type || flavor ? 0.5 : 0.2,
    }

    result.value = recognized
    return recognized
  }

  return { processing, result, error, recognizeFromImage, recognizeFromVoice }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function analyzeImageLocally(base64: string, filename: string): RecognizedProduct {
  const lower = filename.toLowerCase()
  const knownFlavors = ['vanilla', 'chocolate', 'strawberry', 'mango', 'butterscotch']
  const knownTypes = ['stick', 'cup', 'cone', 'bar', 'tub']

  let flavor = ''
  let type = ''
  for (const f of knownFlavors) {
    if (lower.includes(f)) { flavor = f; break }
  }
  for (const t of knownTypes) {
    if (lower.includes(t)) { type = t; break }
  }

  return {
    name: filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
    type: type || 'ice cream',
    flavor: flavor || '',
    variant: '',
    confidence: 0.4,
  }
}
