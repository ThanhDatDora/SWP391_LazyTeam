import { createContext, useContext, useState, useEffect } from 'react';
import { api, cacheUtils } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      console.log('🔐 Login attempt with credentials:', { email: credentials.email, password: '***' });
      setIsLoading(true);
      
      // Try API login first
      try {
        console.log('📡 Calling API login...');
        const response = await api.auth.login(credentials.email, credentials.password);
        console.log('📡 API response:', response);
        
        if (response.success && response.data) {
          const { user: userData, token } = response.data;
          console.log('✅ Login successful, user data:', userData);
          
          // Store in localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Update state
          setUser(userData);
          setIsAuthenticated(true);
          
          return { success: true };
        } else {
          console.log('❌ API login failed:', response.error);
          return { success: false, message: response.error || 'Đăng nhập thất bại' };
        }
      } catch (_apiError) {
        console.warn('⚠️ API login failed, using mock login:', _apiError);
        
        // Mock login for development
        let roleId = 3; // Default to learner
        let fullName = credentials.email.split('@')[0];
        
        // Set role based on email for demo accounts
        if (credentials.email === 'admin@example.com') {
          roleId = 1; // Admin
          fullName = 'Admin User';
        } else if (credentials.email === 'instructor@example.com') {
          roleId = 2; // Instructor  
          fullName = 'Instructor User';
        } else if (credentials.email === 'learner@example.com') {
          roleId = 3; // Learner
          fullName = 'Learner User';
        }
        
        const mockUser = {
          id: 1,
          email: credentials.email,
          full_name: fullName,
          role_id: roleId
        };
        
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('token', 'mock-token');
        
        setUser(mockUser);
        setIsAuthenticated(true);
        
        console.log('✅ Mock login successful, user:', mockUser);
        return { success: true };
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      return { success: false, message: 'Lỗi hệ thống' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      
      // Try API register first
      try {
        const response = await api.auth.register(userData);
        if (response.success && response.data) {
          const { user: newUser, token } = response.data;
          
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(newUser));
          
          setUser(newUser);
          setIsAuthenticated(true);
          
          return { success: true };
        }
      } catch (_apiError) {
        console.warn('API register failed, using mock register');
        
        // Mock register for development
        const mockUser = {
          id: Date.now(),
          email: userData.email,
          full_name: userData.full_name,
          role_id: 3 // Default to learner
        };
        
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('token', 'mock-token');
        
        setUser(mockUser);
        setIsAuthenticated(true);
        
        return { success: true };
      }
      
      return { success: false, message: 'Đăng ký thất bại' };
    } catch (error) {
      console.error('Register failed:', error);
      return { success: false, message: 'Lỗi hệ thống' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('🚪 Logging out user...');
    
    // Clear ALL localStorage items
    localStorage.removeItem('token');
    localStorage.removeItem('authToken'); // THIS IS THE TOKEN USED BY API!
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    
    // Clear API cache to prevent showing old user's data
    cacheUtils.clear();
    
    // Clear state
    setUser(null);
    setIsAuthenticated(false);
    
    console.log('✅ Logout complete - All data cleared (localStorage + API cache)');
  };

  // Update user profile in context and localStorage
  const updateProfile = (updatedUserData) => {
    console.log('🔄 Updating user profile in context:', updatedUserData);
    
    // Merge with existing user data
    const updatedUser = { ...user, ...updatedUserData };
    
    // Update state
    setUser(updatedUser);
    
    // Update localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    console.log('✅ Profile updated in context:', updatedUser);
  };

  // Check authentication status (utility function)
  const checkAuth = () => {
    return isAuthenticated && user !== null;
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    state: { 
      user, 
      isAuthenticated,
      isLoading 
    },
    login,
    register,
    logout,
    updateProfile,
    checkAuthStatus,
    checkAuth,
    setUser // Export setUser để AuthCallback có thể dùng
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};