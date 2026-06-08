import { useState, useEffect, useCallback } from 'react';
import { commentApi } from '../../api/comments';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import type { Comment } from '../../types/comment';

interface Props {
  blogId: number;
  quoteAnchor?: string | null;
  quoteText?: string | null;
  onQuoteClear: () => void;
}

export default function CommentList({ blogId, quoteAnchor, quoteText, onQuoteClear }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(() => {
    setLoading(true);
    commentApi.list(blogId, page)
      .then((res) => {
        setComments(res.data.data.items || []);
        setTotal(res.data.data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [blogId, page]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="py-4">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
        评论 {total > 0 && <span className="text-slate-400 font-normal text-sm">({total})</span>}
      </h3>

      <div className="mb-6">
        <CommentForm
          blogId={blogId}
          onSuccess={() => { fetchComments(); onQuoteClear(); }}
          quoteAnchor={quoteAnchor}
          quoteText={quoteText}
        />
      </div>

      {loading ? (
        <div className="text-center py-6 text-slate-400 dark:text-slate-400 text-sm">加载中...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-6 text-slate-400 dark:text-slate-400 text-sm">暂无评论，来说点什么吧。</div>
      ) : (
        <div className="space-y-0 divide-y divide-gray-100 dark:divide-gray-700">
          {comments.map((c) => (
            <CommentItem key={c.id} comment={c} blogId={blogId} onRefresh={fetchComments} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded-lg text-xs font-light cursor-pointer border transition-colors ${page === i + 1 ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800' : 'border-black/5 dark:border-white/10 text-slate-500 hover:border-black/15 dark:hover:border-white/15'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
