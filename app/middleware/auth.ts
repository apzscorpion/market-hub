// This file is intentionally kept empty.
// Auth is handled by auth.global.ts which runs on every route.
// Individual pages can still use definePageMeta({ middleware: 'auth' })
// for additional page-specific checks if needed.
export default defineNuxtRouteMiddleware(() => {})
