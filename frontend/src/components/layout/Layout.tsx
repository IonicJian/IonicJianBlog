import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { Footer } from './Footer'
import { Header } from './Header'

const patternClass =
  'col-start-1 row-span-full row-start-1 hidden h-full bg-[image:repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-[size:10px_10px] border-gray-950/5 [--pattern-fg:rgb(0_0_0_/_0.05)] md:block dark:border-white/10 dark:[--pattern-fg:rgb(255_255_255_/_0.1)]'

function PageFallback() {
  return (
    <div className="px-4 py-24 text-sm text-gray-500 dark:text-gray-400 sm:px-6">
      加载中...
    </div>
  )
}

export function Layout() {
  return (
    <>
      <Header />
      <div className="grid min-h-dvh grid-cols-1 grid-rows-[1fr_auto] justify-center overflow-x-clip pt-14 [--gutter-width:2.5rem] md:grid-cols-[var(--gutter-width)_minmax(0,80rem)_var(--gutter-width)]">
        <aside aria-hidden className={`${patternClass} border-r`} />
        <main className="col-start-1 md:col-start-2">
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </main>
        <aside
          aria-hidden
          className={`${patternClass} border-l md:col-start-3`}
        />
        <div className="col-start-1 md:col-start-2">
          <Footer />
        </div>
      </div>
    </>
  )
}
