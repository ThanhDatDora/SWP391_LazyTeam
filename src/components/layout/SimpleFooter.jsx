import React from 'react';

const SimpleFooter = () => {
  return (
    <footer className="bg-white border-t border-gray-200 p-6 text-center">
      <div className="text-gray-600">
        <p className="mb-2">© 2024 Mini Coursera - Nền tảng học trực tuyến</p>
        <div className="flex justify-center space-x-4 text-sm">
          <a href="/about" className="hover:text-blue-600">Về chúng tôi</a>
          <a href="/contact" className="hover:text-blue-600">Liên hệ</a>
          <a href="/blog" className="hover:text-blue-600">Blog</a>
          <a href="/pricing" className="hover:text-blue-600">Giá cả</a>
        </div>
      </div>
    </footer>
  );
};

export default SimpleFooter;