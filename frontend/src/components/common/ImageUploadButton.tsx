import { ImageSquare } from '@phosphor-icons/react'
import { useRef, type ChangeEvent } from 'react'
import { uploadImage } from '@/api/blogs'
import { extractMessage } from '@/api/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ImageUploadButtonProps {
  onInsert: (markdown: string) => void
  className?: string
}

export function ImageUploadButton({
  onInsert,
  className,
}: ImageUploadButtonProps) {
  const ref = useRef<HTMLInputElement>(null)

  const handle = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const { url } = await uploadImage(file)
      onInsert(`\n\n![](${url})\n\n`)
      toast.success('图片已插入')
    } catch (err) {
      toast.error(extractMessage(err))
    }
    e.target.value = ''
  }

  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
          className,
        )}
        aria-label="上传图片"
        title="上传图片"
      >
        <ImageSquare size={18} weight="regular" />
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handle}
      />
    </>
  )
}
