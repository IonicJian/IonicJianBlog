import { ArrowRight } from "@phosphor-icons/react";
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
      <Link
        to={`/blogs/${blog.id}`}
        className="group block -mx-4 border-x-0 border-y border-transparent px-4 transition-colors hover:border-gray-400 hover:bg-gray-950/[0.025] sm:-mx-6 sm:px-6 dark:hover:border-gray-600 dark:hover:bg-white/[0.025]"
      >
        <div className="lg:grid lg:grid-cols-[16.8rem_2.5rem_minmax(0,1fr)] lg:gap-0">
          <div className="font-mono text-sm font-medium tracking-widest text-gray-500 tabular-nums uppercase">
            {formatDate(blog.created_at)}
          </div>
          <div className="hidden lg:block" />
          <div className="min-w-0 lg:flex lg:gap-4">
            <div className="min-w-0 flex-1 pl-2">
              <div className="bp-line-top">
                <span className="font-semibold text-gray-950 transition-colors group-hover:text-sky-500 dark:text-white">
                  {blog.title}
                </span>
              </div>
              {blog.excerpt && (
                <p className="mt-6 line-clamp-3 text-sm leading-5 text-gray-600 dark:text-gray-300">
                  {blog.excerpt}
                </p>
              )}
              <ArrowRight
                size={16}
                weight="regular"
                className="mt-4 text-gray-500 transition-transform group-hover:translate-x-1 group-hover:text-sky-500 dark:text-gray-400"
              />
            </div>
            {blog.tags && blog.tags.length > 0 && (
              <div className="mt-1 hidden w-[10rem] shrink-0 flex-col gap-0.5 lg:flex">
                {blog.tags.map((t) => (
                  <span key={t.id} className="font-mono text-xs font-medium tracking-widest text-gray-400 uppercase">
                    {t.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
