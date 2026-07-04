import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      'flex h-10 w-full rounded-4xl bg-white px-4 py-2 text-sm text-gray-950 outline outline-1 -outline-offset-1 outline-gray-950/10 placeholder:text-gray-950/50 focus:outline focus:outline-2 focus:outline-gray-950/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/10 dark:text-white dark:outline-white/15 dark:placeholder:text-white/50 dark:focus:outline-white/25',
      className,
    )}
    ref={ref}
    {...props}
  />
))
Input.displayName = 'Input'

export { Input }
