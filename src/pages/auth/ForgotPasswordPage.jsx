import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:3001/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.data.message);
        setEmailSent(true);
        // Auto redirect to reset password page after 3 seconds
        setTimeout(() => {
          navigate(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 3000);
      } else {
        setError(data.error?.message || 'Không thể gửi email reset mật khẩu');
      }
    } catch (err) {
      setError('Lỗi kết nối đến server. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(\'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?q=80&w=2070&auto=format&fit=crop\')'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/80 to-pink-600/80" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-4">
              Khôi phục tài khoản
            </h2>
            <p className="text-lg opacity-90">
              Đừng lo lắng, chúng tôi sẽ giúp bạn lấy lại quyền truy cập
            </p>
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          {/* Back Button */}
          <Link 
            to="/auth"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại đăng nhập
          </Link>

          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Quên mật khẩu?
            </h1>
            <p className="text-gray-600">
              {emailSent 
                ? 'Chúng tôi đã gửi mã xác thực đến email của bạn'
                : 'Nhập email để nhận mã xác thực đặt lại mật khẩu'
              }
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <div className="text-sm text-green-700">
                <p>{success}</p>
                <p className="mt-1 font-medium">Đang chuyển hướng...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {!emailSent && (
            <>
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Hướng dẫn:</h4>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Nhập địa chỉ email đã đăng ký</li>
                  <li>Kiểm tra hộp thư và thư mục spam</li>
                  <li>Nhập mã xác thực 6 số</li>
                  <li>Tạo mật khẩu mới</li>
                </ol>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ email
                  </label>
                  <Input
                    type="email"
                    placeholder="Nhập email đã đăng ký"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 rounded-full border-gray-300 focus:border-red-400 focus:ring-red-400"
                    required
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full h-12 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Đang gửi...
                    </div>
                  ) : (
                    'Gửi mã xác thực'
                  )}
                </Button>
              </form>
            </>
          )}

          {emailSent && (
            <div className="space-y-6">
              {/* Email Sent Confirmation */}
              <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
                <Mail className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Email đã được gửi!
                </h3>
                <p className="text-sm text-green-700 mb-4">
                  Chúng tôi đã gửi mã xác thực 6 số đến:
                </p>
                <p className="font-medium text-green-800">{email}</p>
              </div>

              {/* Manual Navigation */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Đã nhận được mã xác thực?
                </p>
                <Button
                  onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}`)}
                  className="w-full h-12 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium text-base transition-colors"
                >
                  Tiếp tục đặt lại mật khẩu
                </Button>
              </div>

              {/* Resend Option */}
              <div className="text-center">
                <button
                  onClick={() => {
                    setEmailSent(false);
                    setSuccess('');
                    setError('');
                  }}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Chưa nhận được email? Gửi lại
                </button>
              </div>
            </div>
          )}

          {/* Additional Help */}
          <div className="text-center pt-6 border-t">
            <p className="text-sm text-gray-600 mb-2">
              Vẫn gặp khó khăn?
            </p>
            <Link 
              to="/contact"
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Liên hệ hỗ trợ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;