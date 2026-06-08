import { useState, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { commentApi } from '../../api/comments';
import MarkdownRenderer from '../common/MarkdownRenderer';
import { IconGitHub } from '../common/Icons';

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
  const draftKey = `comment_draft_${blogId}${parentId ? '_' + parentId : ''}`;
  const [content, setContent] = useState(() => localStorage.getItem(draftKey) || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);
  const [useMd, setUseMd] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Save draft on change
  const handleChange = (val: string) => {
    setContent(val);
    localStorage.setItem(draftKey, val || '');
  };

  const clearDraft = () => {
    localStorage.removeItem(draftKey);
    setContent('');
  };

  const saveAndLogin = (url: string) => {
    localStorage.setItem(draftKey, content);
    window.location.href = url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !content.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await commentApi.create(blogId, {
        content: content.trim(),
        parent_id: parentId,
        anchor_start: quoteAnchor ?? undefined,
        anchor_text: quoteText ?? undefined,
      });
      clearDraft();
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
      className="text-xs px-1.5 py-0.5 rounded border border-black/5/50 dark:border-white/10/50 bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-600 cursor-pointer"
    >{label}</button>;

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {error && <p className="text-red-500 text-xs">{error}</p>}

      {quoteText && (
        <blockquote className="border-l-3 border-blue-400 bg-blue-50 dark:bg-blue-950 dark:border-blue-600 pl-3 py-1.5 rounded-r text-sm text-slate-500 dark:text-slate-400 italic">
          {quoteText.length > 100 ? quoteText.slice(0, 100) + '...' : quoteText}
        </blockquote>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-1 flex-wrap">
        {useMd && <>
          {toolbarBtn('B', '**', '**')}
          {toolbarBtn('I', '*', '*')}
          {toolbarBtn('`', '`', '`')}
          {toolbarBtn('~~', '~~', '~~')}
          {toolbarBtn('Link', '[', '](url)')}
          {toolbarBtn('> ', '> ')}
          {toolbarBtn('```', '\n```\n', '\n```\n')}
        </>}
        <span className="flex-1" />
        {/* Markdown toggle */}
        <button type="button" onClick={() => setUseMd(!useMd)}
          className={`text-xs px-2 py-0.5 rounded border cursor-pointer transition-colors ${useMd ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 text-blue-700 dark:text-blue-300' : 'border-black/5 dark:border-white/10 text-slate-400 dark:text-slate-400'}`}
          title={useMd ? 'Markdown 已启用' : '纯文本模式'}>
          MD
        </button>
        <button type="button" onClick={() => setPreview(!preview)}
          className={`text-xs px-2 py-0.5 rounded border cursor-pointer ${preview ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 text-blue-700 dark:text-blue-300' : 'border-black/5 dark:border-white/10 text-slate-400'}`}>
          {preview ? '编辑' : '预览'}
        </button>
      </div>

      {/* Editor / Preview */}
      {preview ? (
        <div className="min-h-[80px] border border-black/5 dark:border-white/5 rounded-xl px-3 py-2 text-sm bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm">
          {content ? (
            useMd ? <MarkdownRenderer content={content} compact noDataPid />
            : <pre className="whitespace-pre-wrap font-sans text-sm text-slate-600 dark:text-slate-300 m-0">{content}</pre>
          ) : <span className="text-slate-400">暂无内容</span>}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={useMd ? (placeholder || '写下你的评论... 支持 Markdown') : (placeholder || '写下你的评论...')}
          rows={parentId ? 2 : 3}
          className="w-full border border-black/5 dark:border-white/5 rounded-xl px-3 py-2 text-sm bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm text-slate-800 dark:text-slate-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
      )}

      <div className="flex items-center gap-2">
        {isAuthenticated ? (
          <>
            <button type="submit" disabled={submitting || !content.trim()}
              className="btn-primary !py-1.5 !px-4 !text-xs text-sm hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
              {submitting ? '发送中...' : '发送'}
            </button>
            {onCancel && (
              <button type="button" onClick={onCancel} className="text-slate-400 text-sm hover:text-slate-600">取消</button>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">登录后发送：</span>
            <button type="button" onClick={() => saveAndLogin('/login')}
              className="btn-primary !py-1 !px-3 !text-xs cursor-pointer">登录</button>
            <button type="button" onClick={() => saveAndLogin('/api/v1/auth/github')}
              className="btn-ghost !py-1 !px-3 !text-xs !gap-1 cursor-pointer flex items-center gap-1">
              <IconGitHub className="w-3.5 h-3.5" />
              GitHub
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
