import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuthStore } from '../../store/authStore';
import { commentApi } from '../../api/comments';

interface Props {
  blogId: number;
  parentId?: number;
  placeholder?: string;
  onSuccess: () => void;
  onCancel?: () => void;
  quoteAnchor?: string | null;
  quoteText?: string | null;
}

const insertSyntax = (textarea: HTMLTextAreaElement, before: string, after: string) => {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const selected = text.slice(start, end);
  textarea.value = text.slice(0, start) + before + selected + after + text.slice(end);
  textarea.focus();
  textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
};

export default function CommentForm({ blogId, parentId, placeholder, onSuccess, onCancel, quoteAnchor, quoteText }: Props) {
  const { isAuthenticated } = useAuthStore();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!isAuthenticated) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500">
        请<a href="/login" className="text-blue-600 dark:text-blue-400 hover:underline mx-1">登录</a>后发表评论。
      </p>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await commentApi.create(blogId, {
        content: content.trim(),
        parent_id: parentId,
        anchor_start: quoteAnchor ?? undefined,
        anchor_text: quoteText ?? undefined,
      });
      setContent('');
      setPreview(false);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || '发送失败');
    } finally {
      setSubmitting(false);
    }
  };

  const toolbarBtn = (label: string, before: string, after = '') =>
    <button type="button" onClick={() => { if (textareaRef.current) insertSyntax(textareaRef.current, before, after); }}
      className="text-xs px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
    >{label}</button>;

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {error && <p className="text-red-500 text-xs">{error}</p>}

      {quoteText && (
        <blockquote className="border-l-3 border-blue-400 bg-blue-50 dark:bg-blue-950 dark:border-blue-600 pl-3 py-1.5 rounded-r text-sm text-gray-600 dark:text-gray-400 italic">
          {quoteText.length > 100 ? quoteText.slice(0, 100) + '...' : quoteText}
        </blockquote>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-1 flex-wrap">
        {toolbarBtn('B', '**', '**')}
        {toolbarBtn('I', '*', '*')}
        {toolbarBtn('`', '`', '`')}
        {toolbarBtn('~~', '~~', '~~')}
        {toolbarBtn('Link', '[', '](url)')}
        {toolbarBtn('> ', '> ')}
        {toolbarBtn('```', '\n```\n', '\n```\n')}
        <span className="flex-1" />
        <button type="button" onClick={() => setPreview(!preview)}
          className={`text-xs px-2 py-0.5 rounded border cursor-pointer ${preview ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 text-blue-700 dark:text-blue-300' : 'border-gray-200 dark:border-gray-600 text-gray-500'}`}>
          {preview ? '编辑' : '预览'}
        </button>
      </div>

      {/* Editor / Preview */}
      {preview ? (
        <div className="min-h-[80px] border border-gray-200 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 prose dark:prose-invert prose-sm max-w-none
          prose-a:text-blue-500 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:rounded prose-code:text-xs">
          {content ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            : <span className="text-gray-400">暂无内容</span>}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder || '写下你的评论... 支持 Markdown'}
          rows={parentId ? 2 : 3}
          className="w-full border border-gray-200 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
      )}

      <div className="flex items-center gap-2">
        <button type="submit" disabled={submitting || !content.trim()}
          className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
          {submitting ? '发送中...' : '发送'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-gray-500 text-sm hover:text-gray-700">取消</button>
        )}
      </div>
    </form>
  );
}
