import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Newspaper } from 'lucide-react'
import { demoCredentials } from '../api/auth.api'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { loginUser, selectAuthStatus } from '../redux/slices/authSlice'
import type { LoginInput } from '../types/auth'

export function LoginPage() {
  const dispatch = useAppDispatch()
  const authStatus = useAppSelector(selectAuthStatus)
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const submitting = authStatus === 'loading'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    setError('')
    try {
      await dispatch(loginUser(values)).unwrap()
      const from = (location.state as { from?: { pathname?: string } } | null)
        ?.from?.pathname
      navigate(from && from !== '/login' ? from : '/', { replace: true })
    } catch (caught) {
      setError(typeof caught === 'string' ? caught : 'Could not sign in.')
    }
  })

  return (
    <div className="min-h-svh bg-navy-deep text-white">
      <div className="mx-auto flex min-h-svh max-w-md flex-col justify-center px-4 py-12">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-md bg-gold text-navy-deep">
            <Newspaper size={22} />
          </div>
          <p className="text-[11px] tracking-[0.22em] text-gold uppercase">
            Economic Vision
          </p>
          <h1 className="mt-2 font-serif text-4xl font-semibold">
            Admin sign in
          </h1>
          <p className="mt-2 text-sm text-white/65">
            Sign in to manage news articles and the newsroom desk.
          </p>
        </div>

        <section className="rounded-xl border border-white/10 bg-navy p-6 shadow-xl sm:p-7">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs text-white/70" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                className="h-11 w-full rounded-md border border-white/10 bg-navy-deep px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-gold"
                placeholder={demoCredentials.email}
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email ? (
                <p className="mt-1 text-xs text-red-300">{errors.email.message}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-white/70" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="h-11 w-full rounded-md border border-white/10 bg-navy-deep px-3 pr-10 text-sm text-white outline-none placeholder:text-white/35 focus:border-gold"
                  placeholder="••••••••"
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-white/50 hover:text-white"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password ? (
                <p className="mt-1 text-xs text-red-300">
                  {errors.password.message}
                </p>
              ) : null}
            </div>

            {error ? (
              <p
                className="rounded-md border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="h-11 w-full rounded-md bg-gold text-sm font-medium text-navy-deep hover:brightness-95 disabled:opacity-60"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-4 font-mono text-[11px] leading-relaxed text-white/45">
            Demo {demoCredentials.email} / {demoCredentials.password}
          </p>
        </section>
      </div>
    </div>
  )
}
