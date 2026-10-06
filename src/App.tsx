import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import {
  GuestOnly,
  RequireAdmin,
  RequireAuth,
} from './components/layout/ProtectedRoute'
import { AddArticlePage } from './pages/AddArticlePage'
import { ArticlesPage } from './pages/ArticlesPage'
import { Dashboard } from './pages/Dashboard'
import { LoginPage } from './pages/LoginPage'
import { UsersPage } from './pages/UsersPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { HomepagePage } from './pages/HomepagePage'
import { MediaPage } from './pages/MediaPage'

export default function App() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="login" element={<LoginPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="articles" element={<ArticlesPage />} />
          <Route path="articles/new" element={<AddArticlePage />} />
          <Route path="articles/:articleId/edit" element={<AddArticlePage />} />
          <Route
            path="articles/:articleId/preview"
            element={<AddArticlePage previewOnly />}
          />
          <Route element={<RequireAdmin />}>
            <Route path="users" element={<UsersPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="homepage" element={<HomepagePage />} />
            <Route path="media" element={<MediaPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}
