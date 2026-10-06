import { useEffect, useState, type FormEvent } from 'react'
import { Eye, EyeOff, Pencil, Trash2, UserPlus, X } from 'lucide-react'
import {
  createUserApi,
  deleteUserApi,
  fetchUsersApi,
  updateUserApi,
  type UserInput,
} from '../api/users.api'
import { useAppSelector } from '../redux/hooks'
import { selectUser } from '../redux/slices/authSlice'
import type { AuthUser } from '../types/auth'
import { getErrorMessage } from '../utils/error'

const EMPTY_FORM: UserInput = { name: '', email: '', password: '', role: 'user' }

const inputClass =
  'h-10 w-full rounded-md border border-line bg-paper px-3 text-sm outline-none focus:border-gold'

const roleLabel = (role: AuthUser['role']) => (role === 'admin' ? 'Admin' : 'Author')

export function UsersPage() {
  const currentUser = useAppSelector(selectUser)
  const [users, setUsers] = useState<AuthUser[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [form, setForm] = useState<UserInput>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    fetchUsersApi()
      .then(setUsers)
      .catch((caught) => setLoadError(getErrorMessage(caught, 'Could not load users.')))
      .finally(() => setLoading(false))
  }, [])

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowPassword(false)
  }

  const startEdit = (user: AuthUser) => {
    setEditingId(user.id)
    setForm({ name: user.name, email: user.email, password: '', role: user.role })
    setError('')
    setNotice('')
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setNotice('')

    if (!form.name.trim() || !form.email.trim()) {
      setError('Name and email are required.')
      return
    }
    if (!editingId && !form.password) {
      setError('Set a password so this user can sign in.')
      return
    }
    if (form.password && form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setSaving(true)
    try {
      if (editingId) {
        const { password, ...rest } = form
        const updated = await updateUserApi(editingId, password ? form : rest)
        setUsers((list) => list.map((user) => (user.id === updated.id ? updated : user)))
        setNotice(`${updated.name} updated.`)
      } else {
        const created = await createUserApi(form)
        setUsers((list) => [created, ...list])
        setNotice(`${created.name} can now sign in with ${created.email}.`)
      }
      resetForm()
    } catch (caught) {
      setError(getErrorMessage(caught, 'Could not save user.'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (user: AuthUser) => {
    if (!window.confirm(`Delete ${user.name}? They will no longer be able to sign in.`)) {
      return
    }
    setError('')
    setNotice('')
    try {
      await deleteUserApi(user.id)
      setUsers((list) => list.filter((item) => item.id !== user.id))
      if (editingId === user.id) resetForm()
      setNotice(`${user.name} deleted.`)
    } catch (caught) {
      setError(getErrorMessage(caught, 'Could not delete user.'))
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="border-b border-line px-5 py-4">
          <h2 className="font-serif text-xl font-semibold">Users</h2>
          <p className="text-sm text-muted">
            Authors and admins who can sign in to the newsroom.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-paper text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-5 py-3 font-medium">Serial No.</th>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-5 py-8 text-muted" colSpan={5}>
                    Loading users…
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
              {!loading && !loadError && users.length === 0 ? (
                <tr>
                  <td className="px-5 py-8 text-muted" colSpan={5}>
                    No users yet.
                  </td>
                </tr>
              ) : null}
              {users.map((user, index) => (
                <tr key={user.id} className="border-t border-line">
                  <td className="px-5 py-4 text-muted">{index + 1}</td>
                  <td className="px-5 py-4 font-medium">
                    {user.name}
                    {user.id === currentUser?.id ? (
                      <span className="ml-2 text-xs text-muted">(you)</span>
                    ) : null}
                  </td>
                  <td className="px-5 py-4 text-muted">{user.email}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-navy text-white'
                          : 'bg-gold-soft text-navy'
                      }`}
                    >
                      {roleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => startEdit(user)}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-navy hover:text-gold"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                      {user.id === currentUser?.id ? null : (
                        <button
                          type="button"
                          onClick={() => void handleDelete(user)}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-red-700 hover:text-red-900"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="h-fit rounded-xl border border-line bg-card p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-serif text-xl font-semibold">
            {editingId ? 'Edit user' : 'Add author'}
          </h3>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
            >
              <X size={14} />
              Cancel
            </button>
          ) : null}
        </div>

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted" htmlFor="user-name">
              Name
            </label>
            <input
              id="user-name"
              className={inputClass}
              value={form.name}
              placeholder="Full name"
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted" htmlFor="user-email">
              Email
            </label>
            <input
              id="user-email"
              type="email"
              autoComplete="off"
              className={inputClass}
              value={form.email}
              placeholder="author@economicvision.com"
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </div>
          <div>
            <label
              className="mb-1.5 block text-xs font-semibold text-muted"
              htmlFor="user-password"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="user-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className={`${inputClass} pr-10`}
                value={form.password}
                placeholder={editingId ? 'Leave blank to keep current' : 'At least 6 characters'}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted hover:text-ink"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted" htmlFor="user-role">
              Role
            </label>
            <select
              id="user-role"
              className={inputClass}
              value={form.role}
              onChange={(event) =>
                setForm({ ...form, role: event.target.value as UserInput['role'] })
              }
            >
              <option value="user">Author (write and save drafts)</option>
              <option value="admin">Admin (publish and manage users)</option>
            </select>
          </div>

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
            <UserPlus size={16} />
            {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add author'}
          </button>
        </form>
      </section>
    </div>
  )
}
