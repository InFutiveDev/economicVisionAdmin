import axios from 'axios'
import { api } from './client'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const MAX_DIMENSION = 2000
const QUALITY = 0.82

function loadImage(file: Blob) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read that image.'))
    }
    image.src = url
  })
}

// Keeps uploads small enough for the proxy in front of the API (about 1MB).
async function compressImage(file: File): Promise<File> {
  if (/image\/(gif|svg)/.test(file.type)) return file

  const image = await loadImage(file)
  const scale = Math.min(1, MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight))
  const width = Math.round(image.naturalWidth * scale)
  const height = Math.round(image.naturalHeight * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) return file
  context.drawImage(image, 0, 0, width, height)

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', QUALITY),
  )
  const output =
    blob?.type === 'image/webp'
      ? blob
      : await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', QUALITY))
  if (!output || output.size >= file.size) return file

  const extension = output.type === 'image/webp' ? 'webp' : 'jpg'
  const name = `${file.name.replace(/\.[^.]+$/, '') || 'image'}.${extension}`
  return new File([output], name, { type: output.type })
}

export async function uploadImageApi(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Choose an image file.')
  }
  if (file.size > MAX_IMAGE_BYTES * 4) {
    throw new Error('Image must be 20MB or smaller.')
  }

  const compressed = await compressImage(file).catch(() => file)
  if (compressed.size > MAX_IMAGE_BYTES) {
    throw new Error('Image must be 5MB or smaller.')
  }

  const body = new FormData()
  body.append('file', compressed)

  try {
    const { data } = await api.post<{ url?: string }>('/uploads', body)
    if (!data?.url) throw new Error('Upload finished without an image URL.')
    return data.url
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 413) {
      throw new Error('This image is too large for the server. Try a smaller image.')
    }
    throw error instanceof Error ? error : new Error('Could not upload image.')
  }
}

async function dataUrlToFile(dataUrl: string, index: number) {
  const blob = await (await fetch(dataUrl)).blob()
  const extension = blob.type.split('/')[1]?.replace('jpeg', 'jpg') || 'png'
  return new File([blob], `inline-${index}.${extension}`, { type: blob.type })
}

// Older drafts embedded images as data URLs, which makes saves exceed the size limit.
export async function uploadInlineImages<T>(value: T): Promise<T> {
  const uploaded = new Map<string, string>()
  let index = 0

  const walk = async (node: unknown): Promise<unknown> => {
    if (typeof node === 'string') {
      if (!node.startsWith('data:image/')) return node
      if (!uploaded.has(node)) {
        index += 1
        uploaded.set(node, await uploadImageApi(await dataUrlToFile(node, index)))
      }
      return uploaded.get(node)
    }
    if (Array.isArray(node)) return Promise.all(node.map(walk))
    if (node && typeof node === 'object') {
      const entries = await Promise.all(
        Object.entries(node).map(async ([key, child]) => [key, await walk(child)] as const),
      )
      return Object.fromEntries(entries)
    }
    return node
  }

  return (await walk(value)) as T
}
