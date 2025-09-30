import React from 'react';

const SimpleLanding = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            🎓 Mini Coursera
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Nền tảng học tập trực tuyến hàng đầu
          </p>
          
          <div className="space-y-4">
            <a 
              href="/auth" 
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              🚀 Đăng nhập / Đăng ký
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">Khóa học đa dạng</h3>
            <p className="text-gray-600">Hàng trăm khóa học chất lượng cao</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold mb-2">Chứng chỉ uy tín</h3>
            <p className="text-gray-600">Được công nhận bởi các doanh nghiệp</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="text-4xl mb-4">👨‍🏫</div>
            <h3 className="text-xl font-semibold mb-2">Giảng viên chuyên nghiệp</h3>
            <p className="text-gray-600">Đội ngũ giảng viên kinh nghiệm</p>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Bắt đầu hành trình học tập của bạn
          </h2>
          <a 
            href="/auth" 
            className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            ✨ Khám phá ngay
          </a>
        </div>
      </div>
    </div>
  );
};

export default SimpleLanding;