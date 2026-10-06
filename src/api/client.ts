import axios from 'axios'
import { AUTH_STORAGE_KEY } from '../types/auth'

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ??
    'https://adminapi.theeconomicvision.com/api',
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

export const AUTH_EXPIRED_EVENT = 'ev-auth-expired'

api.interceptors.response.use(undefined, (error) => {
  const isLogin = String(error?.config?.url ?? '').includes('/auth/login')
  if (error?.response?.status === 401 && !isLogin) {
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
  }
  return Promise.reject(error)
})
