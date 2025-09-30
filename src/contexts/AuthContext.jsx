import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { api } from '../services/api';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        isLoading: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          dispatch({ type: 'AUTH_START' });
          const response = await api.auth.getCurrentUser();
          if (response.success && response.data) {
            dispatch({ type: 'AUTH_SUCCESS', payload: response.data.user });
          } else {
            localStorage.removeItem('authToken');
            dispatch({ type: 'AUTH_ERROR', payload: 'Session expired' });
          }
        } catch (error) {
          localStorage.removeItem('authToken');
          dispatch({ type: 'AUTH_ERROR', payload: 'Session expired' });
        }
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await api.auth.login(email, password);
      
      if (response.success && response.data) {
        dispatch({ type: 'AUTH_SUCCESS', payload: response.data.user });
      } else {
        dispatch({ type: 'AUTH_ERROR', payload: response.error || 'Login failed' });
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await api.auth.register(userData);
      
      if (response.success && response.data) {
        dispatch({ type: 'AUTH_SUCCESS', payload: response.data.user });
      } else {
        dispatch({ type: 'AUTH_ERROR', payload: response.error || 'Registration failed' });
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      // Even if logout API fails, we still want to clear local state
      dispatch({ type: 'LOGOUT' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const isAuthenticated = () => {
    return state.isAuthenticated && state.user !== null;
  };

  const hasRole = (roleId) => {
    return state.user && state.user.role_id === roleId;
  };

  const value = {
    state,
    login,
    register,
    logout,
    clearError,
    isAuthenticated,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// HOC for protected routes
export const withAuth = (WrappedComponent, requiredRoles = []) => {
  return (props) => {
    const { state } = useAuth();
    
    if (!state.isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Yêu cầu đăng nhập
            </h2>
            <p className="text-gray-600 mb-4">
              Bạn cần đăng nhập để truy cập trang này
            </p>
            <a 
              href="/auth" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700"
            >
              Đăng nhập
            </a>
          </div>
        </div>
      );
    }
    
    if (requiredRoles.length > 0 && state.user && !requiredRoles.includes(state.user.role_id)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Không có quyền truy cập
            </h2>
            <p className="text-gray-600 mb-4">
              Bạn không có quyền truy cập trang này
            </p>
            <a 
              href="/" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700"
            >
              Quay về trang chủ
            </a>
          </div>
        </div>
      );
    }
    
    return <WrappedComponent {...props} />;
  };
};

// Role constants for easy reference
export const ROLES = {
  ADMIN: 1,
  INSTRUCTOR: 2,
  LEARNER: 3
};

// Helper functions
export const isAdmin = (user) => user?.role_id === ROLES.ADMIN;
export const isInstructor = (user) => user?.role_id === ROLES.INSTRUCTOR;
export const isLearner = (user) => user?.role_id === ROLES.LEARNER;
export const hasRole = (user, roleId) => user?.role_id === roleId;