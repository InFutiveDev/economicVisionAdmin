import axios from 'axios'
import type { EpaperEdition, EpaperInput, EpaperPageItem } from '../types/epaper'
import { api } from './client'
import { uploadImageApi } from './upload.api'

const EPAPER_STORAGE_KEY = 'ev_admin_epaper_data'

const SEED_EPAPERS: EpaperEdition[] = [
  {
    id: 'epaper-indore-10-sep-2026',
    name: 'संवाद फर्स्ट',
    title: 'संवाद फर्स्ट',
    paragraph: 'संवाद फर्स्ट डिजिटल दैनिक संस्करण — इंदौर संस्करण',
    paragraphs: ['संवाद फर्स्ट डिजिटल दैनिक संस्करण — इंदौर संस्करण'],
    city: 'Indore',
    date: 'Thursday, 10 September 2026',
    dateShort: '10 Sep 2026',
    slug: 'indore-10-sep-2026',
    cover: 'https://beta.theeconomicvision.com/epaper/page-0.jpg',
    today: true,
    status: 'published',
    pages: Array.from({ length: 8 }).map((_, i) => ({
      id: `page-${i + 1}`,
      pageNumber: i + 1,
      title: `Page ${i + 1}`,
      image: `https://beta.theeconomicvision.com/epaper/page-${i}.jpg`,
    })),
    createdAt: new Date('2026-09-10T06:00:00Z').toISOString(),
    updatedAt: new Date('2026-09-10T06:00:00Z').toISOString(),
  },
  {
    id: 'epaper-indore-09-sep-2026',
    name: 'संवाद फर्स्ट',
    city: 'Indore',
    date: 'Wednesday, 09 September 2026',
    dateShort: '09 Sep 2026',
    slug: 'indore-09-sep-2026',
    cover: 'https://beta.theeconomicvision.com/epaper/page-0.jpg',
    today: false,
    status: 'published',
    pages: Array.from({ length: 8 }).map((_, i) => ({
      id: `page-${i + 1}`,
      pageNumber: i + 1,
      title: `Page ${i + 1}`,
      image: `https://beta.theeconomicvision.com/epaper/page-${i}.jpg`,
    })),
    createdAt: new Date('2026-09-09T06:00:00Z').toISOString(),
    updatedAt: new Date('2026-09-09T06:00:00Z').toISOString(),
  },
  {
    id: 'epaper-bhopal-10-sep-2026',
    name: 'संवाद फर्स्ट',
    city: 'Bhopal',
    date: 'Thursday, 10 September 2026',
    dateShort: '10 Sep 2026',
    slug: 'bhopal-10-sep-2026',
    cover: 'https://beta.theeconomicvision.com/epaper/page-0.jpg',
    today: true,
    status: 'published',
    pages: Array.from({ length: 8 }).map((_, i) => ({
      id: `page-${i + 1}`,
      pageNumber: i + 1,
      title: `Page ${i + 1}`,
      image: `https://beta.theeconomicvision.com/epaper/page-${i}.jpg`,
    })),
    createdAt: new Date('2026-09-10T06:00:00Z').toISOString(),
    updatedAt: new Date('2026-09-10T06:00:00Z').toISOString(),
  },
  {
    id: 'epaper-ujjain-10-sep-2026',
    name: 'संवाद फर्स्ट',
    city: 'Ujjain',
    date: 'Thursday, 10 September 2026',
    dateShort: '10 Sep 2026',
    slug: 'ujjain-10-sep-2026',
    cover: 'https://beta.theeconomicvision.com/epaper/page-0.jpg',
    today: true,
    status: 'published',
    pages: Array.from({ length: 8 }).map((_, i) => ({
      id: `page-${i + 1}`,
      pageNumber: i + 1,
      title: `Page ${i + 1}`,
      image: `https://beta.theeconomicvision.com/epaper/page-${i}.jpg`,
    })),
    createdAt: new Date('2026-09-10T06:00:00Z').toISOString(),
    updatedAt: new Date('2026-09-10T06:00:00Z').toISOString(),
  },
]

function getLocalEpapers(): EpaperEdition[] {
  try {
    const raw = localStorage.getItem(EPAPER_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(EPAPER_STORAGE_KEY, JSON.stringify(SEED_EPAPERS))
      return SEED_EPAPERS
    }
    return JSON.parse(raw) as EpaperEdition[]
  } catch {
    return SEED_EPAPERS
  }
}

function saveLocalEpapers(list: EpaperEdition[]): void {
  try {
    localStorage.setItem(EPAPER_STORAGE_KEY, JSON.stringify(list))
  } catch (error) {
    console.warn('Failed to save ePapers to localStorage', error)
  }
}

export async function fetchEpapersApi(): Promise<EpaperEdition[]> {
  try {
    const { data } = await api.get<{ epapers?: EpaperEdition[]; items?: EpaperEdition[] } | EpaperEdition[]>(
      '/epapers',
    )
    const list = Array.isArray(data) ? data : data?.epapers || data?.items
    if (Array.isArray(list)) {
      saveLocalEpapers(list)
      return list
    }
  } catch {
    // If backend doesn't support /epapers, try /epaper
    try {
      const { data } = await api.get<{ epapers?: EpaperEdition[] } | EpaperEdition[]>('/epaper')
      const list = Array.isArray(data) ? data : data?.epapers
      if (Array.isArray(list)) {
        saveLocalEpapers(list)
        return list
      }
    } catch {
      // Backend route not available yet: gracefully fall back to local storage
    }
  }

  return getLocalEpapers()
}

export async function fetchEpaperByIdApi(idOrSlug: string): Promise<EpaperEdition> {
  try {
    const { data } = await api.get<{ epaper?: EpaperEdition } | EpaperEdition>(`/epapers/${idOrSlug}`)
    const item = (data as { epaper?: EpaperEdition }).epaper ?? (data as EpaperEdition)
    if (item?.id) return item
  } catch {
    try {
      const { data } = await api.get<{ epaper?: EpaperEdition } | EpaperEdition>(`/epaper/${idOrSlug}`)
      const item = (data as { epaper?: EpaperEdition }).epaper ?? (data as EpaperEdition)
      if (item?.id) return item
    } catch {
      // Fall through to local
    }
  }

  const list = getLocalEpapers()
  const found = list.find((item) => item.id === idOrSlug || item.slug === idOrSlug)
  if (found) return found
  throw new Error('E-Paper edition not found.')
}

export async function saveEpaperApi(input: EpaperInput): Promise<EpaperEdition> {
  const isUpdate = Boolean(input.id)
  const id = input.id || `epaper-${Date.now()}`
  const now = new Date().toISOString()

  const edition: EpaperEdition = {
    ...input,
    id,
    createdAt: input.id ? undefined : now,
    updatedAt: now,
  }

  try {
    if (isUpdate) {
      const { data } = await api.put<{ epaper?: EpaperEdition } | EpaperEdition>(`/epapers/${id}`, edition)
      const res = (data as { epaper?: EpaperEdition }).epaper ?? (data as EpaperEdition)
      if (res?.id) {
        updateLocal(res)
        return res
      }
    } else {
      const { data } = await api.post<{ epaper?: EpaperEdition } | EpaperEdition>('/epapers', edition)
      const res = (data as { epaper?: EpaperEdition }).epaper ?? (data as EpaperEdition)
      if (res?.id) {
        updateLocal(res)
        return res
      }
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status !== 404 && error.response?.status !== 405) {
      console.warn('API error saving epaper, storing locally:', error)
    }
  }

  // Local sync
  const updated = updateLocal(edition)
  return updated
}

function updateLocal(edition: EpaperEdition): EpaperEdition {
  const current = getLocalEpapers()
  const index = current.findIndex((item) => item.id === edition.id || item.slug === edition.slug)
  let updatedList: EpaperEdition[]

  // If marked as today, we can optionally clear previous today for the same city
  if (edition.today) {
    current.forEach((item) => {
      if (item.city.toLowerCase() === edition.city.toLowerCase() && item.id !== edition.id) {
        item.today = false
      }
    })
  }

  if (index >= 0) {
    current[index] = { ...current[index], ...edition, updatedAt: new Date().toISOString() }
    updatedList = [...current]
  } else {
    updatedList = [edition, ...current]
  }

  saveLocalEpapers(updatedList)
  return edition
}

export async function deleteEpaperApi(id: string): Promise<void> {
  try {
    await api.delete(`/epapers/${id}`)
  } catch {
    try {
      await api.delete(`/epaper/${id}`)
    } catch {
      // Backend route not available
    }
  }

  const current = getLocalEpapers()
  const filtered = current.filter((item) => item.id !== id)
  saveLocalEpapers(filtered)
}

export async function batchUploadPageImages(
  files: File[],
  onProgress?: (completed: number, total: number) => void,
): Promise<EpaperPageItem[]> {
  const uploadedPages: EpaperPageItem[] = []
  const total = files.length

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const imageUrl = await uploadImageApi(file)
    uploadedPages.push({
      id: crypto.randomUUID(),
      pageNumber: i + 1,
      title: `Page ${i + 1}`,
      image: imageUrl,
    })
    onProgress?.(i + 1, total)
  }

  return uploadedPages
}
