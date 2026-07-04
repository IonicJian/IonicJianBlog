import { useEffect, useState } from "react";
import { listFriendLinks } from "@/api/social";
import { GuestbookSection } from "./GuestbookSection";
import type { FriendLink } from "@/types/social";

function isSafeUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function FriendLinksPage() {
  const [links, setLinks] = useState<FriendLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listFriendLinks()
      .then(setLinks)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mt-24 px-4 sm:px-6">
        <h1 className="bp-line text-6xl tracking-tighter text-balance text-gray-950 sm:text-7xl lg:text-8xl dark:text-white">
          Friend Links
        </h1>
        <p className="mt-10 bp-line text-lg text-gray-500 dark:text-gray-400">
          欢迎留言交换友链呀
        </p>
      </div>
      <div className="mt-12">
        {loading ? (
          <p className="px-4 py-8 text-sm text-gray-500 sm:px-6 dark:text-gray-400">
            加载中...
          </p>
        ) : links.length === 0 ? (
          <p className="px-4 py-8 text-sm text-gray-500 sm:px-6 dark:text-gray-400">
            暂无友链
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-px border border-gray-950/5 bg-gray-950/5 sm:grid-cols-2 dark:border-white/10 dark:bg-white/10">
            {links.map((l) => (
              <div key={l.id} className="bg-white p-5 dark:bg-gray-950">
                <div className="flex items-center gap-3">
                  {isSafeUrl(l.logo_url) ? (
                    <img
                      src={l.logo_url}
                      alt={l.name}
                      className="h-10 w-10 shrink-0 rounded-full border border-gray-950/10 object-cover dark:border-white/10"
                    />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-950/5 text-sm font-medium dark:bg-white/10">
                      {l.name[0]}
                    </span>
                  )}
                  {isSafeUrl(l.url) ? (
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-gray-950 transition-colors hover:text-sky-500 dark:text-white"
                    >
                      {l.name}
                    </a>
                  ) : (
                    <span className="font-medium text-gray-950 dark:text-white">
                      {l.name}
                    </span>
                  )}
                </div>
                {l.description && (
                  <p className="mt-4 leading-7 text-gray-600 dark:text-gray-300">
                    {l.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <GuestbookSection />
    </div>
  );
}
