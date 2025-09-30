import React from 'react';

const SimpleSideNav = ({ user }) => {
  return (
    <nav className="bg-white rounded-lg shadow p-4">
      <div className="space-y-2">
        <div className="font-semibold text-gray-900 mb-4">📚 Navigation</div>
        
        <a href="/catalog" className="block p-2 text-gray-700 hover:bg-gray-100 rounded-md">
          📖 Catalog
        </a>
        <a href="/progress" className="block p-2 text-gray-700 hover:bg-gray-100 rounded-md">
          📊 Tiến độ
        </a>
        <a href="/exam-history" className="block p-2 text-gray-700 hover:bg-gray-100 rounded-md">
          🎯 Lịch sử thi
        </a>
        
        {user && user.role === 'admin' && (
          <a href="/admin" className="block p-2 text-red-600 hover:bg-red-50 rounded-md">
            👨‍💼 Admin Panel
          </a>
        )}
        
        {user && user.role === 'instructor' && (
          <a href="/instructor" className="block p-2 text-blue-600 hover:bg-blue-50 rounded-md">
            👨‍🏫 Instructor
          </a>
        )}
      </div>
    </nav>
  );
};

export default SimpleSideNav;