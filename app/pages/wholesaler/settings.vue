<script setup lang="ts">
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'

definePageMeta({
  layout: 'wholesaler',
})

const { t } = useI18n()
const { $firebaseDb } = useNuxtApp()
const { showSuccess, showError } = useToast()

const loading = ref(true)
const saving = ref(false)

const form = reactive({
  wholesalerName: '',
  wholesalerAddress: '',
  wholesalerPhone: '',
  wholesalerGST: '',
  taxRate: 0,
  currency: 'INR',
  invoicePrefix: 'INV',
})

onMounted(async () => {
  try {
    const configDoc = await getDoc(doc($firebaseDb, 'systemSettings', 'config'))
    if (configDoc.exists()) {
      const data = configDoc.data()
      form.wholesalerName = data.wholesalerName || ''
      form.wholesalerAddress = data.wholesalerAddress || ''
      form.wholesalerPhone = data.wholesalerPhone || ''
      form.wholesalerGST = data.wholesalerGST || ''
      form.taxRate = data.taxRate || 0
      form.currency = data.currency || 'INR'
      form.invoicePrefix = data.invoicePrefix || 'INV'
    }
  }
  catch (e) {
    console.error('[settings] Failed to load:', e)
  }
  finally {
    loading.value = false
  }
})

async function saveSettings(): Promise<void> {
  saving.value = true
  try {
    await updateDoc(doc($firebaseDb, 'systemSettings', 'config'), {
      ...form,
      updatedAt: serverTimestamp(),
    })
    showSuccess('Settings saved successfully')
  }
  catch (e) {
    showError('Failed to save settings')
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold text-gray-900 mb-6">{{ t('nav.settings') }}</h2>

    <div v-if="loading" class="bg-white rounded-lg border p-6 animate-pulse">
      <div class="space-y-4">
        <div class="h-10 bg-gray-200 rounded" />
        <div class="h-10 bg-gray-200 rounded" />
        <div class="h-10 bg-gray-200 rounded" />
      </div>
    </div>

    <form v-else class="bg-white rounded-lg border border-gray-200 p-6 max-w-lg space-y-4" @submit.prevent="saveSettings">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
        <input v-model="form.wholesalerName" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <textarea v-model="form.wholesalerAddress" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input v-model="form.wholesalerPhone" type="tel" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
        <input v-model="form.wholesalerGST" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
        <input v-model.number="form.taxRate" type="number" min="0" max="100" step="0.5" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Invoice Prefix</label>
        <input v-model="form.invoicePrefix" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
      </div>

      <button
        type="submit"
        :disabled="saving"
        class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {{ saving ? 'Saving...' : 'Save Settings' }}
      </button>
    </form>
  </div>
</template>
