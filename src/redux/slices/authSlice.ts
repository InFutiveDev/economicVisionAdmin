import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { loginApi } from '../../api/auth.api'
import type { AuthUser, LoginInput } from '../../types/auth'
import { getErrorMessage } from '../../utils/error'
import { clearSession, readSession, writeSession } from '../../utils/storage'

const stored = readSession()
const session = stored?.token?.startsWith('demo-') ? null : stored
if (stored && !session) clearSession()

type AuthState = {
  user: AuthUser | null
  token: string | null
  status: 'idle' | 'loading' | 'failed'
  error: string | null
}

const initialState: AuthState = {
  user: session?.user ?? null,
  token: session?.token ?? null,
  status: 'idle',
  error: null,
}

export const loginUser = createAsyncThunk(
  'auth/login',
  async (input: LoginInput, { rejectWithValue }) => {
    try {
      return await loginApi(input)
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not sign in.'))
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null
      state.token = null
      state.status = 'idle'
      state.error = null
      clearSession()
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'idle'
        state.user = action.payload.user
        state.token = action.payload.token
        writeSession(action.payload)
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string) || 'Could not sign in.'
      })
  },
})

export const { logout } = authSlice.actions
export const selectUser = (state: { auth: AuthState }) => state.auth.user
export const selectAuthStatus = (state: { auth: AuthState }) => state.auth.status
export default authSlice.reducer
