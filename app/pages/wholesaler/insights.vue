<script setup lang="ts">
definePageMeta({ layout: 'wholesaler', middleware: 'auth' })

const { allOrders, fetchAllOrders } = useOrders()
const { computeInsights } = useSalesInsights()
const loading = ref(true)

onMounted(async () => {
  await fetchAllOrders()
  loading.value = false
})

const insights = computed(() => computeInsights(allOrders.value))

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-xl font-semibold text-gray-900">Sales Insights</h2>

    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div v-for="i in 3" :key="i" class="bg-white border rounded-lg p-6 animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-1/2 mb-3" />
        <div class="h-8 bg-gray-200 rounded w-2/3" />
      </div>
    </div>

    <template v-else>
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white border border-gray-200 rounded-lg p-5">
          <p class="text-sm text-gray-500">Total Revenue</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ formatPrice(insights.totalRevenue) }}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-lg p-5">
          <p class="text-sm text-gray-500">Total Orders</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ insights.totalOrders }}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-lg p-5">
          <p class="text-sm text-gray-500">Avg Order Value</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ formatPrice(insights.avgOrderValue) }}</p>
        </div>
      </div>

      <!-- Orders by Status -->
      <div class="bg-white border border-gray-200 rounded-lg p-5">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">Orders by Status</h3>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="(count, status) in insights.ordersByStatus"
            :key="status"
            :class="['px-3 py-1.5 rounded-lg text-sm font-medium', statusColors[status] || 'bg-gray-100 text-gray-700']"
          >
            {{ status }}: {{ count }}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top Products -->
        <div class="bg-white border border-gray-200 rounded-lg p-5">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">Top Products</h3>
          <div v-if="insights.topProducts.length === 0" class="text-sm text-gray-400">No data yet</div>
          <div v-else class="space-y-2">
            <div
              v-for="(p, idx) in insights.topProducts"
              :key="idx"
              class="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0"
            >
              <div class="flex items-center gap-2">
                <span class="text-xs text-gray-400 w-5">{{ idx + 1 }}.</span>
                <span class="text-sm text-gray-900">{{ p.productName }}</span>
              </div>
              <div class="text-right">
                <span class="text-sm font-medium text-gray-900">{{ formatPrice(p.revenue) }}</span>
                <span class="text-xs text-gray-400 ml-2">{{ p.quantity }} sold</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Retailers -->
        <div class="bg-white border border-gray-200 rounded-lg p-5">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">Top Retailers</h3>
          <div v-if="insights.topRetailers.length === 0" class="text-sm text-gray-400">No data yet</div>
          <div v-else class="space-y-2">
            <div
              v-for="(r, idx) in insights.topRetailers"
              :key="idx"
              class="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0"
            >
              <div class="flex items-center gap-2">
                <span class="text-xs text-gray-400 w-5">{{ idx + 1 }}.</span>
                <span class="text-sm text-gray-900">{{ r.name }}</span>
              </div>
              <div class="text-right">
                <span class="text-sm font-medium text-gray-900">{{ formatPrice(r.totalSpent) }}</span>
                <span class="text-xs text-gray-400 ml-2">{{ r.orderCount }} orders</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Revenue by Day -->
      <div class="bg-white border border-gray-200 rounded-lg p-5">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">Daily Revenue (last 30 days)</h3>
        <div v-if="insights.revenueByDay.length === 0" class="text-sm text-gray-400">No data yet</div>
        <div v-else class="flex items-end gap-1 h-32">
          <div
            v-for="day in insights.revenueByDay"
            :key="day.date"
            class="flex-1 bg-blue-500 rounded-t min-w-[4px] hover:bg-blue-600 transition-colors relative group"
            :style="{ height: `${Math.max(4, (day.revenue / Math.max(...insights.revenueByDay.map(d => d.revenue))) * 100)}%` }"
            :title="`${day.date}: ${formatPrice(day.revenue)}`"
          />
        </div>
        <div v-if="insights.revenueByDay.length > 0" class="flex justify-between mt-1 text-[10px] text-gray-400">
          <span>{{ insights.revenueByDay[0]?.date }}</span>
          <span>{{ insights.revenueByDay[insights.revenueByDay.length - 1]?.date }}</span>
        </div>
      </div>
    </template>
  </div>
</template>
