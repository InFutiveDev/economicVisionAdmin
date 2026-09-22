import {
  FileText,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Plus,
  Search,
} from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { logout, selectUser } from '../../redux/slices/authSlice'
import { initials } from '../../utils/slug'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/articles', label: 'Articles', icon: FileText, end: true },
  { to: '/articles/new', label: 'New article', icon: Plus, end: true },
]

function pageTitle(pathname: string) {
  if (pathname === '/') return 'Dashboard'
  if (pathname.startsWith('/articles/new')) return 'New article'
  if (pathname.startsWith('/articles')) return 'Articles'
  return 'News Article Admin'
}

export function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)
  const title = pageTitle(location.pathname)

  const signOut = () => {
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-svh bg-paper text-ink">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-white/10 bg-navy-deep text-white lg:flex">
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6">
          <div className="flex size-10 items-center justify-center rounded-md bg-gold text-navy-deep">
            <Newspaper size={20} strokeWidth={2.2} />
          </div>
          <div>
            <p className="font-serif text-lg leading-tight font-semibold">
              Economic Vision
            </p>
            <p className="text-[11px] tracking-[0.18em] text-gold uppercase">
              News Admin
            </p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-4">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-md bg-navy px-3 py-3">
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-full bg-gold/20 text-xs font-semibold text-gold">
                {initials(user?.name ?? 'EV')}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user?.name}</p>
                <p className="text-[11px] tracking-wide text-gold uppercase">
                  {user?.role}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/10 px-3 py-2 text-xs text-white/80 hover:bg-white/5"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-line bg-card/90 px-4 py-3 backdrop-blur sm:px-8">
          <div>
            <p className="text-xs tracking-[0.16em] text-gold uppercase">
              News Article Admin
            </p>
            <h1 className="font-serif text-2xl font-semibold">{title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <label className="relative hidden md:block">
              <Search
                size={16}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
              />
              <input
                type="search"
                placeholder="Search articles"
                className="h-10 w-64 rounded-md border border-line bg-paper pr-3 pl-9 text-sm outline-none focus:border-gold"
              />
            </label>
            <button
              type="button"
              onClick={() => navigate('/articles/new')}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-white hover:bg-navy"
            >
              <Plus size={16} />
              New article
            </button>
            <button
              type="button"
              onClick={signOut}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-3 text-sm lg:hidden"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </header>

        <main className="px-4 py-8 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
