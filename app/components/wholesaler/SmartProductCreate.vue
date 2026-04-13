<script setup lang="ts">
const emit = defineEmits<{
  productRecognized: [data: { name: string, type: string, flavor: string, imageUrl?: string }]
}>()

const { processing, result, recognizeFromImage, recognizeFromVoice } = useSmartProductCreation()
const { uploading, uploadProductImage } = useImageUpload()

const mode = ref<'photo' | 'voice' | null>(null)
const voiceInput = ref('')
const previewUrl = ref<string | null>(null)
const selectedFile = ref<File | null>(null)

function onFileSelect(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

async function processImage(): Promise<void> {
  if (!selectedFile.value) return
  const recognized = await recognizeFromImage(selectedFile.value)

  let imageUrl: string | undefined
  try {
    imageUrl = await uploadProductImage(selectedFile.value, `new_${Date.now()}`)
  }
  catch { /* non-blocking */ }

  emit('productRecognized', {
    name: recognized.name,
    type: recognized.type,
    flavor: recognized.flavor,
    imageUrl,
  })
}

function processVoice(): void {
  if (!voiceInput.value.trim()) return
  const recognized = recognizeFromVoice(voiceInput.value)
  emit('productRecognized', {
    name: recognized.name,
    type: recognized.type,
    flavor: recognized.flavor,
  })
}

function reset(): void {
  mode.value = null
  voiceInput.value = ''
  previewUrl.value = null
  selectedFile.value = null
}
</script>

<template>
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold text-blue-800">Smart Product Creation</h3>
      <button v-if="mode" class="text-xs text-blue-600 hover:underline" @click="reset">Reset</button>
    </div>

    <!-- Mode selection -->
    <div v-if="!mode" class="flex gap-2">
      <button
        class="flex-1 py-3 rounded-lg border-2 border-dashed border-blue-300 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors flex flex-col items-center gap-1"
        @click="mode = 'photo'"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Photo
      </button>
      <button
        class="flex-1 py-3 rounded-lg border-2 border-dashed border-blue-300 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors flex flex-col items-center gap-1"
        @click="mode = 'voice'"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        Voice
      </button>
    </div>

    <!-- Photo mode -->
    <div v-if="mode === 'photo'" class="space-y-3">
      <div v-if="!previewUrl" class="relative">
        <input type="file" accept="image/*" capture="environment" class="absolute inset-0 opacity-0 cursor-pointer" @change="onFileSelect">
        <div class="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center text-blue-600 text-sm">
          Tap to take a photo or upload
        </div>
      </div>
      <div v-else class="space-y-2">
        <img :src="previewUrl" alt="Preview" class="w-full h-40 object-cover rounded-lg">
        <button
          :disabled="processing || uploading"
          class="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
          @click="processImage"
        >
          {{ processing ? 'Analyzing...' : uploading ? 'Uploading...' : 'Recognize & Create' }}
        </button>
      </div>
      <div v-if="result" class="text-xs text-blue-700 bg-blue-100 rounded p-2">
        Detected: <strong>{{ result.name }}</strong>
        ({{ result.type }}, {{ result.flavor || 'unknown flavor' }})
        — {{ (result.confidence * 100).toFixed(0) }}% confidence
      </div>
    </div>

    <!-- Voice mode -->
    <div v-if="mode === 'voice'" class="space-y-2">
      <input
        v-model="voiceInput"
        type="text"
        placeholder="Describe the product, e.g. 'Vanilla stick 5 rupees'"
        class="w-full px-3 py-2 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      >
      <button
        :disabled="!voiceInput.trim()"
        class="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
        @click="processVoice"
      >
        Create from Description
      </button>
      <div v-if="result" class="text-xs text-blue-700 bg-blue-100 rounded p-2">
        Parsed: <strong>{{ result.name }}</strong>
        ({{ result.type }}, {{ result.flavor || 'unknown flavor' }})
        — {{ (result.confidence * 100).toFixed(0) }}% confidence
      </div>
    </div>
  </div>
</template>
