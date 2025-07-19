import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

type BadgeElement = HTMLDivElement | HTMLButtonElement;

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        success:
          'border-transparent bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50',
        warning:
          'border-transparent bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50',
        info: 'border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50',
        error:
          'border-transparent bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50',
      },
      size: {
        sm: 'h-5 px-1.5 text-xs',
        md: 'h-6 px-2 text-xs',
        lg: 'h-8 px-3 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

interface BadgeBaseProps extends VariantProps<typeof badgeVariants> {
  /**
   * Optional left icon to display in the badge
   */
  leftIcon?: React.ReactNode;
  /**
   * Optional right icon to display in the badge
   */
  rightIcon?: React.ReactNode;
  /**
   * Optional class name
   */
  className?: string;
  /**
   * Badge content
   */
  children: React.ReactNode;
}

type BadgeProps = BadgeBaseProps & (
  | (Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BadgeBaseProps> & { 
      onClick?: React.MouseEventHandler<HTMLButtonElement>;
    })
  | (Omit<React.HTMLAttributes<HTMLDivElement>, keyof BadgeBaseProps> & {
      onClick?: never;
    })
);

const Badge = React.forwardRef<BadgeElement, BadgeProps>(({
  className,
  variant,
  size,
  leftIcon,
  rightIcon,
  children,
  onClick,
  ...props
}, ref) => {
  const baseClasses = cn(
    badgeVariants({ variant, size }),
    {
      'cursor-pointer': !!onClick,
      'pl-1.5': leftIcon,
      'pr-1.5': rightIcon,
    },
    className
  );

  // If onClick is provided, render as button
  if (onClick) {
    const { type: _, ...buttonProps } = props as React.ButtonHTMLAttributes<HTMLButtonElement>;
    return (
      <button
        type="button"
        className={baseClasses}
        onClick={onClick}
        ref={ref as React.Ref<HTMLButtonElement>}
        {...buttonProps}
      >
        {leftIcon && <span className="mr-1">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-1">{rightIcon}</span>}
      </button>
    );
  }

  // Otherwise render as div
  const divProps = props as React.HTMLAttributes<HTMLDivElement>;
  return (
    <div
      className={baseClasses}
      ref={ref as React.Ref<HTMLDivElement>}
      {...divProps}
    >
      {leftIcon && <span className="mr-1">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-1">{rightIcon}</span>}
    </div>
  );
});

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
