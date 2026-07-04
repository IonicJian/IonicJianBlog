import { PencilSimple, Plus, Trash } from '@phosphor-icons/react'
import { useEffect, useState, type FormEvent } from 'react'
import {
  createFriendLink,
  deleteFriendLink,
  listFriendLinks,
  updateFriendLink,
} from '@/api/social'
import { extractMessage } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import type { FriendLink } from '@/types/social'

interface EditorProps {
  link: FriendLink | null
  onDone: () => void
  onCancel: () => void
}

function FriendLinkEditor({ link, onDone, onCancel }: EditorProps) {
  const [name, setName] = useState(link?.name || '')
  const [url, setUrl] = useState(link?.url || '')
  const [description, setDescription] = useState(link?.description || '')
  const [logoUrl, setLogoUrl] = useState(link?.logo_url || '')
  const [saving, setSaving] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = {
        name,
        url,
        description: description || undefined,
        logo_url: logoUrl || undefined,
        sort_order: link?.sort_order || 0,
      }
      if (link) await updateFriendLink(link.id, data)
      else await createFriendLink(data)
      toast.success(link ? '已更新' : '已创建')
      onDone()
    } catch (err) {
      toast.error(extractMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mb-4 flex flex-col gap-3 rounded-2xl bg-white p-5 outline outline-1 outline-gray-950/5 dark:bg-gray-950 dark:outline-white/10"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="fl-name">名称</Label>
          <Input
            id="fl-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="fl-url">URL</Label>
          <Input
            id="fl-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://"
            required
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="fl-desc">描述</Label>
        <Textarea
          id="fl-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="fl-logo">头像 URL</Label>
        <Input
          id="fl-logo"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? '保存中...' : '保存'}
        </Button>
      </div>
    </form>
  )
}

export function AdminFriendLinks() {
  const [links, setLinks] = useState<FriendLink[]>([])
  const [editing, setEditing] = useState<FriendLink | null>(null)
  const [showForm, setShowForm] = useState(false)

  const load = () => listFriendLinks().then(setLinks)
  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (id: number) => {
    if (!window.confirm('删除这个友链?')) return
    try {
      await deleteFriendLink(id)
      toast.success('已删除')
      load()
    } catch (e) {
      toast.error(extractMessage(e))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-xl font-medium tracking-tight text-gray-950 dark:text-white">
          友链
        </h2>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null)
            setShowForm(true)
          }}
        >
          <Plus size={14} weight="regular" />
          新建
        </Button>
      </div>
      {showForm && (
        <FriendLinkEditor
          link={editing}
          onDone={() => {
            setShowForm(false)
            setEditing(null)
            load()
          }}
          onCancel={() => {
            setShowForm(false)
            setEditing(null)
          }}
        />
      )}
      <div className="overflow-hidden rounded-2xl bg-white outline outline-1 outline-gray-950/5 dark:bg-gray-950 dark:outline-white/10">
        {links.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            暂无友链
          </p>
        ) : (
          links.map((l) => (
            <div
              key={l.id}
              className="flex items-center justify-between border-b border-gray-950/5 px-4 py-3 last:border-0 dark:border-white/10"
            >
              <div className="min-w-0 flex-1">
                <a
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-gray-950 transition-colors hover:text-sky-500 dark:text-white"
                >
                  {l.name}
                </a>
                {l.description && (
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {l.description}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditing(l)
                    setShowForm(true)
                  }}
                >
                  <PencilSimple size={14} weight="regular" />
                  编辑
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  onClick={() => handleDelete(l.id)}
                >
                  <Trash size={14} weight="regular" />
                  删除
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
