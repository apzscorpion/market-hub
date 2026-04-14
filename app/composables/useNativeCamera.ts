import { Capacitor } from '@capacitor/core'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'

export function useNativeCamera() {
  const available = Capacitor.isNativePlatform()
  const photo = ref<string | null>(null)
  const error = ref<string | null>(null)

  async function takePhoto(): Promise<string | null> {
    if (!available) {
      error.value = 'Camera not available in browser'
      return null
    }
    error.value = null
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        width: 800,
        height: 800,
      })
      photo.value = image.base64String ? `data:image/jpeg;base64,${image.base64String}` : null
      return photo.value
    }
    catch (e) {
      error.value = (e as Error).message
      return null
    }
  }

  async function pickFromGallery(): Promise<string | null> {
    if (!available) {
      error.value = 'Gallery not available in browser'
      return null
    }
    error.value = null
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos,
        width: 800,
        height: 800,
      })
      photo.value = image.base64String ? `data:image/jpeg;base64,${image.base64String}` : null
      return photo.value
    }
    catch (e) {
      error.value = (e as Error).message
      return null
    }
  }

  return { available, photo, error, takePhoto, pickFromGallery }
}
