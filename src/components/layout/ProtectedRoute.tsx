import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '../../redux/hooks'
import { selectUser } from '../../redux/slices/authSlice'

export function RequireAuth() {
  const user = useAppSelector(selectUser)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
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
