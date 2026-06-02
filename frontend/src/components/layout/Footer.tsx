export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
      <div className="container mx-auto px-4">
        <p>&copy; {new Date().getFullYear()} My Personal Blog. React + Go + PostgreSQL.</p>
      </div>
    </footer>
  );
}
