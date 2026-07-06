import { Link } from "react-router-dom";
import type { BlogListItem } from "@/types/blog";

interface BlogRowProps {
  blog: BlogListItem;
}

function formatDate(s: string): string {
  return new Date(s).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function BlogRow({ blog }: BlogRowProps) {
  return (
    <div className="bp-line-top px-4 pt-12 sm:px-6">
      <div className="lg:grid lg:grid-cols-[16.8rem_2.5rem_minmax(0,1fr)] lg:gap-0">
        <div className="font-mono text-sm font-medium tracking-widest text-gray-500 tabular-nums uppercase">
          {formatDate(blog.created_at)}
        </div>
        <div className="hidden lg:block" />
        <div className="lg:pl-2 lg:pr-2">
          <div className="lg:mr-[19.3rem] pl-2">
            <div className="bp-line-top">
              <Link
                to={`/blogs/${blog.id}`}
                className="font-semibold text-gray-950 transition-colors hover:text-sky-500 dark:text-white"
              >
                {blog.title}
              </Link>
            </div>
            {blog.excerpt && (
              <p className="mt-6 line-clamp-3 text-sm leading-5 text-gray-600 dark:text-gray-300">
                {blog.excerpt}
              </p>
            )}
            <Link
              to={`/blogs/${blog.id}`}
              className="mt-4 inline-block text-sm font-semibold text-sky-500 transition-colors hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-500"
            >
              阅读更多
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
