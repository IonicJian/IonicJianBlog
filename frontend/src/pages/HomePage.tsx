import { ArrowRight, Camera } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listBlogs } from "@/api/blogs";
import { getSiteOwner } from "@/api/site";
import { BlogCard } from "@/components/common/BlogCard";
import { Bookcase } from "@/components/decorations/Bookcase";
import { Button } from "@/components/ui/button";
import type { BlogListItem } from "@/types/blog";
import type { User } from "@/types/user";

export function HomePage() {
  const [owner, setOwner] = useState<User | null>(null);
  const [blogs, setBlogs] = useState<BlogListItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    getSiteOwner()
      .then((o) => {
        if (!cancelled) setOwner(o);
      })
      .catch(() => {});
    listBlogs({ page: 1, page_size: 6, sort: "latest" })
      .then((d) => {
        if (!cancelled) setBlogs(d.items || []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <section className="bp-line">
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-32">
          <div className="pointer-events-none absolute top-0 right-0 z-0 hidden w-[960px] h-[600px] overflow-hidden lg:block ">
            <Bookcase />
          </div>
          <div className="relative z-10">
            <h1 className="bp-line text-6xl font-medium tracking-tighter text-balance text-gray-950 sm:text-7xl lg:text-8xl dark:text-white">
              {owner?.display_name || "IonicJ"}
            </h1>
            <p className="mt-6 max-w-2xl bp-line text-base text-gray-500 dark:text-gray-400 sm:text-lg">
              {owner?.bio || "探索技术,记录思考,分享生活。"}
            </p>
            <div className="mt-10 bp-line">
              <Button asChild size="lg">
                <Link to="/blogs">
                  开始阅读
                  <ArrowRight size={16} weight="regular" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bp-line">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="flex items-center justify-between pb-8">
            <h2 className="bp-line text-2xl font-medium tracking-tight text-gray-950 dark:text-white">
              最新文章
            </h2>
            <Link
              to="/blogs"
              className="text-sm text-gray-500 transition-colors hover:text-gray-950 dark:text-gray-400 dark:hover:text-white"
            >
              查看全部
            </Link>
          </div>
          {blogs.length === 0 ? (
            <div className="rounded-2xl bg-gray-950/2 p-8 text-center text-sm text-gray-500 outline outline-1 outline-gray-950/5 dark:bg-white/5 dark:outline-white/10 dark:text-gray-400">
              暂无文章
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {blogs.map((b) => (
                <BlogCard key={b.id} blog={b} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="flex items-center justify-between pb-8">
            <h2 className="bp-line text-2xl font-medium tracking-tight text-gray-950 dark:text-white">
              摄影
            </h2>
            <Link
              to="/photography"
              className="text-sm text-gray-500 transition-colors hover:text-gray-950 dark:text-gray-400 dark:hover:text-white"
            >
              查看全部
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Link
                key={i}
                to="/photography"
                className="flex aspect-square items-center justify-center rounded-2xl bg-gray-950/2 text-gray-400 outline outline-1 outline-gray-950/5 transition-colors hover:bg-gray-950/5 dark:bg-white/5 dark:outline-white/10 dark:hover:bg-white/10"
              >
                <Camera size={28} weight="regular" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
