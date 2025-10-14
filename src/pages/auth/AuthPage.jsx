import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const { state, login, register } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'learner', // Default role
    rememberMe: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (activeTab === 'login') {
        await login(formData.email, formData.password);
        navigate('/'); // Redirect to home after successful login
      } else {
        // Register
        const roleId = formData.role === 'instructor' ? ROLES.INSTRUCTOR : ROLES.LEARNER;
        await register({
          full_name: formData.full_name,
          email: formData.email,
          password: formData.password,
          role_id: roleId
        });
        navigate('/'); // Redirect to home after successful registration
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
            backgroundImage: `url('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/80 to-blue-600/80"></div>
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
                  setFormData({
                    full_name: '',
                    email: '',
                    password: '',
                    role: 'learner',
                    rememberMe: false
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
                  setFormData({
                    full_name: '',
                    email: '',
                    password: '',
                    role: 'learner',
                    rememberMe: false
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
          <p className="text-gray-600 text-center mb-8">
            {activeTab === 'login' 
              ? 'Đăng nhập vào tài khoản Mini Coursera của bạn'
              : 'Tạo tài khoản mới để bắt đầu học tập'
            }
          </p>

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name Field (for Register) */}
            {activeTab === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên
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
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                type="email"
                name="email"
                placeholder={activeTab === 'login' ? 'Nhập email của bạn' : 'Nhập địa chỉ email'}
                value={formData.email}
                onChange={handleInputChange}
                className="w-full h-12 rounded-full border-gray-300 focus:border-teal-400 focus:ring-teal-400"
                required
              />
            </div>

            {/* Role Selection (for Register) */}
            {activeTab === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vai trò
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
            )}

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

            {/* Remember Me & Forgot Password (Login only) */}
            {activeTab === 'login' && (
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
                <a href="#" className="text-sm text-teal-600 hover:text-teal-700">
                  Quên mật khẩu?
                </a>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={state.isLoading}
              className="w-full h-12 bg-teal-400 hover:bg-teal-500 text-white rounded-full font-medium text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {state.isLoading 
                ? (activeTab === 'login' ? 'Đang đăng nhập...' : 'Đang tạo tài khoản...')
                : (activeTab === 'login' ? 'Đăng nhập' : 'Đăng ký')
              }
            </Button>
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