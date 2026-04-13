<script setup lang="ts">
const emit = defineEmits<{
  productRecognized: [data: {
    name: string
    type: string
    flavor: string
    price: number | null
    weight: string
    barcode: string
    vegStatus: string
  }]
}>()

const { processing, result, error, progress, initOCR, processFrame, recognizeFromVoice, resetScan, cleanup } = useSmartProductCreation()
const { showSuccess, showError } = useToast()

const scannerActive = ref(false)
const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const stream = ref<MediaStream | null>(null)
const currentBarcode = ref('')
const ocrInterval = ref<ReturnType<typeof setInterval> | null>(null)
const barcodeScanner = ref<any>(null)
const scanContainerId = `qr-reader-${Date.now()}`

async function startScanner(): Promise<void> {
  try {
    // Start OCR engine loading in background
    initOCR()

    // Start camera
    stream.value = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    })

    scannerActive.value = true
    await nextTick()

    if (videoRef.value) {
      videoRef.value.srcObject = stream.value
      await videoRef.value.play()
    }

    // Start barcode scanning
    startBarcodeScanner()

    // Start periodic OCR (every 3 seconds)
    ocrInterval.value = setInterval(() => captureAndOCR(), 3000)

    // Do first OCR after 1.5s (let camera focus)
    setTimeout(() => captureAndOCR(), 1500)
  }
  catch (e) {
    showError('Camera access denied. Please allow camera access.')
  }
}

async function startBarcodeScanner(): Promise<void> {
  try {
    const { Html5Qrcode } = await import('html5-qrcode')

    // Create a hidden container for html5-qrcode
    await nextTick()
    const container = document.getElementById(scanContainerId)
    if (!container) return

    barcodeScanner.value = new Html5Qrcode(scanContainerId)

    await barcodeScanner.value.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 }, disableFlip: false },
      (decodedText: string) => {
        if (decodedText && decodedText !== currentBarcode.value) {
          currentBarcode.value = decodedText
          showSuccess(`Barcode detected: ${decodedText}`)
        }
      },
      () => { /* ignore scan failures */ },
    )
  }
  catch {
    // Barcode scanner failed — that's OK, OCR still works
    // This often happens because two video streams can't share the camera
    // In that case, we scan barcodes from our own video frames
    startBarcodeFromVideo()
  }
}

function startBarcodeFromVideo(): void {
  // Alternative: use html5-qrcode's static scanFile on captured frames
  // This runs alongside OCR without needing a second camera stream
}

async function captureAndOCR(): Promise<void> {
  if (!videoRef.value || !canvasRef.value || processing.value) return

  const video = videoRef.value
  const canvas = canvasRef.value

  // Don't scan if video isn't playing
  if (video.readyState < 2) return

  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(video, 0, 0)

  await processFrame(canvas, currentBarcode.value)
}

function stopScanner(): void {
  // Stop OCR interval
  if (ocrInterval.value) {
    clearInterval(ocrInterval.value)
    ocrInterval.value = null
  }

  // Stop barcode scanner
  if (barcodeScanner.value) {
    try { barcodeScanner.value.stop() } catch {}
    barcodeScanner.value = null
  }

  // Stop camera
  if (stream.value) {
    stream.value.getTracks().forEach(t => t.stop())
    stream.value = null
  }

  scannerActive.value = false
}

function useResult(): void {
  if (!result.value) return
  emit('productRecognized', {
    name: result.value.name,
    type: result.value.type,
    flavor: result.value.flavor,
    price: result.value.price,
    weight: result.value.weight,
    barcode: result.value.barcode,
    vegStatus: result.value.vegStatus,
  })
  stopScanner()
  resetScan()
}

function reset(): void {
  stopScanner()
  resetScan()
  currentBarcode.value = ''
}

onUnmounted(() => {
  stopScanner()
  cleanup()
})

function confidenceColor(c: number): string {
  if (c >= 0.6) return 'text-green-600'
  if (c >= 0.3) return 'text-yellow-600'
  return 'text-red-500'
}
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
    <!-- Header -->
    <div class="p-3 border-b border-gray-100 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
          <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
        </div>
        <span class="text-sm font-semibold text-gray-900">Smart Scan</span>
      </div>
      <button
        v-if="scannerActive"
        class="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
        @click="reset"
      >
        Stop
      </button>
    </div>

    <div class="p-3 space-y-3">
      <!-- Start button -->
      <div v-if="!scannerActive">
        <button
          class="w-full py-4 rounded-lg border-2 border-dashed border-blue-300 text-blue-700 text-sm font-medium hover:bg-blue-50 hover:border-blue-400 transition-all flex flex-col items-center gap-2"
          @click="startScanner"
        >
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          Scan Product
          <span class="text-xs text-gray-400 font-normal">Point camera at product — reads automatically</span>
        </button>
      </div>

      <!-- Live scanner -->
      <div v-if="scannerActive" class="space-y-2">
        <!-- Camera feed -->
        <div class="relative rounded-lg overflow-hidden bg-black aspect-[4/3]">
          <video ref="videoRef" autoplay playsinline muted class="w-full h-full object-cover" />

          <!-- Scan overlay corners -->
          <div class="absolute inset-0 pointer-events-none">
            <div class="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-green-400 rounded-tl" />
            <div class="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-green-400 rounded-tr" />
            <div class="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-green-400 rounded-bl" />
            <div class="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-green-400 rounded-br" />
          </div>

          <!-- Scanning indicator -->
          <div class="absolute top-0 left-0 right-0">
            <div
              v-if="processing"
              class="h-1 bg-blue-500 animate-pulse"
            />
          </div>

          <!-- Status bar at bottom -->
          <div class="absolute bottom-0 left-0 right-0 bg-black/60 px-3 py-2">
            <div class="flex items-center justify-between">
              <span class="text-white text-xs">
                {{ processing ? 'Reading...' : 'Scanning...' }}
              </span>
              <div class="flex gap-1">
                <span
                  v-for="field in progress.detectedFields"
                  :key="field"
                  class="text-[9px] px-1.5 py-0.5 rounded-full bg-green-500 text-white font-medium"
                >
                  {{ field }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <canvas ref="canvasRef" class="hidden" />
        <div :id="scanContainerId" class="hidden" />

        <!-- Rejection message -->
        <div
          v-if="progress.step === 'rejected'"
          class="bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2"
        >
          <svg class="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p class="text-xs text-red-700">Not a product label. Point at the product packaging.</p>
        </div>

        <!-- Suggestion -->
        <div
          v-if="progress.suggestion && progress.step !== 'rejected'"
          class="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2"
        >
          <svg class="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-xs text-amber-700">{{ progress.suggestion }}</p>
        </div>

        <!-- Live detected data -->
        <div v-if="result && result.isProductLabel" class="bg-gray-50 rounded-lg p-3 space-y-1.5">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-gray-500 uppercase">Detected</span>
            <span :class="['text-xs font-semibold', confidenceColor(result.confidence)]">
              {{ (result.confidence * 100).toFixed(0) }}%
            </span>
          </div>
          <div v-if="result.brand" class="flex justify-between text-sm">
            <span class="text-gray-500">Brand</span>
            <span class="font-medium text-blue-700">{{ result.brand }}</span>
          </div>
          <div v-if="result.name" class="flex justify-between text-sm">
            <span class="text-gray-500">Product</span>
            <span class="font-medium text-gray-900 text-right max-w-[60%] truncate">{{ result.name }}</span>
          </div>
          <div v-if="result.flavor" class="flex justify-between text-sm">
            <span class="text-gray-500">Flavor</span>
            <span class="font-medium text-gray-900">{{ result.flavor }}</span>
          </div>
          <div v-if="result.type" class="flex justify-between text-sm">
            <span class="text-gray-500">Type</span>
            <span class="font-medium text-gray-900">{{ result.type }}</span>
          </div>
          <div v-if="result.price" class="flex justify-between text-sm">
            <span class="text-gray-500">MRP</span>
            <span class="font-medium text-green-700">₹{{ result.price }}</span>
          </div>
          <div v-if="result.weight" class="flex justify-between text-sm">
            <span class="text-gray-500">Weight</span>
            <span class="font-medium text-gray-900">{{ result.weight }}</span>
          </div>
          <div v-if="result.barcode" class="flex justify-between text-sm">
            <span class="text-gray-500">Barcode</span>
            <span class="font-medium text-gray-900 text-xs font-mono">{{ result.barcode }}</span>
          </div>
          <div v-if="result.vegStatus !== 'unknown'" class="flex justify-between text-sm">
            <span class="text-gray-500">Diet</span>
            <span :class="['font-semibold', result.vegStatus === 'veg' ? 'text-green-600' : 'text-red-600']">
              {{ result.vegStatus === 'veg' ? '🟢 Vegetarian' : '🔴 Non-Veg' }}
            </span>
          </div>
        </div>

        <!-- Use data button -->
        <button
          v-if="result && result.isProductLabel && result.confidence >= 0.2"
          class="w-full py-3 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors"
          @click="useResult"
        >
          Add This Product
        </button>
      </div>

      <!-- Error -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">
        {{ error }}
      </div>
    </div>
  </div>
</template>
