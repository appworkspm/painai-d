# Painai Design System

A comprehensive design system for the Painai Timesheet Management System, built with React, TypeScript, and Tailwind CSS.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Design Tokens](#design-tokens)
3. [Theme](#theme)
4. [Components](#components)
5. [Utilities](#utilities)
6. [Best Practices](#best-practices)
7. [Contribution Guidelines](#contribution-guidelines)

## Getting Started

### Installation

```bash
# Install required dependencies
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge lucide-react framer-motion
```

### Setup

1. Wrap your application with the `ThemeProvider`:

```tsx
import { ThemeProvider } from './theme/ThemeProvider';

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <YourApp />
    </ThemeProvider>
  );
}
```

## Design Tokens

### Colors

| Name       | Usage                     |
|------------|---------------------------|
| primary    | Primary brand color       |
| success    | Success states            |
| warning    | Warning states            |
| error      | Error states              |
| gray       | Neutral colors            |
| background | Page background            |
| surface    | Card/panel backgrounds    |
| text       | Primary text              |
| textMuted  | Secondary/muted text      |
| border     | Borders and dividers      |

### Typography

- **Font Family**: Inter (system font stack fallback)
- **Base Font Size**: 16px (1rem)
- **Scale**: Uses a modular scale for consistent typography

### Spacing

Uses a 4px base unit with a consistent scale from 0.25rem to 16rem.

### Breakpoints

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## Theme

The theme system supports light and dark modes out of the box. You can access and modify the theme using the `useTheme` hook:

```tsx
import { useTheme } from '../theme/ThemeProvider';

function ThemeToggle() {
  const { mode, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      {mode === 'dark' ? '🌞' : '🌙'}
    </button>
  );
}
```

## Components

### Available Components

- `Button`: A versatile button component with multiple variants and sizes
- `Input`: Form input with label, description, and error states
- `Card`: Container component for content with header, content, and footer sections
- `LoadingSpinner`: Animated loading indicator
- `LoadingState`: Full-page loading state
- `ErrorState`: Error display with retry option
- `StatCard`: Card for displaying statistics

### Component Guidelines

1. **Consistent Props**:
   - `className` for custom styling
   - `variant` for different styles
   - `size` for different sizes
   - `disabled` and other standard HTML attributes

2. **Composition**: Components are built to be composed together

3. **Accessibility**: Components follow WAI-ARIA patterns

## Utilities

### Class Name Utilities

Use the `cn` utility for conditional class names:

```tsx
import { cn } from '../utils/cn';

function MyComponent({ className, isActive }) {
  return (
    <div className={cn(
      'base-class',
      isActive && 'active-class',
      className
    )}>
      Content
    </div>
  );
}
```

### Variant Utilities

Create type-safe variants with `class-variance-authority`:

```tsx
import { cva } from 'class-variance-authority';

const buttonVariants = cva('base-class', {
  variants: {
    variant: {
      primary: 'bg-primary text-white',
      secondary: 'bg-secondary text-white',
    },
    size: {
      sm: 'text-sm',
      md: 'text-base',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});
```

## Best Practices

### Styling

1. **Use Design Tokens**: Always use the provided design tokens for colors, spacing, etc.
2. **Responsive Design**: Use Tailwind's responsive prefixes
3. **Dark Mode**: Test components in both light and dark modes

### Component Development

1. **Composition**: Favor composition over inheritance
2. **Props**: Keep the API surface small and focused
3. **Documentation**: Document props and usage examples

## Contribution Guidelines

1. **Branch Naming**: `feature/component-name` or `fix/issue-description`
2. **Code Style**: Follow the existing code style and patterns
3. **Testing**: Add tests for new components
4. **Documentation**: Update relevant documentation
5. **Review**: Open a pull request for review

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
