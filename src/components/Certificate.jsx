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
    <div className="w-full h-full flex items-center justify-center p-2 sm:p-4">
      {/* Certificate Container - Portrait A4 ratio fit to modal */}
      <div className="w-full max-w-2xl h-full max-h-[85vh] aspect-[1/1.414] bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-lg shadow-2xl border-4 border-blue-600 relative overflow-hidden flex flex-col">
        
        {/* Decorative Corner Elements */}
        <div className="absolute top-0 left-0 w-12 sm:w-16 h-12 sm:h-16 border-t-4 border-l-4 border-yellow-500 rounded-tl-lg"></div>
        <div className="absolute top-0 right-0 w-12 sm:w-16 h-12 sm:h-16 border-t-4 border-r-4 border-yellow-500 rounded-tr-lg"></div>
        <div className="absolute bottom-0 left-0 w-12 sm:w-16 h-12 sm:h-16 border-b-4 border-l-4 border-yellow-500 rounded-bl-lg"></div>
        <div className="absolute bottom-0 right-0 w-12 sm:w-16 h-12 sm:h-16 border-b-4 border-r-4 border-yellow-500 rounded-br-lg"></div>

        {/* Content Container */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-10 py-8 z-10">
          
          {/* Header */}
          <div className="text-center mb-3 sm:mb-4">
            <Award className="w-12 sm:w-14 h-12 sm:h-14 mx-auto text-yellow-500 mb-2" />
            <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-1">
              Chứng Nhận
            </h1>
            <p className="text-sm sm:text-base text-gray-600">Hoàn Thành Khóa Học</p>
          </div>

          {/* Decorative Line */}
          <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 mx-auto mb-3 sm:mb-4"></div>

          {/* Content */}
          <div className="text-center space-y-2 sm:space-y-3 w-full">
            <p className="text-sm text-gray-700">Chứng nhận rằng</p>
            
            <h2 className="text-xl sm:text-2xl font-bold text-blue-900 my-2 px-4">
              {student_name}
            </h2>

            <p className="text-sm text-gray-700">đã hoàn thành xuất sắc khóa học</p>

            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 my-2 sm:my-3 px-6 sm:px-8 leading-tight">
              {course_title}
            </h3>

            {/* Info Row */}
            <div className="flex items-center justify-center gap-4 sm:gap-8 my-3 sm:my-4 flex-wrap">
              <div className="text-center bg-white/50 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 backdrop-blur-sm">
                <p className="text-xs text-gray-600 mb-0.5">Ngày hoàn thành</p>
                <p className="text-sm font-semibold text-gray-900">{formattedDate}</p>
              </div>
              {instructor_name && (
                <div className="text-center bg-white/50 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 backdrop-blur-sm">
                  <p className="text-xs text-gray-600 mb-0.5">Giảng viên</p>
                  <p className="text-sm font-semibold text-gray-900">{instructor_name}</p>
                </div>
              )}
            </div>

            {/* Certificate ID */}
            <p className="text-xs text-gray-500 mt-3 sm:mt-4">
              Mã chứng chỉ: MC-{course_id}-{new Date(completion_date).getTime()}
            </p>
          </div>

          {/* Decorative Bottom Border */}
          <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2 sm:gap-3">
            <div className="w-12 sm:w-16 h-0.5 bg-gradient-to-r from-transparent to-blue-600"></div>
            <Award className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600" />
            <div className="w-12 sm:w-16 h-0.5 bg-gradient-to-l from-transparent to-blue-600"></div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Outside certificate, below it */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex justify-center gap-2 sm:gap-3 print:hidden z-20">
        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm shadow-lg"
        >
          <Download className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          Tải xuống
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm shadow-lg"
        >
          <Share2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          Chia sẻ
        </button>
      </div>

    </div>
  );
};

export default Certificate;
