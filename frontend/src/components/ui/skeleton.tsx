import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const skeletonVariants = cva('animate-pulse bg-gray-200 dark:bg-gray-700', {
  variants: {
    variant: {
      default: 'rounded-md',
      circle: 'rounded-full',
      text: 'h-4 rounded',
      title: 'h-6 rounded-md w-3/4',
      subtitle: 'h-4 rounded-md w-1/2',
      paragraph: 'h-3 rounded w-full',
      button: 'h-10 rounded-md w-24',
      input: 'h-10 rounded-md w-full',
      card: 'rounded-lg h-32',
      image: 'aspect-video w-full rounded-lg',
      avatar: 'rounded-full h-10 w-10',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  /**
   * Optional class name for additional styling
   */
  className?: string;
  /**
   * Whether to show the skeleton loading animation
   * @default true
   */
  showAnimation?: boolean;
  /**
   * Number of skeleton items to render (for lists)
   * @default 1
   */
  count?: number;
  /**
   * Optional container class name when rendering multiple skeletons
   */
  containerClassName?: string;
}

/**
 * A simple loading skeleton component that can be used to indicate content is loading.
 * Supports various shapes and animations.
 */
function Skeleton({
  className,
  variant,
  showAnimation = true,
  count = 1,
  containerClassName,
  ...props
}: SkeletonProps) {
  const skeletons = Array.from({ length: count }).map((_, index) => (
    <div
      key={index}
      className={cn(
        skeletonVariants({ variant }),
        {
          'animate-pulse': showAnimation,
        },
        className
      )}
      {...props}
    />
  ));

  if (count > 1) {
    return <div className={cn('space-y-2', containerClassName)}>{skeletons}</div>;
  }

  return skeletons[0];
}

/**
 * A compound component for building more complex skeleton loaders
 */
const SkeletonLoader = {
  /**
   * Main Skeleton component
   */
  Root: Skeleton,
  
  /**
   * Skeleton for card components
   */
  Card: ({ className, ...props }: SkeletonProps) => (
    <div
      className={cn(
        'space-y-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700',
        className
      )}
      {...props}
    >
      <Skeleton variant="title" className="w-3/4" />
      <Skeleton variant="subtitle" className="w-1/2" />
      <div className="space-y-2 pt-2">
        <Skeleton variant="paragraph" />
        <Skeleton variant="paragraph" className="w-5/6" />
      </div>
    </div>
  ),
  
  /**
   * Skeleton for form elements
   */
  Form: ({ className, ...props }: SkeletonProps) => (
    <div className={cn('space-y-4', className)} {...props}>
      <div className="space-y-2">
        <Skeleton variant="subtitle" className="w-1/4" />
        <Skeleton variant="input" />
      </div>
      <div className="space-y-2">
        <Skeleton variant="subtitle" className="w-1/4" />
        <Skeleton variant="input" />
      </div>
      <Skeleton variant="button" className="mt-4" />
    </div>
  ),
  
  /**
   * Skeleton for table rows
   */
  Table: ({ rows = 4, className, ...props }: SkeletonProps & { rows?: number }) => (
    <div className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton variant="paragraph" className="h-12 w-12" />
          <Skeleton variant="paragraph" className="h-4 flex-1" />
          <Skeleton variant="paragraph" className="h-4 w-1/4" />
          <Skeleton variant="paragraph" className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  ),
};

export { Skeleton, SkeletonLoader };
