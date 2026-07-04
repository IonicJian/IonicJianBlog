import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 py-12 text-center">
      <p className="text-6xl font-semibold tabular-nums">404</p>
      <p className="mt-4 text-sm text-muted-foreground">页面不存在</p>
      <Button asChild className="mt-6">
        <Link to="/">回首页</Link>
      </Button>
    </div>
  )
}
