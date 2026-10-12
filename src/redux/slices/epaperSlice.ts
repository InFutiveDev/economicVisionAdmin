import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { format } from 'date-fns'
import {
  deleteEpaperApi,
  fetchEpaperByIdApi,
  fetchEpapersApi,
  saveEpaperApi,
} from '../../api/epaper.api'
import type { EpaperEdition, EpaperInput, EpaperPageItem, EpaperStatus } from '../../types/epaper'
import { getErrorMessage } from '../../utils/error'

export function generateEpaperSlug(city: string, date: string): string {
  const cleanCity = city.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const parsedDate = new Date(date)
  if (!isNaN(parsedDate.getTime())) {
    const formatted = format(parsedDate, 'dd-MMM-yyyy').toLowerCase()
    return `${cleanCity}-${formatted}`.replace(/-+/g, '-').replace(/^-|-$/g, '')
  }
  const cleanDate = date.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return `${cleanCity}-${cleanDate}`.replace(/-+/g, '-').replace(/^-|-$/g, '')
}

export function formatDateStrings(dateInput: string | Date) {
  const dateObj = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  if (isNaN(dateObj.getTime())) {
    const now = new Date()
    return {
      date: format(now, 'EEEE, dd MMMM yyyy'),
      dateShort: format(now, 'dd MMM yyyy'),
      rawDate: format(now, 'yyyy-MM-dd'),
    }
  }
  return {
    date: format(dateObj, 'EEEE, dd MMMM yyyy'),
    dateShort: format(dateObj, 'dd MMM yyyy'),
    rawDate: format(dateObj, 'yyyy-MM-dd'),
  }
}

type EditorState = {
  id: string | null
  name: string
  title: string
  city: string
  rawDate: string
  date: string
  dateShort: string
  slug: string
  cover: string
  paragraph: string
  paragraphs: string[]
  today: boolean
  status: EpaperStatus
  pdfUrl: string
  pages: EpaperPageItem[]
  activePageIndex: number
  preview: boolean
  saving: boolean
  uploading: boolean
  uploadProgress: { completed: number; total: number } | null
  error: string
  notice: string
}

type EpaperState = {
  items: EpaperEdition[]
  listStatus: 'idle' | 'loading' | 'failed'
  listError: string | null
  editor: EditorState
}

const defaultDateInfo = formatDateStrings(new Date())

const initialEditorState: EditorState = {
  id: null,
  name: 'संवाद फर्स्ट',
  title: 'संवाद फर्स्ट',
  city: 'Indore',
  rawDate: defaultDateInfo.rawDate,
  date: defaultDateInfo.date,
  dateShort: defaultDateInfo.dateShort,
  slug: generateEpaperSlug('Indore', defaultDateInfo.rawDate),
  cover: '',
  paragraph: '',
  paragraphs: [],
  today: true,
  status: 'published',
  pdfUrl: '',
  pages: [],
  activePageIndex: 0,
  preview: false,
  saving: false,
  uploading: false,
  uploadProgress: null,
  error: '',
  notice: '',
}

const initialState: EpaperState = {
  items: [],
  listStatus: 'idle',
  listError: null,
  editor: initialEditorState,
}

export const fetchEpapers = createAsyncThunk(
  'epaper/fetchList',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchEpapersApi()
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not load e-papers.'))
    }
  },
)

export const loadEpaper = createAsyncThunk(
  'epaper/loadOne',
  async (idOrSlug: string, { rejectWithValue }) => {
    try {
      return await fetchEpaperByIdApi(idOrSlug)
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not find e-paper edition.'))
    }
  },
)

export const saveEpaperDraft = createAsyncThunk<
  EpaperEdition,
  void,
  { state: { epaper: EpaperState } }
>('epaper/saveDraft', async (_, { getState, rejectWithValue }) => {
  try {
    const { editor } = getState().epaper
    const name = editor.name.trim() || editor.title.trim() || 'संवाद फर्स्ट'
    const title = editor.title.trim() || name
    const paragraphs = editor.paragraphs.map((p) => p.trim()).filter(Boolean)
    const paragraph = editor.paragraph.trim() || paragraphs[0] || ''

    const payload: EpaperInput = {
      id: editor.id || undefined,
      name,
      title,
      city: editor.city.trim() || 'Indore',
      date: editor.date,
      dateShort: editor.dateShort,
      slug: editor.slug.trim() || generateEpaperSlug(editor.city, editor.rawDate),
      cover: editor.cover || editor.pages[0]?.image || '',
      paragraph,
      excerpt: paragraph,
      description: paragraph,
      paragraphs,
      pages: editor.pages.map((p, idx) => ({ ...p, pageNumber: idx + 1 })),
      today: editor.today,
      status: 'draft',
      pdfUrl: editor.pdfUrl,
    }
    return await saveEpaperApi(payload)
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Failed to save draft.'))
  }
})

export const publishEpaper = createAsyncThunk<
  EpaperEdition,
  void,
  { state: { epaper: EpaperState } }
>('epaper/publish', async (_, { getState, rejectWithValue }) => {
  try {
    const { editor } = getState().epaper
    const name = editor.name.trim() || editor.title.trim() || 'संवाद फर्स्ट'
    const title = editor.title.trim() || name
    const paragraphs = editor.paragraphs.map((p) => p.trim()).filter(Boolean)
    const paragraph = editor.paragraph.trim() || paragraphs[0] || ''

    const payload: EpaperInput = {
      id: editor.id || undefined,
      name,
      title,
      city: editor.city.trim() || 'Indore',
      date: editor.date,
      dateShort: editor.dateShort,
      slug: editor.slug.trim() || generateEpaperSlug(editor.city, editor.rawDate),
      cover: editor.cover || editor.pages[0]?.image || '',
      paragraph,
      excerpt: paragraph,
      description: paragraph,
      paragraphs,
      pages: editor.pages.map((p, idx) => ({ ...p, pageNumber: idx + 1 })),
      today: editor.today,
      status: 'published',
      pdfUrl: editor.pdfUrl,
    }
    return await saveEpaperApi(payload)
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Failed to publish e-paper.'))
  }
})

export const deleteEpaper = createAsyncThunk(
  'epaper/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteEpaperApi(id)
      return id
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to delete e-paper.'))
    }
  },
)

const epaperSlice = createSlice({
  name: 'epaper',
  initialState,
  reducers: {
    resetEpaperEditor: (state) => {
      const dateInfo = formatDateStrings(new Date())
      state.editor = {
        ...initialEditorState,
        rawDate: dateInfo.rawDate,
        date: dateInfo.date,
        dateShort: dateInfo.dateShort,
        slug: generateEpaperSlug('Indore', dateInfo.rawDate),
      }
    },
    setName: (state, action: PayloadAction<string>) => {
      state.editor.name = action.payload
      if (!state.editor.title || state.editor.title === 'संवाद फर्स्ट') {
        state.editor.title = action.payload
      }
    },
    setTitle: (state, action: PayloadAction<string>) => {
      state.editor.title = action.payload
      if (!state.editor.name || state.editor.name === 'संवाद फर्स्ट') {
        state.editor.name = action.payload
      }
    },
    setParagraph: (state, action: PayloadAction<string>) => {
      state.editor.paragraph = action.payload
    },
    setParagraphs: (state, action: PayloadAction<string[]>) => {
      state.editor.paragraphs = action.payload
    },
    addParagraph: (state, action: PayloadAction<string>) => {
      if (action.payload.trim()) {
        state.editor.paragraphs.push(action.payload.trim())
      }
    },
    updateParagraph: (state, action: PayloadAction<{ index: number; text: string }>) => {
      const { index, text } = action.payload
      if (state.editor.paragraphs[index] !== undefined) {
        state.editor.paragraphs[index] = text
      }
    },
    removeParagraph: (state, action: PayloadAction<number>) => {
      state.editor.paragraphs.splice(action.payload, 1)
    },
    setCity: (state, action: PayloadAction<string>) => {
      state.editor.city = action.payload
      if (!state.editor.id) {
        state.editor.slug = generateEpaperSlug(action.payload, state.editor.rawDate)
      }
    },
    setDateFromPicker: (state, action: PayloadAction<string>) => {
      const rawDate = action.payload
      const dateInfo = formatDateStrings(rawDate)
      state.editor.rawDate = rawDate
      state.editor.date = dateInfo.date
      state.editor.dateShort = dateInfo.dateShort
      if (!state.editor.id) {
        state.editor.slug = generateEpaperSlug(state.editor.city, rawDate)
      }
    },
    setSlug: (state, action: PayloadAction<string>) => {
      state.editor.slug = action.payload
    },
    setCover: (state, action: PayloadAction<string>) => {
      state.editor.cover = action.payload
    },
    setToday: (state, action: PayloadAction<boolean>) => {
      state.editor.today = action.payload
    },
    setStatus: (state, action: PayloadAction<EpaperStatus>) => {
      state.editor.status = action.payload
    },
    setPdfUrl: (state, action: PayloadAction<string>) => {
      state.editor.pdfUrl = action.payload
    },
    togglePreview: (state) => {
      state.editor.preview = !state.editor.preview
    },
    setPreview: (state, action: PayloadAction<boolean>) => {
      state.editor.preview = action.payload
    },
    setActivePageIndex: (state, action: PayloadAction<number>) => {
      state.editor.activePageIndex = Math.max(
        0,
        Math.min(action.payload, state.editor.pages.length - 1),
      )
    },
    addPage: (state, action: PayloadAction<{ title?: string; image: string; description?: string }>) => {
      const pageNumber = state.editor.pages.length + 1
      state.editor.pages.push({
        id: crypto.randomUUID(),
        pageNumber,
        title: action.payload.title || `Page ${pageNumber}`,
        image: action.payload.image,
        description: action.payload.description || '',
      })
      if (!state.editor.cover) {
        state.editor.cover = action.payload.image
      }
    },
    addBatchPages: (state, action: PayloadAction<EpaperPageItem[]>) => {
      const start = state.editor.pages.length
      const formatted = action.payload.map((item, idx) => ({
        ...item,
        pageNumber: start + idx + 1,
        title: item.title || `Page ${start + idx + 1}`,
      }))
      state.editor.pages.push(...formatted)
      if (!state.editor.cover && state.editor.pages[0]?.image) {
        state.editor.cover = state.editor.pages[0].image
      }
    },
    updatePage: (
      state,
      action: PayloadAction<{ index: number; updates: Partial<EpaperPageItem> }>,
    ) => {
      const { index, updates } = action.payload
      if (state.editor.pages[index]) {
        state.editor.pages[index] = { ...state.editor.pages[index], ...updates }
        if (index === 0 && !state.editor.cover && updates.image) {
          state.editor.cover = updates.image
        }
      }
    },
    removePage: (state, action: PayloadAction<number>) => {
      state.editor.pages.splice(action.payload, 1)
      state.editor.pages.forEach((page, idx) => {
        page.pageNumber = idx + 1
      })
      if (state.editor.activePageIndex >= state.editor.pages.length) {
        state.editor.activePageIndex = Math.max(0, state.editor.pages.length - 1)
      }
    },
    movePage: (state, action: PayloadAction<{ index: number; direction: -1 | 1 }>) => {
      const { index, direction } = action.payload
      const target = index + direction
      if (target < 0 || target >= state.editor.pages.length) return
      const temp = state.editor.pages[index]
      state.editor.pages[index] = state.editor.pages[target]
      state.editor.pages[target] = temp
      state.editor.pages.forEach((page, idx) => {
        page.pageNumber = idx + 1
      })
      state.editor.activePageIndex = target
    },
    setPagesList: (state, action: PayloadAction<EpaperPageItem[]>) => {
      state.editor.pages = action.payload.map((page, idx) => ({
        ...page,
        pageNumber: idx + 1,
      }))
    },
    setError: (state, action: PayloadAction<string>) => {
      state.editor.error = action.payload
    },
    setNotice: (state, action: PayloadAction<string>) => {
      state.editor.notice = action.payload
    },
    setUploading: (
      state,
      action: PayloadAction<{
        uploading: boolean
        progress?: { completed: number; total: number } | null
      }>,
    ) => {
      state.editor.uploading = action.payload.uploading
      state.editor.uploadProgress = action.payload.progress ?? null
    },
  },
  extraReducers: (builder) => {
    // fetch list
    builder
      .addCase(fetchEpapers.pending, (state) => {
        state.listStatus = 'loading'
        state.listError = null
      })
      .addCase(fetchEpapers.fulfilled, (state, action) => {
        state.listStatus = 'idle'
        state.items = action.payload
      })
      .addCase(fetchEpapers.rejected, (state, action) => {
        state.listStatus = 'failed'
        state.listError = (action.payload as string) || 'Could not load e-papers.'
      })

    // load one
    builder
      .addCase(loadEpaper.pending, (state) => {
        state.editor.saving = true
        state.editor.error = ''
      })
      .addCase(loadEpaper.fulfilled, (state, action) => {
        const item = action.payload
        state.editor.saving = false
        state.editor.id = item.id
        state.editor.name = item.name || item.title || 'संवाद फर्स्ट'
        state.editor.title = item.title || item.name || 'संवाद फर्स्ट'
        state.editor.city = item.city
        const dateInfo = formatDateStrings(item.date)
        state.editor.rawDate = dateInfo.rawDate
        state.editor.date = item.date
        state.editor.dateShort = item.dateShort
        state.editor.slug = item.slug
        state.editor.cover = item.cover
        state.editor.paragraph = item.paragraph || item.excerpt || item.description || ''
        state.editor.paragraphs = Array.isArray(item.paragraphs) && item.paragraphs.length
          ? item.paragraphs
          : item.paragraph
            ? [item.paragraph]
            : []
        state.editor.today = item.today
        state.editor.status = item.status
        state.editor.pdfUrl = item.pdfUrl || ''
        state.editor.pages = item.pages || []
        state.editor.activePageIndex = 0
        state.editor.error = ''
      })
      .addCase(loadEpaper.rejected, (state, action) => {
        state.editor.saving = false
        state.editor.error = (action.payload as string) || 'Failed to load edition.'
      })

    // save draft
    builder
      .addCase(saveEpaperDraft.pending, (state) => {
        state.editor.saving = true
        state.editor.error = ''
        state.editor.notice = ''
      })
      .addCase(saveEpaperDraft.fulfilled, (state, action) => {
        state.editor.saving = false
        state.editor.id = action.payload.id
        state.editor.status = 'draft'
        state.editor.notice = 'Draft saved successfully.'
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index >= 0) state.items[index] = action.payload
        else state.items.unshift(action.payload)
      })
      .addCase(saveEpaperDraft.rejected, (state, action) => {
        state.editor.saving = false
        state.editor.error = (action.payload as string) || 'Failed to save draft.'
      })

    // publish
    builder
      .addCase(publishEpaper.pending, (state) => {
        state.editor.saving = true
        state.editor.error = ''
        state.editor.notice = ''
      })
      .addCase(publishEpaper.fulfilled, (state, action) => {
        state.editor.saving = false
        state.editor.id = action.payload.id
        state.editor.status = 'published'
        state.editor.notice = 'E-Paper published successfully!'
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index >= 0) state.items[index] = action.payload
        else state.items.unshift(action.payload)
      })
      .addCase(publishEpaper.rejected, (state, action) => {
        state.editor.saving = false
        state.editor.error = (action.payload as string) || 'Failed to publish e-paper.'
      })

    // delete
    builder.addCase(deleteEpaper.fulfilled, (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
    })
  },
})

export const {
  resetEpaperEditor,
  setName,
  setTitle,
  setParagraph,
  setParagraphs,
  addParagraph,
  updateParagraph,
  removeParagraph,
  setCity,
  setDateFromPicker,
  setSlug,
  setCover,
  setToday,
  setStatus,
  setPdfUrl,
  togglePreview,
  setPreview,
  setActivePageIndex,
  addPage,
  addBatchPages,
  updatePage,
  removePage,
  movePage,
  setPagesList,
  setError,
  setNotice,
  setUploading,
} = epaperSlice.actions

export const selectEpapers = (state: { epaper: EpaperState }) => state.epaper.items
export const selectEpapersStatus = (state: { epaper: EpaperState }) => state.epaper.listStatus
export const selectEpapersError = (state: { epaper: EpaperState }) => state.epaper.listError
export const selectEpaperEditor = (state: { epaper: EpaperState }) => state.epaper.editor

export default epaperSlice.reducer
