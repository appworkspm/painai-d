import { useNotification } from '../contexts/NotificationContext';

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: any;
}

export const handleApiError = (error: any, showNotification?: ReturnType<typeof useNotification>['showNotification']): ApiError => {
  let apiError: ApiError = {
    status: 500,
    message: 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง'
  };

  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    apiError.status = status;
    
    switch (status) {
      case 400:
        apiError.message = data?.message || 'ข้อมูลที่ส่งไม่ถูกต้อง';
        break;
      case 401:
        apiError.message = 'ไม่มีสิทธิ์เข้าถึง กรุณาเข้าสู่ระบบใหม่';
        break;
      case 403:
        apiError.message = 'ไม่มีสิทธิ์เข้าถึงข้อมูลนี้';
        break;
      case 404:
        apiError.message = 'ไม่พบข้อมูลที่ต้องการ';
        break;
      case 409:
        apiError.message = data?.message || 'ข้อมูลซ้ำกับที่มีอยู่แล้ว';
        break;
      case 422:
        apiError.message = data?.message || 'ข้อมูลไม่ถูกต้อง';
        break;
      case 429:
        apiError.message = 'ส่งคำขอมากเกินไป กรุณารอสักครู่';
        break;
      case 500:
        apiError.message = 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง';
        break;
      case 502:
        apiError.message = 'เซิร์ฟเวอร์ไม่สามารถเชื่อมต่อได้';
        break;
      case 503:
        apiError.message = 'เซิร์ฟเวอร์กำลังบำรุงรักษา กรุณาลองใหม่อีกครั้ง';
        break;
      default:
        apiError.message = data?.message || `เกิดข้อผิดพลาด (${status})`;
    }
    
    apiError.code = data?.code;
    apiError.details = data?.details;
  } else if (error.request) {
    // Network error
    apiError.status = 0;
    apiError.message = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
  } else {
    // Other error
    apiError.message = error.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
  }

  // Log error for debugging
  console.error('API Error:', {
    status: apiError.status,
    message: apiError.message,
    originalError: error
  });

  // Show notification if available
  if (showNotification) {
    showNotification({
      message: apiError.message,
      type: 'error'
    });
  }

  return apiError;
};

export const isNetworkError = (error: any): boolean => {
  return !error.response && error.request;
};

export const isServerError = (error: any): boolean => {
  return error.response && error.response.status >= 500;
};

export const isClientError = (error: any): boolean => {
  return error.response && error.response.status >= 400 && error.response.status < 500;
};

export const shouldRetry = (error: any): boolean => {
  // Retry on network errors and 5xx server errors
  return isNetworkError(error) || isServerError(error);
};

export const getRetryDelay = (attempt: number): number => {
  // Exponential backoff: 1s, 2s, 4s, 8s, 16s
  return Math.min(1000 * Math.pow(2, attempt - 1), 16000);
}; 