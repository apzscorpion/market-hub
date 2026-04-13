<script setup lang="ts">
const { t } = useI18n()
const { logout } = useAuth()
const route = useRoute()

const drawerOpen = ref(false)

const navItems = [
  { to: '/wholesaler/dashboard', label: 'nav.dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/wholesaler/products', label: 'nav.products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { to: '/wholesaler/orders', label: 'nav.orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { to: '/wholesaler/users', label: 'nav.users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { to: '/wholesaler/insights', label: 'Insights', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { to: '/wholesaler/logs', label: 'Logs', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { to: '/wholesaler/settings', label: 'nav.settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
]

function isActive(to: string): boolean {
  return route.path === to || route.path.startsWith(to + '/')
}

function closeDrawer(): void {
  drawerOpen.value = false
}

watch(route, closeDrawer)
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Desktop sidebar (md+) -->
    <aside class="hidden md:block w-64 bg-white border-r border-gray-200 min-h-screen fixed top-0 left-0 z-30">
      <div class="p-4 border-b border-gray-200">
        <h1 class="text-lg font-semibold text-gray-900">{{ t('app.name') }}</h1>
        <p class="text-xs text-gray-500">Admin Panel</p>
      </div>
      <nav class="p-3 space-y-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="[
            'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
            isActive(item.to)
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'text-gray-700 hover:bg-gray-100',
          ]"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="item.icon" />
          </svg>
          {{ t(item.label) }}
        </NuxtLink>
      </nav>
      <div class="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200">
        <button class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100" @click="logout">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {{ t('auth.logout') }}
        </button>
      </div>
    </aside>

    <!-- Mobile header (<md) -->
    <header class="md:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
      <div class="px-4 py-2.5 flex items-center justify-between">
        <button class="p-1.5 -ml-1.5 text-gray-600" @click="drawerOpen = true">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 class="text-base font-semibold text-gray-900">{{ t('app.name') }}</h1>
        <div class="w-8" />
      </div>
    </header>

    <!-- Mobile drawer overlay -->
    <Teleport to="body">
      <Transition name="drawer">
        <div v-if="drawerOpen" class="fixed inset-0 z-50 md:hidden">
          <div class="absolute inset-0 bg-black/40" @click="closeDrawer" />
          <aside class="absolute top-0 left-0 bottom-0 w-72 bg-white shadow-xl flex flex-col">
            <div class="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h1 class="text-lg font-semibold text-gray-900">{{ t('app.name') }}</h1>
                <p class="text-xs text-gray-500">Admin Panel</p>
              </div>
              <button class="p-1.5 text-gray-400 hover:text-gray-600" @click="closeDrawer">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
              <NuxtLink
                v-for="item in navItems"
                :key="item.to"
                :to="item.to"
                :class="[
                  'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors',
                  isActive(item.to)
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100',
                ]"
              >
                <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="item.icon" />
                </svg>
                {{ t(item.label) }}
              </NuxtLink>
            </nav>
            <div class="p-3 border-t border-gray-200">
              <button class="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100" @click="logout">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {{ t('auth.logout') }}
              </button>
            </div>
          </aside>
        </div>
      </Transition>
    </Teleport>

    <!-- Main content -->
    <main class="md:ml-64 p-4 sm:p-6">
      <slot />
    </main>

    <CommonToast />
  </div>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.2s ease;
}
.drawer-enter-active aside,
.drawer-leave-active aside {
  transition: transform 0.25s ease;
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
.drawer-enter-from aside,
.drawer-leave-to aside {
  transform: translateX(-100%);
}
</style>
