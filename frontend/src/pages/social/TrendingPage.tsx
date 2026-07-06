import { GitFork, Sparkle, Star } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { getTrending } from "@/api/social";
import type { TrendingRepo } from "@/types/trending";

export function TrendingPage() {
  const [repos, setRepos] = useState<TrendingRepo[]>([]);
  const [overallSummary, setOverallSummary] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getTrending()
      .then((r) => {
        if (!cancelled) {
          setRepos(r?.repos || []);
          setOverallSummary(r?.overall_summary || "");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="pt-32 px-4 sm:px-6">
        <h1 className="bp-line text-6xl tracking-tighter text-balance text-gray-950 sm:text-7xl lg:text-8xl dark:text-white">
          GitHub Trending
        </h1>
        <p className="mt-10 bp-line text-lg text-gray-500 dark:text-gray-400">
          最近热门的 GitHub 仓库。
        </p>
        {overallSummary && (
          <div className="mt-8 rounded-xl border border-amber-500/20 bg-amber-50/50 px-5 py-4 dark:bg-amber-950/10">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
              <Sparkle size={14} weight="fill" />
              AI 趋势解读
            </div>
            <p className="mt-2 whitespace-pre-line text-sm leading-7 text-gray-700 dark:text-gray-300">
              {overallSummary}
            </p>
          </div>
        )}
      </div>
      <div className="mt-12">
        {loading ? (
          <p className="px-4 py-8 text-sm text-gray-500 sm:px-6 dark:text-gray-400">
            加载中...
          </p>
        ) : repos.length === 0 ? (
          <p className="px-4 py-8 text-sm text-gray-500 sm:px-6 dark:text-gray-400">
            暂无数据
          </p>
        ) : (
          <div className="bp-line">
            {repos.map((r) => (
              <a
                key={r.full_name}
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="bp-line block px-4 py-8 transition-colors hover:bg-gray-950/2.5 sm:px-6 dark:hover:bg-white/2.5"
              >
                <div className="grid gap-2 lg:grid-cols-[14rem_2.5rem_minmax(0,1fr)] lg:gap-0">
                  <div className="font-mono text-sm font-medium tracking-widest text-gray-500 uppercase">
                    {r.language || "—"}
                  </div>
                  <div className="hidden lg:block" />
                  <div className="lg:pl-2">
                    <span className="font-semibold text-gray-950 transition-colors hover:text-sky-500 dark:text-white">
                      {r.full_name}
                    </span>
                    {r.description && (
                      <p className="mt-4 line-clamp-2 leading-7 text-gray-600 dark:text-gray-300">
                        {r.description}
                      </p>
                    )}
                    {r.ai_commentary && (
                      <p className="mt-3 whitespace-pre-line border-l-2 border-amber-400/40 pl-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
                        {r.ai_commentary}
                      </p>
                    )}
                    <div className="mt-4 flex items-center gap-4 text-xs text-gray-500 tabular-nums dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Star size={12} weight="regular" />
                        {r.stars.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork size={12} weight="regular" />
                        {r.forks.toLocaleString()}
                      </span>
                      {r.current_period_stars > 0 && (
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                          <Star size={12} weight="fill" />
                          {r.current_period_stars.toLocaleString()} this week
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
