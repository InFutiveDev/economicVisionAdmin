import { api } from './client'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export async function uploadImageApi(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Choose an image file.')
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('Image must be 5MB or smaller.')
  }

  const body = new FormData()
  body.append('file', file)

  try {
    const { data } = await api.post<{ url?: string }>('/uploads', body)
    if (data?.url) return data.url
  } catch {
    // Local preview if the upload API is not available yet.
  }

  return readFileAsDataUrl(file)
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('Could not read that image.'))
    reader.readAsDataURL(file)
  })
}
