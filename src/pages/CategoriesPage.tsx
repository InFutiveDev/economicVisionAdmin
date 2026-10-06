import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ArrowDown, ArrowUp, CornerDownRight, Download, Pencil, Plus, Trash2, X } from 'lucide-react'
import {
  createCategoryApi,
  deleteCategoryApi,
  fetchCategoriesApi,
  reorderCategoriesApi,
  updateCategoryApi,
  type CategoryInput,
} from '../api/homepage.api'
import { DEFAULT_MENU, groupCategories, type Category } from '../types/homepage'
import { getErrorMessage } from '../utils/error'
import { moveItem } from '../utils/list'

const emptyForm = (parentId: string | null = null): CategoryInput => ({
  name: '',
  description: '',
  showInNav: true,
  parentId,
})

const inputClass =
  'h-10 w-full rounded-md border border-line bg-paper px-3 text-sm outline-none focus:border-gold'

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [form, setForm] = useState<CategoryInput>(emptyForm())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const groups = useMemo(() => groupCategories(categories), [categories])
  const editingHasChildren = Boolean(
    editingId && categories.some((category) => category.parentId === editingId),
  )
  const parentOptions = groups.filter((group) => group.id !== editingId)

  useEffect(() => {
    fetchCategoriesApi()
      .then(setCategories)
      .catch((caught) => setLoadError(getErrorMessage(caught, 'Could not load categories.')))
      .finally(() => setLoading(false))
  }, [])

  const resetForm = (parentId: string | null = null) => {
    setForm(emptyForm(parentId))
    setEditingId(null)
  }

  const startEdit = (category: Category) => {
    setEditingId(category.id)
    setForm({
      name: category.name,
      description: category.description,
      showInNav: category.showInNav,
      parentId: category.parentId,
    })
    setError('')
    setNotice('')
  }

  const startSubCategory = (parent: Category) => {
    resetForm(parent.id)
    setError('')
    setNotice('')
    document.getElementById('category-name')?.focus()
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setNotice('')
    if (!form.name.trim()) {
      setError('Category name is required.')
      return
    }

    setSaving(true)
    try {
      if (editingId) {
        const updated = await updateCategoryApi(editingId, form)
        setCategories((list) => list.map((item) => (item.id === updated.id ? updated : item)))
        setNotice(`${updated.name} updated.`)
      } else {
        const created = await createCategoryApi(form)
        setCategories((list) => [...list, created])
        setNotice(`${created.name} added.`)
      }
      resetForm(editingId ? null : form.parentId)
    } catch (caught) {
      setError(getErrorMessage(caught, 'Could not save category.'))
    } finally {
      setSaving(false)
    }
  }

  const handleMove = async (siblings: Category[], index: number, direction: -1 | 1) => {
    const next = moveItem(siblings, index, direction)
    if (next === siblings) return
    const order = new Map(next.map((item, position) => [item.id, position + 1]))
    setCategories((list) =>
      list
        .map((item) => (order.has(item.id) ? { ...item, order: order.get(item.id)! } : item))
        .sort((a, b) => a.order - b.order),
    )
    try {
      setCategories(await reorderCategoriesApi(next.map((item) => item.id)))
    } catch (caught) {
      setError(getErrorMessage(caught, 'Could not reorder categories.'))
    }
  }

  const handleDelete = async (category: Category) => {
    if (!window.confirm(`Delete ${category.name}? Existing articles keep their category text.`)) {
      return
    }
    setError('')
    setNotice('')
    try {
      await deleteCategoryApi(category.id)
      setCategories((list) => list.filter((item) => item.id !== category.id))
      if (editingId === category.id) resetForm()
      setNotice(`${category.name} deleted.`)
    } catch (caught) {
      setError(getErrorMessage(caught, 'Could not delete category.'))
    }
  }

  const handleImportMenu = async () => {
    setImporting(true)
    setError('')
    setNotice('')
    try {
      const created: Category[] = []
      for (const entry of DEFAULT_MENU) {
        const main = await createCategoryApi({ ...emptyForm(), name: entry.name })
        created.push(main)
        for (const child of entry.children ?? []) {
          created.push(await createCategoryApi({ ...emptyForm(main.id), name: child }))
        }
      }
      setCategories(created)
      setNotice('Current site menu imported. Edit, reorder or add to it as needed.')
    } catch (caught) {
      setError(getErrorMessage(caught, 'Could not import the site menu.'))
      setCategories(await fetchCategoriesApi().catch(() => categories))
    } finally {
      setImporting(false)
    }
  }

  const renderActions = (category: Category, siblings: Category[], index: number) => (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        aria-label="Move up"
        disabled={index === 0}
        onClick={() => void handleMove(siblings, index, -1)}
        className="text-muted hover:text-ink disabled:opacity-30"
      >
        <ArrowUp size={15} />
      </button>
      <button
        type="button"
        aria-label="Move down"
        disabled={index === siblings.length - 1}
        onClick={() => void handleMove(siblings, index, 1)}
        className="text-muted hover:text-ink disabled:opacity-30"
      >
        <ArrowDown size={15} />
      </button>
      {!category.parentId ? (
        <button
          type="button"
          onClick={() => startSubCategory(category)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:text-gold"
        >
          <Plus size={14} />
          Sub
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => startEdit(category)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-navy hover:text-gold"
      >
        <Pencil size={14} />
        Edit
      </button>
      <button
        type="button"
        onClick={() => void handleDelete(category)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-red-700 hover:text-red-900"
      >
        <Trash2 size={14} />
        Delete
      </button>
    </div>
  )

  const parentName = groups.find((group) => group.id === form.parentId)?.name

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="border-b border-line px-5 py-4">
          <h2 className="font-serif text-xl font-semibold">Categories</h2>
          <p className="text-sm text-muted">
            Main categories are the header menu items; sub-categories appear in their dropdown.
            The order here is the menu order.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-paper text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-5 py-3 font-medium">Serial No.</th>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Slug</th>
                <th className="px-5 py-3 font-medium">In menu</th>
                <th className="px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-5 py-8 text-muted" colSpan={5}>
                    Loading categories…
                  </td>
                </tr>
              ) : null}
              {!loading && loadError ? (
                <tr>
                  <td className="px-5 py-8 text-red-700" colSpan={5}>
                    {loadError}
                  </td>
                </tr>
              ) : null}
              {!loading && !loadError && categories.length === 0 ? (
                <tr>
                  <td className="px-5 py-8 text-muted" colSpan={5}>
                    <p>No categories yet. Add your first one, or start from the current site menu.</p>
                    <button
                      type="button"
                      disabled={importing}
                      onClick={() => void handleImportMenu()}
                      className="mt-3 inline-flex h-9 items-center gap-2 rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-paper disabled:opacity-60"
                    >
                      <Download size={14} />
                      {importing ? 'Importing…' : 'Import current site menu'}
                    </button>
                  </td>
                </tr>
              ) : null}
              {groups.map((group, groupIndex) => [
                <tr key={group.id} className="border-t border-line">
                  <td className="px-5 py-4 font-medium text-ink">{groupIndex + 1}</td>
                  <td className="px-5 py-4">
                    <p className="font-semibold">{group.name}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {group.children.length
                        ? `${group.children.length} sub-categor${group.children.length === 1 ? 'y' : 'ies'}`
                        : group.description || 'Main category'}
                    </p>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-muted">{group.slug}</td>
                  <td className="px-5 py-4 text-muted">{group.showInNav ? 'Yes' : 'No'}</td>
                  <td className="px-5 py-4">{renderActions(group, groups, groupIndex)}</td>
                </tr>,
                ...group.children.map((child, childIndex) => (
                  <tr key={child.id} className="border-t border-line/60 bg-paper/40">
                    <td className="px-5 py-3 pl-9 text-xs text-muted">
                      {groupIndex + 1}.{childIndex + 1}
                    </td>
                    <td className="px-5 py-3">
                      <p className="flex items-center gap-2">
                        <CornerDownRight size={14} className="shrink-0 text-muted" />
                        {child.name}
                      </p>
                      {child.description ? (
                        <p className="mt-0.5 pl-6 text-xs text-muted">{child.description}</p>
                      ) : null}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted">{child.slug}</td>
                    <td className="px-5 py-3 text-muted">{child.showInNav ? 'Yes' : 'No'}</td>
                    <td className="px-5 py-3">
                      {renderActions(child, group.children, childIndex)}
                    </td>
                  </tr>
                )),
              ])}
            </tbody>
          </table>
        </div>
      </section>

      <section className="h-fit rounded-xl border border-line bg-card p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-serif text-xl font-semibold">
            {editingId
              ? 'Edit category'
              : parentName
                ? `Add sub-category to ${parentName}`
                : 'Add category'}
          </h3>
          {editingId || form.parentId ? (
            <button
              type="button"
              onClick={() => resetForm()}
              className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
            >
              <X size={14} />
              Cancel
            </button>
          ) : null}
        </div>
        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted" htmlFor="category-name">
              Name
            </label>
            <input
              id="category-name"
              className={inputClass}
              value={form.name}
              placeholder={form.parentId ? 'e.g. Inflation' : 'e.g. Economy'}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </div>
          <div>
            <label
              className="mb-1.5 block text-xs font-semibold text-muted"
              htmlFor="category-parent"
            >
              Parent category
            </label>
            <select
              id="category-parent"
              className={inputClass}
              value={form.parentId ?? ''}
              disabled={editingHasChildren}
              onChange={(event) => setForm({ ...form, parentId: event.target.value || null })}
            >
              <option value="">None (main menu item)</option>
              {parentOptions.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            {editingHasChildren ? (
              <p className="mt-1.5 text-xs text-muted">
                This category has sub-categories, so it stays a main category.
              </p>
            ) : null}
          </div>
          <div>
            <label
              className="mb-1.5 block text-xs font-semibold text-muted"
              htmlFor="category-description"
            >
              Description
            </label>
            <textarea
              id="category-description"
              className="min-h-20 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-gold"
              value={form.description}
              placeholder="Optional"
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={form.showInNav}
              onChange={(event) => setForm({ ...form, showInNav: event.target.checked })}
            />
            Show in site menu
          </label>

          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          {notice ? (
            <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">{notice}</p>
          ) : null}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-white hover:bg-navy disabled:opacity-60"
          >
            <Plus size={16} />
            {saving
              ? 'Saving…'
              : editingId
                ? 'Save changes'
                : form.parentId
                  ? 'Add sub-category'
                  : 'Add category'}
          </button>
        </form>
      </section>
    </div>
  )
}
