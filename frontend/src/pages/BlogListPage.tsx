import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogApi } from '../api/blogs';
import type { BlogListItem } from '../types/blog';

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<BlogListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const api = search
      ? blogApi.search(search, page)
      : blogApi.list({ page, page_size: 10 });

    api
      .then((res) => {
        setBlogs(res.data.data.items || []);
        setTotal(res.data.data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search]);

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">博客</h1>
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="搜索文章..."
          className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">加载中...</div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">暂无文章。</div>
      ) : (
        <>
          <div className="space-y-6">
            {blogs.map((blog) => (
              <article key={blog.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                <Link to={`/blogs/${blog.id}`} className="no-underline">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 hover:text-blue-600 dark:hover:text-blue-400">
                    {blog.is_top && <span className="text-red-500 mr-1">[置顶]</span>}
                    {blog.title}
                  </h2>
                </Link>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{blog.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                  <div className="flex items-center gap-3">
                    <span>{new Date(blog.created_at).toLocaleDateString('zh-CN')}</span>
                    <span>{blog.view_count} 阅读</span>
                    <span>{blog.like_count} 赞</span>
                  </div>
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="flex gap-1">
                      {blog.tags.map((tag) => (
                        <span key={tag.id} className="px-2 py-0.5 rounded text-xs text-white" style={{ backgroundColor: tag.color }}>
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 rounded text-sm cursor-pointer ${
                    page === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
