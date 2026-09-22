import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Eye, Globe, Save } from 'lucide-react'
import { BlockEditor } from '../components/blocks/BlockEditor'
import { BlockPalette } from '../components/blocks/BlockPalette'
import { BlockRenderer } from '../components/blocks/BlockRenderer'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { selectUser } from '../redux/slices/authSlice'
import {
  addBlock,
  duplicateBlock,
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
  setTags,
  setTitle,
  togglePreview,
  updateBlock,
} from '../redux/slices/editorSlice'
import { ARTICLE_CATEGORIES } from '../types/block'
import { initials, slugify } from '../utils/slug'
import '../styles/article-editor.css'

export function AddArticlePage() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)
  const editor = useAppSelector(selectEditor)
  const isAdmin = user?.role === 'admin'
  const slug = useMemo(() => slugify(editor.title), [editor.title])
  const tags = editor.tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)

  useEffect(() => {
    dispatch(resetEditor())
    if (user?.name) dispatch(setAuthor(user.name))
    return () => {
      dispatch(resetEditor())
    }
  }, [dispatch, user?.name])

  const validate = () => {
    if (!editor.title.trim() && editor.blocks.length === 0) {
      return 'Title is required, and the article needs at least one block.'
    }
    if (!editor.title.trim()) return 'Title is required.'
    if (editor.blocks.length === 0) return 'Add at least one block before saving.'
    return ''
  }

  const handleSave = () => {
    const message = validate()
    if (message) {
      dispatch(setError(message))
      return
    }
    void dispatch(saveDraft())
  }

  const handlePublish = () => {
    const message = validate()
    if (message) {
      dispatch(setError(message))
      return
    }
    void dispatch(publishArticle())
  }

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
            <button
              type="button"
              className="btn"
              onClick={() => dispatch(togglePreview())}
            >
              <Eye size={14} />
              {editor.preview ? 'Edit' : 'Preview'}
            </button>
            <button
              type="button"
              className="btn gold"
              onClick={handleSave}
              disabled={editor.saving}
            >
              <Save size={14} />
              Save draft
            </button>
            {isAdmin ? (
              <button
                type="button"
                className="btn primary"
                onClick={handlePublish}
                disabled={editor.saving}
              >
                <Globe size={14} />
                Publish
              </button>
            ) : null}
          </div>
        </div>

        <header className="article-header">
          <input
            className="article-kicker-input"
            value={editor.kicker}
            placeholder="Kicker / eyebrow"
            onChange={(event) => dispatch(setKicker(event.target.value))}
          />
          <input
            className="article-title-input"
            value={editor.title}
            placeholder="Write a headline"
            onChange={(event) => dispatch(setTitle(event.target.value))}
          />
          <p className="article-slug">{slug || 'slug-will-appear-here'}</p>
          <textarea
            className="article-excerpt"
            value={editor.excerpt}
            placeholder="Dek / excerpt for the homepage and newsletter"
            onChange={(event) => dispatch(setExcerpt(event.target.value))}
          />

          <div className="article-meta-grid">
            <label className="cover-field">
              {editor.coverImage ? (
                <img className="cover-preview" src={editor.coverImage} alt="" />
              ) : (
                <div className="cover-placeholder">Cover image preview</div>
              )}
              <input
                className="field"
                value={editor.coverImage}
                placeholder="Cover image URL"
                onChange={(event) => dispatch(setCoverImage(event.target.value))}
              />
            </label>

            <div className="meta-fields">
              <div className="article-toolbar-meta">
                <input
                  className="article-author-input"
                  value={editor.author}
                  placeholder="Author"
                  onChange={(event) => dispatch(setAuthor(event.target.value))}
                />
                <select
                  className="article-select"
                  value={editor.category}
                  onChange={(event) => dispatch(setCategory(event.target.value))}
                >
                  {ARTICLE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <input
                className="article-tags-input"
                value={editor.tags}
                placeholder="Tags, comma separated"
                onChange={(event) => dispatch(setTags(event.target.value))}
              />
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
          <div className="error-banner" role="alert">
            {editor.error}
          </div>
        ) : null}
        {editor.notice ? <div className="notice-banner">{editor.notice}</div> : null}

        {editor.preview ? (
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
                {editor.author || 'Editorial Desk'} · {editor.category} ·{' '}
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
              <div className="empty-editor">
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
            <BlockPalette onAdd={(type) => dispatch(addBlock(type))} />
          </>
        )}
      </div>
    </div>
  )
}
