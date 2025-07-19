import * as React from 'react';
import { cn } from '@/lib/utils';

const Avatar = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    src?: string;
    alt?: string;
    fallback?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  }
>(({ className, src, alt, fallback, size = 'md', ...props }, ref) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
    '2xl': 'h-24 w-24 text-xl',
  };

  return (
    <span
      ref={ref}
      className={cn(
        'relative flex items-center justify-center overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt || 'Avatar'}
          className="h-full w-full object-cover"
        />
      ) : fallback ? (
        <span className="font-medium text-gray-600 dark:text-gray-300">
          {fallback}
        </span>
      ) : (
        <svg
          className="h-full w-full text-gray-400"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.67 0 8.997 1.701 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
    </span>
  );
});
Avatar.displayName = 'Avatar';

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement> & { asChild?: boolean }
>(({ className, ...props }, ref) => (
  <img
    ref={ref}
    className={cn('aspect-square h-full w-full', className)}
    {...props}
  />
));
AvatarImage.displayName = 'AvatarImage';

const AvatarFallback = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    delayMs?: number;
  }
>(({ className, delayMs, children, ...props }, ref) => {
  const [isVisible, setIsVisible] = React.useState(delayMs === undefined);

  React.useEffect(() => {
    if (delayMs === undefined) return;
    
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [delayMs]);

  return isVisible ? (
    <span
      ref={ref}
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800',
        className
      )}
      {...props}
    >
      {children}
    </span>
  ) : null;
});
AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarImage, AvatarFallback };
