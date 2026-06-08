import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import BlogListPage from './pages/BlogListPage';
import BlogDetailPage from './pages/BlogDetailPage';
import BlogCreatePage from './pages/BlogCreatePage';
import BlogEditPage from './pages/BlogEditPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FriendLinksPage from './pages/FriendLinksPage';
import GuestbookPage from './pages/GuestbookPage';
import TrendingPage from './pages/TrendingPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import NotFoundPage from './pages/NotFoundPage';
import { useAuthStore } from './store/authStore';
import { useUIStore } from './store/uiStore';

function App() {
  const init = useAuthStore((s) => s.init);
  const initTheme = useUIStore((s) => s.initTheme);

  useEffect(() => {
    init();
    initTheme();
  }, [init, initTheme]);

  // Scroll-triggered reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    const els = document.querySelectorAll('.reveal-on-scroll');
    els.forEach((el) => observer.observe(el));
    // Also observe dynamically added elements
    const mutationObserver = new MutationObserver(() => {
      const newEls = document.querySelectorAll('.reveal-on-scroll:not(.is-visible)');
      newEls.forEach((el) => observer.observe(el));
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/blogs" element={<BlogListPage />} />
          <Route path="/blogs/:id" element={<BlogDetailPage />} />
          <Route path="/blogs/create" element={<BlogCreatePage />} />
          <Route path="/blogs/:id/edit" element={<BlogEditPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/friends" element={<FriendLinksPage />} />
          <Route path="/guestbook" element={<GuestbookPage />} />
          <Route path="/trending" element={<TrendingPage />} />
          <Route path="/auth/callback" element={<OAuthCallbackPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
