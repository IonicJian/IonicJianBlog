import { memo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useUIStore } from '../../store/uiStore';

interface Props {
  content: string;
  /** Use smaller prose size for compact contexts (comments, previews) */
  compact?: boolean;
  /** Skip data-p-id attributes (not needed outside blog detail) */
  noDataPid?: boolean;
  /** Callback when an image is clicked (enables click-to-zoom) */
  onImageClick?: (src: string, alt: string) => void;
}

/** Shared prose styles used across blog content, comments, and MDEditor preview */
export const proseClasses = [
  'prose', 'dark:prose-invert', 'prose-gray', 'max-w-none',
  'prose-headings:text-slate-800', 'dark:prose-headings:text-gray-100', 'prose-headings:font-semibold',
  'prose-p:text-slate-600', 'dark:prose-p:text-slate-300', 'prose-p:leading-relaxed',
  'prose-a:text-amber-600', 'dark:prose-a:text-amber-400', 'prose-a:no-underline', 'hover:prose-a:underline',
  'prose-pre:p-0',
  'prose-blockquote:border-l-4', 'prose-blockquote:border-amber-500', 'prose-blockquote:bg-amber-50/50', 'dark:prose-blockquote:bg-amber-950/20', 'prose-blockquote:px-4', 'prose-blockquote:py-2', 'prose-blockquote:rounded-r', 'dark:prose-blockquote:text-slate-300',
  'prose-img:rounded-lg', 'prose-img:shadow-md',
  'prose-strong:text-slate-800', 'dark:prose-strong:text-gray-100',
  'prose-table:border-collapse',
  'prose-th:bg-slate-100', 'dark:prose-th:bg-slate-800', 'prose-th:px-4', 'prose-th:py-2', 'prose-th:text-left',
  'prose-td:border-t', 'dark:prose-td:border-gray-700', 'prose-td:px-4', 'prose-td:py-2',
].join(' ');

const MarkdownRenderer = memo(function MarkdownRenderer({ content, compact, noDataPid, onImageClick }: Props) {
  let pCounter = 0;
  const getPId = () => `p${++pCounter}`;

  const slugify = (text: string) => {
    if (!text) return '';
    return text.toString().toLowerCase().replace(/[^\w一-鿿]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const wrap = (el: keyof HTMLElementTagNameMap) =>
    ({ children, ...props }: any) => {
      const Tag = el;
      const extra: any = {};
      if (!noDataPid) extra['data-p-id'] = getPId();
      // Add id for heading elements (h1-h4) for TOC linking
      if (['h1','h2','h3','h4'].includes(el) && children) {
        const text = typeof children === 'string' ? children : Array.isArray(children) ? children.join('') : '';
        const id = slugify(text);
        if (id) extra.id = id;
      }
      return <Tag {...extra} {...props}>{children}</Tag>;
    };

  const theme = useUIStore(s => s.theme);
  const isLight = theme !== 'dark';

  const CodeBlock = ({ children, className }: any) => {
    const [copied, setCopied] = useState(false);
    const match = /language-(\w+)/.exec(className || '');
    const code = String(children).replace(/\n$/, '');
    const lightStyle = { ...oneLight, 'pre[class*="language-"]': { ...oneLight['pre[class*="language-"]'], background: '#f1f5f9' } };
    return (
      <div className="relative group my-6 -mx-4">
        <div className={`flex items-center justify-between px-5 py-2 rounded-t-xl text-xs font-mono ${isLight ? 'bg-slate-300 text-slate-500' : 'bg-slate-800 text-slate-400'}`}>
          <span>{match ? match[1] : 'code'}</span>
          <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className={`bg-transparent border-none cursor-pointer text-xs transition-colors ${isLight ? 'text-slate-500 hover:text-slate-700' : 'text-slate-400 hover:text-white'}`}>
            {copied ? '已复制' : '复制'}
          </button>
        </div>
        <SyntaxHighlighter
          style={isLight ? lightStyle : oneDark}
          language={match ? match[1] : 'text'}
          PreTag="div"
          customStyle={{ margin: 0, borderRadius: '0 0 0.75rem 0.75rem', padding: '1.25rem', fontSize: '0.8rem', lineHeight: '1.6' }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    );
  };

  const components: any = {
    hr: () => <hr className="my-6 border-t border-black/10 dark:border-white/10" />,
    pre: ({ children }: any) => <>{children}</>,
    code: ({ children, className, ...props }: any) => {
      const isInline = !className;
      if (isInline) return <code className="bg-slate-100 dark:bg-slate-800 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded text-sm" {...props}>{children}</code>;
      return <CodeBlock className={className}>{children}</CodeBlock>;
    },
    img: onImageClick
      ? ({ src, alt, ...props }: any) => (
          <img src={src} alt={alt || ''} {...props} className="cursor-zoom-in hover:opacity-90 transition-opacity rounded-lg" onClick={() => onImageClick(src, alt || '')} />
        )
      : undefined,
  };
  if (!noDataPid) {
    Object.assign(components, {
      p: wrap('p'),
      h1: wrap('h1'),
      h2: wrap('h2'),
      h3: wrap('h3'),
      h4: wrap('h4'),
      blockquote: wrap('blockquote'),
      li: wrap('li'),
    });
  }

  return (
    <div className={`${proseClasses} ${compact ? 'prose-sm' : ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

export default MarkdownRenderer;
