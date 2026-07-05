import { Trash, UploadSimple } from '@phosphor-icons/react'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { deletePhoto, listPhotos, uploadPhoto } from '@/api/photos'
import { extractMessage } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import type { Photo } from '@/types/photo'

export function AdminPhotography() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [title, setTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = () => listPhotos().then((p) => setPhotos(p || []))
  useEffect(() => {
    load()
  }, [])

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await uploadPhoto(file, title)
      setTitle('')
      load()
      toast.success('已上传')
    } catch (err) {
      toast.error(extractMessage(err))
    } finally {
      setUploading(false)
    }
    e.target.value = ''
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('删除这张照片?')) return
    try {
      await deletePhoto(id)
      load()
      toast.success('已删除')
    } catch (err) {
      toast.error(extractMessage(err))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-xl font-medium tracking-tight text-gray-950 dark:text-white">
          摄影
        </h2>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
        <Button
          size="sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          <UploadSimple size={14} weight="regular" />
          {uploading ? '上传中...' : '上传'}
        </Button>
      </div>
      <div className="mb-6">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="标题(可选)"
        />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {(photos || []).map((p) => (
          <div
            key={p.id}
            className="group relative aspect-square overflow-hidden rounded-lg border border-gray-950/5 dark:border-white/10"
          >
            <img
              src={p.url}
              alt={p.title}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleDelete(p.id)}
              className="absolute top-2 right-2 rounded-md bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Trash size={14} weight="regular" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
