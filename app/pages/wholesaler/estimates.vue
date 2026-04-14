<script setup lang="ts">
import { matchProducts } from '~/utils/productMatcher'
import type { EstimateLine } from '~/stores/estimates'

definePageMeta({ layout: 'wholesaler' })

const estimatesStore = useEstimatesStore()
const productStore = useProductStore()
const { isListening, isSupported, transcript, interimTranscript, allAlternatives, start, stop, reset: resetSpeech } = useSpeechRecognition()
const { voiceOrder, processVoiceInput, reset: resetParser } = useVoiceOrderEntry()
const { showSuccess, showError, showInfo } = useToast()

const manualInput = ref('')
const retailerName = ref('')
const notes = ref('')
const filter = ref<'today' | 'week' | 'month' | 'all'>('week')
const processing = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

onMounted(() => {
  estimatesStore.load()
})

const filteredList = computed(() => {
  switch (filter.value) {
    case 'today': return estimatesStore.today
    case 'week': return estimatesStore.thisWeek
    case 'month': return estimatesStore.thisMonth
    default: return estimatesStore.estimates
  }
})

const totalForFilter = computed(() => estimatesStore.sumTotal(filteredList.value))

// When voice transcript updates, parse it
watch(transcript, (val) => {
  if (val) processVoiceInput(val)
})

function toggleListening() {
  if (isListening.value) stop()
  else { resetParser(); start('en') }
}

function processManualInput() {
  if (!manualInput.value.trim()) return
  processVoiceInput(manualInput.value)
}

function saveEstimate() {
  if (voiceOrder.value.lines.length === 0) {
    showError('No items to save')
    return
  }
  const name = retailerName.value.trim() || voiceOrder.value.retailerName || 'Unknown'
  const lines: EstimateLine[] = voiceOrder.value.lines.map(l => ({
    productName: l.productName,
    quantity: l.quantity,
    price: l.price,
    total: l.total,
  }))
  estimatesStore.addEstimate({
    retailerName: name,
    lines,
    totalAmount: voiceOrder.value.totalAmount,
    source: 'voice',
    notes: notes.value,
  })
  showSuccess('Estimate saved')
  resetForm()
}

function resetForm() {
  resetSpeech()
  resetParser()
  manualInput.value = ''
  retailerName.value = ''
  notes.value = ''
}

async function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  processing.value = true
  try {
    if (file.type.startsWith('image/')) {
      const text = await extractTextFromImage(file)
      processVoiceInput(text)
      showInfo(`Extracted from image: ${text.length} characters`)
    }
    else if (file.type === 'application/pdf') {
      showError('PDF upload coming soon. Try taking a photo of the page instead.')
    }
    else if (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      const text = await extractTextFromSpreadsheet(file)
      parseSpreadsheetText(text)
      showSuccess('Spreadsheet parsed')
    }
    else {
      showError('Unsupported file type. Use an image, CSV, or Excel file.')
    }
  }
  catch (e) {
    showError((e as Error).message || 'Failed to process file')
  }
  finally {
    processing.value = false
    if (fileInputRef.value) fileInputRef.value.value = ''
  }
}

async function extractTextFromImage(file: File): Promise<string> {
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

async function extractTextFromSpreadsheet(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsText(file)
  })
}

function parseSpreadsheetText(text: string) {
  // Parse CSV-like text: "productName, quantity, price" per line
  const rows = text.split(/\n/).map(l => l.trim()).filter(Boolean)
  const lines: EstimateLine[] = []
  let retailer = ''

  for (const row of rows) {
    const cols = row.split(/[,\t]+/).map(c => c.trim())
    // Skip header rows
    if (cols[0]?.toLowerCase() === 'product' || cols[0]?.toLowerCase() === 'name') continue
    if (cols.length < 2) continue

    // First row with single column might be retailer name
    if (cols.length === 1 && !retailer) {
      retailer = cols[0]
      continue
    }

    const name = cols[0]
    const qty = parseInt(cols[1], 10) || 1
    let price = parseFloat(cols[2] || '0') || 0

    // Try to match product from catalog to auto-fill price
    if (!price) {
      const matches = matchProducts(name, productStore.products)
      if (matches[0]?.product) price = matches[0].product.price
    }

    lines.push({
      productName: name,
      quantity: qty,
      price,
      total: qty * price,
    })
  }

  voiceOrder.value = {
    retailerName: retailer,
    lines: lines.map(l => ({
      productName: l.productName,
      matchedProduct: null,
      quantity: l.quantity,
      price: l.price,
      total: l.total,
      confidence: 1,
    })),
    totalAmount: lines.reduce((s, l) => s + l.total, 0),
  }
}

function formatPrice(n: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n)
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold text-gray-900">Estimates</h2>
      <div class="flex gap-1">
        <button
          v-for="f in ['today', 'week', 'month', 'all']"
          :key="f"
          :class="[
            'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize',
            filter === f ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100',
          ]"
          @click="filter = f as any"
        >
          {{ f }}
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-2">
      <div class="card-flat p-3 text-center">
        <div class="text-xs text-gray-500">Count</div>
        <div class="text-lg font-bold text-gray-900 tabular-nums">{{ filteredList.length }}</div>
      </div>
      <div class="card-flat p-3 text-center">
        <div class="text-xs text-gray-500">Total Value</div>
        <div class="text-lg font-bold text-emerald-600 tabular-nums">{{ formatPrice(totalForFilter) }}</div>
      </div>
      <div class="card-flat p-3 text-center">
        <div class="text-xs text-gray-500">Avg / Estimate</div>
        <div class="text-lg font-bold text-gray-900 tabular-nums">
          {{ filteredList.length > 0 ? formatPrice(totalForFilter / filteredList.length) : '—' }}
        </div>
      </div>
    </div>

    <!-- Input card -->
    <div class="card p-4 space-y-3">
      <h3 class="text-sm font-semibold text-gray-900">New Estimate</h3>

      <!-- Retailer name -->
      <input
        v-model="retailerName"
        type="text"
        placeholder="Retailer / shop name"
        class="input-sm"
      >

      <!-- Voice + input -->
      <div class="flex gap-2">
        <button
          v-if="isSupported"
          :class="[
            'w-11 h-11 rounded-full flex items-center justify-center transition-all shrink-0',
            isListening
              ? 'bg-red-500 hover:bg-red-600 pulse-ring'
              : 'bg-purple-500 hover:bg-purple-600 shadow-md',
          ]"
          @click="toggleListening"
        >
          <svg v-if="!isListening" class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <svg v-else class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        </button>
        <textarea
          v-model="manualInput"
          rows="2"
          placeholder="Speak or type: 'vanilla cone 3, mango bar 5, butterscotch 2 each'"
          class="input-sm flex-1 resize-none"
        />
        <button
          v-if="manualInput.trim()"
          class="px-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-xs font-medium shrink-0"
          @click="processManualInput"
        >
          Parse
        </button>
      </div>

      <!-- File upload -->
      <div class="flex items-center gap-2">
        <label class="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload File
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*,.csv,.xlsx,.xls,application/pdf"
            class="hidden"
            @change="handleFileUpload"
          >
        </label>
        <span v-if="processing" class="text-xs text-blue-500">Processing file...</span>
        <span class="text-[10px] text-gray-400">Image, CSV, or Excel</span>
      </div>

      <!-- Live transcript -->
      <div v-if="isListening || interimTranscript || transcript" class="bg-purple-50 rounded-lg p-3 text-sm">
        <p class="text-gray-800">
          {{ transcript }}
          <span class="text-gray-400 italic">{{ interimTranscript }}</span>
        </p>
      </div>

      <!-- Parsed table -->
      <div v-if="voiceOrder.lines.length > 0">
        <div class="border border-gray-200 rounded-lg overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr class="text-xs text-gray-500">
                <th class="text-left px-3 py-2 font-medium">Product</th>
                <th class="text-center px-2 py-2 font-medium w-14">Qty</th>
                <th class="text-right px-2 py-2 font-medium w-20">Price</th>
                <th class="text-right px-3 py-2 font-medium w-20">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="(line, idx) in voiceOrder.lines" :key="idx">
                <td class="px-3 py-2">{{ line.productName }}</td>
                <td class="px-2 py-2 text-center">{{ line.quantity }}</td>
                <td class="px-2 py-2 text-right text-gray-600">{{ line.price ? formatPrice(line.price) : '—' }}</td>
                <td class="px-3 py-2 text-right font-medium">{{ line.total ? formatPrice(line.total) : '—' }}</td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-50">
              <tr class="font-semibold">
                <td colspan="3" class="px-3 py-2 text-right">Total</td>
                <td class="px-3 py-2 text-right">{{ formatPrice(voiceOrder.totalAmount) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Notes -->
        <textarea
          v-model="notes"
          rows="1"
          placeholder="Notes (optional)"
          class="input-sm mt-3 resize-none"
        />

        <div class="flex gap-2 mt-3">
          <button class="btn-success flex-1" @click="saveEstimate">
            Save Estimate
          </button>
          <button class="btn-outline" @click="resetForm">
            Reset
          </button>
        </div>
      </div>
    </div>

    <!-- List -->
    <div class="space-y-2">
      <h3 class="text-xs font-semibold text-gray-500 uppercase px-1">
        {{ filter }} ({{ filteredList.length }})
      </h3>
      <div v-if="filteredList.length === 0" class="text-center py-8 text-gray-400 text-sm">
        No estimates in this period
      </div>
      <TransitionGroup name="list" tag="div" class="space-y-2">
        <div
          v-for="est in filteredList"
          :key="est.id"
          class="card p-3"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold text-gray-900">{{ est.retailerName }}</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 uppercase font-medium">
                  {{ est.source }}
                </span>
              </div>
              <div class="mt-1 flex flex-wrap gap-1">
                <span
                  v-for="(line, i) in est.lines.slice(0, 4)"
                  :key="i"
                  class="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600"
                >
                  {{ line.quantity }}× {{ line.productName }}
                </span>
                <span v-if="est.lines.length > 4" class="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                  +{{ est.lines.length - 4 }} more
                </span>
              </div>
              <p v-if="est.notes" class="text-xs text-gray-400 mt-1 italic">{{ est.notes }}</p>
            </div>
            <div class="text-right shrink-0">
              <div class="text-sm font-bold text-emerald-600 tabular-nums">{{ formatPrice(est.totalAmount) }}</div>
              <div class="text-[10px] text-gray-400">{{ formatDate(est.createdAt) }}</div>
              <button
                class="text-[10px] text-red-400 hover:text-red-600 mt-1"
                @click="estimatesStore.removeEstimate(est.id)"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>
