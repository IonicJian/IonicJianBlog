export default function Footer() {
  return (
    <footer className="bg-white border-t py-6 text-center text-sm text-gray-500">
      <div className="container mx-auto px-4">
        <p>&copy; {new Date().getFullYear()} My Personal Blog. Built with React + Go + PostgreSQL.</p>
      </div>
    </footer>
  );
}
