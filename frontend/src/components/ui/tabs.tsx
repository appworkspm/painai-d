import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    /**
     * The variant of the tabs
     * @default 'default'
     */
    variant?: 'default' | 'pills' | 'underline' | 'contained';
    /**
     * Whether to take up the full width of the container
     * @default false
     */
    fullWidth?: boolean;
    /**
     * The size of the tabs
     * @default 'md'
     */
    size?: 'sm' | 'md' | 'lg';
  }
>(({ className, variant = 'default', fullWidth = false, size = 'md', ...props }, ref) => {
  const variantClasses = {
    default: 'bg-muted text-muted-foreground',
    pills: 'bg-background p-1 rounded-lg',
    underline: 'border-b border-border',
    contained: 'bg-background border border-border rounded-lg',
  };

  const sizeClasses = {
    sm: 'h-8 text-xs',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base',
  };

  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-md',
        variantClasses[variant],
        fullWidth && 'w-full',
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    /**
     * The variant of the tab trigger
     * @default 'default'
     */
    variant?: 'default' | 'pills' | 'underline' | 'contained';
    /**
     * Whether to take up the full width of the container
     * @default false
     */
    fullWidth?: boolean;
    /**
     * The size of the tab trigger
     * @default 'md'
     */
    size?: 'sm' | 'md' | 'lg';
    /**
     * Optional left icon
     */
    leftIcon?: React.ReactNode;
    /**
     * Optional right icon
     */
    rightIcon?: React.ReactNode;
    /**
     * Optional badge count
     */
    badge?: number | string;
  }
>(
  (
    {
      className,
      variant = 'default',
      fullWidth = false,
      size = 'md',
      leftIcon,
      rightIcon,
      badge,
      children,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      default:
        'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
      pills:
        'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-md',
      underline:
        'data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground rounded-none',
      contained:
        'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm',
    };

    const sizeClasses = {
      sm: 'h-7 px-2 text-xs',
      md: 'h-9 px-3',
      lg: 'h-11 px-4 text-base',
    };

    return (
      <TabsPrimitive.Trigger
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          variantClasses[variant],
          fullWidth && 'flex-1',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {leftIcon && (
          <span className="mr-2 flex h-4 w-4 items-center justify-center">
            {leftIcon}
          </span>
        )}
        {children}
        {rightIcon && (
          <span className="ml-2 flex h-4 w-4 items-center justify-center">
            {rightIcon}
          </span>
        )}
        {badge !== undefined && (
          <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-xs font-medium text-primary dark:bg-primary/20">
            {badge}
          </span>
        )}
      </TabsPrimitive.Trigger>
    );
  }
);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> & {
    /**
     * Whether to add padding to the content
     * @default true
     */
    padded?: boolean;
  }
>(({ className, padded = true, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      padded && 'p-4',
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

// Tab Component with all sub-components
type TabsComponent = React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> &
    React.RefAttributes<React.ElementRef<typeof TabsPrimitive.Root>>
> & {
  List: typeof TabsList;
  Trigger: typeof TabsTrigger;
  Content: typeof TabsContent;
};

const TabsComponent = Tabs as TabsComponent;
TabsComponent.List = TabsList;
TabsComponent.Trigger = TabsTrigger;
TabsComponent.Content = TabsContent;

export { TabsComponent as Tabs };

// Usage Example:
/*
function ExampleTabs() {
  return (
    <Tabs defaultValue="account" className="w-[400px]">
      <Tabs.List variant="pills" fullWidth>
        <Tabs.Trigger value="account" leftIcon={<User className="h-4 w-4" />}>
          Account
        </Tabs.Trigger>
        <Tabs.Trigger value="password" leftIcon={<Lock className="h-4 w-4" />}>
          Password
        </Tabs.Trigger>
        <Tabs.Trigger 
          value="notifications" 
          leftIcon={<Bell className="h-4 w-4" />}
          badge={3}
        >
          Notifications
        </Tabs.Trigger>
      </Tabs.List>
      
      <Tabs.Content value="account">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Make changes to your account here. Click save when you're done.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue="John Doe" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="username">Username</Label>
              <Input id="username" defaultValue="@johndoe" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save changes</Button>
          </CardFooter>
        </Card>
      </Tabs.Content>
      
      <Tabs.Content value="password">
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your password here. After saving, you'll be logged out.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="current">Current password</Label>
              <Input id="current" type="password" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">New password</Label>
              <Input id="new" type="password" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save password</Button>
          </CardFooter>
        </Card>
      </Tabs.Content>
      
      <Tabs.Content value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Configure how you receive notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="email" className="flex flex-col space-y-1">
                <span>Email</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Receive emails about new features and updates.
                </span>
              </Label>
              <Switch id="email" defaultChecked />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="push" className="flex flex-col space-y-1">
                <span>Push notifications</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Receive push notifications on your device.
                </span>
              </Label>
              <Switch id="push" />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="sms" className="flex flex-col space-y-1">
                <span>SMS messages</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Receive text messages about important updates.
                </span>
              </Label>
              <Switch id="sms" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save preferences</Button>
          </CardFooter>
        </Card>
      </Tabs.Content>
    </Tabs>
  );
}
*/
