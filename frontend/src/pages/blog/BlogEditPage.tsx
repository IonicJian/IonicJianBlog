import MDEditor from '@uiw/react-md-editor'
import { Trash } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  deleteBlog,
  getBlog,
  listCategories,
  listTags,
  updateBlog,
} from '@/api/blogs'
import { extractMessage } from '@/api/client'
import { ImageUploadButton } from '@/components/common/ImageUploadButton'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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

export function BlogEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const theme = useUIStore((s) => s.theme)

  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<BlogStatus>('draft')
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [tagIds, setTagIds] = useState<number[]>([])
  const [isTop, setIsTop] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const blogId = Number(id)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    getBlog(blogId)
      .then((b) => {
        if (cancelled) return
        setTitle(b.title)
        setContent(b.content)
        setStatus(b.status)
        setCategoryId(b.category_id || '')
        setIsTop(b.is_top)
        setTagIds(b.tags?.map((t) => t.id) || [])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    listCategories().then(setCategories).catch(() => {})
    listTags().then(setTags).catch(() => {})
    return () => {
      cancelled = true
    }
  }, [blogId, id])

  if (user && user.role !== 'admin') {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12 text-sm text-muted-foreground md:px-12">
        无权限访问
      </div>
    )
  }
  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12 text-sm text-muted-foreground md:px-12">
        加载中...
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
      await updateBlog(blogId, {
        title: title.trim(),
        content,
        status,
        category_id: categoryId || undefined,
        tag_ids: tagIds,
        is_top: isTop,
      })
      toast.success('已更新')
      navigate(`/blogs/${blogId}`)
    } catch (err) {
      toast.error(extractMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteBlog(blogId)
      toast.success('已删除')
      navigate('/blogs')
    } catch (err) {
      toast.error(extractMessage(err))
    } finally {
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  const toggleTag = (tid: number) => {
    setTagIds((prev) =>
      prev.includes(tid) ? prev.filter((t) => t !== tid) : [...prev, tid],
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 md:px-12" data-color-mode={theme}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">编辑文章</h1>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash size={14} weight="regular" />
          删除
        </Button>
      </div>
      <div className="mt-6 flex flex-col gap-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="文章标题"
          className="h-11 text-base"
        />
        <ImageUploadButton onInsert={(md) => setContent((c) => c + md)} />
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
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除文章</DialogTitle>
            <DialogDescription>
              确定删除这篇文章吗?此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? '删除中...' : '删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
