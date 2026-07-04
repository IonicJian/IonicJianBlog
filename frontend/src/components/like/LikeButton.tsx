import { Heart } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface LikeButtonProps {
  count: number
  liked: boolean
  onToggle: () => Promise<unknown> | void
  size?: number
  className?: string
}

export function LikeButton({
  count,
  liked,
  onToggle,
  size = 18,
  className,
}: LikeButtonProps) {
  const [optimisticLiked, setOptimisticLiked] = useState(liked)
  const [optimisticCount, setOptimisticCount] = useState(count)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setOptimisticLiked(liked)
    setOptimisticCount(count)
  }, [liked, count])

  const handle = async () => {
    if (loading) return
    const next = !optimisticLiked
    setOptimisticLiked(next)
    setOptimisticCount((c) => (next ? c + 1 : c - 1))
    setLoading(true)
    try {
      await onToggle()
    } catch {
      setOptimisticLiked(!next)
      setOptimisticCount((c) => (next ? c - 1 : c + 1))
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={loading}
      className={cn(
        'inline-flex items-center gap-1.5 text-xs transition-colors disabled:opacity-50',
        optimisticLiked
          ? 'text-primary'
          : 'text-muted-foreground hover:text-foreground',
        className,
      )}
    >
      <Heart size={size} weight={optimisticLiked ? 'fill' : 'regular'} />
      <span className="tabular-nums">{optimisticCount}</span>
    </button>
  )
}
