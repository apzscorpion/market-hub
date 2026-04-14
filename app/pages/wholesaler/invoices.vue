<script setup lang="ts">
import { collection, query, orderBy, onSnapshot, type Unsubscribe } from 'firebase/firestore'
import type { Invoice } from '~/types/invoice'

definePageMeta({ layout: 'wholesaler' })

const { $firebaseDb } = useNuxtApp()
const invoices = ref<Invoice[]>([])
const loading = ref(true)
const search = ref('')
const statusFilter = ref<'all' | 'generated' | 'sent' | 'paid'>('all')

let unsub: Unsubscribe | null = null

onMounted(() => {
  const q = query(collection($firebaseDb, 'invoices'), orderBy('generatedAt', 'desc'))
  unsub = onSnapshot(q, (snap) => {
    invoices.value = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Invoice[]
    loading.value = false
  }, () => { loading.value = false })
})

onUnmounted(() => {
  if (unsub) unsub()
})

const filtered = computed(() => {
  let list = invoices.value
  if (statusFilter.value !== 'all') list = list.filter(i => i.status === statusFilter.value)
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(i =>
      i.invoiceNumber.toLowerCase().includes(q)
      || i.retailerName.toLowerCase().includes(q)
      || i.orderId.includes(q),
    )
  }
  return list
})

const totalAmount = computed(() => filtered.value.reduce((sum, i) => sum + i.total, 0))
const paidAmount = computed(() => filtered.value.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0))
const unpaidAmount = computed(() => totalAmount.value - paidAmount.value)

function formatPrice(n: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n)
}

function formatDate(ts: any): string {
  const date = ts?.toDate ? ts.toDate() : new Date(ts)
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const statusColor: Record<string, string> = {
  generated: 'bg-amber-50 text-amber-700 border-amber-200',
  sent: 'bg-blue-50 text-blue-700 border-blue-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between flex-wrap gap-2">
      <h2 class="text-xl font-semibold text-gray-900">Invoices</h2>
      <div class="flex gap-1">
        <button
          v-for="s in ['all', 'generated', 'sent', 'paid']"
          :key="s"
          :class="[
            'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize',
            statusFilter === s ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100',
          ]"
          @click="statusFilter = s as any"
        >
          {{ s }}
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-2">
      <div class="card-flat p-3 text-center">
        <div class="text-xs text-gray-500">Count</div>
        <div class="text-lg font-bold text-gray-900 tabular-nums">{{ filtered.length }}</div>
      </div>
      <div class="card-flat p-3 text-center">
        <div class="text-xs text-gray-500">Total</div>
        <div class="text-lg font-bold text-gray-900 tabular-nums">{{ formatPrice(totalAmount) }}</div>
      </div>
      <div class="card-flat p-3 text-center">
        <div class="text-xs text-gray-500">Unpaid</div>
        <div class="text-lg font-bold text-red-600 tabular-nums">{{ formatPrice(unpaidAmount) }}</div>
      </div>
    </div>

    <input
      v-model="search"
      type="search"
      placeholder="Search by invoice #, retailer, or order ID..."
      class="input-sm"
    >

    <!-- Loading -->
    <div v-if="loading" class="space-y-2">
      <div v-for="i in 5" :key="i" class="card-flat p-4 animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-1/3 mb-2" />
        <div class="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="filtered.length === 0" class="text-center py-12 text-gray-400 text-sm">
      No invoices found
    </div>

    <!-- List -->
    <TransitionGroup v-else name="list" tag="div" class="space-y-2">
      <NuxtLink
        v-for="inv in filtered"
        :key="inv.id"
        :to="`/wholesaler/orders/${inv.orderId}/invoice`"
        class="card p-4 block hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-sm font-bold text-gray-900">{{ inv.invoiceNumber }}</span>
              <span
                :class="[
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize',
                  statusColor[inv.status] || statusColor.generated,
                ]"
              >
                {{ inv.status }}
              </span>
            </div>
            <p class="text-sm font-medium text-gray-800 truncate">{{ inv.retailerName }}</p>
            <p class="text-xs text-gray-500 mt-0.5">
              {{ inv.items.length }} items · Order #{{ inv.orderId.slice(0, 8) }}
            </p>
            <!-- Item preview -->
            <div class="mt-2 flex flex-wrap gap-1">
              <span
                v-for="item in inv.items.slice(0, 3)"
                :key="item.productName"
                class="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600"
              >
                {{ item.quantity }}× {{ item.nickname || item.productName }}
              </span>
              <span v-if="inv.items.length > 3" class="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                +{{ inv.items.length - 3 }}
              </span>
            </div>
          </div>
          <div class="text-right shrink-0">
            <div class="text-base font-bold text-gray-900 tabular-nums">{{ formatPrice(inv.total) }}</div>
            <div class="text-[11px] text-gray-400 mt-0.5">{{ formatDate(inv.generatedAt) }}</div>
          </div>
        </div>
      </NuxtLink>
    </TransitionGroup>
  </div>
</template>
