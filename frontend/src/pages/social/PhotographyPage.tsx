import { Camera as CameraIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Camera } from "@/components/decorations/Camera";
import {
  ImageLightbox,
  type LightboxImage,
} from "@/components/common/Lightbox";
import { listPhotos } from "@/api/photos";
import type { Photo } from "@/types/photo";

export function PhotographyPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    listPhotos()
      .then((p) => {
        if (!cancelled) setPhotos(p || []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const lightboxImages: LightboxImage[] = photos.map((p) => ({
    src: p.url,
    alt: p.title,
  }));

  return (
    <div className="relative mx-auto max-w-7xl">
      <div className="relative pt-32 px-4 sm:px-6">
        <div className="pointer-events-none absolute top-0 right-0 z-0 hidden w-[1080px] h-[675px] overflow-hidden lg:block">
          <Camera />
        </div>
        <div className="relative z-10">
          <h1 className="bp-line text-6xl tracking-tighter text-balance text-gray-950 sm:text-7xl lg:text-8xl dark:text-white">
            Photos
          </h1>
          <p className="mt-10 bp-line text-lg text-gray-500 dark:text-gray-400">
            光与影织成诗行
          </p>
        </div>
      </div>
      <div className="mt-12 px-4 sm:px-6">
        {photos.length === 0 ? (
          <div className="bp-line rounded-2xl p-12 text-center">
            <CameraIcon
              size={32}
              weight="regular"
              className="mx-auto text-gray-400"
            />
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              摄影作品整理中,敬请期待
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {photos.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setIndex(i);
                  setOpen(true);
                }}
                className="group relative aspect-square overflow-hidden rounded-2xl border border-gray-950/5 bg-gray-950/2 dark:border-white/10 dark:bg-white/5"
              >
                <img
                  src={p.url}
                  alt={p.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                {p.title && (
                  <span className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent p-2 text-left text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {p.title}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      <ImageLightbox
        open={open}
        index={index}
        images={lightboxImages}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
