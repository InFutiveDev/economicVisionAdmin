import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { publishPageApi, savePageApi } from '../../api/pages.api'
import type { Block, BlockType, PagePayload } from '../../types/block'
import { createBlock } from '../../utils/blockFactory'
import { getErrorMessage } from '../../utils/error'
import { slugify } from '../../utils/slug'

type EditorState = {
  title: string
  kicker: string
  excerpt: string
  category: string
  tags: string
  coverImage: string
  featured: boolean
  author: string
  blocks: Block[]
  status: 'draft' | 'published'
  pageId?: string
  preview: boolean
  error: string
  notice: string
  saving: boolean
}

const initialState: EditorState = {
  title: '',
  kicker: '',
  excerpt: '',
  category: 'Economy',
  tags: '',
  coverImage: '',
  featured: false,
  author: '',
  blocks: [],
  status: 'draft',
  preview: false,
  error: '',
  notice: '',
  saving: false,
}

function toPayload(state: EditorState): PagePayload {
  return {
    title: state.title.trim(),
    slug: slugify(state.title),
    kicker: state.kicker.trim(),
    excerpt: state.excerpt.trim(),
    category: state.category,
    tags: state.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    coverImage: state.coverImage.trim(),
    featured: state.featured,
    author: state.author.trim() || 'Editorial Desk',
    status: 'draft',
    blocks: state.blocks,
  }
}

export const saveDraft = createAsyncThunk(
  'editor/saveDraft',
  async (_, { getState, rejectWithValue }) => {
    const { editor } = getState() as { editor: EditorState }
    try {
      return await savePageApi(toPayload(editor), editor.pageId)
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not save draft.'))
    }
  },
)

export const publishArticle = createAsyncThunk(
  'editor/publish',
  async (_, { getState, rejectWithValue }) => {
    const { editor } = getState() as { editor: EditorState }
    try {
      const saved = await savePageApi(toPayload(editor), editor.pageId)
      const id = saved.id ?? editor.pageId
      if (!id) {
        throw new Error('Save succeeded without an id, so publish was skipped.')
      }
      await publishPageApi(id)
      return saved
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not publish this article.'))
    }
  },
)

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    resetEditor: () => initialState,
    setTitle(state, action: PayloadAction<string>) {
      state.title = action.payload
      state.error = ''
      state.notice = ''
    },
    setKicker(state, action: PayloadAction<string>) {
      state.kicker = action.payload
    },
    setExcerpt(state, action: PayloadAction<string>) {
      state.excerpt = action.payload
    },
    setCategory(state, action: PayloadAction<string>) {
      state.category = action.payload
    },
    setTags(state, action: PayloadAction<string>) {
      state.tags = action.payload
    },
    setCoverImage(state, action: PayloadAction<string>) {
      state.coverImage = action.payload
    },
    setFeatured(state, action: PayloadAction<boolean>) {
      state.featured = action.payload
    },
    setAuthor(state, action: PayloadAction<string>) {
      state.author = action.payload
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload
      state.notice = ''
    },
    togglePreview(state) {
      state.preview = !state.preview
    },
    addBlock(state, action: PayloadAction<BlockType>) {
      state.blocks.push(createBlock(action.payload))
      state.error = ''
      state.notice = ''
    },
    updateBlock(state, action: PayloadAction<Block>) {
      state.blocks = state.blocks.map((block) =>
        block.id === action.payload.id ? action.payload : block,
      )
    },
    moveBlock(state, action: PayloadAction<{ index: number; direction: -1 | 1 }>) {
      const { index, direction } = action.payload
      const target = index + direction
      if (target < 0 || target >= state.blocks.length) return
      const copy = [...state.blocks]
      const [item] = copy.splice(index, 1)
      copy.splice(target, 0, item)
      state.blocks = copy
    },
    duplicateBlock(state, action: PayloadAction<string>) {
      const index = state.blocks.findIndex((block) => block.id === action.payload)
      const source = state.blocks[index]
      if (!source) return
      const copy = structuredClone(source)
      copy.id = crypto.randomUUID()
      state.blocks.splice(index + 1, 0, copy)
    },
    removeBlock(state, action: PayloadAction<string>) {
      state.blocks = state.blocks.filter((block) => block.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveDraft.pending, (state) => {
        state.saving = true
        state.error = ''
        state.notice = ''
      })
      .addCase(saveDraft.fulfilled, (state, action) => {
        state.saving = false
        state.status = 'draft'
        state.notice = 'Draft saved.'
        if (action.payload.id) state.pageId = action.payload.id
      })
      .addCase(saveDraft.rejected, (state, action) => {
        state.saving = false
        state.error = (action.payload as string) || 'Could not save draft.'
      })
      .addCase(publishArticle.pending, (state) => {
        state.saving = true
        state.error = ''
      })
      .addCase(publishArticle.fulfilled, (state, action) => {
        state.saving = false
        state.status = 'published'
        state.notice = 'Article published.'
        if (action.payload.id) state.pageId = action.payload.id
      })
      .addCase(publishArticle.rejected, (state, action) => {
        state.saving = false
        state.error = (action.payload as string) || 'Could not publish this article.'
      })
  },
})

export const {
  resetEditor,
  setTitle,
  setKicker,
  setExcerpt,
  setCategory,
  setTags,
  setCoverImage,
  setFeatured,
  setAuthor,
  setError,
  togglePreview,
  addBlock,
  updateBlock,
  moveBlock,
  duplicateBlock,
  removeBlock,
} = editorSlice.actions

export const selectEditor = (state: { editor: EditorState }) => state.editor
export default editorSlice.reducer
