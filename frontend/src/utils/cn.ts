import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * A utility function to merge Tailwind CSS classes with clsx and tailwind-merge
 * @param inputs - Class values to be merged
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Creates a type-safe variant function for components with variants
 * @param config - The variants configuration object
 * @returns A function that returns the appropriate class names based on the variant props
 */
export function createVariants<T extends Record<string, Record<string, string>>>(config: T) {
  return function useVariants(
    base: string,
    variants: {
      [K in keyof T]?: keyof T[K];
    } = {}
  ) {
    const variantClasses = Object.entries(variants).map(([variant, value]) => {
      if (value && config[variant]?.[value as string]) {
        return config[variant][value as string];
      }
      return '';
    });

    return cn(base, ...variantClasses);
  };
}

/**
 * Creates a BEM (Block Element Modifier) class name generator
 * @param block - The block name
 * @returns An object with element and modifier generators
 */
export function createBEM(block: string) {
  return {
    b: () => block,
    e: (element: string) => `${block}__${element}`,
    m: (modifier: string) => `${block}--${modifier}`,
    em: (element: string, modifier: string) => 
      `${block}__${element}--${modifier}`,
  };
}

/**
 * Conditionally joins class names together
 * @param classes - An object where keys are class names and values are booleans
 * @returns A string of class names where the value is true
 */
export function classNames(
  classes: Record<string, boolean | undefined | null>
): string {
  return Object.entries(classes)
    .filter(([_, value]) => Boolean(value))
    .map(([key]) => key)
    .join(' ');
}

/**
 * Creates a memoized version of the class name merging function
 * @returns A memoized version of the cn function
 */
export function createMemoizedCn() {
  const cache = new Map<string, string>();
  
  return (...inputs: ClassValue[]): string => {
    const key = JSON.stringify(inputs);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = cn(...inputs);
    cache.set(key, result);
    return result;
  };
}

/**
 * A memoized version of the cn function
 */
export const mcn = createMemoizedCn();
