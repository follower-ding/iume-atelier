import { lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthBootstrap from '@/components/auth/AuthBootstrap'
import AdminRoute from '@/components/auth/AdminRoute'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import ConsoleLayout from '@/layouts/ConsoleLayout'
import AppLayout from '@/layouts/AppLayout'

const HomePage = lazy(() => import('@/pages/HomePage'))
const ArticlesPage = lazy(() => import('@/pages/ArticlesPage'))
const ArticleDetailPage = lazy(() => import('@/pages/ArticleDetailPage'))
const AboutPage = lazy(() => import('@/pages/AboutPage'))
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage'))
const ToolsPage = lazy(() => import('@/pages/ToolsPage'))
const ToolDetailPage = lazy(() => import('@/pages/ToolDetailPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const StudioPage = lazy(() => import('@/pages/StudioPage'))
const StudioArticleEditPage = lazy(() => import('@/pages/StudioArticleEditPage'))
const SearchPage = lazy(() => import('@/pages/SearchPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

const ConsoleDashboardPage = lazy(() => import('@/pages/console/ConsoleDashboardPage'))
const ConsoleUsersPage = lazy(() => import('@/pages/console/ConsoleUsersPage'))
const ConsoleArticlesPage = lazy(() => import('@/pages/console/ConsoleArticlesPage'))
const ConsoleArticleEditPage = lazy(() => import('@/pages/console/ConsoleArticleEditPage'))
const ConsoleCommentsPage = lazy(() => import('@/pages/console/ConsoleCommentsPage'))
const ConsoleTaxonomyPage = lazy(() => import('@/pages/console/ConsoleTaxonomyPage'))
const ConsoleAuditLogsPage = lazy(() => import('@/pages/console/ConsoleAuditLogsPage'))
const ConsoleAiToolsPage = lazy(() => import('@/pages/console/ConsoleAiToolsPage'))
const ConsoleAiToolEditPage = lazy(() => import('@/pages/console/ConsoleAiToolEditPage'))

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthBootstrap />
      <Routes>
        <Route
          path="/console"
          element={(
            <AdminRoute>
              <ConsoleLayout />
            </AdminRoute>
          )}
        >
          <Route index element={<ConsoleDashboardPage />} />
          <Route path="users" element={<ConsoleUsersPage />} />
          <Route path="articles" element={<ConsoleArticlesPage />} />
          <Route path="articles/new" element={<ConsoleArticleEditPage />} />
          <Route path="articles/:id/edit" element={<ConsoleArticleEditPage />} />
          <Route path="comments" element={<ConsoleCommentsPage />} />
          <Route path="taxonomy" element={<ConsoleTaxonomyPage />} />
          <Route path="audit-logs" element={<ConsoleAuditLogsPage />} />
          <Route path="ai-tools" element={<ConsoleAiToolsPage />} />
          <Route path="ai-tools/new" element={<ConsoleAiToolEditPage />} />
          <Route path="ai-tools/:id/edit" element={<ConsoleAiToolEditPage />} />
        </Route>

        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/article/:slug" element={<ArticleDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/tools/:id" element={<ToolDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin" element={<Navigate to="/console" replace />} />
          <Route path="/manage" element={<Navigate to="/studio" replace />} />
          <Route
            path="/settings"
            element={(
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/studio"
            element={(
              <ProtectedRoute>
                <StudioPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/studio/new"
            element={(
              <ProtectedRoute>
                <StudioArticleEditPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/studio/:id/edit"
            element={(
              <ProtectedRoute>
                <StudioArticleEditPage />
              </ProtectedRoute>
            )}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
