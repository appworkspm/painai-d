import React from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleGoBack = () => {
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center">
            <div className="p-8">
              <div className="flex justify-center mb-6">
                <AlertTriangle className="h-16 w-16 text-red-500" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                เกิดข้อผิดพลาดในระบบ
              </h1>
              
              <p className="text-gray-600 mb-8">
                ขออภัย เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง
              </p>

              <div className="space-y-3">
                <Button
                  onClick={this.handleRetry}
                  className="w-full flex items-center justify-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  ลองใหม่อีกครั้ง
                </Button>
                
                <Button
                  onClick={this.handleGoBack}
                  variant="outline"
                  className="w-full flex items-center justify-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  กลับไปหน้าก่อนหน้า
                </Button>
                
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="w-full flex items-center justify-center"
                >
                  <Home className="h-4 w-4 mr-2" />
                  กลับหน้าหลัก
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    ดูรายละเอียดข้อผิดพลาด (สำหรับนักพัฒนา)
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                    {this.state.error.stack}
                  </pre>
                  {this.state.errorInfo && (
                    <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </details>
              )}
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
