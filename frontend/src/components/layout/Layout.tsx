import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';

export default function Layout() {
  const isHome = useLocation().pathname === '/';
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 bg-mesh">
      <Header />
      <main className={`flex-1 ${isHome ? '' : 'container mx-auto px-6 py-8 max-w-5xl'} pt-14`}>
        <Outlet />
      </main>
      {!isHome && (
        <footer className="border-t border-black/5 dark:border-white/5 py-8 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-600 font-light tracking-wider">© 2026 Personal Blog</p>
        </footer>
      )}
    </div>
  );
}
