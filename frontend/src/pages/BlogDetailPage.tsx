import { useParams } from 'react-router-dom';

export default function BlogDetailPage() {
  const { id } = useParams();
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Blog Post #{id}</h1>
      <div className="text-gray-400">Content coming soon...</div>
    </div>
  );
}
