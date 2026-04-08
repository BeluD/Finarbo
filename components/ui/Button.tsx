import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'tonal' | 'outline' | 'ghost' | 'danger'
  size?:    'default' | 'sm'
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'filled', size = 'default', fullWidth, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'btn',
          `btn-${variant}`,
          size === 'sm' && 'btn-sm',
          fullWidth && 'w-full justify-center',
          className,
        )}
        style={fullWidth ? { width: '100%', justifyContent: 'center' } : undefined}
        {...props}
      >
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
