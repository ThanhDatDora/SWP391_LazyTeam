import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, Mail } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const AuthPage = () => {
  const { state, login } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpSent, setOTPSent] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    otp: '',
    role: 'learner', // Default role
    rememberMe: false,
    // Instructor additional fields
    headline: '',
    bio: '',
    degrees_and_certificates: '',
    work_history: '',
    awards: ''
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError(''); // Clear error when user types
    setSuccess(''); // Clear success when user types
  };

  // Handle Google OAuth login
  const handleGoogleLogin = async () => {
    try {
      setError('');
      const response = await fetch('http://localhost:3001/api/auth/google');
      const data = await response.json();
      
      if (data.success) {
        window.location.href = data.data.authUrl;
      } else {
        // Show detailed error message from backend
        const errorMessage = data.error?.message || 'Không thể kết nối với Google OAuth';
        const errorDetails = data.error?.details || '';
        setError(`${errorMessage}${errorDetails ? '\n' + errorDetails : ''}`);
      }
    } catch {
      setError('Lỗi kết nối đến server. Vui lòng kiểm tra xem backend có đang chạy không.');
    }
  };

  // Handle OTP registration
  const handleSendOTP = async () => {
    // Validate required fields based on role
    const requiredFields = ['full_name', 'email', 'password', 'role'];
    const instructorFields = ['headline', 'bio', 'degrees_and_certificates', 'work_history'];
    
    // Check basic required fields
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`Vui lòng nhập ${field === 'full_name' ? 'họ và tên' : field === 'email' ? 'email' : field === 'password' ? 'mật khẩu' : 'vai trò'}`);
        return;
      }
    }
    
    // Check instructor additional fields
    if (formData.role === 'instructor') {
      for (const field of instructorFields) {
        if (!formData[field]) {
          const fieldNames = {
            headline: 'tiêu đề chuyên môn',
            bio: 'tiểu sử',
            degrees_and_certificates: 'bằng cấp và chứng chỉ', 
            work_history: 'kinh nghiệm làm việc'
          };
          setError(`Vui lòng nhập ${fieldNames[field]}`);
          return;
        }
      }
    }

    try {
      setError('');
      console.log('🚀 Sending OTP request to:', 'http://localhost:3001/api/auth/register/send-otp');
      console.log('📤 Request data:', { 
        email: formData.email,
        full_name: formData.full_name,
        password: '***',
        role: formData.role,
        ...(formData.role === 'instructor' && {
          headline: formData.headline,
          bio: formData.bio?.substring(0, 50) + '...',
          degrees_and_certificates: formData.degrees_and_certificates?.substring(0, 50) + '...',
          work_history: formData.work_history?.substring(0, 50) + '...',
          awards: formData.awards?.substring(0, 50) + '...'
        })
      });
      
      const response = await fetch('http://localhost:3001/api/auth/register/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: formData.email,
          full_name: formData.full_name,
          password: formData.password,
          role: formData.role,
          ...(formData.role === 'instructor' && {
            headline: formData.headline,
            bio: formData.bio,
            degrees_and_certificates: formData.degrees_and_certificates,
            work_history: formData.work_history,
            awards: formData.awards
          })
        })
      });

      console.log('📥 Response status:', response.status);
      const data = await response.json();
      console.log('📥 Response data:', data);
      
      if (data.success) {
        setOTPSent(true);
        setSuccess('Mã OTP đã được gửi đến email của bạn!');
      } else {
        setError(data.error?.message || 'Không thể gửi OTP');
      }
    } catch (err) {
      console.error('❌ OTP Send Error:', err);
      console.error('❌ Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      setError(`Lỗi kết nối đến server: ${err.message}`);
    }
  };

  const handleResendOTP = async () => {
    try {
      setError('');
      const response = await fetch('http://localhost:3001/api/auth/register/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Mã OTP mới đã được gửi!');
      } else {
        setError(data.error?.message || 'Không thể gửi lại OTP');
      }
    } catch {
      setError('Lỗi kết nối đến server');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (activeTab === 'login') {
        console.log('🎯 AuthPage handleSubmit - Login tab');
        console.log('🎯 formData:', { email: formData.email, password: formData.password ? '***' : undefined });
        console.log('🎯 Calling login() with credentials...');
        
        const credentials = {
          email: formData.email,
          password: formData.password
        };
        console.log('🎯 Credentials object:', { email: credentials.email, password: credentials.password ? '***' : undefined });
        
        const result = await login(credentials);
        console.log('🎯 Login result:', result);
        
        if (result.success) {
          // Navigate to home - HomePage component will handle role-based rendering
          navigate('/');
        } else {
          setError(result.message || 'Đăng nhập thất bại');
        }
      } else if (otpSent) {
        // OTP Registration - verify OTP and create account
        const instructorData = formData.role === 'instructor' ? {
          headline: formData.headline,
          bio: formData.bio,
          degrees_and_certificates: formData.degrees_and_certificates,
          work_history: formData.work_history,
          awards: formData.awards
        } : {};

        const response = await fetch('http://localhost:3001/api/auth/register/verify-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: formData.email,
            otp: formData.otp,
            password: formData.password,
            fullName: formData.full_name,
            role: formData.role,
            ...instructorData
          })
        });

        const data = await response.json();
        
        if (data.success) {
          setSuccess('Đăng ký thành công!');
          // Auto login after successful registration
          setTimeout(() => {
            navigate('/');
          }, 1500);
        } else {
          setError(data.error?.message || 'Xác thực OTP thất bại');
        }
      } else {
        // Register tab but no OTP sent yet - this shouldn't happen with our new flow
        setError('Vui lòng gửi mã OTP trước khi đăng ký');
      }
    } catch (err) {
      setError(err.message || 'Đã có lỗi xảy ra');
    }
  };

  // Redirect if already authenticated
  React.useEffect(() => {
    if (state.isAuthenticated) {
      navigate('/');
    }
  }, [state.isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex">
      {/* Left Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(\'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop\')'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/80 to-blue-600/80" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-4">
              Nền tảng học trực tuyến hàng đầu
            </h2>
            <p className="text-lg opacity-90">
              Khám phá hàng nghìn khóa học từ các chuyên gia hàng đầu
            </p>
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          {/* Welcome Header */}
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
              Chào mừng đến Mini Coursera!
            </h1>

            {/* Tab Switcher */}
            <div className="flex bg-teal-400/20 rounded-full p-1 mb-8">
              <button
                onClick={() => {
                  setActiveTab('login');
                  setError('');
                  setSuccess('');
                  setOTPSent(false);
                  setFormData({
                    full_name: '',
                    email: '',
                    password: '',
                    otp: '',
                    role: 'learner',
                    rememberMe: false,
                    headline: '',
                    bio: '',
                    degrees_and_certificates: '',
                    work_history: '',
                    awards: ''
                  });
                }}
                className={`flex-1 py-3 px-6 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'login'
                    ? 'bg-teal-400 text-white shadow-sm'
                    : 'text-teal-600 hover:text-teal-700'
                }`}
              >
                Đăng nhập
              </button>
              <button
                onClick={() => {
                  setActiveTab('register');
                  setError('');
                  setSuccess('');
                  setOTPSent(false);
                  setFormData({
                    full_name: '',
                    email: '',
                    password: '',
                    otp: '',
                    role: 'learner',
                    rememberMe: false,
                    headline: '',
                    bio: '',
                    degrees_and_certificates: '',
                    work_history: '',
                    awards: ''
                  });
                }}
                className={`flex-1 py-3 px-6 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'register'
                    ? 'bg-teal-400 text-white shadow-sm'
                    : 'text-teal-600 hover:text-teal-700'
                }`}
              >
                Đăng ký
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="text-center mb-8">
            <p className="text-gray-600">
              {activeTab === 'login' 
                ? 'Đăng nhập vào tài khoản Mini Coursera của bạn'
                : 'Tạo tài khoản mới để bắt đầu học tập'
              }
            </p>
            {activeTab === 'register' && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 <strong>Quy trình đăng ký:</strong> Điền đầy đủ thông tin → Nhận mã OTP qua email → Xác thực → Hoàn tất tạo tài khoản
                </p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <Mail className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {/* Google Login Button */}
          {activeTab === 'login' && (
            <div className="space-y-3">
              <Button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-full font-medium text-base transition-colors flex items-center justify-center space-x-3"
                title="Google OAuth đang được cấu hình. Vui lòng sử dụng đăng ký bằng OTP."
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Đăng nhập bằng Google</span>
              </Button>

             
            </div>
          )}

          {/* Divider */}
          {activeTab === 'login' && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">hoặc</span>
              </div>
            </div>
          )}

          {/* OTP Mode Toggle for Register */}
          {activeTab === 'register' && !otpSent && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Mail className="w-5 h-5 text-blue-500" />
                <h4 className="font-medium text-blue-800">Đăng ký tài khoản</h4>
              </div>
              <p className="text-sm text-blue-700">
                Điền đầy đủ thông tin bên dưới. Sau khi hoàn tất, chúng tôi sẽ gửi mã OTP đến email để xác thực tài khoản.
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Registration Form - Full Information */}
            {activeTab === 'register' && !otpSent && (
              <>
                {/* Full Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="full_name"
                    placeholder="Nhập họ và tên của bạn"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="w-full h-12 rounded-full border-gray-300 focus:border-teal-400 focus:ring-teal-400"
                    required
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="Nhập địa chỉ email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full h-12 rounded-full border-gray-300 focus:border-teal-400 focus:ring-teal-400"
                    required
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Tạo mật khẩu mạnh (tối thiểu 6 ký tự)"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full h-12 rounded-full border-gray-300 focus:border-teal-400 focus:ring-teal-400 pr-12"
                      required
                      minLength={6}
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

                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vai trò <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full h-12 rounded-full border-gray-300 focus:border-teal-400 focus:ring-teal-400 px-4"
                    required
                  >
                    <option value="learner">Học viên</option>
                    <option value="instructor">Giảng viên</option>
                  </select>
                </div>

                {/* Instructor Additional Fields */}
                {formData.role === 'instructor' && (
                  <>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h4 className="font-medium text-amber-800 mb-2">Thông tin giảng viên</h4>
                      <p className="text-sm text-amber-700">
                        Vui lòng cung cấp thông tin chuyên môn để hoàn tất đăng ký giảng viên.
                      </p>
                    </div>

                    {/* Headline */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tiêu đề chuyên môn <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        name="headline"
                        placeholder="VD: Senior Frontend Developer | React Expert"
                        value={formData.headline}
                        onChange={handleInputChange}
                        className="w-full h-12 rounded-full border-gray-300 focus:border-teal-400 focus:ring-teal-400"
                        maxLength={500}
                        required={formData.role === 'instructor'}
                      />
                      <p className="text-xs text-gray-500 mt-1">Mô tả ngắn gọn về chuyên môn của bạn</p>
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tiểu sử <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="bio"
                        placeholder="Giới thiệu chi tiết về bản thân, kinh nghiệm và phong cách giảng dạy..."
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="w-full h-24 rounded-lg border-gray-300 focus:border-teal-400 focus:ring-teal-400 p-3 resize-none"
                        required={formData.role === 'instructor'}
                      />
                      <p className="text-xs text-gray-500 mt-1">Chia sẻ câu chuyện và kinh nghiệm của bạn</p>
                    </div>

                    {/* Degrees and Certificates */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bằng cấp và chứng chỉ <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="degrees_and_certificates"
                        placeholder="VD: Thạc sĩ Khoa học Máy tính - ĐH Bách Khoa (2020)&#10;Chứng chỉ AWS Solutions Architect (2021)&#10;Chứng chỉ Google Analytics (2022)"
                        value={formData.degrees_and_certificates}
                        onChange={handleInputChange}
                        className="w-full h-20 rounded-lg border-gray-300 focus:border-teal-400 focus:ring-teal-400 p-3 resize-none"
                        required={formData.role === 'instructor'}
                      />
                      <p className="text-xs text-gray-500 mt-1">Liệt kê các bằng cấp và chứng chỉ chuyên môn</p>
                    </div>

                    {/* Work History */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kinh nghiệm làm việc <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="work_history"
                        placeholder="VD: Senior Developer tại FPT Software (2020-2023)&#10;Tech Lead tại Viettel Solutions (2018-2020)&#10;Freelance Consultant (2016-2018)"
                        value={formData.work_history}
                        onChange={handleInputChange}
                        className="w-full h-20 rounded-lg border-gray-300 focus:border-teal-400 focus:ring-teal-400 p-3 resize-none"
                        required={formData.role === 'instructor'}
                      />
                      <p className="text-xs text-gray-500 mt-1">Nêu rõ vị trí, công ty và thời gian làm việc</p>
                    </div>

                    {/* Awards */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giải thưởng và thành tích
                      </label>
                      <textarea
                        name="awards"
                        placeholder="VD: Giải nhất Hackathon FPT 2022&#10;Top 10 Most Valuable Developer của năm 2021&#10;Diễn giả tại Tech Conference Vietnam 2020"
                        value={formData.awards}
                        onChange={handleInputChange}
                        className="w-full h-16 rounded-lg border-gray-300 focus:border-teal-400 focus:ring-teal-400 p-3 resize-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">Các giải thưởng, thành tích nổi bật (không bắt buộc)</p>
                    </div>
                  </>
                )}

                {/* Submit Button */}
                <Button
                  type="button"
                  onClick={handleSendOTP}
                  className="w-full h-12 bg-teal-400 hover:bg-teal-500 text-white rounded-full font-medium text-base transition-colors"
                >
                  Gửi mã OTP xác thực
                </Button>
              </>
            )}

            {/* OTP Verification Form */}
            {activeTab === 'register' && otpSent && (
              <>
                <div className="text-center">
                  <Mail className="w-16 h-16 text-teal-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Xác thực email
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Chúng tôi đã gửi mã OTP đến email <strong>{formData.email}</strong>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã OTP <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="otp"
                    placeholder="Nhập mã OTP 6 số"
                    value={formData.otp}
                    onChange={handleInputChange}
                    className="w-full h-12 rounded-full border-gray-300 focus:border-teal-400 focus:ring-teal-400 text-center text-lg tracking-widest"
                    maxLength={6}
                    required
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-gray-600">
                      Mã OTP có hiệu lực trong 5 phút
                    </p>
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                    >
                      Gửi lại mã
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-teal-400 hover:bg-teal-500 text-white rounded-full font-medium text-base transition-colors"
                >
                  Hoàn tất đăng ký
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setOTPSent(false);
                    setFormData({ ...formData, otp: '' });
                    setError('');
                    setSuccess('');
                  }}
                  className="w-full text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center space-x-1"
                >
                  <span>←</span>
                  <span>Quay lại chỉnh sửa thông tin</span>
                </button>
              </>
            )}

            {/* Login Form */}
            {activeTab === 'login' && (
              <>
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="Nhập email của bạn"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full h-12 rounded-full border-gray-300 focus:border-teal-400 focus:ring-teal-400"
                    required
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Nhập mật khẩu của bạn"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full h-12 rounded-full border-gray-300 focus:border-teal-400 focus:ring-teal-400 pr-12"
                      required
                      minLength={6}
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

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Ghi nhớ đăng nhập</span>
                  </label>
                  <Link to="/forgot-password" className="text-sm text-teal-600 hover:text-teal-700">
                    Quên mật khẩu?
                  </Link>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={state.isLoading}
                  className="w-full h-12 bg-teal-400 hover:bg-teal-500 text-white rounded-full font-medium text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {state.isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </Button>
              </>
            )}
          </form>

          {/* Demo Users Info */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">Demo Accounts:</h4>
            <div className="text-xs text-blue-700 space-y-1">
              <p><strong>Admin:</strong> admin@example.com / Admin@123</p>
              <p><strong>Instructor:</strong> instructor@example.com / Instr@123</p>
              <p><strong>Learner:</strong> learner@example.com / Learner@123</p>
            </div>
          </div>

          {/* Mobile Hero Text */}
          <div className="lg:hidden text-center pt-8 border-t">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Nền tảng học trực tuyến
            </h3>
            <p className="text-gray-600">
              Khám phá hàng nghìn khóa học chất lượng cao
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;