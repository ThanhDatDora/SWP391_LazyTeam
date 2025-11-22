import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Mail } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    email: searchParams.get('email') || '',
    resetToken: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!formData.email) {
      navigate('/forgot-password');
    }
  }, [formData.email, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.resetToken) {
      setError('Vui lòng nhập mã xác thực');
      return false;
    }
    if (formData.resetToken.length !== 6) {
      setError('Mã xác thực phải có 6 số');
      return false;
    }
    if (!formData.newPassword) {
      setError('Vui lòng nhập mật khẩu mới');
      return false;
    }
    if (formData.newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {return;}

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:3001/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          resetToken: formData.resetToken,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.data.message);
        // Auto redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/auth');
        }, 3000);
      } else {
        setError(data.error?.message || 'Không thể đặt lại mật khẩu');
      }
    } catch (err) {
      setError('Lỗi kết nối đến server. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(\'https://images.unsplash.com/photo-1555421689-491a97ff2040?q=80&w=2070&auto=format&fit=crop\')'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/80 to-blue-600/80" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-4">
              Tạo mật khẩu mới
            </h2>
            <p className="text-lg opacity-90">
              Bảo mật tài khoản với mật khẩu mạnh và an toàn
            </p>
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          {/* Back Button */}
          <Link 
            to="/forgot-password"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Link>

          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Đặt lại mật khẩu
            </h1>
            <p className="text-gray-600">
              Nhập mã xác thực và tạo mật khẩu mới cho tài khoản
            </p>
            <p className="text-sm text-gray-500 mt-1">
              <strong>{formData.email}</strong>
            </p>
          </div>

          {/* Email Reminder */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-blue-500" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">Kiểm tra email của bạn</p>
                <p>Mã xác thực 6 số đã được gửi đến email trên</p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <div className="text-sm text-green-700">
                <p>{success}</p>
                <p className="mt-1 font-medium">Đang chuyển hướng đến trang đăng nhập...</p>
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

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Reset Token */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã xác thực <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="resetToken"
                  placeholder="Nhập mã 6 số từ email"
                  value={formData.resetToken}
                  onChange={handleInputChange}
                  className="w-full h-12 rounded-full border-gray-300 focus:border-green-400 focus:ring-green-400 text-center text-lg tracking-widest"
                  maxLength={6}
                  required
                  disabled={isLoading}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    Mã có hiệu lực trong 15 phút
                  </p>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-xs text-green-600 hover:text-green-700 font-medium"
                  >
                    Gửi lại mã
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="newPassword"
                    placeholder="Tạo mật khẩu mới (tối thiểu 6 ký tự)"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full h-12 rounded-full border-gray-300 focus:border-green-400 focus:ring-green-400 pr-12"
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Nhập lại mật khẩu mới"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full h-12 rounded-full border-gray-300 focus:border-green-400 focus:ring-green-400 pr-12"
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">Yêu cầu mật khẩu:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className={`flex items-center ${formData.newPassword.length >= 6 ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className="mr-2">•</span>
                    Ít nhất 6 ký tự
                  </li>
                  <li className={`flex items-center ${formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className="mr-2">•</span>
                    Mật khẩu xác nhận phải khớp
                  </li>
                </ul>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white rounded-full font-medium text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Đang cập nhật...
                  </div>
                ) : (
                  'Cập nhật mật khẩu'
                )}
              </Button>
            </form>
          )}

          {/* Additional Help */}
          <div className="text-center pt-6 border-t">
            <p className="text-sm text-gray-600 mb-2">
              Gặp khó khăn trong quá trình đặt lại?
            </p>
            <Link 
              to="/contact"
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Liên hệ hỗ trợ kỹ thuật
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;