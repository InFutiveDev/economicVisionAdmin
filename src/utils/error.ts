import { isAxiosError } from 'axios'

export function getErrorMessage(caught: unknown, fallback: string) {
  if (isAxiosError(caught)) {
    const data = caught.response?.data as { message?: string } | undefined
    return data?.message ?? caught.message ?? fallback
  }
  if (caught instanceof Error) return caught.message
  if (typeof caught === 'string') return caught
  return fallback
}
