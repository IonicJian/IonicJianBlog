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
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        评论 {total > 0 && <span className="text-gray-400 font-normal text-sm">({total})</span>}
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
        <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-sm">加载中...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-sm">暂无评论，来说点什么吧。</div>
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
              className={`px-3 py-1 rounded text-xs cursor-pointer ${page === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
