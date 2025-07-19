import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// Tooltip with arrow component
const TooltipWithArrow = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className
    )}
    {...props}
  >
    {props.children}
    <TooltipPrimitive.Arrow className="fill-popover" />
  </TooltipPrimitive.Content>
));
TooltipWithArrow.displayName = 'TooltipWithArrow';

// Tooltip wrapper component
interface TooltipWrapperProps {
  /**
   * The content to show in the tooltip
   */
  content: React.ReactNode;
  /**
   * The element that triggers the tooltip
   */
  children: React.ReactElement;
  /**
   * Delay in milliseconds before showing the tooltip
   * @default 300
   */
  delayDuration?: number;
  /**
   * Whether to show an arrow pointing to the trigger element
   * @default true
   */
  showArrow?: boolean;
  /**
   * Optional CSS class for the tooltip content
   */
  className?: string;
  /**
   * The preferred side of the trigger to render the tooltip
   * @default 'top'
   */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /**
   * The preferred alignment of the tooltip relative to the trigger
   * @default 'center'
   */
  align?: 'start' | 'center' | 'end';
}

/**
 * A tooltip component that provides additional context when hovering over an element.
 */
function TooltipWrapper({
  content,
  children,
  delayDuration = 300,
  showArrow = true,
  className,
  side = 'top',
  align = 'center',
}: TooltipWrapperProps) {
  const ContentComponent = showArrow ? TooltipWithArrow : TooltipContent;

  return (
    <Tooltip delayDuration={delayDuration}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <ContentComponent side={side} align={align} className={className}>
        {content}
      </ContentComponent>
    </Tooltip>
  );
}

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  TooltipWithArrow,
  TooltipWrapper,
};
