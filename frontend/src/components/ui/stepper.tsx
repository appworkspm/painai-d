import * as React from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type Step = {
  /**
   * Unique identifier for the step
   */
  id: string;
  /**
   * The title of the step
   */
  title: string;
  /**
   * Optional description for the step
   */
  description?: string;
  /**
   * Optional icon to display for the step
   */
  icon?: React.ReactNode;
  /**
   * Whether the step is optional
   */
  optional?: boolean;
};

type StepperProps = {
  /**
   * Array of step objects
   */
  steps: Step[];
  /**
   * Current active step index (0-based)
   */
  activeStep: number;
  /**
   * Callback when a step is clicked
   */
  onStepClick?: (stepIndex: number) => void;
  /**
   * Custom class name for the stepper container
   */
  className?: string;
  /**
   * The orientation of the stepper
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Whether to show step numbers
   * @default true
   */
  showStepNumbers?: boolean;
  /**
   * Whether to show checkmarks for completed steps
   * @default true
   */
  showCheckmarks?: boolean;
  /**
   * Whether to show connecting lines between steps
   * @default true
   */
  showConnectors?: boolean;
  /**
   * Custom class name for the step connector
   */
  connectorClassName?: string;
  /**
   * Custom class name for the step content
   */
  contentClassName?: string;
};

/**
 * A stepper component to guide users through a multi-step process
 */
function Stepper({
  steps,
  activeStep,
  onStepClick,
  className,
  orientation = 'horizontal',
  showStepNumbers = true,
  showCheckmarks = true,
  showConnectors = true,
  connectorClassName,
  contentClassName,
}: StepperProps) {
  const isVertical = orientation === 'vertical';
  const isInteractive = typeof onStepClick === 'function';

  const getStepStatus = (index: number) => {
    if (index < activeStep) return 'completed';
    if (index === activeStep) return 'active';
    return 'inactive';
  };

  const StepContent = ({ step, index, status }: { step: Step; index: number; status: string }) => (
    <div
      className={cn(
        'flex items-start',
        isVertical ? 'flex-col' : 'flex-row',
        status === 'active' ? 'font-medium' : 'text-muted-foreground',
        isInteractive && 'cursor-pointer',
        contentClassName
      )}
      onClick={() => isInteractive && onStepClick(index)}
    >
      <div className="flex items-center">
        <div
          className={cn(
            'flex items-center justify-center rounded-full border-2 h-8 w-8 shrink-0',
            status === 'completed' && 'bg-primary border-primary text-primary-foreground',
            status === 'active' && 'border-primary',
            status === 'inactive' && 'border-muted-foreground/25',
            status === 'completed' && showCheckmarks && 'bg-primary text-primary-foreground'
          )}
        >
          {status === 'completed' && showCheckmarks ? (
            <Check className="h-4 w-4" />
          ) : showStepNumbers ? (
            <span className="text-sm font-medium">{index + 1}</span>
          ) : step.icon ? (
            <span className="h-4 w-4">{step.icon}</span>
          ) : null}
        </div>
        
        {!isVertical && index < steps.length - 1 && showConnectors && (
          <div
            className={cn(
              'h-0.5 w-8 mx-2',
              status === 'completed' ? 'bg-primary' : 'bg-muted',
              connectorClassName
            )}
          />
        )}
      </div>
      
      <div className={cn('mt-2', !isVertical && 'ml-3')}>
        <div className="flex items-center">
          <h3 className="text-sm font-medium">{step.title}</h3>
          {step.optional && (
            <span className="ml-2 text-xs text-muted-foreground">(Optional)</span>
          )}
        </div>
        {step.description && (
          <p className="text-xs text-muted-foreground">{step.description}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'flex',
          isVertical ? 'flex-col space-y-6' : 'flex-row items-center justify-between',
          isVertical && showConnectors && 'relative'
        )}
      >
        {isVertical && showConnectors && (
          <div
            className={cn(
              'absolute left-4 top-0 bottom-0 w-0.5 -translate-x-1/2',
              'bg-muted',
              connectorClassName
            )}
            style={{
              height: `calc(100% - ${steps.length * 12}px)`,
              top: '24px',
            }}
          />
        )}
        
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isLast = index === steps.length - 1;
          
          return (
            <React.Fragment key={step.id}>
              <StepContent step={step} index={index} status={status} />
              
              {isVertical && !isLast && showConnectors && (
                <div
                  className={cn(
                    'h-4 w-0.5 mx-auto',
                    status === 'completed' ? 'bg-primary' : 'bg-muted',
                    connectorClassName
                  )}
                />
              )}
              
              {!isVertical && !isLast && showConnectors && (
                <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

type StepperVerticalProps = Omit<StepperProps, 'orientation'>;

/**
 * A vertical variant of the Stepper component
 */
function StepperVertical(props: StepperVerticalProps) {
  return <Stepper {...props} orientation="vertical" />;
}

export { Stepper, StepperVertical };

// Usage Example:
/*
function ExampleStepper() {
  const [activeStep, setActiveStep] = React.useState(0);
  
  const steps = [
    {
      id: 'step-1',
      title: 'Account Information',
      description: 'Enter your account details',
    },
    {
      id: 'step-2',
      title: 'Personal Information',
      description: 'Tell us about yourself',
    },
    {
      id: 'step-3',
      title: 'Preferences',
      description: 'Customize your experience',
      optional: true,
    },
    {
      id: 'step-4',
      title: 'Review',
      description: 'Confirm your information',
    },
  ];
  
  const handleStepClick = (stepIndex: number) => {
    // Only allow clicking on completed steps or the next step
    if (stepIndex <= activeStep || stepIndex === activeStep + 1) {
      setActiveStep(stepIndex);
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="p-6 border rounded-lg">
        <h2 className="text-xl font-semibold mb-6">Checkout</h2>
        
        <Stepper
          steps={steps}
          activeStep={activeStep}
          onStepClick={handleStepClick}
          className="mb-8"
        />
        
        <div className="mt-8 p-6 border rounded-lg bg-muted/20">
          {activeStep === 0 && (
            <div>
              <h3 className="text-lg font-medium mb-4">Account Information</h3>
              <p className="text-muted-foreground">
                Enter your account details to get started.
              </p>
            </div>
          )}
          
          {activeStep === 1 && (
            <div>
              <h3 className="text-lg font-medium mb-4">Personal Information</h3>
              <p className="text-muted-foreground">
                Tell us a bit about yourself.
              </p>
            </div>
          )}
          
          {activeStep === 2 && (
            <div>
              <h3 className="text-lg font-medium mb-4">Preferences</h3>
              <p className="text-muted-foreground">
                Customize your experience with our platform.
              </p>
            </div>
          )}
          
          {activeStep === 3 && (
            <div>
              <h3 className="text-lg font-medium mb-4">Review</h3>
              <p className="text-muted-foreground">
                Please review your information before submitting.
              </p>
            </div>
          )}
          
          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setActiveStep((prev) => Math.max(prev - 1, 0))}
              disabled={activeStep === 0}
            >
              Back
            </Button>
            
            {activeStep < steps.length - 1 ? (
              <Button onClick={() => setActiveStep((prev) => prev + 1)}>
                Next
              </Button>
            ) : (
              <Button>Submit</Button>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-6 border rounded-lg">
        <h2 className="text-xl font-semibold mb-6">Vertical Stepper</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <StepperVertical
            steps={steps}
            activeStep={activeStep}
            onStepClick={handleStepClick}
            className="md:col-span-1"
          />
          
          <div className="md:col-span-2 p-6 border rounded-lg bg-muted/20">
            <h3 className="text-lg font-medium mb-4">
              {steps[activeStep]?.title}
            </h3>
            <p className="text-muted-foreground">
              {steps[activeStep]?.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
*/
