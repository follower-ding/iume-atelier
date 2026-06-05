import MainLayout from '@/layouts/MainLayout'
import AdminPage from '@/pages/admin/AdminPage'
import ArticleDetailPage from '@/pages/articles/ArticleDetailPage'
import HomePage from '@/pages/home/HomePage'
import LoginPage from '@/pages/login/LoginPage'
import { useAuthStore } from '@/store/authStore'
import { Navigate, Route, Routes } from 'react-router-dom'

function RequireAuth({ children }: { children: JSX.Element }) {
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="articles/:slug" element={<ArticleDetailPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="admin" element={<RequireAuth><AdminPage /></RequireAuth>} />
      </Route>
    </Routes>
  )
}
