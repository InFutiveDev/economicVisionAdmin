import axios from 'axios'
import { AUTH_STORAGE_KEY } from '../types/auth'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }

  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return config
    const token = (JSON.parse(raw) as { token?: string }).token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch {
    return config
  }
  return config
})
