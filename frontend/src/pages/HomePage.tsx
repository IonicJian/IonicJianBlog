import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="py-12">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to My Blog</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Sharing thoughts, tutorials, and experiences in software development.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/blogs"
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 no-underline font-medium"
          >
            Read Blogs
          </Link>
          <Link
            to="/guestbook"
            className="bg-white text-gray-700 px-5 py-2.5 rounded-lg border hover:bg-gray-50 no-underline font-medium"
          >
            Sign Guestbook
          </Link>
        </div>
      </section>

      <section className="text-center text-gray-400 text-sm py-8">
        <p>Blog posts will appear here once published.</p>
      </section>
    </div>
  );
}
