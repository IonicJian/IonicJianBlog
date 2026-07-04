import MDEditor from '@uiw/react-md-editor'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createBlog, listCategories, listTags } from '@/api/blogs'
import { extractMessage } from '@/api/client'
import { ImageUploadButton } from '@/components/common/ImageUploadButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { toast } from 'sonner'
import type { BlogStatus } from '@/types/blog'
import type { Category } from '@/types/category'
import type { Tag } from '@/types/tag'
import { CategoryPicker, TagPicker } from './BlogEditors'

const selectClass =
  'h-9 rounded-md border border-border bg-card px-3 text-sm focus:border-primary focus:ring-2 focus:ring-ring focus:outline-none'

export function BlogCreatePage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const theme = useUIStore((s) => s.theme)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<BlogStatus>('draft')
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [tagIds, setTagIds] = useState<number[]>([])
  const [isTop, setIsTop] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    listCategories().then(setCategories).catch(() => {})
    listTags().then(setTags).catch(() => {})
  }, [])

  if (user && user.role !== 'admin') {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12 text-sm text-muted-foreground md:px-12">
        无权限访问
      </div>
    )
  }

  const submit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('标题和内容不能为空')
      return
    }
    setSaving(true)
    try {
      const blog = await createBlog({
        title: title.trim(),
        content,
        status,
        category_id: categoryId || undefined,
        tag_ids: tagIds,
        is_top: isTop,
      })
      toast.success('保存成功')
      navigate(`/blogs/${blog.id}`)
    } catch (err) {
      toast.error(extractMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const toggleTag = (id: number) => {
    setTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 md:px-12" data-color-mode={theme}>
      <h1 className="text-2xl font-semibold tracking-tight">写文章</h1>
      <div className="mt-6 flex flex-col gap-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="文章标题"
          className="h-11 text-base"
        />
        <div className="flex items-center gap-2">
          <ImageUploadButton onInsert={(md) => setContent((c) => c + md)} />
        </div>
        <MDEditor
          value={content}
          onChange={(v) => setContent(v || '')}
          height={500}
        />
        <CategoryPicker
          categories={categories}
          selected={categoryId}
          onSelect={setCategoryId}
          onCreated={() => listCategories().then(setCategories)}
        />
        <TagPicker
          tags={tags}
          selected={tagIds}
          onToggle={toggleTag}
          onCreated={() => listTags().then(setTags)}
        />
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as BlogStatus)}
            className={selectClass}
          >
            <option value="draft">草稿</option>
            <option value="published">发布</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={isTop}
              onChange={(e) => setIsTop(e.target.checked)}
            />
            置顶
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            取消
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>
    </div>
  )
}
