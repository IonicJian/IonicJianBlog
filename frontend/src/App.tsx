import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { HomePage } from '@/pages/HomePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { useUIStore } from '@/store/uiStore'
import { Toaster } from 'sonner'

const BlogListPage = lazy(() =>
  import('@/pages/blog/BlogListPage').then((m) => ({ default: m.BlogListPage })),
)
const BlogDetailPage = lazy(() =>
  import('@/pages/blog/BlogDetailPage').then((m) => ({ default: m.BlogDetailPage })),
)
const BlogCreatePage = lazy(() =>
  import('@/pages/blog/BlogCreatePage').then((m) => ({ default: m.BlogCreatePage })),
)
const BlogEditPage = lazy(() =>
  import('@/pages/blog/BlogEditPage').then((m) => ({ default: m.BlogEditPage })),
)
const LoginPage = lazy(() =>
  import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const RegisterPage = lazy(() =>
  import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })),
)
const OAuthCallbackPage = lazy(() =>
  import('@/pages/auth/OAuthCallbackPage').then((m) => ({ default: m.OAuthCallbackPage })),
)
const FriendLinksPage = lazy(() =>
  import('@/pages/social/FriendLinksPage').then((m) => ({ default: m.FriendLinksPage })),
)
const TrendingPage = lazy(() =>
  import('@/pages/social/TrendingPage').then((m) => ({ default: m.TrendingPage })),
)
const PhotographyPage = lazy(() =>
  import('@/pages/social/PhotographyPage').then((m) => ({ default: m.PhotographyPage })),
)

const AdminLayout = lazy(() =>
  import('@/pages/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })),
)
const AdminDashboard = lazy(() =>
  import('@/pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })),
)
const AdminBlogs = lazy(() =>
  import('@/pages/admin/AdminBlogs').then((m) => ({ default: m.AdminBlogs })),
)
const AdminCategories = lazy(() =>
  import('@/pages/admin/AdminCategories').then((m) => ({ default: m.AdminCategories })),
)
const AdminTags = lazy(() =>
  import('@/pages/admin/AdminTags').then((m) => ({ default: m.AdminTags })),
)
const AdminComments = lazy(() =>
  import('@/pages/admin/AdminComments').then((m) => ({ default: m.AdminComments })),
)
const AdminGuestbook = lazy(() =>
  import('@/pages/admin/AdminGuestbook').then((m) => ({ default: m.AdminGuestbook })),
)
const AdminFriendLinks = lazy(() =>
  import('@/pages/admin/AdminFriendLinks').then((m) => ({ default: m.AdminFriendLinks })),
)
const AdminPhotography = lazy(() =>
  import('@/pages/admin/AdminPhotography').then((m) => ({ default: m.AdminPhotography })),
)

function ThemedToaster() {
  const theme = useUIStore((s) => s.theme)
  return <Toaster theme={theme} position="bottom-right" />
}

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/blogs" element={<BlogListPage />} />
          <Route path="/blogs/:id" element={<BlogDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<OAuthCallbackPage />} />
          <Route path="/friends" element={<FriendLinksPage />} />
          <Route path="/trending" element={<TrendingPage />} />
          <Route path="/photography" element={<PhotographyPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="blogs" element={<AdminBlogs />} />
            <Route path="blogs/create" element={<BlogCreatePage />} />
            <Route path="blogs/:id/edit" element={<BlogEditPage />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="tags" element={<AdminTags />} />
            <Route path="comments" element={<AdminComments />} />
            <Route path="guestbook" element={<AdminGuestbook />} />
            <Route path="friend-links" element={<AdminFriendLinks />} />
            <Route path="photography" element={<AdminPhotography />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      <ThemedToaster />
    </>
  )
}
