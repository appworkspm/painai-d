import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> & {
    /**
     * Optional class name for the item
     */
    className?: string;
    /**
     * Whether to show a border around the item
     * @default true
     */
    bordered?: boolean;
  }
>(({ className, bordered = true, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(
      'overflow-hidden',
      bordered && 'border-b border-border last:border-b-0',
      className
    )}
    {...props}
  />
));
AccordionItem.displayName = 'AccordionItem';

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & {
    /**
     * Optional class name for the trigger
     */
    className?: string;
    /**
     * Whether to show a chevron icon
     * @default true
     */
    showChevron?: boolean;
    /**
     * Optional left icon or content
     */
    leftIcon?: React.ReactNode;
    /**
     * Optional right content (e.g., badge, status)
     */
    rightContent?: React.ReactNode;
    /**
     * Whether to take up the full width of the container
     * @default true
     */
    fullWidth?: boolean;
    /**
     * The variant of the accordion trigger
     * @default 'default'
     */
    variant?: 'default' | 'ghost' | 'filled';
  }
>(
  (
    {
      className,
      children,
      showChevron = true,
      leftIcon,
      rightContent,
      fullWidth = true,
      variant = 'default',
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      default: 'hover:bg-muted/50',
      ghost: 'hover:bg-transparent',
      filled: 'bg-muted/50 hover:bg-muted',
    };

    return (
      <AccordionPrimitive.Header className="flex">
        <AccordionPrimitive.Trigger
          ref={ref}
          className={cn(
            'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180',
            variantClasses[variant],
            fullWidth ? 'w-full' : 'w-auto',
            'px-4',
            className
          )}
          {...props}
        >
          <div className="flex items-center space-x-2">
            {leftIcon && (
              <span className="flex h-5 w-5 items-center justify-center">
                {leftIcon}
              </span>
            )}
            {children}
          </div>
          <div className="flex items-center space-x-2">
            {rightContent && (
              <div className="text-sm font-normal text-muted-foreground">
                {rightContent}
              </div>
            )}
            {showChevron && (
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
            )}
          </div>
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
    );
  }
);
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> & {
    /**
     * Optional class name for the content
     */
    className?: string;
    /**
     * Whether to add padding to the content
     * @default true
     */
    padded?: boolean;
  }
>(({ className, children, padded = true, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      'overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
      padded && 'pb-4',
      className
    )}
    {...props}
  >
    <div className={cn(padded && 'px-4 pb-1')}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

// Type for the compound component
type AccordionComponent = React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root> &
    React.RefAttributes<React.ElementRef<typeof AccordionPrimitive.Root>>
> & {
  Item: typeof AccordionItem;
  Trigger: typeof AccordionTrigger;
  Content: typeof AccordionContent;
};

const AccordionComponent = Accordion as AccordionComponent;
AccordionComponent.Item = AccordionItem;
AccordionComponent.Trigger = AccordionTrigger;
AccordionComponent.Content = AccordionContent;

export { AccordionComponent as Accordion };

// Add the following to your global CSS file (e.g., index.css):
/*
@keyframes accordion-down {
  from {
    height: 0;
    opacity: 0;
  }
  to {
    height: var(--radix-accordion-content-height);
    opacity: 1;
  }
}

@keyframes accordion-up {
  from {
    height: var(--radix-accordion-content-height);
    opacity: 1;
  }
  to {
    height: 0;
    opacity: 0;
  }
}
*/

// Usage Example:
/*
function ExampleAccordion() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <Accordion.Item value="item-1">
        <Accordion.Trigger>
          Is it accessible?
        </Accordion.Trigger>
        <Accordion.Content>
          Yes. It adheres to the WAI-ARIA design pattern.
        </Accordion.Content>
      </Accordion.Item>
      
      <Accordion.Item value="item-2">
        <Accordion.Trigger
          leftIcon={<Info className="h-4 w-4 text-blue-500" />}
          rightContent={
            <Badge variant="outline" className="ml-2">
              New
            </Badge>
          }
        >
          What are the benefits?
        </Accordion.Trigger>
        <Accordion.Content>
          <ul className="list-disc pl-5 space-y-2">
            <li>Keyboard navigation support</li>
            <li>Animated transitions</li>
            <li>Fully customizable styling</li>
            <li>Accessibility features</li>
          </ul>
        </Accordion.Content>
      </Accordion.Item>
      
      <Accordion.Item value="item-3">
        <Accordion.Trigger variant="filled">
          How do I use it?
        </Accordion.Trigger>
        <Accordion.Content>
          <div className="space-y-2">
            <p>1. Import the Accordion component:</p>
            <pre className="bg-muted p-2 rounded text-sm overflow-x-auto">
              {`import { Accordion } from '@/components/ui/accordion';`}
            </pre>
            <p>2. Use it in your component:</p>
            <pre className="bg-muted p-2 rounded text-sm overflow-x-auto">
              {`<Accordion type="single" collapsible>
  <Accordion.Item value="item-1">
    <Accordion.Trigger>Title</Accordion.Trigger>
    <Accordion.Content>Content</Accordion.Content>
  </Accordion.Item>
</Accordion>`}
            </pre>
          </div>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}
*/
