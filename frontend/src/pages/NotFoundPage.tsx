import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
      <p className="text-gray-500 mb-6">Page not found</p>
      <Link to="/" className="text-blue-600 hover:underline">
        Go Home
      </Link>
    </div>
  );
}
