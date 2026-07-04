import { useState } from 'react'
import { createCategory, createTag } from '@/api/blogs'
import { extractMessage } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Category } from '@/types/category'
import type { Tag } from '@/types/tag'

const selectClass =
  'h-9 rounded-md border border-border bg-card px-3 text-sm focus:border-primary focus:ring-2 focus:ring-ring focus:outline-none'

interface FlatCategory {
  id: number
  name: string
  depth: number
}

function flatten(cats: Category[], depth = 0): FlatCategory[] {
  return cats.flatMap((c) => [
    { id: c.id, name: c.name, depth },
    ...flatten(c.children || [], depth + 1),
  ])
}

interface CategoryPickerProps {
  categories: Category[]
  selected: number | ''
  onSelect: (id: number | '') => void
  onCreated: () => void
}

export function CategoryPicker({
  categories,
  selected,
  onSelect,
  onCreated,
}: CategoryPickerProps) {
  const [newName, setNewName] = useState('')
  const [parentId, setParentId] = useState<number | ''>('')
  const [creating, setCreating] = useState(false)
  const flat = flatten(categories)

  const create = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      await createCategory({
        name: newName.trim(),
        parent_id: parentId || undefined,
      })
      setNewName('')
      setParentId('')
      onCreated()
      toast.success('分类已创建')
    } catch (err) {
      toast.error(extractMessage(err))
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        分类
      </p>
      <select
        value={selected}
        onChange={(e) => onSelect(e.target.value ? Number(e.target.value) : '')}
        className={selectClass}
      >
        <option value="">无分类</option>
        {flat.map((c) => (
          <option key={c.id} value={c.id}>
            {' '.repeat(c.depth * 2)}
            {c.name}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="新分类名"
          className="flex-1"
        />
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : '')}
          className={selectClass}
        >
          <option value="">顶级</option>
          {flat.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <Button
          variant="outline"
          size="sm"
          onClick={create}
          disabled={creating || !newName.trim()}
        >
          新建
        </Button>
      </div>
    </div>
  )
}

interface TagPickerProps {
  tags: Tag[]
  selected: number[]
  onToggle: (id: number) => void
  onCreated: () => void
}

export function TagPicker({
  tags,
  selected,
  onToggle,
  onCreated,
}: TagPickerProps) {
  const [newName, setNewName] = useState('')
  const [color, setColor] = useState('#625fff')
  const [creating, setCreating] = useState(false)

  const create = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      await createTag({ name: newName.trim(), color })
      setNewName('')
      onCreated()
      toast.success('标签已创建')
    } catch (err) {
      toast.error(extractMessage(err))
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        标签
      </p>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => {
          const active = selected.includes(t.id)
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onToggle(t.id)}
              className={cn(
                'rounded-md border px-2 py-0.5 text-xs transition-colors',
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              {t.name}
            </button>
          )
        })}
      </div>
      <div className="flex items-center gap-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="新标签"
          className="flex-1"
        />
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-9 w-9 rounded-md border border-border bg-card"
          aria-label="标签颜色"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={create}
          disabled={creating || !newName.trim()}
        >
          新建
        </Button>
      </div>
    </div>
  )
}
