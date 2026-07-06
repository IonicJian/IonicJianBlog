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
  const rafRef = useRef<number | null>(null)

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

    const onScroll = () => {
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        // Pick the last heading whose top is above the header offset;
        // that is the section currently in view.
        let current = ''
        for (const h of headings) {
          if (h.getBoundingClientRect().top < 120) {
            current = h.id
          }
        }
        setActiveId(current)
        rafRef.current = null
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
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
