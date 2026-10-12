import { configureStore } from '@reduxjs/toolkit'
import articlesReducer from './slices/articlesSlice'
import authReducer from './slices/authSlice'
import editorReducer from './slices/editorSlice'
import epaperReducer from './slices/epaperSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    articles: articlesReducer,
    editor: editorReducer,
    epaper: epaperReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
