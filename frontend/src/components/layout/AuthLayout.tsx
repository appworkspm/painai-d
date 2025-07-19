import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function AuthLayout() {
  const { user, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If user is already authenticated, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <main className="flex flex-1 flex-col">
        <div className="mx-auto flex w-full flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Painai Timesheet
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Sign in to your account to continue
              </p>
            </div>
            <div className="bg-white py-8 px-4 shadow dark:bg-gray-800 sm:rounded-lg sm:px-10">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
      <footer className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Painai. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
