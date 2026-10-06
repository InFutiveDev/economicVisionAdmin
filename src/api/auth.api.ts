import { isAxiosError } from 'axios'
import type { AuthSession, LoginInput } from '../types/auth'
import { api } from './client'

export async function loginApi(input: LoginInput): Promise<AuthSession> {
  try {
    const { data } = await api.post<AuthSession>('/auth/login', input)
    if (!data?.token || !data?.user) {
      throw new Error('Invalid login response.')
    }
    return data
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 401) {
      throw new Error('Invalid email or password.')
    }
    throw error
  }
}
