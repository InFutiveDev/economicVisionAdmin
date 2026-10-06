import type {
  Category,
  HomeSectionItem,
  HomeSectionKey,
  HomeSections,
  MediaItem,
  MediaType,
} from '../types/homepage'
import { api } from './client'

export type CategoryInput = Pick<Category, 'name' | 'description' | 'showInNav' | 'parentId'>

export async function fetchCategoriesApi(): Promise<Category[]> {
  const { data } = await api.get<{ categories: Category[] }>('/categories')
  return data.categories
}

export async function createCategoryApi(input: CategoryInput): Promise<Category> {
  const { data } = await api.post<{ category: Category }>('/categories', input)
  return data.category
}

export async function updateCategoryApi(id: string, input: CategoryInput): Promise<Category> {
  const { data } = await api.put<{ category: Category }>(`/categories/${id}`, input)
  return data.category
}

export async function reorderCategoriesApi(ids: string[]): Promise<Category[]> {
  const { data } = await api.put<{ categories: Category[] }>('/categories/reorder', { ids })
  return data.categories
}

export async function deleteCategoryApi(id: string): Promise<void> {
  await api.delete(`/categories/${id}`)
}

export async function fetchHomeSectionsApi(): Promise<HomeSections> {
  const { data } = await api.get<{ sections: HomeSections }>('/homepage')
  return data.sections
}

export async function saveHomeSectionApi(
  key: HomeSectionKey,
  items: HomeSectionItem[],
): Promise<HomeSectionItem[]> {
  const { data } = await api.put<{ items: HomeSectionItem[] }>(`/homepage/${key}`, {
    items: items.map(({ articleId, label, note }) => ({ articleId, label, note })),
  })
  return data.items
}

export type MediaInput = Omit<MediaItem, 'id' | 'order'>

export async function fetchMediaApi(type: MediaType): Promise<MediaItem[]> {
  const { data } = await api.get<{ items: MediaItem[] }>('/media', { params: { type } })
  return data.items
}

export async function createMediaApi(input: MediaInput): Promise<MediaItem> {
  const { data } = await api.post<{ item: MediaItem }>('/media', input)
  return data.item
}

export async function updateMediaApi(id: string, input: MediaInput): Promise<MediaItem> {
  const { data } = await api.put<{ item: MediaItem }>(`/media/${id}`, input)
  return data.item
}

export async function reorderMediaApi(ids: string[]): Promise<void> {
  await api.put('/media/reorder', { ids })
}

export async function deleteMediaApi(id: string): Promise<void> {
  await api.delete(`/media/${id}`)
}
