import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  content: string;
}

const MarkdownRenderer = memo(function MarkdownRenderer({ content }: Props) {
  let pCounter = 0;
  const getPId = () => `p${++pCounter}`;

  return (
    <div className="prose dark:prose-invert prose-gray max-w-none
      prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-headings:font-semibold
      prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
      prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
      prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:text-pink-600 dark:prose-code:text-pink-400
      prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-4
      prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-950 prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:rounded-r dark:prose-blockquote:text-gray-300
      prose-img:rounded-lg prose-img:shadow-md
      prose-strong:text-gray-900 dark:prose-strong:text-gray-100
      prose-table:border-collapse
      prose-th:bg-gray-100 dark:prose-th:bg-gray-800 prose-th:px-4 prose-th:py-2 prose-th:text-left
      prose-td:border-t dark:prose-td:border-gray-700 prose-td:px-4 prose-td:py-2
    ">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children, ...props }) => <p data-p-id={getPId()} {...props}>{children}</p>,
          h1: ({ children, ...props }) => <h1 data-p-id={getPId()} {...props}>{children}</h1>,
          h2: ({ children, ...props }) => <h2 data-p-id={getPId()} {...props}>{children}</h2>,
          h3: ({ children, ...props }) => <h3 data-p-id={getPId()} {...props}>{children}</h3>,
          h4: ({ children, ...props }) => <h4 data-p-id={getPId()} {...props}>{children}</h4>,
          blockquote: ({ children, ...props }) => <blockquote data-p-id={getPId()} {...props}>{children}</blockquote>,
          li: ({ children, ...props }) => <li data-p-id={getPId()} {...props}>{children}</li>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

export default MarkdownRenderer;
