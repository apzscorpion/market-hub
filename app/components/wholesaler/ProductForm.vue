<script setup lang="ts">
import type { Product } from '~/types/product'

const props = defineProps<{
  product?: Product
}>()

const emit = defineEmits<{
  save: [data: any]
  cancel: []
}>()

const isEdit = computed(() => !!props.product)

const form = reactive({
  name: props.product?.name ?? '',
  nickname: props.product?.nickname ?? '',
  aliases: props.product?.aliases?.join(', ') ?? '',
  categoryId: props.product?.categoryId ?? '',
  subcategoryId: props.product?.subcategoryId ?? '',
  unitType: props.product?.unitType ?? 'box',
  unitsPerPackage: props.product?.unitsPerPackage ?? 1,
  price: props.product?.price ?? 0,
  active: props.product?.active ?? true,
  sortOrder: props.product?.sortOrder ?? 0,
  classification: {
    typeId: props.product?.classification?.typeId ?? '',
    flavor: props.product?.classification?.flavor ?? '',
    variant: props.product?.classification?.variant ?? '',
    packagingType: props.product?.classification?.packagingType ?? '',
    temperatureSensitivity: props.product?.classification?.temperatureSensitivity ?? 'standard',
  },
  stock: {
    quantity: props.product?.stock?.quantity ?? 0,
    lowStockThreshold: props.product?.stock?.lowStockThreshold ?? 10,
  },
  badges: {
    isNew: props.product?.badges?.isNew ?? false,
    isTrending: props.product?.badges?.isTrending ?? false,
    isRecommended: props.product?.badges?.isRecommended ?? false,
  },
})

const errors = ref<Record<string, string>>({})

function validate(): boolean {
  errors.value = {}
  if (!form.name.trim()) errors.value.name = 'Name is required'
  if (!form.nickname.trim()) errors.value.nickname = 'Nickname is required'
  if (form.price <= 0) errors.value.price = 'Price must be greater than 0'
  return Object.keys(errors.value).length === 0
}

function submit(): void {
  if (!validate()) return

  const aliasArray = form.aliases
    .split(',')
    .map(a => a.trim())
    .filter(Boolean)

  emit('save', {
    name: form.name.trim(),
    nickname: form.nickname.trim(),
    aliases: aliasArray,
    categoryId: form.categoryId,
    subcategoryId: form.subcategoryId,
    unitType: form.unitType,
    unitsPerPackage: form.unitsPerPackage,
    price: Number(form.price),
    active: form.active,
    sortOrder: Number(form.sortOrder),
    classification: { ...form.classification },
    stock: {
      quantity: Number(form.stock.quantity),
      lowStockThreshold: Number(form.stock.lowStockThreshold),
    },
    badges: { ...form.badges },
    images: props.product?.images ?? [],
  })
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="submit">
    <h3 class="text-lg font-semibold text-gray-900">
      {{ isEdit ? 'Edit Product' : 'Add New Product' }}
    </h3>

    <!-- Name fields -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
        <input v-model="form.name" class="w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500" :class="errors.name && 'border-red-300'">
        <p v-if="errors.name" class="text-xs text-red-500 mt-1">{{ errors.name }}</p>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Nickname (short name) *</label>
        <input v-model="form.nickname" class="w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500" :class="errors.nickname && 'border-red-300'">
        <p v-if="errors.nickname" class="text-xs text-red-500 mt-1">{{ errors.nickname }}</p>
      </div>
    </div>

    <!-- Aliases -->
    <div>
      <label class="block text-xs font-medium text-gray-600 mb-1">Aliases (comma-separated, include Malayalam)</label>
      <input v-model="form.aliases" placeholder="vanilla, വാനില, vanila" class="w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-blue-500">
    </div>

    <!-- Classification -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Type</label>
        <select v-model="form.classification.typeId" class="w-full px-3 py-2 text-sm border rounded-lg">
          <option value="">Select...</option>
          <option value="bar">Bar / Stick</option>
          <option value="cone">Cone</option>
          <option value="cup">Cup</option>
          <option value="family_pack">Family Pack</option>
          <option value="bulk_pack">Bulk Pack</option>
          <option value="tub">Tub</option>
          <option value="popsicle">Popsicle</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Flavor</label>
        <input v-model="form.classification.flavor" placeholder="e.g., Vanilla" class="w-full px-3 py-2 text-sm border rounded-lg">
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Variant</label>
        <select v-model="form.classification.variant" class="w-full px-3 py-2 text-sm border rounded-lg">
          <option value="">None</option>
          <option value="premium">Premium</option>
          <option value="sugar_free">Sugar-free</option>
          <option value="kids">Kids Special</option>
          <option value="seasonal">Seasonal</option>
          <option value="limited">Limited Edition</option>
        </select>
      </div>
    </div>

    <!-- Pricing & Units -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Price (INR) *</label>
        <input v-model.number="form.price" type="number" min="0" step="0.01" class="w-full px-3 py-2 text-sm border rounded-lg" :class="errors.price && 'border-red-300'">
        <p v-if="errors.price" class="text-xs text-red-500 mt-1">{{ errors.price }}</p>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Unit Type</label>
        <select v-model="form.unitType" class="w-full px-3 py-2 text-sm border rounded-lg">
          <option value="box">Box</option>
          <option value="piece">Piece</option>
          <option value="pack">Pack</option>
          <option value="kg">Kg</option>
          <option value="litre">Litre</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Units / Package</label>
        <input v-model.number="form.unitsPerPackage" type="number" min="1" class="w-full px-3 py-2 text-sm border rounded-lg">
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Sort Order</label>
        <input v-model.number="form.sortOrder" type="number" class="w-full px-3 py-2 text-sm border rounded-lg">
      </div>
    </div>

    <!-- Stock -->
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Stock Quantity</label>
        <input v-model.number="form.stock.quantity" type="number" min="0" class="w-full px-3 py-2 text-sm border rounded-lg">
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Low Stock Threshold</label>
        <input v-model.number="form.stock.lowStockThreshold" type="number" min="0" class="w-full px-3 py-2 text-sm border rounded-lg">
      </div>
    </div>

    <!-- Badges & Active -->
    <div class="flex flex-wrap gap-4 items-center">
      <label class="inline-flex items-center gap-2 text-sm">
        <input v-model="form.badges.isNew" type="checkbox" class="rounded border-gray-300 text-blue-600">
        New
      </label>
      <label class="inline-flex items-center gap-2 text-sm">
        <input v-model="form.badges.isTrending" type="checkbox" class="rounded border-gray-300 text-orange-600">
        Trending
      </label>
      <label class="inline-flex items-center gap-2 text-sm">
        <input v-model="form.badges.isRecommended" type="checkbox" class="rounded border-gray-300 text-green-600">
        Recommended
      </label>
      <div class="ml-auto">
        <label class="inline-flex items-center gap-2 text-sm">
          <input v-model="form.active" type="checkbox" class="rounded border-gray-300 text-blue-600">
          Active
        </label>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex gap-2 pt-2">
      <button type="submit" class="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
        {{ isEdit ? 'Update Product' : 'Add Product' }}
      </button>
      <button type="button" class="px-5 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50" @click="emit('cancel')">
        Cancel
      </button>
    </div>
  </form>
</template>
