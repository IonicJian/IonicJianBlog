import { useParams } from 'react-router-dom';

export default function BlogEditPage() {
  const { id } = useParams();
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Blog #{id}</h1>
      <div className="text-gray-400">Editor coming soon...</div>
    </div>
  );
}
