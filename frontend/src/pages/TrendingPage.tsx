import { useState, useEffect } from 'react';
import { trendingApi, type TrendingRepo } from '../api/trending';

const langColors: Record<string, string> = {
  Go: 'bg-cyan-500', JavaScript: 'bg-yellow-400', TypeScript: 'bg-blue-500',
  Python: 'bg-green-500', Rust: 'bg-orange-600', Java: 'bg-red-500',
  'C++': 'bg-pink-500', C: 'bg-gray-500', Ruby: 'bg-red-600',
  Swift: 'bg-orange-500', Kotlin: 'bg-purple-500',
};

export default function TrendingPage() {
  const [repos, setRepos] = useState<TrendingRepo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trendingApi.get()
      .then((res) => setRepos(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="py-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">GitHub 趋势</h1>
      <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">本周热门开源项目</p>

      {loading ? (
        <div className="text-center py-12 text-gray-400">加载中...</div>
      ) : repos.length === 0 ? (
        <div className="text-center py-12 text-gray-400">暂无数据</div>
      ) : (
        <div className="space-y-3">
          {repos.map((repo, i) => (
            <a
              key={repo.full_name}
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline block"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-300 dark:text-gray-600 w-5">{i + 1}</span>
                      <span className="text-gray-400 dark:text-gray-500 text-xs">/{repo.full_name}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-1">{repo.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                      {repo.description || '暂无描述'}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                      {repo.language && (
                        <span className="flex items-center gap-1">
                          <span className={`w-2.5 h-2.5 rounded-full ${langColors[repo.language] || 'bg-gray-400'}`}></span>
                          {repo.language}
                        </span>
                      )}
                      <span>⭐ {repo.stars.toLocaleString()}</span>
                      <span>🔀 {repo.forks.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
