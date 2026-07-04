import { Camera as CameraIcon } from "@phosphor-icons/react";
import { Camera } from "@/components/decorations/Camera";
import { useState } from "react";
import {
  ImageLightbox,
  type LightboxImage,
} from "@/components/common/Lightbox";

const PHOTOS: LightboxImage[] = [];

export function PhotographyPage() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="pointer-events-none absolute top-0 right-0 z-0 hidden w-[1080px] h-[675px] overflow-hidden lg:block">
        <Camera />
      </div>
      <div className="relative mt-24 px-4 sm:px-6">
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
        {PHOTOS.length === 0 ? (
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
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {PHOTOS.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setIndex(i);
                  setOpen(true);
                }}
                className="aspect-[4/3] overflow-hidden rounded-2xl border border-gray-950/5 bg-gray-950/2 dark:border-white/10 dark:bg-white/5"
              >
                <img
                  src={p.src}
                  alt={p.alt || ""}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
              </button>
            ))}
          </div>
        )}
      </div>
      <ImageLightbox
        open={open}
        index={index}
        images={PHOTOS}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
