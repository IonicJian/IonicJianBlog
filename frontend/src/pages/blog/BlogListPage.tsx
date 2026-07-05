import { ArrowLeft, ArrowRight, MagnifyingGlass } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { listBlogs, listCategories, listTags, searchBlogs } from "@/api/blogs";
import { Laptop } from "@/components/decorations/Laptop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { BlogListItem, BlogSort } from "@/types/blog";
import type { Category } from "@/types/category";
import type { Tag } from "@/types/tag";
import { BlogRow } from "./BlogRow";

const PAGE_SIZE = 10;

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3 py-12">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <ArrowLeft size={14} weight="regular" />
        上一页
      </Button>
      <span className="text-sm text-gray-500 tabular-nums dark:text-gray-400">
        {page} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        下一页
        <ArrowRight size={14} weight="regular" />
      </Button>
    </div>
  );
}

function flattenCategories(cats: Category[]): Category[] {
  return cats.flatMap((c) => [
    c,
    ...(c.children ? flattenCategories(c.children) : []),
  ]);
}

export function BlogListPage() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<BlogSort>("latest");
  const [category, setCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [blogs, setBlogs] = useState<BlogListItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch(() => {});
    listTags()
      .then(setTags)
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const fetcher = q
      ? searchBlogs(q, page, PAGE_SIZE)
      : listBlogs({
          page,
          page_size: PAGE_SIZE,
          sort,
          tag: selectedTags.join(",") || undefined,
          category: category || undefined,
        });
    fetcher
      .then((d) => {
        if (cancelled) return;
        setBlogs(d.items || []);
        setTotalPages(d.total_pages);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [q, sort, category, selectedTags, page]);

  useEffect(() => {
    setPage(1);
  }, [q, sort, category, selectedTags]);

  const toggleTag = (slug: string) => {
    setSelectedTags((prev) =>
      prev.includes(slug) ? prev.filter((t) => t !== slug) : [...prev, slug],
    );
  };

  const flat = flattenCategories(categories);
  const chip = (active: boolean) =>
    cn(
      "rounded-full px-3 py-1 text-xs font-medium transition-colors",
      active
        ? "bg-gray-950 text-white dark:bg-white dark:text-gray-950"
        : "bg-gray-950/5 text-gray-950 hover:bg-gray-950/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15",
    );

  return (
    <div className="relative mx-auto max-w-7xl">
      <div className="relative pt-32 px-4 sm:px-6">
        <div className="pointer-events-none absolute top-0 right-0 z-0 hidden w-[960px] h-[600px] overflow-hidden lg:block">
          <Laptop />
        </div>
        <div className="relative z-10">
          <h1 className="bp-line text-6xl tracking-tighter text-balance text-gray-950 sm:text-7xl lg:text-8xl dark:text-white">
            Blogs
          </h1>

          <div className="mt-10 max-w-md">
            <div className="bp-line relative">
              <MagnifyingGlass
                size={16}
                weight="regular"
                className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500"
              />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="搜索文章..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="bp-line-top pt-1.5 mt-6 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium tracking-widest text-gray-500 uppercase">
              排序
            </span>
            {(["latest", "popular"] as BlogSort[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSort(s)}
                className={chip(sort === s)}
              >
                {s === "latest" ? "最新" : "推荐"}
              </button>
            ))}
            {flat.length > 0 && (
              <>
                <span className="ml-4 text-xs font-medium tracking-widest text-gray-500 uppercase">
                  分类
                </span>
                {flat.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() =>
                      setCategory(category === c.slug ? "" : c.slug)
                    }
                    className={chip(category === c.slug)}
                  >
                    {c.name}
                  </button>
                ))}
              </>
            )}
          </div>
          {tags.length > 0 && (
            <div className=" bp-line py-1.5 mt-1 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium tracking-widest text-gray-500 uppercase">
                标签
              </span>
              {tags.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTag(t.slug)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    selectedTags.includes(t.slug)
                      ? "bg-sky-500 text-white"
                      : "bg-gray-950/5 text-gray-950 hover:bg-gray-950/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15",
                  )}
                >
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-12">
        {loading ? (
          <p className="px-4 py-8 text-sm text-gray-500 dark:text-gray-400 sm:px-6">
            ...
          </p>
        ) : blogs.length === 0 ? (
          <p className="px-4 py-8 text-sm text-gray-500 dark:text-gray-400 sm:px-6">
            没有找到文章
          </p>
        ) : (
          <>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-4 z-0 border-l border-gray-950/5 dark:border-white/10 sm:left-6 lg:left-[21.3rem]" />
              <div className="relative z-10 bp-line-bottom">
                {blogs.map((b) => (
                  <BlogRow key={b.id} blog={b} />
                ))}
              </div>
            </div>
            <div className="px-4 sm:px-6">
              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={setPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
