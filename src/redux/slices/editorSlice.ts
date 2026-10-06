import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { fetchArticleByIdApi } from '../../api/articles.api'
import { publishPageApi, savePageApi } from '../../api/pages.api'
import { uploadInlineImages } from '../../api/upload.api'
import type { Article } from '../../types/article'
import type { Block, BlockType, PagePayload } from '../../types/block'
import { createBlock } from '../../utils/blockFactory'
import { getErrorMessage } from '../../utils/error'
import { slugify } from '../../utils/slug'

type EditorState = {
  title: string
  kicker: string
  excerpt: string
  category: string
  subCategory: string
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
  subCategory: '',
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

function toPayload(
  state: EditorState,
  status: PagePayload['status'] = 'draft',
): PagePayload {
  return {
    title: state.title.trim(),
    slug: slugify(state.title),
    kicker: state.kicker.trim(),
    excerpt: state.excerpt.trim(),
    category: state.category,
    subCategory: state.subCategory,
    tags: state.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    coverImage: state.coverImage.trim(),
    featured: state.featured,
    author: state.author.trim() || 'Editorial Desk',
    status,
    blocks: state.blocks,
  }
}

export const saveDraft = createAsyncThunk(
  'editor/saveDraft',
  async (_, { getState, rejectWithValue }) => {
    const { editor } = getState() as { editor: EditorState }
    try {
      const status = editor.status === 'published' ? 'published' : 'draft'
      const payload = await uploadInlineImages(toPayload(editor, status))
      const saved = await savePageApi(payload, editor.pageId)
      return { ...saved, blocks: payload.blocks, coverImage: payload.coverImage }
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not save draft.'))
    }
  },
)

export const loadArticle = createAsyncThunk(
  'editor/load',
  async (
    { id, preview = false }: { id: string; preview?: boolean },
    { rejectWithValue },
  ) => {
    try {
      const article = await fetchArticleByIdApi(id)
      return { article, preview }
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not load this article.'))
    }
  },
)

export const publishArticle = createAsyncThunk(
  'editor/publish',
  async (_, { getState, rejectWithValue }) => {
    const { editor } = getState() as { editor: EditorState }
    try {
      const payload = await uploadInlineImages(toPayload(editor, 'published'))
      const saved = await savePageApi(payload, editor.pageId)
      const id = saved.id ?? editor.pageId
      if (!id) {
        throw new Error('Save succeeded without an id, so publish was skipped.')
      }
      const published = await publishPageApi(id, payload)
      return { ...published, blocks: payload.blocks, coverImage: payload.coverImage }
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
    hydrateEditor(state, action: PayloadAction<Article>) {
      const article = action.payload
      state.pageId = article.id
      state.title = article.title
      state.kicker = article.kicker
      state.excerpt = article.excerpt
      state.category = article.category || 'Economy'
      state.subCategory = article.subCategory || ''
      state.tags = article.tags.join(', ')
      state.coverImage = article.coverImage
      state.featured = article.featured
      state.author = article.author
      state.blocks = article.blocks
      state.status = article.status === 'published' ? 'published' : 'draft'
      state.preview = false
      state.error = ''
      state.notice = ''
      state.saving = false
    },
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
      if (state.category !== action.payload) state.subCategory = ''
      state.category = action.payload
    },
    setSubCategory(state, action: PayloadAction<string>) {
      state.subCategory = action.payload
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
        state.status = action.payload.status === 'published' ? 'published' : 'draft'
        state.notice =
          state.status === 'published' ? 'Changes saved.' : 'Draft saved.'
        if (action.payload.id) state.pageId = action.payload.id
        state.blocks = action.payload.blocks
        state.coverImage = action.payload.coverImage
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
        state.blocks = action.payload.blocks
        state.coverImage = action.payload.coverImage
      })
      .addCase(publishArticle.rejected, (state, action) => {
        state.saving = false
        state.error = (action.payload as string) || 'Could not publish this article.'
      })
      .addCase(loadArticle.pending, (state) => {
        state.saving = true
        state.error = ''
        state.notice = ''
      })
      .addCase(loadArticle.fulfilled, (state, action) => {
        editorSlice.caseReducers.hydrateEditor(state, {
          ...action,
          payload: action.payload.article,
        })
        state.preview = action.payload.preview
      })
      .addCase(loadArticle.rejected, (state, action) => {
        state.saving = false
        state.error = (action.payload as string) || 'Could not load this article.'
      })
  },
})

export const {
  resetEditor,
  hydrateEditor,
  setTitle,
  setKicker,
  setExcerpt,
  setCategory,
  setSubCategory,
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
