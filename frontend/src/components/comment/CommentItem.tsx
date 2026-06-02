import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import LikeButton from '../like/LikeButton';
import CommentForm from './CommentForm';
import { useAuthStore } from '../../store/authStore';
import { commentApi } from '../../api/comments';
import type { Comment } from '../../types/comment';

export default function CommentItem({ comment, blogId, onRefresh, depth = 0 }: {
  comment: Comment;
  blogId: number;
  onRefresh: () => void;
  depth?: number;
}) {
  const [showReply, setShowReply] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const isOwner = isAuthenticated && user?.id === comment.user_id;
  const isAdmin = user?.role === 'admin';
  const canDelete = isOwner || isAdmin;
  const maxDepth = 3;

  const handleDelete = async () => {
    if (!confirm('确定删除这条评论？')) return;
    setDeleting(true);
    try { await commentApi.delete(comment.id); onRefresh(); }
    catch { setDeleting(false); }
  };

  const authorName = comment.author?.display_name || comment.author?.username || '匿名';

  const handleQuoteJump = () => {
    if (comment.anchor_start) {
      const el = document.querySelector(`[data-p-id="${comment.anchor_start}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-blue-400', 'rounded');
        setTimeout(() => el.classList.remove('ring-2', 'ring-blue-400', 'rounded'), 2000);
      }
    }
  };

  return (
    <div className={`${depth > 0 ? 'ml-6 pl-4 border-l-2 border-gray-100 dark:border-gray-700' : ''}`}>
      <div className="flex items-start gap-2 py-2">
        <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 text-xs font-bold flex-shrink-0 mt-0.5">
          {authorName[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{authorName}</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {new Date(comment.created_at).toLocaleDateString('zh-CN')}
            </span>
          </div>

          {/* Quoted text from article */}
          {comment.anchor_text && (
            <button
              onClick={handleQuoteJump}
              className="text-left w-full border-l-3 border-blue-400 bg-blue-50 dark:bg-blue-950 dark:border-blue-600 pl-3 py-1.5 rounded-r text-sm text-gray-600 dark:text-gray-400 italic mb-1.5 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer"
            >
              {comment.anchor_text.length > 150 ? comment.anchor_text.slice(0, 150) + '...' : comment.anchor_text}
            </button>
          )}

          <div className="text-sm text-gray-700 dark:text-gray-300 mb-1 break-words prose dark:prose-invert prose-sm max-w-none
            prose-a:text-blue-500 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:rounded prose-code:text-xs
            prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-pre:p-2 prose-pre:rounded prose-pre:text-xs">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{comment.content}</ReactMarkdown>
          </div>
          <div className="flex items-center gap-2">
            <LikeButton commentId={comment.id} initialLiked={comment.liked_by_me} initialCount={comment.like_count} />
            {depth < maxDepth && (
              <button onClick={() => setShowReply(!showReply)}
                className="text-xs text-gray-400 hover:text-blue-500 bg-transparent border-none cursor-pointer">
                {showReply ? '取消回复' : '回复'}
              </button>
            )}
            {canDelete && (
              <button onClick={handleDelete} disabled={deleting}
                className="text-xs text-gray-300 hover:text-red-500 bg-transparent border-none cursor-pointer">
                {deleting ? '删除中...' : '删除'}
              </button>
            )}
          </div>

          {showReply && (
            <div className="mt-2">
              <CommentForm blogId={blogId} parentId={comment.id}
                placeholder={`回复 ${authorName}...`}
                onSuccess={() => { setShowReply(false); onRefresh(); }}
                onCancel={() => setShowReply(false)} />
            </div>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} blogId={blogId} onRefresh={onRefresh} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
