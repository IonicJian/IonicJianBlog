import { useEffect, useRef, useState } from 'react'
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
  const headingsRef = useRef<HTMLElement[]>([])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const collect = () => {
      const headings = Array.from(
        container.querySelectorAll<HTMLElement>('h1, h2, h3, h4'),
      ).filter((h) => h.id && h.textContent)
      headingsRef.current = headings
      setItems(
        headings.map((h) => ({
          id: h.id,
          text: h.textContent ?? '',
          level: Number(h.tagName[1]),
        })),
      )
      return headings
    }

    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.add(entry.target.id)
          } else {
            visible.delete(entry.target.id)
          }
        }
        // Pick the first visible heading (by DOM order = closest to top)
        const current = headingsRef.current.find((h) => visible.has(h.id))
        if (current) setActiveId(current.id)
      },
      { rootMargin: '-80px 0px 0px 0px', threshold: 0 },
    )

    const headings = collect()
    for (const h of headings) observer.observe(h)

    // Re-collect if async content (markdown) renders after mount
    const mutationObs = new MutationObserver(() => {
      observer.disconnect()
      const updated = collect()
      for (const h of updated) observer.observe(h)
      visible.clear()
    })
    mutationObs.observe(container, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      mutationObs.disconnect()
    }
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
                '-ml-px block border-l-2 border-transparent py-1 pr-2 text-xs transition-colors hover:text-foreground',
                activeId === item.id
                  ? 'border-sky-500 text-sky-500 font-medium'
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
