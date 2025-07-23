import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface ErrorState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  statusCode?: number;
}

interface GlobalErrorHandlerProps {
  children: React.ReactNode;
}

export const GlobalErrorHandler: React.FC<GlobalErrorHandlerProps> = ({ children }) => {
  const [errorState, setErrorState] = useState<ErrorState>({ hasError: false });

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      setErrorState({
        hasError: true,
        error: event.error,
        statusCode: event.error?.status || 500
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      setErrorState({
        hasError: true,
        error: new Error(event.reason?.message || 'Unknown error'),
        statusCode: event.reason?.status || 500
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const handleRetry = () => {
    setErrorState({ hasError: false });
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleGoBack = () => {
    window.history.back();
  };

  if (errorState.hasError) {
    const { statusCode = 500 } = errorState;
    
    const getErrorMessage = () => {
      switch (statusCode) {
        case 404:
          return {
            title: 'ไม่พบหน้าเว็บ',
            message: 'หน้าที่คุณกำลังค้นหาไม่มีอยู่ในระบบ',
            icon: <AlertTriangle className="h-16 w-16 text-orange-500" />
          };
        case 403:
          return {
            title: 'ไม่มีสิทธิ์เข้าถึง',
            message: 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้',
            icon: <AlertTriangle className="h-16 w-16 text-red-500" />
          };
        case 500:
        default:
          return {
            title: 'เกิดข้อผิดพลาดในระบบ',
            message: 'ขออภัย เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง',
            icon: <AlertTriangle className="h-16 w-16 text-red-500" />
          };
      }
    };

    const errorInfo = getErrorMessage();

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <div className="p-8">
            <div className="flex justify-center mb-6">
              {errorInfo.icon}
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {errorInfo.title}
            </h1>
            
            <p className="text-gray-600 mb-8">
              {errorInfo.message}
            </p>

            <div className="space-y-3">
              <Button
                onClick={handleRetry}
                className="w-full flex items-center justify-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                ลองใหม่อีกครั้ง
              </Button>
              
              <Button
                onClick={handleGoBack}
                variant="outline"
                className="w-full flex items-center justify-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                กลับไปหน้าก่อนหน้า
              </Button>
              
              <Button
                onClick={handleGoHome}
                variant="outline"
                className="w-full flex items-center justify-center"
              >
                <Home className="h-4 w-4 mr-2" />
                กลับหน้าหลัก
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && errorState.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  ดูรายละเอียดข้อผิดพลาด (สำหรับนักพัฒนา)
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                  {errorState.error.stack}
                </pre>
              </details>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}; 