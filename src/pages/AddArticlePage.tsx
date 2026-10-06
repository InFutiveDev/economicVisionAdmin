import { useEffect, useMemo, useState } from 'react'
import { fetchCategoriesApi } from '../api/homepage.api'
import { groupCategories } from '../types/homepage'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Eye, Globe, Pencil, Save } from 'lucide-react'
import { BlockEditor } from '../components/blocks/BlockEditor'
import { BlockPalette } from '../components/blocks/BlockPalette'
import { BlockRenderer } from '../components/blocks/BlockRenderer'
import { ImageUploadField } from '../components/blocks/ImageUploadField'
import { TagInput } from '../components/articles/TagInput'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { fetchArticles, selectArticles } from '../redux/slices/articlesSlice'
import { selectUser } from '../redux/slices/authSlice'
import {
  addBlock,
  duplicateBlock,
  loadArticle,
  moveBlock,
  publishArticle,
  removeBlock,
  resetEditor,
  saveDraft,
  selectEditor,
  setAuthor,
  setCategory,
  setCoverImage,
  setError,
  setExcerpt,
  setFeatured,
  setKicker,
  setSubCategory,
  setTags,
  setTitle,
  togglePreview,
  updateBlock,
} from '../redux/slices/editorSlice'
import { ARTICLE_CATEGORIES } from '../types/block'
import { initials, slugify } from '../utils/slug'
import '../styles/article-editor.css'

const TITLE_FIELD_ID = 'article-title'
const BLOCKS_FIELD_ID = 'article-blocks'

function focusEditorField(field: 'title' | 'blocks') {
  const id = field === 'title' ? TITLE_FIELD_ID : BLOCKS_FIELD_ID
  window.requestAnimationFrame(() => {
    const element = document.getElementById(id)
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    if (
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement
    ) {
      element.focus()
    }
  })
}

function fieldFromError(message: string): 'title' | 'blocks' | null {
  if (/title/i.test(message)) return 'title'
  if (/block/i.test(message)) return 'blocks'
  return null
}

export function AddArticlePage({ previewOnly = false }: { previewOnly?: boolean }) {
  const { articleId } = useParams()
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)
  const editor = useAppSelector(selectEditor)
  const isAdmin = user?.role === 'admin'
  const slug = useMemo(() => slugify(editor.title), [editor.title])
  const tags = editor.tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
  const articles = useAppSelector(selectArticles)
  const tagSuggestions = useMemo(
    () =>
      [...new Set(articles.flatMap((article) => article.tags.map((tag) => tag.trim())))]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [articles],
  )

  useEffect(() => {
    if (!previewOnly && articles.length === 0) void dispatch(fetchArticles())
  }, [dispatch, previewOnly, articles.length])
  const [categoryGroups, setCategoryGroups] = useState<{ name: string; children: string[] }[]>(
    ARTICLE_CATEGORIES.map((name) => ({ name, children: [] })),
  )
  const activeGroup = categoryGroups.find((group) => group.name === editor.category)
  const subCategoryOptions = activeGroup?.children ?? []
  const showSubCategoryValue =
    Boolean(editor.subCategory) && !subCategoryOptions.includes(editor.subCategory)

  useEffect(() => {
    fetchCategoriesApi()
      .then((categories) => {
        if (!categories.length) return
        setCategoryGroups(
          groupCategories(categories).map((group) => ({
            name: group.name,
            children: group.children.map((child) => child.name),
          })),
        )
      })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    if (articleId) {
      void dispatch(loadArticle({ id: articleId, preview: previewOnly }))
    } else {
      dispatch(resetEditor())
      if (user?.name) dispatch(setAuthor(user.name))
    }
    return () => {
      dispatch(resetEditor())
    }
  }, [articleId, dispatch, previewOnly, user?.name])

  const validate = () => {
    if (!editor.title.trim() && editor.blocks.length === 0) {
      return {
        message: 'Title is required, and the article needs at least one block.',
        field: 'title' as const,
      }
    }
    if (!editor.title.trim()) {
      return { message: 'Title is required.', field: 'title' as const }
    }
    if (editor.blocks.length === 0) {
      return {
        message: 'Add at least one block before saving.',
        field: 'blocks' as const,
      }
    }
    return { message: '', field: null }
  }

  const showValidation = (message: string, field: 'title' | 'blocks' | null) => {
    if (editor.preview) dispatch(togglePreview())
    dispatch(setError(message))
    if (field) focusEditorField(field)
  }

  const handleSave = () => {
    const result = validate()
    if (result.message) {
      showValidation(result.message, result.field)
      return
    }
    void dispatch(saveDraft())
  }

  const handlePublish = () => {
    const result = validate()
    if (result.message) {
      showValidation(result.message, result.field)
      return
    }
    void dispatch(publishArticle())
  }

  useEffect(() => {
    const field = fieldFromError(editor.error)
    if (field) focusEditorField(field)
  }, [editor.error])

  return (
    <div className="article-page">
      <div className="article-page-inner">
        <div className="article-topbar">
          <Link className="article-back" to="/articles">
            <ArrowLeft size={14} />
            Articles
          </Link>
          <div className="article-actions">
            <span className={`status-pill ${editor.status}`}>{editor.status}</span>
            {previewOnly && editor.pageId ? (
              <Link className="btn" to={`/articles/${editor.pageId}/edit`}>
                <Pencil size={14} />
                Edit
              </Link>
            ) : null}
            {previewOnly ? null : (
              <button
                type="button"
                className="btn"
                onClick={() => dispatch(togglePreview())}
              >
                <Eye size={14} />
                {editor.preview ? 'Edit' : 'Preview'}
              </button>
            )}
            {previewOnly ? null : (
              <button
                type="button"
                className="btn gold"
                onClick={handleSave}
                disabled={editor.saving}
              >
                <Save size={14} />
                {editor.status === 'published' ? 'Save changes' : 'Save draft'}
              </button>
            )}
            {previewOnly || !isAdmin ? null : (
              <button
                type="button"
                className="btn primary"
                onClick={handlePublish}
                disabled={editor.saving}
              >
                <Globe size={14} />
                Publish
              </button>
            )}
          </div>
        </div>

        <header className="article-header">
          <div className="article-field">
            <label className="field-label" htmlFor="article-kicker">
              Kicker
            </label>
            <input
              id="article-kicker"
              className="article-kicker-input"
              value={editor.kicker}
              placeholder="Kicker / eyebrow"
              onChange={(event) => dispatch(setKicker(event.target.value))}
            />
          </div>
          <div className="article-field article-title-field">
            <label className="field-label" htmlFor={TITLE_FIELD_ID}>
              Title
            </label>
            <input
              id={TITLE_FIELD_ID}
              className={`article-title-input ${
                /title/i.test(editor.error) ? 'is-invalid' : ''
              }`}
              value={editor.title}
              placeholder="Add a title"
              aria-invalid={/title/i.test(editor.error)}
              onChange={(event) => dispatch(setTitle(event.target.value))}
            />
            <p className="article-slug">{slug || 'slug-will-appear-here'}</p>
          </div>
          <div className="article-field">
            <label className="field-label" htmlFor="article-excerpt">
              Excerpt
            </label>
            <textarea
              id="article-excerpt"
              className="article-excerpt"
              value={editor.excerpt}
              placeholder="Dek / excerpt for the homepage and newsletter"
              onChange={(event) => dispatch(setExcerpt(event.target.value))}
            />
          </div>

          <div className="article-meta-grid">
            <div className="article-field cover-field">
              <label className="field-label" htmlFor="article-cover-upload">
                Cover image
              </label>
              <ImageUploadField
                id="article-cover-upload"
                value={editor.coverImage}
                onChange={(url) => dispatch(setCoverImage(url))}
              />
              <input
                className="field"
                value={editor.coverImage}
                placeholder="Or paste a cover image URL"
                aria-label="Cover image URL"
                onChange={(event) => dispatch(setCoverImage(event.target.value))}
              />
            </div>

            <div className="meta-fields">
              <div className="article-toolbar-meta">
                <div className="article-field">
                  <label className="field-label" htmlFor="article-author">
                    Author
                  </label>
                  <input
                    id="article-author"
                    className="article-author-input"
                    value={editor.author}
                    placeholder="Author"
                    onChange={(event) => dispatch(setAuthor(event.target.value))}
                  />
                </div>
                <div className="article-field">
                  <label className="field-label" htmlFor="article-category">
                    Category
                  </label>
                  <select
                    id="article-category"
                    className="article-select"
                    value={editor.category}
                    onChange={(event) => dispatch(setCategory(event.target.value))}
                  >
                    {activeGroup ? null : (
                      <option value={editor.category}>{editor.category}</option>
                    )}
                    {categoryGroups.map((group) => (
                      <option key={group.name} value={group.name}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="article-field">
                  <label className="field-label" htmlFor="article-sub-category">
                    Sub-category
                  </label>
                  <select
                    id="article-sub-category"
                    className="article-select"
                    value={editor.subCategory}
                    disabled={!subCategoryOptions.length && !editor.subCategory}
                    onChange={(event) => dispatch(setSubCategory(event.target.value))}
                  >
                    <option value="">
                      {subCategoryOptions.length ? 'None' : 'No sub-categories'}
                    </option>
                    {showSubCategoryValue ? (
                      <option value={editor.subCategory}>{editor.subCategory}</option>
                    ) : null}
                    {subCategoryOptions.map((child) => (
                      <option key={child} value={child}>
                        {child}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="article-field">
                <label className="field-label" htmlFor="article-tags">
                  Tags
                </label>
                <TagInput
                  id="article-tags"
                  value={tags}
                  suggestions={tagSuggestions}
                  placeholder="Type a tag and press Enter"
                  onChange={(next) => dispatch(setTags(next.join(', ')))}
                />
              </div>
              <label className="featured-toggle">
                <input
                  type="checkbox"
                  checked={editor.featured}
                  onChange={(event) => dispatch(setFeatured(event.target.checked))}
                />
                Feature on homepage
              </label>
            </div>
          </div>
        </header>

        {editor.error ? (
          <button
            type="button"
            className="error-banner"
            role="alert"
            onClick={() => {
              const field = fieldFromError(editor.error)
              if (field) focusEditorField(field)
            }}
          >
            {editor.error}
          </button>
        ) : null}
        {editor.notice ? <div className="notice-banner">{editor.notice}</div> : null}

        {previewOnly || editor.preview ? (
          <article className="article-preview">
            {editor.kicker ? (
              <p className="article-preview-kicker">{editor.kicker}</p>
            ) : null}
            <h1 className="article-preview-title">{editor.title || 'Untitled'}</h1>
            {editor.excerpt ? (
              <p className="article-preview-excerpt">{editor.excerpt}</p>
            ) : null}
            {editor.coverImage ? (
              <img className="article-cover" src={editor.coverImage} alt="" />
            ) : null}
            <div className="article-byline">
              <span className="avatar">{initials(editor.author)}</span>
              <span>
                {editor.author || 'Editorial Desk'} ·{' '}
                {[editor.category, editor.subCategory].filter(Boolean).join(' › ')} ·{' '}
                {new Date().toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            {tags.length > 0 ? (
              <div className="preview-tags">
                {tags.map((tag) => (
                  <span className="preview-tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
            {editor.blocks.length === 0 ? (
              <p className="rendered-empty">No blocks to preview yet.</p>
            ) : (
              editor.blocks.map((block) => (
                <BlockRenderer key={block.id} block={block} />
              ))
            )}
          </article>
        ) : (
          <>
            {editor.blocks.length === 0 ? (
              <div className="empty-editor" id={BLOCKS_FIELD_ID}>
                <h3>Start the story</h3>
                <p>Add a heading, stats, image, or any block from the palette below.</p>
              </div>
            ) : (
              <div className="block-list">
                {editor.blocks.map((block, index) => (
                  <BlockEditor
                    key={block.id}
                    block={block}
                    isFirst={index === 0}
                    isLast={index === editor.blocks.length - 1}
                    onChange={(next) => dispatch(updateBlock(next))}
                    onMoveUp={() => dispatch(moveBlock({ index, direction: -1 }))}
                    onMoveDown={() => dispatch(moveBlock({ index, direction: 1 }))}
                    onDuplicate={() => dispatch(duplicateBlock(block.id))}
                    onRemove={() => dispatch(removeBlock(block.id))}
                  />
                ))}
              </div>
            )}
            <div id={editor.blocks.length === 0 ? undefined : BLOCKS_FIELD_ID}>
              <BlockPalette onAdd={(type) => dispatch(addBlock(type))} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
