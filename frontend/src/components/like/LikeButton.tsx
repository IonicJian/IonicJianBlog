import { useState } from 'react';
import { likeApi } from '../../api/social';
import { IconHeart } from '../common/Icons';

interface Props {
  blogId?: number;
  commentId?: number;
  initialLiked: boolean;
  initialCount: number;
}

export default function LikeButton({ blogId, commentId, initialLiked, initialCount }: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  const handleToggle = async () => {
    const prevLiked = liked;
    const prevCount = count;
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);
    try {
      if (blogId) {
        const res = await likeApi.toggleBlog(blogId);
        setLiked(res.data.data.liked);
        setCount(res.data.data.count);
      } else if (commentId) {
        const res = await likeApi.toggleComment(commentId);
        setLiked(res.data.data.liked);
        setCount(res.data.data.count);
      }
    } catch {
      setLiked(prevLiked);
      setCount(prevCount);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-xl border-none cursor-pointer transition-colors ${
        liked
          ? 'text-amber-600 dark:text-amber-500 bg-amber-50/80 dark:bg-amber-950/30'
          : 'text-slate-400 dark:text-slate-400 hover:text-amber-500 bg-transparent hover:bg-amber-50/60 dark:hover:bg-amber-950/20'
      }`}
    >
      <IconHeart filled={liked} className="w-4 h-4" /> <span>{count}</span>
    </button>
  );
}
