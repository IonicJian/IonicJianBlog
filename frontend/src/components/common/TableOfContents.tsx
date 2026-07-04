import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface TocItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  containerRef: React.RefObject<HTMLElement | null>
  className?: string
}

export function TableOfContents({
  containerRef,
  className,
}: TableOfContentsProps) {
  const [items, setItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const headings = Array.from(
      container.querySelectorAll<HTMLElement>('h1, h2, h3, h4'),
    )
    const toc: TocItem[] = headings
      .map((h) => ({
        id: h.id,
        text: h.textContent ?? '',
        level: Number(h.tagName[1]),
      }))
      .filter((h) => h.id && h.text)
    setItems(toc)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        })
      },
      { rootMargin: '0px 0px -75% 0px', threshold: 0 },
    )
    headings.forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [containerRef])

  if (items.length < 2) return null

  return (
    <nav className={cn('flex flex-col gap-2', className)}>
      <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        目录
      </p>
      <ul className="flex flex-col gap-1 border-l border-border">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              style={{ paddingLeft: `${(item.level - 1) * 12 + 12}px` }}
              className={cn(
                '-ml-px block border-l border-transparent py-1 pr-2 text-xs transition-colors hover:text-foreground',
                activeId === item.id
                  ? 'border-primary text-primary'
                  : 'text-muted-foreground',
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
