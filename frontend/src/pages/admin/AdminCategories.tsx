import { Trash } from '@phosphor-icons/react'
import { useEffect, useState, type FormEvent } from 'react'
import { createCategory, deleteCategory, listCategories } from '@/api/blogs'
import { extractMessage } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import type { Category } from '@/types/category'

function flatten(cats: Category[], depth = 0): { c: Category; depth: number }[] {
  return cats.flatMap((c) => [
    { c, depth },
    ...flatten(c.children || [], depth + 1),
  ])
}

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState('')
  const [creating, setCreating] = useState(false)

  const load = () => listCategories().then(setCategories)
  useEffect(() => {
    load()
  }, [])

  const flat = flatten(categories)

  const create = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setCreating(true)
    try {
      await createCategory({
        name: name.trim(),
        parent_id: parentId ? Number(parentId) : undefined,
      })
      setName('')
      setParentId('')
      load()
      toast.success('已创建')
    } catch (err) {
      toast.error(extractMessage(err))
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('删除这个分类?')) return
    try {
      await deleteCategory(id)
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
          placeholder="新分类名"
          className="flex-1"
        />
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className="h-10 rounded-4xl bg-white px-4 text-sm text-gray-950 outline outline-1 -outline-offset-1 outline-gray-950/10 dark:bg-white/10 dark:text-white dark:outline-white/15"
        >
          <option value="">顶级分类</option>
          {flat.map(({ c }) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <Button type="submit" size="sm" disabled={creating || !name.trim()}>
          新建
        </Button>
      </form>

      <div className="overflow-hidden rounded-2xl bg-white outline outline-1 outline-gray-950/5 dark:bg-gray-950 dark:outline-white/10">
        {flat.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            暂无分类
          </p>
        ) : (
          flat.map(({ c, depth }) => (
            <div
              key={c.id}
              className="flex items-center justify-between border-b border-gray-950/5 px-4 py-3 last:border-0 dark:border-white/10"
              style={{ paddingLeft: `${depth * 16 + 16}px` }}
            >
              <span className="text-sm font-medium text-gray-950 dark:text-white">
                {c.name}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(c.id)}
                className="flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-red-600 dark:text-gray-400"
              >
                <Trash size={14} weight="regular" />
                删除
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
