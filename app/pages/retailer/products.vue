<script setup lang="ts">
definePageMeta({
  layout: 'retailer',
})

const { t } = useI18n()
const { activeProducts, loading, error, fetchProducts, fetchCategories, searchProducts } = useProducts()

const searchQuery = ref('')
const filteredProducts = computed(() => searchProducts(searchQuery.value))

onMounted(async () => {
  if (activeProducts.value.length === 0) {
    await Promise.all([fetchProducts(), fetchCategories()])
  }
})
</script>

<template>
  <div>
    <div class="mb-4">
      <CommonSearchBar
        v-model="searchQuery"
        :placeholder="t('common.search') + ' ' + t('nav.products').toLowerCase() + '...'"
      />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div v-for="i in 8" :key="i" class="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
        <div class="h-32 bg-gray-200" />
        <div class="p-3 space-y-2">
          <div class="h-4 bg-gray-200 rounded w-3/4" />
          <div class="h-3 bg-gray-200 rounded w-1/2" />
          <div class="h-8 bg-gray-200 rounded mt-2" />
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-600">{{ error }}</p>
      <button class="mt-2 text-blue-600 hover:underline text-sm" @click="fetchProducts()">
        Try again
      </button>
    </div>

    <!-- Empty -->
    <div v-else-if="filteredProducts.length === 0 && !searchQuery" class="text-center py-12">
      <p class="text-gray-500">{{ t('common.no_results') }}</p>
    </div>

    <!-- Search empty -->
    <div v-else-if="filteredProducts.length === 0 && searchQuery" class="text-center py-12">
      <p class="text-gray-500">No products matching "{{ searchQuery }}"</p>
    </div>

    <!-- Product Grid -->
    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <RetailerProductCard
        v-for="product in filteredProducts"
        :key="product.id"
        :product="product"
      />
    </div>
  </div>
</template>
