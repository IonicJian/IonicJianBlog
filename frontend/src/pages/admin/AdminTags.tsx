import { Trash } from '@phosphor-icons/react'
import { useEffect, useState, type FormEvent } from 'react'
import { createTag, deleteTag, listTags } from '@/api/blogs'
import { extractMessage } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import type { Tag } from '@/types/tag'

export function AdminTags() {
  const [tags, setTags] = useState<Tag[]>([])
  const [name, setName] = useState('')
  const [color, setColor] = useState('#0ea5e9')
  const [creating, setCreating] = useState(false)

  const load = () => listTags().then(setTags)
  useEffect(() => {
    load()
  }, [])

  const create = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setCreating(true)
    try {
      await createTag({ name: name.trim(), color })
      setName('')
      load()
      toast.success('已创建')
    } catch (err) {
      toast.error(extractMessage(err))
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('删除这个标签?')) return
    try {
      await deleteTag(id)
      load()
      toast.success('已删除')
    } catch (err) {
      toast.error(extractMessage(err))
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={create}
        className="flex flex-wrap items-center gap-2 rounded-2xl bg-white p-4 outline outline-1 outline-gray-950/5 dark:bg-gray-950 dark:outline-white/10"
      >
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="新标签名"
          className="flex-1"
        />
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-10 w-12 rounded-4xl border-0 bg-transparent"
          aria-label="标签颜色"
        />
        <Button type="submit" size="sm" disabled={creating || !name.trim()}>
          新建
        </Button>
      </form>

      <div className="rounded-2xl bg-white p-4 outline outline-1 outline-gray-950/5 dark:bg-gray-950 dark:outline-white/10">
        {tags.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
            暂无标签
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t.id}
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  backgroundColor: `${t.color}20`,
                  color: t.color,
                }}
              >
                {t.name}
                <button
                  type="button"
                  onClick={() => handleDelete(t.id)}
                  className="hover:opacity-70"
                  aria-label="删除"
                >
                  <Trash size={12} weight="regular" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
