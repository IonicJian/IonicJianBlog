import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogApi } from '../api/blogs';
import type { BlogListItem } from '../types/blog';

export default function HomePage() {
  const [blogs, setBlogs] = useState<BlogListItem[]>([]);

  useEffect(() => {
    blogApi.list({ page: 1, page_size: 3 }).then((res) => {
      setBlogs(res.data.data.items || []);
    }).catch(() => {});
  }, []);

  return (
    <div className="py-12">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">欢迎来到我的博客</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          分享技术思考、教程和软件开发经验。
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/blogs" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 no-underline font-medium">
            浏览博客
          </Link>
          <Link to="/guestbook" className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 no-underline font-medium">
            写留言
          </Link>
        </div>
      </section>

      {blogs.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">最新文章</h2>
          <div className="space-y-4">
            {blogs.map((blog) => (
              <article key={blog.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
                <Link to={`/blogs/${blog.id}`} className="no-underline">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 hover:text-blue-600 dark:hover:text-blue-400">
                    {blog.is_top && <span className="text-red-500 mr-1">[置顶]</span>}
                    {blog.title}
                  </h3>
                </Link>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{blog.excerpt}</p>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  {new Date(blog.created_at).toLocaleDateString('zh-CN')} · {blog.view_count} 阅读 · {blog.like_count} 赞
                </div>
              </article>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link to="/blogs" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
              查看全部文章 &rarr;
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
