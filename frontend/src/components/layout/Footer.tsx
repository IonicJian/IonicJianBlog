export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-10 border-t border-gray-950/5 dark:border-white/10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-8 text-xs text-gray-500 dark:text-gray-400 sm:flex-row sm:px-6">
        <p>© {year} ZaneLin. All rights reserved.</p>
      </div>
    </footer>
  );
}
