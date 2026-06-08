import { useState } from 'react';
import LikeButton from '../like/LikeButton';
import CommentForm from './CommentForm';
import MarkdownRenderer from '../common/MarkdownRenderer';
import { useAuthStore } from '../../store/authStore';
import { commentApi } from '../../api/social';
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
        el.classList.add('ring-2', 'ring-amber-400', 'rounded');
        setTimeout(() => el.classList.remove('ring-2', 'ring-amber-400', 'rounded'), 2000);
      }
    }
  };

  return (
    <div className={`${depth > 0 ? 'ml-6 pl-4 border-l-2 border-black/5 dark:border-white/5' : ''}`}>
      <div className="flex items-start gap-2 py-2">
        <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center flex-shrink-0 mt-0.5">
          {comment.author?.avatar_url ? (
            <img
              src={comment.author.avatar_url.startsWith('http') ? comment.author.avatar_url : `http://localhost:8080${comment.author.avatar_url}`}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs font-medium text-slate-400 dark:text-slate-400">
              {authorName[0].toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{authorName}</span>
            <span className="text-xs text-slate-400 dark:text-slate-400">
              {new Date(comment.created_at).toLocaleDateString('zh-CN')}
            </span>
          </div>

          {/* Quoted text from article */}
          {comment.anchor_text && (
            <button
              onClick={handleQuoteJump}
              className="text-left w-full border-l-3 border-amber-400 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-600 pl-3 py-1.5 rounded-r text-sm text-slate-500 dark:text-slate-400 italic mb-1.5 hover:bg-amber-50 dark:hover:bg-amber-950/30 cursor-pointer"
            >
              {comment.anchor_text.length > 150 ? comment.anchor_text.slice(0, 150) + '...' : comment.anchor_text}
            </button>
          )}

          <div className="text-sm text-slate-600 dark:text-slate-300 mb-1 break-words">
            <MarkdownRenderer content={comment.content} compact noDataPid />
          </div>
          <div className="flex items-center gap-2">
            <LikeButton commentId={comment.id} initialLiked={comment.liked_by_me} initialCount={comment.like_count} />
            {depth < maxDepth && (
              <button onClick={() => setShowReply(!showReply)}
                className="text-xs text-slate-400 hover:text-amber-500 bg-transparent border-none cursor-pointer">
                {showReply ? '取消回复' : '回复'}
              </button>
            )}
            {canDelete && (
              <button onClick={handleDelete} disabled={deleting}
                className="text-xs text-slate-300 hover:text-red-500 bg-transparent border-none cursor-pointer">
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
