import type { AuthUser, Role } from '../types/auth'
import { api } from './client'

export type UserInput = {
  name: string
  email: string
  password: string
  role: Role
}

export async function fetchUsersApi(): Promise<AuthUser[]> {
  const { data } = await api.get<{ users: AuthUser[] }>('/users')
  return data.users
}

export async function createUserApi(input: UserInput): Promise<AuthUser> {
  const { data } = await api.post<{ user: AuthUser }>('/users', input)
  return data.user
}

export async function updateUserApi(
  id: string,
  input: Partial<UserInput>,
): Promise<AuthUser> {
  const { data } = await api.put<{ user: AuthUser }>(`/users/${id}`, input)
  return data.user
}

export async function deleteUserApi(id: string): Promise<void> {
  await api.delete(`/users/${id}`)
}
