import React from 'react';
import { Award, Download, Share2 } from 'lucide-react';

const Certificate = ({ 
  student_name,
  course_title,
  instructor_name,
  completion_date,
  course_id
}) => {
  const formattedDate = new Date(completion_date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const handleDownload = () => {
    // TODO: Generate PDF certificate
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Chứng chỉ hoàn thành khóa học',
        text: `Tôi đã hoàn thành khóa học "${course_title}" trên MiniCoursera!`,
        url: window.location.href
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Certificate Container */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-2xl p-12 border-8 border-double border-blue-600">
        {/* Header */}
        <div className="text-center mb-8">
          <Award className="w-24 h-24 mx-auto text-yellow-500 mb-4" />
          <h1 className="text-5xl font-bold text-gray-900 mb-2">Chứng Nhận</h1>
          <p className="text-xl text-gray-600">Hoàn Thành Khóa Học</p>
        </div>

        {/* Decorative Line */}
        <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-8"></div>

        {/* Content */}
        <div className="text-center space-y-6">
          <p className="text-lg text-gray-700">Chứng nhận rằng</p>
          
          <h2 className="text-4xl font-bold text-blue-900 my-6">
            {student_name}
          </h2>

          <p className="text-lg text-gray-700">đã hoàn thành xuất sắc khóa học</p>

          <h3 className="text-3xl font-semibold text-gray-900 my-6 px-8">
            {course_title}
          </h3>

          <div className="flex items-center justify-center gap-8 my-8">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Ngày hoàn thành</p>
              <p className="text-lg font-semibold text-gray-900">{formattedDate}</p>
            </div>
            {instructor_name && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Giảng viên</p>
                <p className="text-lg font-semibold text-gray-900">{instructor_name}</p>
              </div>
            )}
          </div>

          {/* Certificate ID */}
          <p className="text-sm text-gray-500 mt-8">
            Mã chứng chỉ: MC-{course_id}-{new Date(completion_date).getTime()}
          </p>
        </div>

        {/* Decorative Border */}
        <div className="mt-12 flex items-center justify-center gap-4">
          <div className="w-20 h-1 bg-gradient-to-r from-transparent to-blue-600"></div>
          <Award className="w-6 h-6 text-blue-600" />
          <div className="w-20 h-1 bg-gradient-to-l from-transparent to-blue-600"></div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mt-8 print:hidden">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-5 h-5" />
          Tải xuống PDF
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Share2 className="w-5 h-5" />
          Chia sẻ
        </button>
      </div>

    </div>
  );
};

export default Certificate;
