import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * AccountLockedModal - Hiển thị khi user bị admin khóa tài khoản (real-time)
 * Modal sẽ hiện toàn màn hình và tự động redirect về trang chủ sau 5 giây
 */
const AccountLockedModal = ({ isOpen, onClose, onLogout }) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (isOpen) {
      // Reset countdown về 5 mỗi khi modal mở
      setCountdown(5);
      
      // Countdown timer
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleRedirect();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen]);

  const handleRedirect = () => {
    onLogout(); // Clear auth data
    navigate('/'); // Redirect to homepage
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fadeIn" />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-scaleIn">
        {/* Gradient Header - ĐỎ */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <AlertTriangle className="w-16 h-16 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center text-white">
            Tài khoản đã bị khóa
          </h2>
        </div>

        {/* Content */}
        <div className="px-8 py-8">
          <div className="text-center space-y-4">
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              Bạn đã vi phạm{' '}
              <span className="font-semibold text-gray-900 dark:text-white">
                nội dung chính sách
              </span>
              {' '}của nền tảng.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Tài khoản sẽ bị khóa cho đến khi có thông báo mới.
            </p>
          </div>

          {/* Countdown */}
          <div className="mt-8 bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">{countdown}</span>
              </div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Tự động chuyển về trang chủ
              </span>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={handleRedirect}
            className="w-full mt-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
          >
            Về trang chủ ngay
          </button>

          {/* Help text */}
          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ hỗ trợ
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AccountLockedModal;
