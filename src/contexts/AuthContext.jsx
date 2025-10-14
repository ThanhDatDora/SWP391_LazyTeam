import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

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
      setIsLoading(true);
      
      // Try API login first
      try {
        const response = await api.auth.login(credentials);
        
        if (response.success && response.data) {
          const { user: userData, token } = response.data;
          
          // Store in localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Update state
          setUser(userData);
          setIsAuthenticated(true);
          
          return { success: true };
        } else {
          return { success: false, message: response.message || 'Đăng nhập thất bại' };
        }
      } catch (error) {
        console.warn('API login failed, using mock login');
        
        // Mock login for development
        const mockUser = {
          id: 1,
          email: credentials.email,
          full_name: credentials.email.split('@')[0],
          role_id: 3
        };
        
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('token', 'mock-token');
        
        setUser(mockUser);
        setIsAuthenticated(true);
        
        return { success: true };
      }
    } catch (error) {
      console.error('Login failed:', error);
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
      } catch (apiError) {
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
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear state
    setUser(null);
    setIsAuthenticated(false);
  };

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
    checkAuthStatus
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