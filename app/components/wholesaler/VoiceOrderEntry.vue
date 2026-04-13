<script setup lang="ts">
const emit = defineEmits<{
  orderCreated: [orderId: string]
}>()

const { isListening, isSupported, transcript, interimTranscript, confidence, allAlternatives, start, stop, reset: resetSpeech } = useSpeechRecognition()
const { voiceOrder, rawTranscript, parsing, processVoiceInput, updateLine, removeLine, reset: resetOrder } = useVoiceOrderEntry()
const { placeOrder } = useOrders()
const { users, fetchUsers } = useUserAdmin()
const { showSuccess, showError } = useToast()

const placing = ref(false)
const manualInput = ref('')
const selectedRetailerId = ref('')

onMounted(() => {
  fetchUsers()
})

const retailers = computed(() => users.value.filter(u => u.role === 'retailer' && u.active))

// Watch transcript changes and parse in real-time
watch(transcript, (val) => {
  if (val) {
    processVoiceInput(val)
  }
})

function toggleListening(): void {
  if (isListening.value) {
    stop()
  }
  else {
    resetOrder()
    start('en')
  }
}

function processManualInput(): void {
  if (!manualInput.value.trim()) return
  processVoiceInput(manualInput.value)
}

async function submitOrder(): Promise<void> {
  if (voiceOrder.value.lines.length === 0) {
    showError('No products in the order')
    return
  }

  // Find retailer
  const retailer = retailers.value.find(r => r.id === selectedRetailerId.value)
  if (!retailer && !voiceOrder.value.retailerName) {
    showError('Please select a retailer')
    return
  }

  placing.value = true
  try {
    // Convert voice order lines to cart items format
    const items = voiceOrder.value.lines
      .filter(l => l.matchedProduct)
      .map(l => ({
        productId: l.matchedProduct!.id,
        productName: l.matchedProduct!.name,
        nickname: l.matchedProduct!.nickname || '',
        quantity: l.quantity,
        unitType: l.matchedProduct!.unitType,
        price: l.price,
      }))

    if (items.length === 0) {
      showError('No matched products to create order')
      placing.value = false
      return
    }

    const orderId = await placeOrder(items, `Manual order for ${retailer?.name || voiceOrder.value.retailerName}`)
    showSuccess('Order created successfully!')
    emit('orderCreated', orderId)
    resetAll()
  }
  catch (e) {
    showError((e as Error).message || 'Failed to create order')
  }
  finally {
    placing.value = false
  }
}

function resetAll(): void {
  stop()
  resetSpeech()
  resetOrder()
  manualInput.value = ''
  selectedRetailerId.value = ''
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(price)
}
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
    <!-- Header -->
    <div class="p-3 border-b border-gray-100 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
          <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <span class="text-sm font-semibold text-gray-900">Quick Order Entry</span>
      </div>
      <button
        v-if="voiceOrder.lines.length > 0"
        class="text-xs text-gray-500 hover:text-red-500 px-2 py-1 rounded hover:bg-gray-100"
        @click="resetAll"
      >
        Clear
      </button>
    </div>

    <div class="p-3 space-y-3">
      <!-- Retailer selection -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Retailer / Shop</label>
        <select
          v-model="selectedRetailerId"
          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="">Select retailer or say the name</option>
          <option v-for="r in retailers" :key="r.id" :value="r.id">
            {{ r.name }} ({{ r.email }})
          </option>
        </select>
      </div>

      <!-- Voice / Text input -->
      <div class="flex gap-2">
        <button
          v-if="isSupported"
          :class="[
            'w-12 h-12 rounded-full flex items-center justify-center transition-all shrink-0',
            isListening
              ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-lg shadow-red-200'
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
        <div class="flex-1 flex gap-1">
          <textarea
            v-model="manualInput"
            rows="2"
            placeholder="Type or speak: 'Retailer ABC, vanilla cone 3, mango bar 5, butterscotch 2 each'"
            class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            @keydown.enter.prevent="processManualInput"
          />
          <button
            v-if="manualInput.trim()"
            class="px-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-xs font-medium shrink-0"
            @click="processManualInput"
          >
            Parse
          </button>
        </div>
      </div>

      <!-- Live transcript -->
      <div v-if="isListening || interimTranscript" class="bg-purple-50 rounded-lg p-3">
        <p class="text-sm text-gray-800">
          {{ transcript }}
          <span class="text-gray-400 italic">{{ interimTranscript }}</span>
        </p>
        <p v-if="isListening" class="text-xs text-purple-500 mt-1 animate-pulse">
          Listening... say products and quantities
        </p>
      </div>

      <!-- Order table -->
      <div v-if="voiceOrder.lines.length > 0" class="space-y-2">
        <div class="text-xs font-semibold text-gray-500 uppercase px-1">
          Order Items ({{ voiceOrder.lines.length }})
        </div>

        <!-- Retailer from voice -->
        <div v-if="voiceOrder.retailerName && !selectedRetailerId" class="bg-blue-50 rounded-lg px-3 py-2 flex items-center gap-2">
          <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span class="text-sm text-blue-800">{{ voiceOrder.retailerName }}</span>
        </div>

        <!-- Table -->
        <div class="border border-gray-200 rounded-lg overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr class="text-xs text-gray-500">
                <th class="text-left px-3 py-2 font-medium">Product</th>
                <th class="text-center px-2 py-2 font-medium w-16">Qty</th>
                <th class="text-right px-2 py-2 font-medium w-20">Price</th>
                <th class="text-right px-3 py-2 font-medium w-20">Total</th>
                <th class="w-8" />
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="(line, idx) in voiceOrder.lines"
                :key="idx"
                :class="line.matchedProduct ? '' : 'bg-red-50'"
              >
                <td class="px-3 py-2">
                  <span v-if="line.matchedProduct" class="text-gray-900">{{ line.productName }}</span>
                  <span v-else class="text-red-500 italic text-xs">"{{ line.productName }}" — no match</span>
                </td>
                <td class="px-2 py-2 text-center">
                  <input
                    :value="line.quantity"
                    type="number"
                    inputmode="numeric"
                    min="1"
                    class="w-14 text-center text-sm border border-gray-200 rounded px-1 py-1 focus:ring-1 focus:ring-purple-500"
                    @input="(e) => updateLine(idx, 'quantity', parseInt((e.target as HTMLInputElement).value) || 1)"
                  >
                </td>
                <td class="px-2 py-2 text-right text-gray-600 text-xs">
                  {{ line.price ? formatPrice(line.price) : '—' }}
                </td>
                <td class="px-3 py-2 text-right font-medium text-gray-900 text-xs">
                  {{ line.total ? formatPrice(line.total) : '—' }}
                </td>
                <td class="pr-2 py-2">
                  <button class="text-gray-300 hover:text-red-500 p-1" @click="removeLine(idx)">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-50">
              <tr class="font-semibold">
                <td colspan="3" class="px-3 py-2 text-right text-sm text-gray-700">Total</td>
                <td class="px-3 py-2 text-right text-sm text-gray-900">{{ formatPrice(voiceOrder.totalAmount) }}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Submit -->
        <button
          :disabled="placing || voiceOrder.lines.filter(l => l.matchedProduct).length === 0"
          class="w-full py-3 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          @click="submitOrder"
        >
          <span v-if="placing" class="inline-flex items-center gap-2">
            <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Creating Order...
          </span>
          <span v-else>Create Order & Invoice</span>
        </button>
      </div>
    </div>
  </div>
</template>
