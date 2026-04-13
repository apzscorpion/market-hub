import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

export function useImageUpload() {
  const { $firebaseStorage } = useNuxtApp()

  const uploading = ref(false)
  const progress = ref(0)
  const error = ref<string | null>(null)

  function compressImage(file: File, maxWidth = 800, quality = 0.8): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        const canvas = document.createElement('canvas')
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Compression failed'))
          },
          'image/jpeg',
          quality,
        )
      }
      img.onerror = reject
      img.src = url
    })
  }

  async function uploadProductImage(file: File, productId: string): Promise<string> {
    uploading.value = true
    progress.value = 0
    error.value = null

    try {
      const compressed = await compressImage(file)
      const ext = 'jpg'
      const path = `products/${productId}/image_${Date.now()}.${ext}`
      const fileRef = storageRef($firebaseStorage, path)

      await uploadBytes(fileRef, compressed, { contentType: 'image/jpeg' })
      progress.value = 100
      return await getDownloadURL(fileRef)
    }
    catch (e) {
      error.value = (e as Error).message
      throw e
    }
    finally {
      uploading.value = false
    }
  }

  return { uploading, progress, error, uploadProductImage, compressImage }
}
