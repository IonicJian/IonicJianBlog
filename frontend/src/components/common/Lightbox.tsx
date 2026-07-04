import { useEffect, useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

export interface LightboxImage {
  src: string
  alt?: string
}

interface LightboxProps {
  open: boolean
  index: number
  images: LightboxImage[]
  onClose: () => void
}

export function ImageLightbox({ open, index, images, onClose }: LightboxProps) {
  const [active, setActive] = useState(open)
  const [activeIndex, setActiveIndex] = useState(index)

  useEffect(() => setActive(open), [open])
  useEffect(() => setActiveIndex(index), [index])

  return (
    <Lightbox
      open={active}
      index={activeIndex}
      close={onClose}
      slides={images.map((img) => ({ src: img.src, alt: img.alt }))}
      on={{
        click: () => onClose(),
        view: ({ index: i }) => setActiveIndex(i),
      }}
      controller={{ closeOnBackdropClick: true }}
      styles={{
        container: { backgroundColor: 'rgba(0, 0, 0, 0.85)' },
      }}
    />
  )
}
