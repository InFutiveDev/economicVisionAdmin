import type { PagePayload, PageResponse } from '../types/block'
import { api } from './client'

export async function savePageApi(payload: PagePayload, id?: string) {
  if (id) {
    const { data } = await api.put<PageResponse>(`/pages/${id}`, payload)
    return data
  }

  const { data } = await api.post<PageResponse>('/pages', payload)
  return data
}

export async function publishPageApi(id: string) {
  const { data } = await api.post<PageResponse>(`/pages/${id}/publish`)
  return data
}
