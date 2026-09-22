export type Role = 'admin' | 'user'

export type AuthUser = {
  id: string
  name: string
  email: string
  role: Role
}

export type AuthSession = {
  token: string
  user: AuthUser
}

export type LoginInput = {
  email: string
  password: string
}

export const AUTH_STORAGE_KEY = 'ev-admin-auth'
