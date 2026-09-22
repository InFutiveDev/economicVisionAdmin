import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { GuestOnly, RequireAuth } from './components/layout/ProtectedRoute'
import { AddArticlePage } from './pages/AddArticlePage'
import { ArticlesPage } from './pages/ArticlesPage'
import { Dashboard } from './pages/Dashboard'
import { LoginPage } from './pages/LoginPage'

export default function App() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="login" element={<LoginPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route path="articles/new" element={<AddArticlePage />} />
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="articles" element={<ArticlesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}
