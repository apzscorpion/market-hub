<script setup lang="ts">
import type { Product } from '~/types/product'
import { parseVoiceOrder, detectVoiceCommand, type ParsedOrderItem } from '~/utils/voiceParser'

const emit = defineEmits<{
  'items-parsed': [items: ParsedOrderItem[]]
  'command': [cmd: 'confirm' | 'cancel']
}>()

const productStore = useProductStore()
const { isListening, isSupported, transcript, interimTranscript, confidence, error, allAlternatives, start, stop, reset } = useSpeechRecognition()

const selectedLang = ref<'en' | 'ml'>('ml')
const parsedItems = ref<ParsedOrderItem[]>([])
const showPreview = ref(false)

watch(transcript, (val) => {
  if (!val) return

  const command = detectVoiceCommand(val)
  if (command) {
    emit('command', command)
    reset()
    return
  }

  parsedItems.value = parseVoiceOrder(val, productStore.products, allAlternatives.value)
  showPreview.value = parsedItems.value.length > 0
})

function toggleListening(): void {
  if (isListening.value) {
    stop()
  }
  else {
    start(selectedLang.value)
  }
}

function addToOrder(): void {
  emit('items-parsed', parsedItems.value)
  reset()
  parsedItems.value = []
  showPreview.value = false
}

function clearVoice(): void {
  reset()
  parsedItems.value = []
  showPreview.value = false
}

function confidenceColor(c: number): string {
  if (c >= 0.8) return 'text-green-600'
  if (c >= 0.5) return 'text-yellow-600'
  return 'text-red-500'
}
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div class="p-3 border-b border-gray-100 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-gray-700">Voice Order</span>
        <span v-if="!isSupported" class="text-xs text-red-500">(Not supported in this browser)</span>
      </div>
      <div class="flex items-center gap-2">
        <select
          v-model="selectedLang"
          class="text-xs border border-gray-200 rounded px-2 py-1"
          :disabled="isListening"
        >
          <option value="ml">Malayalam</option>
          <option value="en">English</option>
        </select>
      </div>
    </div>

    <div class="p-4 space-y-3">
      <!-- Mic button -->
      <div class="flex flex-col items-center gap-3">
        <button
          :disabled="!isSupported"
          :class="[
            'w-16 h-16 rounded-full flex items-center justify-center transition-all',
            isListening
              ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-lg shadow-red-200'
              : 'bg-blue-500 hover:bg-blue-600 shadow-md',
            !isSupported && 'opacity-50 cursor-not-allowed',
          ]"
          @click="toggleListening"
        >
          <svg v-if="!isListening" class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <svg v-else class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        </button>
        <p class="text-xs text-gray-500">
          {{ isListening ? 'Listening... tap to stop' : 'Tap to start speaking' }}
        </p>
      </div>

      <!-- Live transcript -->
      <div v-if="transcript || interimTranscript" class="bg-gray-50 rounded-lg p-3 text-sm">
        <p class="text-gray-800">
          {{ transcript }}
          <span class="text-gray-400 italic">{{ interimTranscript }}</span>
        </p>
        <div v-if="confidence > 0" class="mt-1 text-xs text-gray-400">
          Confidence: {{ (confidence * 100).toFixed(0) }}%
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="text-xs text-red-500 bg-red-50 rounded p-2">
        Speech error: {{ error }}
      </div>

      <!-- Parsed preview -->
      <div v-if="showPreview && parsedItems.length > 0" class="space-y-2">
        <h4 class="text-xs font-medium text-gray-500 uppercase">Detected Items</h4>
        <div class="divide-y divide-gray-100">
          <div
            v-for="(item, idx) in parsedItems"
            :key="idx"
            class="py-2 flex items-center justify-between"
          >
            <div>
              <span v-if="item.matchedProduct" class="text-sm font-medium text-gray-900">
                {{ item.matchedProduct.nickname || item.matchedProduct.name }}
              </span>
              <span v-else class="text-sm text-red-500 italic">
                "{{ item.productQuery }}" — no match
              </span>
              <span class="text-gray-400 text-xs ml-1">x{{ item.quantity }}</span>
            </div>
            <span :class="['text-xs', confidenceColor(item.confidence)]">
              {{ (item.confidence * 100).toFixed(0) }}%
            </span>
          </div>
        </div>

        <div class="flex gap-2 pt-2">
          <button
            class="flex-1 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            @click="addToOrder"
          >
            Add to Order
          </button>
          <button
            class="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
            @click="clearVoice"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
