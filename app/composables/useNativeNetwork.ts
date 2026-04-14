import { Capacitor } from '@capacitor/core'
import { Network } from '@capacitor/network'

export function useNativeNetwork() {
  const isNative = Capacitor.isNativePlatform()
  const connected = ref(true)
  const connectionType = ref<string>('unknown')

  async function init(): Promise<void> {
    if (!isNative) return

    const status = await Network.getStatus()
    connected.value = status.connected
    connectionType.value = status.connectionType

    Network.addListener('networkStatusChange', (s) => {
      connected.value = s.connected
      connectionType.value = s.connectionType
    })
  }

  return { isNative, connected, connectionType, init }
}
