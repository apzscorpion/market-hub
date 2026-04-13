<script setup lang="ts">
const { t } = useI18n()
const { logout } = useAuth()
const route = useRoute()

const tabs = [
  { to: '/delivery/orders', label: 'Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { to: '/delivery/history', label: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
]

function isActive(to: string): boolean {
  return route.path === to || route.path.startsWith(to + '/')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-16">
    <!-- Top header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div class="px-4 py-2.5 flex items-center justify-between">
        <h1 class="text-base font-semibold text-gray-900 truncate">{{ t('app.name') }}</h1>
        <button class="text-xs text-gray-400 hover:text-gray-600 px-2 py-1" @click="logout">
          {{ t('auth.logout') }}
        </button>
      </div>
    </header>

    <!-- Page content -->
    <main class="px-3 py-3 sm:px-4 sm:py-4 max-w-2xl mx-auto">
      <slot />
    </main>

    <!-- Bottom tab bar -->
    <nav class="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-40 safe-bottom">
      <div class="flex items-stretch">
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.to"
          :to="tab.to"
          :class="[
            'flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-[10px] transition-colors',
            isActive(tab.to) ? 'text-blue-600 font-semibold' : 'text-gray-400',
          ]"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" :d="tab.icon" />
          </svg>
          <span>{{ tab.label }}</span>
        </NuxtLink>
      </div>
    </nav>

    <CommonToast />
  </div>
</template>

<style scoped>
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
</style>
