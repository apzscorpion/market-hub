<script setup lang="ts">
const emit = defineEmits<{
  productRecognized: [data: {
    name: string
    type: string
    flavor: string
    price: number | null
    weight: string
    barcode: string
  }]
}>()

const { processing, result, error, progress, recognizeFromImage, recognizeFromVoice, resetScan } = useSmartProductCreation()
const { showError } = useToast()

const cameraActive = ref(false)
const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const previewUrl = ref<string | null>(null)
const selectedFile = ref<File | null>(null)
const stream = ref<MediaStream | null>(null)
const voiceMode = ref(false)
const voiceInput = ref('')

async function startCamera(): Promise<void> {
  try {
    stream.value = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
    })
    cameraActive.value = true
    await nextTick()
    if (videoRef.value) {
      videoRef.value.srcObject = stream.value
    }
  }
  catch (e) {
    showError('Camera access denied. Use file upload instead.')
  }
}

function stopCamera(): void {
  if (stream.value) {
    stream.value.getTracks().forEach(t => t.stop())
    stream.value = null
  }
  cameraActive.value = false
}

function capturePhoto(): void {
  if (!videoRef.value || !canvasRef.value) return

  const video = videoRef.value
  const canvas = canvasRef.value
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(video, 0, 0)

  canvas.toBlob(async (blob) => {
    if (!blob) return
    const file = new File([blob], `scan_${Date.now()}.jpg`, { type: 'image/jpeg' })
    selectedFile.value = file
    previewUrl.value = canvas.toDataURL('image/jpeg')
    stopCamera()
    await processImage()
  }, 'image/jpeg', 0.9)
}

function onFileSelect(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

async function processImage(): Promise<void> {
  if (!selectedFile.value) return
  try {
    const recognized = await recognizeFromImage(selectedFile.value)
    if (recognized.confidence >= 0.3) {
      emit('productRecognized', {
        name: recognized.name,
        type: recognized.type,
        flavor: recognized.flavor,
        price: recognized.price,
        weight: recognized.weight,
        barcode: recognized.barcode,
      })
    }
  }
  catch (e) {
    showError('Failed to analyze image. Try again with a clearer photo.')
  }
}

function processVoice(): void {
  if (!voiceInput.value.trim()) return
  const recognized = recognizeFromVoice(voiceInput.value)
  emit('productRecognized', {
    name: recognized.name,
    type: recognized.type,
    flavor: recognized.flavor,
    price: recognized.price,
    weight: recognized.weight,
    barcode: recognized.barcode,
  })
}

async function retakePhoto(): Promise<void> {
  previewUrl.value = null
  selectedFile.value = null
  resetScan()
  await startCamera()
}

function reset(): void {
  stopCamera()
  previewUrl.value = null
  selectedFile.value = null
  voiceMode.value = false
  voiceInput.value = ''
  resetScan()
}

onUnmounted(() => {
  stopCamera()
})

function progressColor(percent: number): string {
  if (percent < 30) return 'bg-red-500'
  if (percent < 60) return 'bg-yellow-500'
  return 'bg-green-500'
}

function confidenceColor(c: number): string {
  if (c >= 0.6) return 'text-green-600'
  if (c >= 0.3) return 'text-yellow-600'
  return 'text-red-500'
}
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
    <!-- Header -->
    <div class="p-4 border-b border-gray-100 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
          <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 class="text-sm font-semibold text-gray-900">Smart Scan</h3>
      </div>
      <button
        v-if="cameraActive || previewUrl || voiceMode"
        class="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
        @click="reset"
      >
        Reset
      </button>
    </div>

    <div class="p-4 space-y-3">
      <!-- Mode selection -->
      <div v-if="!cameraActive && !previewUrl && !voiceMode && !processing" class="grid grid-cols-3 gap-2">
        <button
          class="py-4 rounded-lg border-2 border-dashed border-gray-300 text-gray-600 text-xs font-medium hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex flex-col items-center gap-1.5"
          @click="startCamera"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Camera
        </button>
        <label class="py-4 rounded-lg border-2 border-dashed border-gray-300 text-gray-600 text-xs font-medium hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex flex-col items-center gap-1.5 cursor-pointer">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Upload
          <input type="file" accept="image/*" class="hidden" @change="onFileSelect">
        </label>
        <button
          class="py-4 rounded-lg border-2 border-dashed border-gray-300 text-gray-600 text-xs font-medium hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex flex-col items-center gap-1.5"
          @click="voiceMode = true"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Type
        </button>
      </div>

      <!-- Camera view -->
      <div v-if="cameraActive" class="space-y-3">
        <div class="relative rounded-lg overflow-hidden bg-black aspect-[4/3]">
          <video ref="videoRef" autoplay playsinline muted class="w-full h-full object-cover" />
          <!-- Scan overlay -->
          <div class="absolute inset-0 pointer-events-none">
            <div class="absolute inset-8 border-2 border-white/40 rounded-lg" />
            <div class="absolute top-8 left-8 w-6 h-6 border-t-3 border-l-3 border-white rounded-tl-lg" />
            <div class="absolute top-8 right-8 w-6 h-6 border-t-3 border-r-3 border-white rounded-tr-lg" />
            <div class="absolute bottom-8 left-8 w-6 h-6 border-b-3 border-l-3 border-white rounded-bl-lg" />
            <div class="absolute bottom-8 right-8 w-6 h-6 border-b-3 border-r-3 border-white rounded-br-lg" />
          </div>
          <p class="absolute bottom-2 left-0 right-0 text-center text-white text-xs bg-black/50 py-1">
            Point camera at product label
          </p>
        </div>
        <button
          class="w-full py-3 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center justify-center gap-2"
          @click="capturePhoto"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
          </svg>
          Capture & Scan
        </button>
        <canvas ref="canvasRef" class="hidden" />
      </div>

      <!-- Processing indicator -->
      <div v-if="processing" class="space-y-3">
        <!-- Preview -->
        <img v-if="previewUrl" :src="previewUrl" alt="Scanning..." class="w-full h-40 object-cover rounded-lg opacity-75" />

        <!-- Progress bar -->
        <div>
          <div class="flex justify-between text-xs text-gray-600 mb-1">
            <span>{{ progress.message }}</span>
            <span>{{ progress.percent }}%</span>
          </div>
          <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              :class="['h-full rounded-full transition-all duration-500', progressColor(progress.percent)]"
              :style="{ width: `${progress.percent}%` }"
            />
          </div>
        </div>

        <!-- Detected fields -->
        <div v-if="progress.detectedFields.length > 0" class="flex flex-wrap gap-1.5">
          <span
            v-for="field in progress.detectedFields"
            :key="field"
            class="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium"
          >
            {{ field }}
          </span>
        </div>
      </div>

      <!-- Result -->
      <div v-if="result && !processing" class="space-y-3">
        <img v-if="previewUrl" :src="previewUrl" alt="Scanned" class="w-full h-32 object-cover rounded-lg" />

        <!-- Confidence -->
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-500">Confidence</span>
          <span :class="['text-sm font-semibold', confidenceColor(result.confidence)]">
            {{ (result.confidence * 100).toFixed(0) }}%
          </span>
        </div>

        <!-- Detected info -->
        <div class="bg-gray-50 rounded-lg p-3 space-y-1.5">
          <div v-if="result.name" class="flex justify-between text-sm">
            <span class="text-gray-500">Product</span>
            <span class="font-medium text-gray-900">{{ result.name }}</span>
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
            <span class="text-gray-500">Price (MRP)</span>
            <span class="font-medium text-gray-900">{{ result.price }}</span>
          </div>
          <div v-if="result.weight" class="flex justify-between text-sm">
            <span class="text-gray-500">Weight</span>
            <span class="font-medium text-gray-900">{{ result.weight }}</span>
          </div>
          <div v-if="result.barcode" class="flex justify-between text-sm">
            <span class="text-gray-500">Barcode</span>
            <span class="font-medium text-gray-900 text-xs">{{ result.barcode }}</span>
          </div>
        </div>

        <!-- Suggestion snackbar -->
        <div
          v-if="progress.suggestion"
          class="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2"
        >
          <svg class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-xs text-amber-700">{{ progress.suggestion }}</p>
        </div>

        <!-- Detected fields tags -->
        <div v-if="progress.detectedFields.length > 0" class="flex flex-wrap gap-1.5">
          <span
            v-for="field in progress.detectedFields"
            :key="field"
            class="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium"
          >
            {{ field }}
          </span>
        </div>

        <!-- Action buttons -->
        <div class="flex gap-2">
          <button
            v-if="result.confidence >= 0.3"
            class="flex-1 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            @click="emit('productRecognized', { name: result.name, type: result.type, flavor: result.flavor, price: result.price, weight: result.weight, barcode: result.barcode })"
          >
            Use This Data
          </button>
          <button
            class="px-4 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            @click="retakePhoto"
          >
            Retake
          </button>
        </div>
      </div>

      <!-- Preview (no processing yet - from file upload) -->
      <div v-if="previewUrl && !processing && !result" class="space-y-3">
        <img :src="previewUrl" alt="Preview" class="w-full h-40 object-cover rounded-lg" />
        <button
          class="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          @click="processImage"
        >
          Scan This Image
        </button>
      </div>

      <!-- Voice/Text mode -->
      <div v-if="voiceMode && !processing" class="space-y-3">
        <textarea
          v-model="voiceInput"
          rows="3"
          placeholder="Describe the product, e.g.&#10;'Lazza vanilla cone, 60ml, price 20 rupees'&#10;'Amul chocolate bar 50g MRP 30'"
          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <button
          :disabled="!voiceInput.trim()"
          class="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          @click="processVoice"
        >
          Create from Description
        </button>
      </div>

      <!-- Error -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">
        {{ error }}
      </div>
    </div>
  </div>
</template>
