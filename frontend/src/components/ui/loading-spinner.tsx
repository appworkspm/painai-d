import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type LoadingSpinnerProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
};

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <Loader2
        className={cn(
          'animate-spin text-primary-600 dark:text-primary-400',
          sizeClasses[size]
        )}
        aria-hidden="true"
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
