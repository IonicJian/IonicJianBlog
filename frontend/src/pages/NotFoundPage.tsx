import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-600 mb-4">404</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">页面不存在</p>
      <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline">
        返回首页
      </Link>
    </div>
  );
}
