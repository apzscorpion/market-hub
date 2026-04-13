<script setup lang="ts">
import type { Product } from '~/types/product'

definePageMeta({
  layout: 'wholesaler',
  middleware: 'auth',
})

const { t } = useI18n()
const { showSuccess, showError } = useToast()
const {
  products, loading,
  fetchAllProducts, createProduct, updateProduct, toggleActive, deleteProduct, updateStock,
} = useProductAdmin()

const showForm = ref(false)
const showSmartCreate = ref(false)
const editingProduct = ref<Product | null>(null)
const searchQuery = ref('')
const showDeleteConfirm = ref(false)
const deletingProduct = ref<Product | null>(null)
const filterActive = ref<'all' | 'active' | 'inactive'>('all')
const editingStockId = ref<string | null>(null)
const stockInput = ref(0)

onMounted(() => {
  fetchAllProducts()
})

const filteredProducts = computed(() => {
  let list = products.value

  if (filterActive.value === 'active') list = list.filter(p => p.active)
  else if (filterActive.value === 'inactive') list = list.filter(p => !p.active)

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(p =>
      p.name.toLowerCase().includes(q)
      || p.nickname.toLowerCase().includes(q)
      || p.aliases.some(a => a.toLowerCase().includes(q)),
    )
  }

  return list
})

const lowStockProducts = computed(() =>
  products.value.filter(p => p.active && p.stock && p.stock.quantity <= p.stock.lowStockThreshold),
)

function openCreate(): void {
  editingProduct.value = null
  showForm.value = true
}

function openEdit(product: Product): void {
  editingProduct.value = product
  showForm.value = true
}

async function onSave(data: any): Promise<void> {
  try {
    if (editingProduct.value) {
      await updateProduct(editingProduct.value.id, data)
      showSuccess('Product updated')
    }
    else {
      await createProduct(data)
      showSuccess('Product created')
    }
    showForm.value = false
    editingProduct.value = null
  }
  catch (e) {
    showError('Failed to save product')
    console.error(e)
  }
}

function cancelForm(): void {
  showForm.value = false
  editingProduct.value = null
}

function onSmartRecognized(data: { name: string, type: string, flavor: string, imageUrl?: string }): void {
  showSmartCreate.value = false
  editingProduct.value = null
  showForm.value = true
}

function confirmDelete(product: Product): void {
  deletingProduct.value = product
  showDeleteConfirm.value = true
}

async function doDelete(): Promise<void> {
  if (!deletingProduct.value) return
  try {
    await deleteProduct(deletingProduct.value.id)
    showSuccess('Product deleted')
  }
  catch (e) {
    showError('Failed to delete product')
  }
  showDeleteConfirm.value = false
  deletingProduct.value = null
}

async function onToggleActive(product: Product): Promise<void> {
  try {
    await toggleActive(product.id, !product.active)
    showSuccess(product.active ? 'Product deactivated' : 'Product activated')
  }
  catch (e) {
    showError('Failed to update product')
  }
}

function startEditStock(product: Product): void {
  editingStockId.value = product.id
  stockInput.value = product.stock?.quantity ?? 0
}

async function saveStock(product: Product): Promise<void> {
  try {
    await updateStock(product.id, stockInput.value)
    showSuccess('Stock updated')
  }
  catch (e) {
    showError('Failed to update stock')
  }
  editingStockId.value = null
}

function stockStatusClass(product: Product): string {
  if (!product.stock) return 'text-gray-400'
  if (product.stock.quantity <= 0) return 'text-red-600 bg-red-50'
  if (product.stock.quantity <= product.stock.lowStockThreshold) return 'text-yellow-600 bg-yellow-50'
  return 'text-green-600 bg-green-50'
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold text-gray-900">{{ t('nav.products') }}</h2>
      <div v-if="!showForm" class="flex gap-2">
        <button
          class="px-3 py-2 text-xs sm:text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
          @click="showSmartCreate = !showSmartCreate"
        >
          {{ showSmartCreate ? 'Hide Smart' : 'Smart Create' }}
        </button>
        <button
          class="px-3 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          @click="openCreate"
        >
          + Add Product
        </button>
      </div>
    </div>

    <WholesalerSmartProductCreate v-if="showSmartCreate" @product-recognized="onSmartRecognized" />

    <!-- Low stock alert -->
    <div v-if="lowStockProducts.length > 0" class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
      <p class="text-sm font-medium text-yellow-800">
        Low Stock Alert: {{ lowStockProducts.length }} product(s) below threshold
      </p>
      <div class="flex flex-wrap gap-1 mt-1">
        <span v-for="p in lowStockProducts" :key="p.id" class="text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded">
          {{ p.nickname }} ({{ p.stock?.quantity ?? 0 }})
        </span>
      </div>
    </div>

    <!-- Product Form -->
    <div v-if="showForm" class="bg-white border border-gray-200 rounded-lg p-4">
      <WholesalerProductForm
        :product="editingProduct ?? undefined"
        @save="onSave"
        @cancel="cancelForm"
      />
    </div>

    <!-- Search & Filter -->
    <div v-if="!showForm" class="flex gap-2">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search products..."
        class="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500"
      >
      <select
        v-model="filterActive"
        class="px-3 py-2 text-sm border border-gray-200 rounded-lg"
      >
        <option value="all">All ({{ products.length }})</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-2">
      <div v-for="i in 4" :key="i" class="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-1/3 mb-2" />
        <div class="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>

    <!-- Product List -->
    <div v-else-if="!showForm" class="space-y-2">
      <div v-if="filteredProducts.length === 0" class="text-center py-12 text-gray-500">
        No products found.
      </div>

      <div
        v-for="product in filteredProducts"
        :key="product.id"
        :class="[
          'bg-white border rounded-lg p-4 transition-colors',
          product.active ? 'border-gray-200' : 'border-gray-100 opacity-60',
        ]"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="font-medium text-gray-900 text-sm">{{ product.nickname }}</h3>
              <span v-if="product.nickname !== product.name" class="text-xs text-gray-400">{{ product.name }}</span>
              <span v-if="!product.active" class="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">Inactive</span>
              <span v-if="product.badges?.isNew" class="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700">New</span>
              <span v-if="product.badges?.isTrending" class="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">Trending</span>
            </div>
            <div class="flex items-center gap-3 mt-1 text-xs text-gray-500">
              <span>{{ formatPrice(product.price) }} / {{ product.unitType }}</span>
              <span v-if="product.classification?.typeId">{{ product.classification.typeId }}</span>
              <span v-if="product.classification?.flavor">{{ product.classification.flavor }}</span>
            </div>
            <div v-if="product.aliases?.length" class="mt-1 text-xs text-gray-400">
              Aliases: {{ product.aliases.join(', ') }}
            </div>
          </div>

          <!-- Stock -->
          <div class="flex-shrink-0 text-center">
            <div v-if="editingStockId === product.id" class="flex items-center gap-1">
              <input
                v-model.number="stockInput"
                type="number"
                min="0"
                class="w-16 px-2 py-1 text-sm text-center border rounded"
                @keydown.enter="saveStock(product)"
              >
              <button class="text-xs text-blue-600 hover:underline" @click="saveStock(product)">Save</button>
            </div>
            <button
              v-else
              :class="['px-2 py-1 rounded text-xs font-medium', stockStatusClass(product)]"
              title="Click to edit stock"
              @click="startEditStock(product)"
            >
              {{ product.stock?.quantity ?? 0 }} in stock
            </button>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-1 flex-shrink-0">
            <button
              class="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50"
              title="Edit"
              @click="openEdit(product)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </button>
            <button
              class="p-1.5 text-gray-400 hover:text-yellow-600 rounded hover:bg-yellow-50"
              :title="product.active ? 'Deactivate' : 'Activate'"
              @click="onToggleActive(product)"
            >
              <svg v-if="product.active" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </button>
            <button
              class="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
              title="Delete"
              @click="confirmDelete(product)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirm -->
    <CommonConfirmDialog
      :open="showDeleteConfirm"
      title="Delete Product"
      :description="`Are you sure you want to delete '${deletingProduct?.name}'? This cannot be undone.`"
      confirm-text="Delete"
      confirm-color="bg-red-600 hover:bg-red-700"
      @confirm="doDelete"
      @cancel="showDeleteConfirm = false; deletingProduct = null"
    />
  </div>
</template>
