export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-black/5 dark:border-white/5 py-6 text-center text-sm text-slate-400 dark:text-slate-400">
      <div className="container mx-auto px-4">
        <p>&copy; {new Date().getFullYear()} My Personal Blog. React + Go + PostgreSQL.</p>
      </div>
    </footer>
  );
}
