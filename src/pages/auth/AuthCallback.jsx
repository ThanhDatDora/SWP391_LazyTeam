import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser, setToken } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const userStr = searchParams.get('user');
      const error = searchParams.get('error');

      if (error) {
        console.error('OAuth error:', error);
        navigate('/auth?error=' + encodeURIComponent(error));
        return;
      }

      if (token && userStr) {
        try {
          const user = JSON.parse(decodeURIComponent(userStr));
          
          // Save to localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          // Update auth context
          setToken(token);
          setUser(user);
          
          // Redirect to home
          navigate('/');
        } catch (err) {
          console.error('Failed to parse user data:', err);
          navigate('/auth?error=invalid_user_data');
        }
      } else {
        navigate('/auth?error=missing_auth_data');
      }
    };

    handleCallback();
  }, [searchParams, navigate, setUser, setToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Đang xử lý đăng nhập...
        </h2>
        <p className="text-gray-600">
          Vui lòng chờ trong giây lát
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;