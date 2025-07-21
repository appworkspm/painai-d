import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // สามารถ log error ไปยัง service ภายนอกได้ที่นี่
    console.error('Global ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
          <h1 className="text-3xl font-bold text-red-600 mb-4">เกิดข้อผิดพลาด!</h1>
          <p className="text-gray-700 dark:text-gray-200 mb-2">{this.state.error?.message || 'Something went wrong.'}</p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => window.location.reload()}>รีเฟรชหน้า</button>
        </div>
      );
    }
    return this.props.children;
  }
}
