import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'rounded-4xl bg-gray-950 px-4 py-2 text-sm/6 text-white hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600',
        outline:
          'rounded-4xl outline outline-1 -outline-offset-1 outline-gray-950/10 px-4 py-2 text-sm/6 text-gray-950 hover:bg-gray-950/5 dark:text-white dark:outline-white/10 dark:hover:bg-white/10',
        ghost:
          'rounded-md px-3 py-1.5 text-sm text-gray-950 hover:bg-gray-950/5 dark:text-white dark:hover:bg-white/10',
        secondary:
          'rounded-4xl bg-gray-950/5 px-4 py-2 text-sm/6 text-gray-950 hover:bg-gray-950/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15',
        destructive:
          'rounded-4xl bg-red-600 px-4 py-2 text-sm/6 text-white hover:bg-red-500',
        link: 'text-sky-500 underline-offset-4 hover:underline dark:text-sky-400',
      },
      size: {
        default: 'h-9',
        sm: 'h-8 text-xs',
        lg: 'h-11 text-base',
        icon: 'size-9 rounded-md',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
