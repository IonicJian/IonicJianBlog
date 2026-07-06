import { ArrowLeft, Eye, PencilSimple, Quotes, Sparkle } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getBlog, incrementView } from "@/api/blogs";
import { getBlogLikeStatus, toggleBlogLike } from "@/api/comments";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { TableOfContents } from "@/components/common/TableOfContents";
import { CommentForm } from "@/components/comment/CommentForm";
import { CommentList } from "@/components/comment/CommentList";
import { LikeButton } from "@/components/like/LikeButton";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import type { Blog } from "@/types/blog";
import type { Comment } from "@/types/comment";

interface QuoteData {
  text: string;
  start: string;
}

interface QuoteBtn {
  x: number;
  y: number;
  text: string;
  start: string;
}

function formatDate(s: string): string {
  return new Date(s).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function BlogDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentRefresh, setCommentRefresh] = useState(0);
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [quoteBtn, setQuoteBtn] = useState<QuoteBtn | null>(null);
  const articleRef = useRef<HTMLDivElement>(null);

  const blogId = Number(id);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    getBlog(blogId)
      .then((b) => {
        if (cancelled) return;
        setBlog(b);
        setLikeCount(b.like_count);
        setLiked(b.liked_by_me);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [blogId, id]);

  useEffect(() => {
    if (!id) return;
    const key = `blog-view-${id}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    incrementView(blogId).catch(() => {});
  }, [blogId, id]);

  useEffect(() => {
    if (!id || !user) return;
    getBlogLikeStatus(blogId)
      .then((s) => {
        setLiked(s.liked);
        setLikeCount(s.count);
      })
      .catch(() => {});
  }, [blogId, id, user]);

  const handleLikeToggle = async () => {
    if (!user) {
      toast.info("请先登录后再点赞");
      throw new Error("not authenticated");
    }
    const res = await toggleBlogLike(blogId);
    setLiked(res.liked);
    setLikeCount(res.count);
  };

  const handleSelection = () => {
    const sel = window.getSelection();
    const text = sel?.toString().trim() ?? "";
    if (text.length < 2) {
      setQuoteBtn(null);
      return;
    }
    const range = sel?.getRangeAt(0);
    if (!range) return;
    const container = range.startContainer;
    const el =
      container.nodeType === Node.ELEMENT_NODE
        ? (container as HTMLElement)
        : container.parentElement;
    const p = el?.closest("p[data-p-id]") ?? null;
    if (!p) {
      setQuoteBtn(null);
      return;
    }
    const rect = range.getBoundingClientRect();
    setQuoteBtn({
      x: rect.left + rect.width / 2,
      y: rect.top,
      text,
      start: p.getAttribute("data-p-id") ?? "",
    });
  };

  const applyQuote = () => {
    if (!quoteBtn) return;
    setQuote({ text: quoteBtn.text, start: quoteBtn.start });
    setQuoteBtn(null);
    window.getSelection()?.removeAllRanges();
    document
      .getElementById("comment-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12 text-sm text-muted-foreground md:px-12">
        加载中...
      </div>
    );
  }
  if (!blog) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12 md:px-12">
        <p className="text-sm text-muted-foreground">文章不存在</p>
        <Button asChild variant="ghost" size="sm" className="mt-4">
          <Link to="/blogs">返回列表</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12">
      <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,768px)_1fr] lg:gap-0">
        <div className="hidden lg:block">
          <div className="sticky top-32 ml-auto max-h-[calc(100vh-10rem)] w-[200px] overflow-y-auto pr-8">
            <TableOfContents containerRef={articleRef} />
          </div>
        </div>
        <article
          ref={articleRef}
          className="w-full lg:border-l lg:border-gray-950/5 dark:lg:border-white/10"
          onMouseUp={handleSelection}
        >
          <div className="flex items-center justify-between pb-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft size={16} weight="regular" />
              返回
            </button>
            {user?.role === "admin" && (
              <Button asChild variant="outline" size="sm">
                <Link to={`/admin/blogs/${blog.id}/edit`}>
                  <PencilSimple size={14} weight="regular" />
                  编辑
                </Link>
              </Button>
            )}
          </div>
          <h1 className="text-5xl font-medium tracking-tighter text-balance text-gray-950 md:text-6xl dark:text-white">
            {blog.title}
          </h1>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="font-mono font-medium tracking-widest uppercase tabular-nums">
              {formatDate(blog.created_at)}
            </span>
            <span className="flex items-center gap-1 tabular-nums">
              <Eye size={14} weight="regular" />
              {blog.view_count}
            </span>
            {blog.tags?.map((t) => (
              <span
                key={t.id}
                className="rounded-full bg-gray-950/5 px-2 py-0.5 dark:bg-white/10"
              >
                {t.name}
              </span>
            ))}
          </div>
          {blog.ai_summary && (
            <div className="mt-8 rounded-xl border border-amber-500/20 bg-amber-50/50 px-5 py-4 dark:bg-amber-950/10">
              <div className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
                <Sparkle size={14} weight="fill" />
                AI 总结
              </div>
              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-gray-700 dark:text-gray-300">
                {blog.ai_summary}
              </p>
            </div>
          )}
          <div className="mt-10 border-t border-gray-950/5 pt-10 dark:border-white/10">
            <MarkdownRenderer content={blog.content} />
          </div>
          <div className="mt-8 flex justify-center border-t border-border pt-6">
            <LikeButton
              count={likeCount}
              liked={liked}
              onToggle={handleLikeToggle}
              size={20}
            />
          </div>
        </article>
        <div className="hidden lg:block" />
      </div>

      <section id="comments" className="mx-auto mt-12 max-w-3xl">
        <h2 className="pb-6 text-2xl font-semibold tracking-tight">评论</h2>
        <div id="comment-form" className="pb-8">
          <CommentForm
            blogId={blog.id}
            replyTo={replyTo}
            quote={quote}
            onSubmitted={() => setCommentRefresh((k) => k + 1)}
            onCancelReply={() => setReplyTo(null)}
            onCancelQuote={() => setQuote(null)}
          />
        </div>
        <CommentList
          blogId={blog.id}
          refreshKey={commentRefresh}
          onReply={(c) => {
            setReplyTo(c);
            document
              .getElementById("comment-form")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
          onChanged={() => setCommentRefresh((k) => k + 1)}
        />
      </section>

      {quoteBtn && (
        <button
          type="button"
          onClick={applyQuote}
          style={{ top: `${quoteBtn.y}px`, left: `${quoteBtn.x}px` }}
          className="fixed z-50 flex -translate-x-1/2 -translate-y-full items-center gap-1 rounded-md border border-border bg-popover px-2 py-1 text-xs backdrop-blur-md transition-colors hover:bg-accent"
        >
          <Quotes size={14} weight="regular" />
          引用
        </button>
      )}
    </div>
  );
}
