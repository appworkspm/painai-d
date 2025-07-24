import React from 'react';
import Header from './Header';
import { Toaster } from '@/components/ui/sonner';

const SimpleLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 sm:p-6">
          {children}
        </main>
        <Toaster />
      </div>
    </div>
  );
};

export default SimpleLayout; 