import React from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  sidebar?: React.ReactNode;
  fullWidth?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  className = '',
  header,
  footer,
  sidebar,
  fullWidth = false,
}) => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text">
      {/* Header */}
      {header && (
        <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/80 backdrop-blur supports-[backdrop-filter]:bg-surface/60">
          <div className={cn('container mx-auto px-4 h-16 flex items-center', {
            'max-w-7xl': !fullWidth,
          })}>
            {header}
          </div>
        </header>
      )}

      <div className="flex flex-1">
        {/* Sidebar */}
        {sidebar && (
          <aside className="hidden md:flex md:flex-shrink-0">
            <div className="flex flex-col w-64 border-r border-border bg-surface">
              {sidebar}
            </div>
          </aside>
        )}

        {/* Main content */}
        <main
          className={cn('flex-1 relative', {
            'overflow-y-auto': !fullWidth,
          })}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={cn('min-h-[calc(100vh-4rem)]', className, {
              'container mx-auto px-4 py-6': !fullWidth,
              'max-w-7xl': !fullWidth,
            })}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Footer */}
      {footer && (
        <footer className="border-t border-border bg-surface">
          <div className={cn('container mx-auto px-4 py-6', {
            'max-w-7xl': !fullWidth,
          })}>
            {footer}
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;
