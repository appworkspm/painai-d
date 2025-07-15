import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function NotFound() {
  const { user } = useAuth();

  const getHomePath = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'ADMIN':
        return '/admin';
      case 'MANAGER':
        return '/timesheet-approval';
      default:
        return '/timesheets';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="relative">
            <div className="text-9xl font-bold text-gray-200">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-4xl font-bold text-gray-600">?</div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          หน้าไม่พบ
        </h1>
        <p className="text-gray-600 mb-8 text-lg">
          หน้าที่คุณกำลังค้นหาอาจถูกลบ ย้าย หรือไม่มีอยู่
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            to={getHomePath()}
            className="inline-block w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            กลับหน้าหลัก
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            กลับไปหน้าก่อนหน้า
          </button>
        </div>

        {/* Additional Help */}
        <div className="mt-8 text-sm text-gray-500">
          <p>หากคุณคิดว่านี่เป็นข้อผิดพลาด กรุณาติดต่อผู้ดูแลระบบ</p>
        </div>
      </div>
    </div>
  );
} 