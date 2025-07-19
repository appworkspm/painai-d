import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const progressVariants = cva(
  'h-2 w-full overflow-hidden rounded-full bg-muted',
  {
    variants: {
      variant: {
        default: 'bg-muted',
        primary: 'bg-primary/20',
        success: 'bg-success/20',
        warning: 'bg-warning/20',
        destructive: 'bg-destructive/20',
      },
      size: {
        default: 'h-2',
        sm: 'h-1.5',
        lg: 'h-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const progressIndicatorVariants = cva(
  'h-full rounded-full transition-all duration-300 ease-in-out',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        primary: 'bg-primary',
        success: 'bg-success',
        warning: 'bg-warning',
        destructive: 'bg-destructive',
      },
      striped: {
        true: 'bg-stripes bg-stripes-white/20',
      },
      animated: {
        true: 'animate-pulse',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

type ProgressProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof progressVariants> & {
    /**
     * The current progress value (0-100)
     */
    value: number;
    /**
     * Optional label to display with the progress bar
     */
    label?: string;
    /**
     * Whether to show the progress percentage
     * @default false
     */
    showPercentage?: boolean;
    /**
     * Whether to show a striped pattern on the progress bar
     * @default false
     */
    striped?: boolean;
    /**
     * Whether to animate the progress bar
     * @default false
     */
    animated?: boolean;
    /**
     * Optional class name for the progress indicator
     */
    indicatorClassName?: string;
    /**
     * Optional class name for the label container
     */
    labelClassName?: string;
  };

/**
 * A progress bar component that shows the completion status of a task
 */
function Progress({
  className,
  value,
  label,
  showPercentage = false,
  variant = 'default',
  size,
  striped = false,
  animated = false,
  indicatorClassName,
  labelClassName,
  ...props
}: ProgressProps) {
  // Ensure value is between 0 and 100
  const progressValue = Math.min(Math.max(Number(value) || 0, 0), 100);

  return (
    <div className={cn('w-full space-y-1', className)} {...props}>
      {(label || showPercentage) && (
        <div
          className={cn(
            'flex items-center justify-between text-sm',
            labelClassName
          )}
        >
          {label && <span className="text-muted-foreground">{label}</span>}
          {showPercentage && (
            <span className="font-medium text-foreground">
              {Math.round(progressValue)}%
            </span>
          )}
        </div>
      )}
      <div className={cn(progressVariants({ variant, size }))}>
        <div
          className={cn(
            progressIndicatorVariants({
              variant,
              striped,
              animated: animated && progressValue < 100,
            }),
            indicatorClassName
          )}
          style={{ width: `${progressValue}%` }}
          role="progressbar"
          aria-valuenow={progressValue}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

// Circular Progress Component
type CircularProgressProps = {
  /**
   * The current progress value (0-100)
   */
  value: number;
  /**
   * The size of the circular progress
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * The thickness of the progress ring
   * @default 3
   */
  thickness?: number;
  /**
   * The color of the progress ring
   * @default 'primary'
   */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
  /**
   * Whether to show the progress percentage
   * @default true
   */
  showPercentage?: boolean;
  /**
   * Optional label to display below the progress circle
   */
  label?: string;
  /**
   * Optional class name for the container
   */
  className?: string;
  /**
   * Optional class name for the circle background
   */
  circleBackgroundClassName?: string;
  /**
   * Optional class name for the progress circle
   */
  progressCircleClassName?: string;
  /**
   * Optional class name for the label
   */
  labelClassName?: string;
};

/**
 * A circular progress indicator component
 */
function CircularProgress({
  value,
  size = 'md',
  thickness = 3,
  variant = 'primary',
  showPercentage = true,
  label,
  className,
  circleBackgroundClassName,
  progressCircleClassName,
  labelClassName,
}: CircularProgressProps) {
  // Ensure value is between 0 and 100
  const progressValue = Math.min(Math.max(Number(value) || 0, 0), 100);
  
  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-20 w-20',
    xl: 'h-24 w-24',
  };
  
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };
  
  const variantClasses = {
    default: 'text-foreground',
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    destructive: 'text-destructive',
  };
  
  const radius = size === 'sm' ? 20 : size === 'lg' ? 35 : size === 'xl' ? 42 : 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progressValue / 100) * circumference;
  
  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className={cn('relative', sizeClasses[size])}>
        <svg
          className="h-full w-full"
          viewBox={`0 0 ${radius * 2 + thickness} ${radius * 2 + thickness}`}
        >
          {/* Background circle */}
          <circle
            className={cn('text-muted', circleBackgroundClassName)}
            strokeWidth={thickness}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={radius + thickness / 2}
            cy={radius + thickness / 2}
          />
          {/* Progress circle */}
          <circle
            className={cn(
              'transition-all duration-500 ease-in-out',
              variantClasses[variant],
              progressCircleClassName
            )}
            strokeWidth={thickness}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={radius + thickness / 2}
            cy={radius + thickness / 2}
            transform={`rotate(-90 ${radius + thickness / 2} ${radius + thickness / 2})`}
          />
        </svg>
        
        {showPercentage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn('font-medium', textSizeClasses[size], variantClasses[variant])}>
              {Math.round(progressValue)}%
            </span>
          </div>
        )}
      </div>
      
      {label && (
        <div className={cn('mt-2 text-center', labelClassName)}>
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
      )}
    </div>
  );
}

export { Progress, CircularProgress };

// Usage Example:
/*
function ExampleProgress() {
  const [progress, setProgress] = React.useState(13);
  
  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Default Progress</h3>
        <Progress value={progress} />
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">With Label and Percentage</h3>
        <Progress 
          value={progress} 
          label="Uploading files..." 
          showPercentage 
        />
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Different Variants</h3>
        <div className="space-y-4">
          <Progress value={20} variant="primary" />
          <Progress value={40} variant="success" />
          <Progress value={60} variant="warning" />
          <Progress value={80} variant="destructive" />
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Striped and Animated</h3>
        <Progress 
          value={75} 
          variant="primary" 
          striped 
          animated 
          showPercentage 
        />
      </div>
      
      <div className="space-y-8 pt-8">
        <h2 className="text-xl font-semibold">Circular Progress</h2>
        
        <div className="flex flex-wrap items-center justify-center gap-8">
          <CircularProgress 
            value={progress} 
            size="sm" 
            label="Small" 
          />
          <CircularProgress 
            value={progress} 
            size="md" 
            label="Medium" 
          />
          <CircularProgress 
            value={progress} 
            size="lg" 
            label="Large" 
          />
          <CircularProgress 
            value={progress} 
            size="xl" 
            label="Extra Large" 
          />
        </div>
        
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <CircularProgress 
            value={25} 
            variant="default"
            label="Default" 
          />
          <CircularProgress 
            value={50} 
            variant="primary"
            label="Primary" 
          />
          <CircularProgress 
            value={75} 
            variant="success"
            label="Success" 
          />
          <CircularProgress 
            value={90} 
            variant="warning"
            label="Warning" 
          />
          <CircularProgress 
            value={100} 
            variant="destructive"
            label="Destructive" 
          />
        </div>
      </div>
    </div>
  );
}
*/
