import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { 
  ShoppingCart, 
  User, 
  LogOut, 
  Settings, 
  BookOpen, 
  Trophy,
  ChevronDown,
  Bell
} from 'lucide-react';
import NotificationDropdown from '../notifications/NotificationDropdown';

const LearnerNavbar = () => {
  const { state, logout } = useAuth();
  const { cartItems, getItemCount } = useCart();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Log cart changes for debugging
  useEffect(() => {
    console.log('🔄 LearnerNavbar: cartItems changed:', cartItems.length);
  }, [cartItems]);

  const handleLogout = () => {
    // Clear localStorage first
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    
    // Call logout function
    logout();
    
    // Navigate back to home/landing page
    navigate('/', { replace: true });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">TC</span>
                </div>
                <span className="text-xl font-bold text-gray-900">TOTC</span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link 
                to="/" 
                className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Home
              </Link>
              <Link 
                to="/courses" 
                className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Courses
              </Link>
              <Link 
                to="/my-courses" 
                className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                My Courses
              </Link>
              <Link 
                to="/progress" 
                className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Progress
              </Link>
              <Link 
                to="/about" 
                className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                About us
              </Link>
            </div>
          </div>

          {/* Right side - Cart, Notifications, Profile */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <NotificationDropdown />

            {/* Shopping Cart */}
            <Link 
              to="/cart" 
              className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {getItemCount()}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={toggleProfileMenu}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {/* Avatar */}
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {getInitials(state.user?.full_name)}
                  </span>
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {state.user?.full_name?.split(' ')[0] || 'User'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">
                      {state.user?.full_name || 'User Name'}
                    </p>
                    <p className="text-xs text-gray-500">{state.user?.email}</p>
                    <p className="text-xs text-blue-600 font-medium">Learner</p>
                  </div>
                  
                  <Link
                    to="/my-profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <User className="w-4 h-4 mr-3" />
                    My Profile
                  </Link>
                  
                  <Link
                    to="/my-courses"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <BookOpen className="w-4 h-4 mr-3" />
                    My Courses
                  </Link>
                  
                  <Link
                    to="/exam-history"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <Trophy className="w-4 h-4 mr-3" />
                    Certificates
                  </Link>
                  
                  <Link
                    to="/my-profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </Link>
                  
                  <div className="border-t border-gray-100 mt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu - can be expanded later */}
      <div className="md:hidden">
        {/* Mobile navigation can be added here */}
      </div>
    </nav>
  );
};

export default LearnerNavbar;