// Page-level auth middleware — enforces auth check per-page
// Used via definePageMeta({ middleware: 'auth' }) on protected pages
// The global middleware (auth.global.ts) already handles auth,
// but this provides an explicit per-page guard as defense-in-depth
export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return

  const authStore = useAuthStore()

  // Wait for initialization
  if (!authStore.initialized) {
    await new Promise<void>((resolve) => {
      const stop = watch(
        () => authStore.initialized,
        (ready) => {
          if (ready) {
            stop()
            resolve()
          }
        },
        { immediate: true },
      )
    })
  }

  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }
})
