import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { fetchArticlesApi, mockArticles } from '../../api/articles.api'
import type { Article } from '../../types/article'
import { getErrorMessage } from '../../utils/error'

type ArticlesState = {
  items: Article[]
  status: 'idle' | 'loading' | 'failed'
  error: string | null
}

const initialState: ArticlesState = {
  items: mockArticles,
  status: 'idle',
  error: null,
}

export const fetchArticles = createAsyncThunk(
  'articles/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchArticlesApi()
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not load articles.'))
    }
  },
)

const articlesSlice = createSlice({
  name: 'articles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchArticles.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.status = 'idle'
        state.items = action.payload
      })
      .addCase(fetchArticles.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string) || 'Could not load articles.'
      })
  },
})

export const selectArticles = (state: { articles: ArticlesState }) =>
  state.articles.items
export default articlesSlice.reducer
