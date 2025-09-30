import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const SimpleHome = () => {
  const { state } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          🎉 Đăng nhập thành công!
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Thông tin người dùng:</h2>
          
          {state.user ? (
            <div className="space-y-2">
              <p><strong>ID:</strong> {state.user.id}</p>
              <p><strong>Tên:</strong> {state.user.fullName || state.user.full_name}</p>
              <p><strong>Email:</strong> {state.user.email}</p>
              <p><strong>Role:</strong> {state.user.role || `Role ID: ${state.user.role_id}`}</p>
              <p><strong>Authentication:</strong> ✅ Đã xác thực</p>
            </div>
          ) : (
            <p className="text-red-600">❌ Không có thông tin user</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Navigation:</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <a href="/catalog" className="block p-4 bg-blue-100 rounded-lg hover:bg-blue-200">
              📚 Catalog Courses
            </a>
            <a href="/progress" className="block p-4 bg-green-100 rounded-lg hover:bg-green-200">
              📊 Tiến độ học tập
            </a>
            <a href="/exam-history" className="block p-4 bg-purple-100 rounded-lg hover:bg-purple-200">
              🎯 Lịch sử thi
            </a>
            <a href="/auth" className="block p-4 bg-red-100 rounded-lg hover:bg-red-200">
              🚪 Logout
            </a>
          </div>
        </div>

        <div className="mt-6 text-center text-gray-600">
          <p>🚀 System Status: Backend port 3001, Frontend port 5173</p>
        </div>
      </div>
    </div>
  );
};

export default SimpleHome;