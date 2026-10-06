import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { AUTH_EXPIRED_EVENT } from '../../api/client'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { logout, selectUser } from '../../redux/slices/authSlice'

export function RequireAuth() {
  const user = useAppSelector(selectUser)
  const dispatch = useAppDispatch()
  const location = useLocation()

  useEffect(() => {
    const signOut = () => dispatch(logout())
    window.addEventListener(AUTH_EXPIRED_EVENT, signOut)
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, signOut)
  }, [dispatch])

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export function RequireAdmin() {
  const user = useAppSelector(selectUser)

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export function GuestOnly() {
  const user = useAppSelector(selectUser)

  if (user) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
