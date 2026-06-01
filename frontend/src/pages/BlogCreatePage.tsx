import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function BlogCreatePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Blog</h1>
      <div className="text-gray-400">Editor coming soon...</div>
    </div>
  );
}
