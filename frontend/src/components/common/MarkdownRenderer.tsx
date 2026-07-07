import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import DOMPurify from 'dompurify'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { createHighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

type Highlighter = Awaited<ReturnType<typeof createHighlighterCore>>
import { cn } from '@/lib/utils'
import { ImageLightbox } from './Lightbox'

let highlighterPromise: Promise<Highlighter> | null = null
function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [
        import('@shikijs/themes/github-light'),
        import('@shikijs/themes/github-dark'),
      ],
      langs: [
        import('@shikijs/langs/bash'),
        import('@shikijs/langs/c'),
        import('@shikijs/langs/cpp'),
        import('@shikijs/langs/css'),
        import('@shikijs/langs/diff'),
        import('@shikijs/langs/go'),
        import('@shikijs/langs/html'),
        import('@shikijs/langs/java'),
        import('@shikijs/langs/javascript'),
        import('@shikijs/langs/json'),
        import('@shikijs/langs/jsx'),
        import('@shikijs/langs/markdown'),
        import('@shikijs/langs/powershell'),
        import('@shikijs/langs/python'),
        import('@shikijs/langs/shell'),
        import('@shikijs/langs/sql'),
        import('@shikijs/langs/tsx'),
        import('@shikijs/langs/typescript'),
        import('@shikijs/langs/yaml'),
      ],
      engine: createJavaScriptRegexEngine(),
    })
  }
  return highlighterPromise
}

function extractText(node: ReactNode): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (node && typeof node === 'object' && 'props' in node) {
    return extractText(
      (node as { props: { children?: ReactNode } }).props.children,
    )
  }
  return ''
}

function slugify(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^\w一-龥\s-]/g, '')
    .replace(/\s+/g, '-')
}

function extractLine(node: unknown): number | undefined {
  if (node && typeof node === 'object' && 'position' in node) {
    const pos = (node as { position?: { start?: { line?: number } } })
      .position
    return pos?.start?.line
  }
  return undefined
}

function CodeBlock({
  html,
  lang,
  code,
}: {
  html: string | null
  lang: string
  code: string
}) {
  const [copied, setCopied] = useState(false)
  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard may be unavailable (non-secure context or permission denied)
    }
  }, [code])
  return (
    <div className="my-4 overflow-hidden rounded-lg border border-border bg-code-bg">
      <div className="flex items-center justify-between border-b border-border px-4 py-1.5">
        <span className="text-xs text-muted-foreground">{lang}</span>
        <button
          type="button"
          onClick={copy}
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {copied ? '已复制' : '复制'}
        </button>
      </div>
      {html ? (
        <div
          className="[&>pre]:whitespace-pre-wrap [&>pre]:break-words text-sm"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="shiki whitespace-pre-wrap break-words p-4 text-sm">
          <code>{code}</code>
        </pre>
      )}
    </div>
  )
}

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const [highlighter, setHighlighter] = useState<Highlighter | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const images = useMemo(() => {
    const re = /!\[[^\]]*\]\(([^)]+)\)/g
    const urls: string[] = []
    let m: RegExpExecArray | null
    while ((m = re.exec(content)) !== null) urls.push(m[1])
    return urls
  }, [content])

  useEffect(() => {
    let cancelled = false
    getHighlighter().then((h) => {
      if (!cancelled) setHighlighter(h)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const makeHeading = (level: 1 | 2 | 3 | 4) => {
    const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4'
    return function Heading({ children }: { children?: ReactNode }) {
      return <Tag id={slugify(extractText(children))}>{children}</Tag>
    }
  }

  const components: Components = {
    h1: makeHeading(1),
    h2: makeHeading(2),
    h3: makeHeading(3),
    h4: makeHeading(4),
    pre: ({ children }) => <>{children}</>,
    p: ({ node, children }) => (
      <p data-p-id={extractLine(node)}>{children}</p>
    ),
    a: ({ href, children }) => (
      <a href={href} target="_blank" rel="noreferrer noopener">
        {children}
      </a>
    ),
    img: ({ src, alt }) => {
      const url = String(src || '')
      return (
        <img
          src={url}
          alt={alt || ''}
          loading="lazy"
          onClick={() => {
            const idx = images.indexOf(url)
            setLightboxIndex(idx >= 0 ? idx : 0)
            setLightboxOpen(true)
          }}
          className="my-4 h-auto max-w-full cursor-zoom-in rounded-lg border border-border"
        />
      )
    },
    code: ({ className: cls, children }) => {
      const match = /language-(\w+)/.exec(cls || '')
      const text = String(children).replace(/\n$/, '')
      if (match) {
        const lang = match[1].toLowerCase()
        let html: string | null = null
        if (highlighter) {
          try {
            html = DOMPurify.sanitize(
              highlighter.codeToHtml(text, {
                lang,
                themes: { light: 'github-light', dark: 'github-dark' },
              }),
              { USE_PROFILES: { html: true } },
            )
          } catch {
            // shiki highlight failed: fall back to plain <code> below
          }
        }
        return <CodeBlock html={html} lang={lang} code={text} />
      }
      return (
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]">
          {children}
        </code>
      )
    },
  }

  return (
    <div className={cn('markdown-body', className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
      <ImageLightbox
        open={lightboxOpen}
        index={lightboxIndex}
        images={images.map((src) => ({ src }))}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  )
}
