import { useState, useEffect, useRef } from "react";
import { blogApi } from "../api/blog";
import apiClient from "../api/client";
import type { BlogListItem } from "../types/blog";
import BlogCard from "../components/common/BlogCard";

type Tab = "recommended" | "latest";

export default function HomePage() {
  const [blogs, setBlogs] = useState<BlogListItem[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("latest");
  const [panelOpen, setPanelOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [owner, setOwner] = useState({
    display_name: "IonicJ",
    avatar_url:
      "https://i1.hdslb.com/bfs/face/d710e001e9453019dcdefdf136845d8d08d80095.jpg",
  });
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    apiClient
      .get("/site/owner")
      .then((res: any) => {
        if (res.data?.data) setOwner(res.data.data);
      })
      .catch(() => {});
  }, []);

  const fetchBlogs = (tab: Tab) => {
    setLoading(true);
    const sort = tab === "recommended" ? "popular" : "latest";
    blogApi
      .list({ page: 1, page_size: 30, sort })
      .then((res) => {
        setBlogs(res.data.data.items || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBlogs("latest");
  }, []);

  const openPanel = (tab: Tab) => {
    clearTimeout(closeTimer.current);
    if (tab !== activeTab) {
      setActiveTab(tab);
      fetchBlogs(tab);
    }
    setPanelOpen(true);
  };
  const closePanel = () => {
    closeTimer.current = setTimeout(() => setPanelOpen(false), 600);
  };
  const cancelClose = () => clearTimeout(closeTimer.current);

  const avatarSrc = owner.avatar_url
    ? owner.avatar_url.startsWith("http")
      ? owner.avatar_url
      : `http://localhost:8080${owner.avatar_url}`
    : null;

  return (
    <div
      className="h-screen flex flex-col overflow-hidden bg-geo-lines"
      style={{ position: "fixed", inset: 0 }}
    >
      {/* ===== Hero — fills remaining space above tab bar ===== */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-50/20 via-transparent to-transparent dark:from-amber-950/15 dark:to-transparent pointer-events-none" />

        <div
          className="flex flex-col items-center transition-all duration-500 ease-out"
          style={{
            transform: panelOpen
              ? "scale(0.65) translateY(-8%)"
              : "scale(1) translateY(0)",
            opacity: panelOpen ? 0.35 : 1,
          }}
        >
          <div className="mb-8">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-1 ring-black/5 dark:ring-white/10 ring-offset-4 ring-offset-transparent">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <span className="text-3xl font-bold text-slate-400 dark:text-slate-500">
                    {owner.display_name?.[0] || "Z"}
                  </span>
                </div>
              )}
            </div>
          </div>

          <h1 className="font-bold text-6xl md:text-7xl text-slate-800 dark:text-slate-100 mb-4 animate-fade-up stagger-1 tracking-tight">
            {owner.display_name}
          </h1>

          <p className="text-sm font-light tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-2 animate-fade-up stagger-2 uppercase">
            Software Engineer
          </p>

          <div className="w-8 h-px bg-amber-500/40 my-6 animate-fade-up stagger-3" />

          <p className="text-sm text-slate-400 dark:text-slate-500 font-light animate-fade-up stagger-3">
            笔记 · 随想 · 分享
          </p>
        </div>
      </div>

      {/* ===== Tab bar — browser-tab style, merges with panel ===== */}
      <div
        className="flex-shrink-0 flex items-end justify-center gap-0"
        onMouseEnter={cancelClose}
        onMouseLeave={closePanel}
      >
        {(
          [
            { key: "recommended", label: "推荐阅读" },
            { key: "latest", label: "最新文章" },
          ] as { key: Tab; label: string }[]
        ).map(({ key, label }) => (
          <button
            key={key}
            className={`group relative bg-transparent border border-transparent cursor-pointer inline-flex flex-col items-center justify-center w-44 pt-2.5 pb-1.5 rounded-t-xl transition-all duration-300 ${
              activeTab === key && panelOpen
                ? "bg-white dark:bg-slate-800 !rounded-b-none !border-b-0 !shadow-none"
                : "hover:bg-white/30 dark:hover:bg-slate-800/30"
            }`}
            onMouseEnter={() => openPanel(key)}
          >
            <span
              className={`text-sm font-light tracking-[0.15em] transition-colors duration-300 ${
                activeTab === key && panelOpen
                  ? "text-slate-800 dark:text-slate-100"
                  : "text-slate-400 dark:text-slate-500"
              }`}
            >
              {label}
            </span>
            <span
              className={`h-0.5 bg-amber-500 rounded-full transition-all duration-300 mt-0.5 ${
                activeTab === key && panelOpen
                  ? "w-1/2"
                  : "w-0 group-hover:w-1/2"
              }`}
            />
          </button>
        ))}
      </div>

      {/* ===== Blog panel ===== */}
      <div
        className="overflow-hidden flex-shrink-0"
        style={{
          height: panelOpen ? "66vh" : "0px",
          transition: "height 0.5s ease-out",
          willChange: "height",
        }}
        onMouseEnter={cancelClose}
        onMouseLeave={closePanel}
      >
        <div
          className="h-full overflow-y-auto !rounded-t-none bg-white dark:bg-slate-800"
          style={{ borderTop: "none", transform: "translateZ(0)" }}
        >
          <div className="max-w-3xl mx-auto px-8 py-6">
            {loading ? (
              <p className="text-sm text-slate-400 dark:text-slate-600 font-light tracking-wider py-16 text-center">
                加载中...
              </p>
            ) : blogs.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-600 font-light tracking-wider py-16 text-center">
                暂无文章
              </p>
            ) : (
              <div className="space-y-3">
                {blogs.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} variant="simple" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
