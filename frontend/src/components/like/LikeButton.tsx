import { useState } from 'react';
import { likeApi } from '../../api/likes';

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
      className={`inline-flex items-center gap-1 text-sm px-2 py-1 rounded-md border-none cursor-pointer transition-colors ${
        liked
          ? 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30'
          : 'text-gray-400 dark:text-gray-500 hover:text-red-400 bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20'
      }`}
    >
      {liked ? '❤️' : '🤍'} <span>{count}</span>
    </button>
  );
}
