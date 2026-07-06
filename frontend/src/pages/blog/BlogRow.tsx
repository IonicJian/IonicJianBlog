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
          <div className="flex flex-col gap-2 font-mono text-sm font-medium tracking-widest text-gray-500 tabular-nums uppercase">
            <span>{formatDate(blog.created_at)}</span>
            {blog.tags && blog.tags.length > 0 && (
              <span className="font-mono text-xs font-normal text-gray-400 normal-case tracking-normal">
                {blog.tags.map((t) => t.name).join(' · ')}
              </span>
            )}
          </div>
          <div className="hidden lg:block" />
          <div className="lg:pl-2 lg:pr-2">
            <div className="lg:mr-[19.3rem] pl-2">
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
          </div>
        </div>
      </Link>
    </div>
  );
}
