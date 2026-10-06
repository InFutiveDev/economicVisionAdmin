import { isAxiosError } from 'axios'

export function getErrorMessage(caught: unknown, fallback: string) {
  if (isAxiosError(caught)) {
    const data = caught.response?.data as { message?: string } | string | undefined
    if (typeof data === 'object' && data?.message) return data.message
    if (caught.response?.status === 404) return fallback
    if (caught.response?.status === 413) {
      return 'This article is too large for the server. Use smaller or fewer images.'
    }
    return caught.message ?? fallback
  }
  if (caught instanceof Error) return caught.message
  if (typeof caught === 'string') return caught
  return fallback
}
