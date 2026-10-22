import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { deleteArticleApi, fetchArticlesApi } from '../../api/articles.api'
import type { Article } from '../../types/article'
import { getErrorMessage } from '../../utils/error'

type ArticlesState = {
  items: Article[]
  status: 'idle' | 'loading' | 'failed'
  error: string | null
}

const initialState: ArticlesState = {
  items: [],
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

export const deleteArticle = createAsyncThunk(
  'articles/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteArticleApi(id)
      return id
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not delete article.'))
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
      .addCase(deleteArticle.fulfilled, (state, action) => {
        state.items = state.items.filter((article) => article.id !== action.payload)
        state.error = null
      })
      .addCase(deleteArticle.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Could not delete article.'
      })
  },
})

export const selectArticles = (state: { articles: ArticlesState }) =>
  state.articles.items
export const selectArticlesStatus = (state: { articles: ArticlesState }) =>
  state.articles.status
export const selectArticlesError = (state: { articles: ArticlesState }) =>
  state.articles.error
export default articlesSlice.reducer
