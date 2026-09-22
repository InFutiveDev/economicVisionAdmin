import { isAxiosError } from 'axios'
import type { AuthSession, LoginInput } from '../types/auth'
import { api } from './client'

const demoAccount = {
  id: 'admin-1',
  name: 'Asha Rao',
  email: 'admin@economicvision.com',
  password: 'admin123',
  role: 'admin' as const,
}

export const demoCredentials = {
  email: demoAccount.email,
  password: demoAccount.password,
}

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

    const email = input.email.trim().toLowerCase()
    if (email !== demoAccount.email || input.password !== demoAccount.password) {
      throw new Error('Invalid email or password.')
    }

    return {
      token: `demo-${demoAccount.role}-${demoAccount.id}`,
      user: {
        id: demoAccount.id,
        name: demoAccount.name,
        email: demoAccount.email,
        role: demoAccount.role,
      },
    }
  }
}
