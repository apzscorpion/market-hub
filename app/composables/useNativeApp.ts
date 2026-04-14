import { Capacitor } from '@capacitor/core'

export function useNativeApp() {
  const isNative = Capacitor.isNativePlatform()
  const platform = Capacitor.getPlatform()

  return { isNative, platform }
}
