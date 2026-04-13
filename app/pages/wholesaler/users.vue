<script setup lang="ts">
import type { User, UserRole } from '~/types/user'

definePageMeta({
  layout: 'wholesaler',
  middleware: 'auth',
})

const { t } = useI18n()
const { showSuccess, showError } = useToast()
const { users, loading, fetchUsers, createUser, updateUser, toggleUserActive } = useUserAdmin()

const showAddForm = ref(false)
const editingUser = ref<User | null>(null)
const roleFilter = ref<'all' | UserRole>('all')
const searchQuery = ref('')

const form = reactive({
  name: '',
  email: '',
  phone: '',
  role: 'retailer' as UserRole,
  address: '',
})

onMounted(() => {
  fetchUsers()
})

const filteredUsers = computed(() => {
  let list = users.value

  if (roleFilter.value !== 'all') {
    list = list.filter(u => u.role === roleFilter.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(u =>
      u.name.toLowerCase().includes(q)
      || (u.email && u.email.toLowerCase().includes(q))
      || (u.phone && u.phone.includes(q)),
    )
  }

  return list
})

const roleCounts = computed(() => ({
  all: users.value.length,
  retailer: users.value.filter(u => u.role === 'retailer').length,
  delivery: users.value.filter(u => u.role === 'delivery').length,
  wholesaler: users.value.filter(u => u.role === 'wholesaler').length,
}))

function openAdd(): void {
  editingUser.value = null
  form.name = ''
  form.email = ''
  form.phone = ''
  form.role = 'retailer'
  form.address = ''
  showAddForm.value = true
}

function openEdit(user: User): void {
  editingUser.value = user
  form.name = user.name
  form.email = user.email || ''
  form.phone = user.phone || ''
  form.role = user.role
  form.address = user.address ?? ''
  showAddForm.value = true
}

async function onSubmit(): Promise<void> {
  if (!form.name.trim() || !form.email.trim()) {
    showError('Name and email are required')
    return
  }

  try {
    if (editingUser.value) {
      await updateUser(editingUser.value.id, {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        role: form.role,
        address: form.address.trim() || undefined,
      })
      showSuccess('User updated')
    }
    else {
      await createUser({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        role: form.role,
        address: form.address.trim() || undefined,
      })
      showSuccess('User added')
    }
    showAddForm.value = false
    editingUser.value = null
  }
  catch (e) {
    showError('Failed to save user')
  }
}

async function onToggle(user: User): Promise<void> {
  try {
    await toggleUserActive(user.id, !user.active)
    showSuccess(user.active ? 'User deactivated' : 'User activated')
  }
  catch {
    showError('Failed to update user')
  }
}

function roleColor(role: UserRole): string {
  switch (role) {
    case 'retailer': return 'bg-blue-100 text-blue-700'
    case 'wholesaler': return 'bg-purple-100 text-purple-700'
    case 'delivery': return 'bg-green-100 text-green-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold text-gray-900">{{ t('nav.users') }}</h2>
      <button
        v-if="!showAddForm"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        @click="openAdd"
      >
        + Add User
      </button>
    </div>

    <!-- Add/Edit Form -->
    <div v-if="showAddForm" class="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      <h3 class="font-medium text-gray-900">{{ editingUser ? 'Edit User' : 'Add New User' }}</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Name *</label>
          <input v-model="form.name" class="w-full px-3 py-2 text-sm border rounded-lg">
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Email *</label>
          <input v-model="form.email" type="email" placeholder="user@example.com" class="w-full px-3 py-2 text-sm border rounded-lg">
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Phone</label>
          <input v-model="form.phone" type="tel" placeholder="+91..." class="w-full px-3 py-2 text-sm border rounded-lg">
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Role</label>
          <select v-model="form.role" class="w-full px-3 py-2 text-sm border rounded-lg">
            <option value="retailer">Retailer</option>
            <option value="delivery">Delivery</option>
            <option value="wholesaler">Wholesaler</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Address</label>
          <input v-model="form.address" class="w-full px-3 py-2 text-sm border rounded-lg">
        </div>
      </div>
      <div class="flex gap-2">
        <button class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700" @click="onSubmit">
          {{ editingUser ? 'Update' : 'Add User' }}
        </button>
        <button class="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50" @click="showAddForm = false">
          Cancel
        </button>
      </div>
    </div>

    <!-- Search & Filter -->
    <div v-if="!showAddForm" class="flex gap-2">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by name, email, or phone..."
        class="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg"
      >
      <select v-model="roleFilter" class="px-3 py-2 text-sm border border-gray-200 rounded-lg">
        <option value="all">All ({{ roleCounts.all }})</option>
        <option value="retailer">Retailers ({{ roleCounts.retailer }})</option>
        <option value="delivery">Delivery ({{ roleCounts.delivery }})</option>
        <option value="wholesaler">Wholesalers ({{ roleCounts.wholesaler }})</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-2">
      <div v-for="i in 4" :key="i" class="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-1/3 mb-2" />
        <div class="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>

    <!-- User List -->
    <div v-else-if="!showAddForm" class="space-y-2">
      <div v-if="filteredUsers.length === 0" class="text-center py-12 text-gray-500">
        No users found.
      </div>

      <div
        v-for="user in filteredUsers"
        :key="user.id"
        :class="['bg-white border rounded-lg p-4', !user.active && 'opacity-60']"
      >
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-medium text-gray-900 text-sm">{{ user.name }}</h3>
              <span :class="['text-[10px] px-1.5 py-0.5 rounded font-medium', roleColor(user.role)]">
                {{ user.role }}
              </span>
              <span v-if="!user.active" class="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">Inactive</span>
            </div>
            <p class="text-xs text-gray-500 mt-0.5">{{ user.email }}</p>
            <p v-if="user.phone" class="text-xs text-gray-400">{{ user.phone }}</p>
            <p v-if="user.address" class="text-xs text-gray-400">{{ user.address }}</p>
          </div>
          <div class="flex items-center gap-1">
            <button
              class="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50"
              title="Edit"
              @click="openEdit(user)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </button>
            <button
              class="p-1.5 rounded"
              :class="user.active ? 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50' : 'text-green-500 hover:text-green-700 hover:bg-green-50'"
              :title="user.active ? 'Deactivate' : 'Activate'"
              @click="onToggle(user)"
            >
              <svg v-if="user.active" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
