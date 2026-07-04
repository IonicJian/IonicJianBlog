import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs/5 font-medium tabular-nums',
  {
    variants: {
      variant: {
        default: 'bg-gray-950/5 text-gray-950 dark:bg-white/10 dark:text-white',
        secondary:
          'bg-gray-950/2 text-gray-950 dark:bg-white/5 dark:text-white',
        outline:
          'outline outline-1 outline-gray-950/10 text-gray-950 dark:outline-white/10 dark:text-white',
        destructive: 'bg-red-600 text-white',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
