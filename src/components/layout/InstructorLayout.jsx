import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import {
  GraduationCap,
  Home,
  BookOpen,
  Users,
  FileText,
  BarChart3,
  DollarSign,
  TrendingUp,
  Award,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Moon,
  Sun,
  Plus,
  PieChart,
  Clock,
  CheckCircle
} from 'lucide-react';

const COLORS = {
  light: {
    primary: '#0d9488',
    secondary: '#14b8a6',
    accent: '#06b6d4',
    background: '#f9fafb',
    card: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb'
  },
  dark: {
    primary: '#5eead4',
    secondary: '#2dd4bf',
    accent: '#22d3ee',
    background: '#0f172a',
    card: '#1e293b',
    sidebar: '#1e293b',
    topBar: '#0f172a',
    text: '#f9fafb',
    textSecondary: '#9ca3af',
    border: '#374155'
  }
};

const InstructorLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
    const { authState: _authState, clearAuthState } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const [expandedSections, setExpandedSections] = useState({
    courses: true,
    analytics: true
  });

  const currentColors = COLORS[theme];

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 Instructor logout clicked');
      
      // Call logout from AuthContext
      logout();
      
      // Clear any instructor-specific data
      localStorage.removeItem('instructorData');
      localStorage.removeItem('instructorDashboard');
      
      console.log('✅ Logout successful, redirecting to login...');
      
      // Navigate to login page
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('❌ Logout failed:', error);
      
      // Force logout even if error
      localStorage.clear();
      navigate('/login', { replace: true });
    }
  };

  const getActiveMenu = () => {
    const path = location.pathname;
    if (path === '/instructor/dashboard') return 'dashboard';
    if (path === '/instructor/courses/create') return 'create-course';
    if (path.includes('/instructor/courses/')) return 'my-courses';
    if (path === '/instructor/analytics') return 'analytics';
    if (path === '/instructor/students') return 'students';
    if (path === '/instructor/revenue') return 'revenue';
    if (path === '/instructor/settings') return 'settings';
    return 'dashboard';
  };

  const activeMenu = getActiveMenu();

  return (
    <div 
      className={`min-h-screen instructor-layout-theme-${theme}`}
      style={{ backgroundColor: currentColors.background, color: currentColors.text }}
    >
      <style>{`
        .instructor-layout-theme-light,
        .instructor-layout-theme-dark {
          transition: background-color 0.3s, color 0.3s;
        }

        .sidebar-menu-item {
          transition: all 0.2s ease;
        }

        .sidebar-menu-item:hover {
          transform: translateX(4px);
          opacity: 0.9;
        }

        .sidebar-menu-item.active {
          font-weight: 600;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${theme === 'dark' ? '#475569' : '#cbd5e1'};
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${theme === 'dark' ? '#64748b' : '#94a3b8'};
        }

        .sidebar-separator {
          position: fixed;
          left: 256px;
          top: 80px;
          bottom: 0;
          width: 1px;
          background: ${currentColors.border};
          z-index: 29;
        }
      `}</style>

      {/* Top Bar */}
      <div 
        className="shadow-2xl fixed top-0 left-0 right-0 z-40" 
        style={{ 
          background: theme === 'dark' 
            ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
            : `linear-gradient(to right, ${currentColors.primary}, ${currentColors.accent})`,
          borderBottom: theme === 'dark' ? `2px solid ${currentColors.primary}` : 'none',
          height: '80px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <div className="px-6 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                variant="ghost"
                className="lg:hidden hover:bg-white/20"
                style={{ color: '#ffffff' }}
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">Mini-Coursera</h1>
                <p className="mt-1 text-sm text-white/80">Bảng điều khiển giảng viên</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="hidden md:flex bg-white/20 border-none px-4 py-2 text-white">
                Instructor Access
              </Badge>
              <Button 
                onClick={toggleTheme} 
                variant="outline" 
                className="bg-white/10 border-white/30 hover:bg-white/20 text-white"
                title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </Button>
              <Button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🔴 Logout button clicked!');
                  handleLogout();
                }}
                variant="outline" 
                className="bg-red-500/80 border-red-400 hover:bg-red-600 text-white cursor-pointer"
                style={{ zIndex: 1000 }}
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
                <span className="ml-2 hidden md:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Separator */}
      <div className="sidebar-separator hidden lg:block"></div>

      {/* Sidebar */}
      <div 
        className={`fixed left-0 bottom-0 w-64 shadow-2xl z-30 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 overflow-y-auto`}
        style={{ 
          top: '80px',
          backgroundColor: theme === 'dark' ? '#1e293b' : currentColors.card,
          boxShadow: theme === 'dark' ? '2px 0 16px rgba(0, 0, 0, 0.4)' : '2px 0 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="flex flex-col h-full" style={{ paddingRight: '8px' }}>
          <nav className="flex-1 overflow-y-auto py-6 custom-scrollbar">
            <div className="space-y-2 px-4">
              
              {/* Dashboard */}
              <Link
                to="/instructor/dashboard"
                onClick={() => setSidebarOpen(false)}
                className={`sidebar-menu-item ${activeMenu === 'dashboard' ? 'active' : ''} w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200`}
                style={{
                  backgroundColor: activeMenu === 'dashboard' ? currentColors.primary + '20' : 'transparent',
                  color: activeMenu === 'dashboard' ? currentColors.primary : currentColors.text,
                  fontWeight: activeMenu === 'dashboard' ? '600' : '500'
                }}
              >
                <div 
                  className="p-2 rounded-lg"
                  style={{
                    backgroundColor: activeMenu === 'dashboard' 
                      ? (theme === 'dark' ? 'rgba(94, 234, 212, 0.2)' : 'rgba(255, 255, 255, 0.5)')
                      : 'transparent'
                  }}
                >
                  <Home className="w-5 h-5" />
                </div>
                <span className="font-medium">Tổng quan</span>
              </Link>

              {/* Divider */}
              <div className="h-px my-3" style={{ backgroundColor: currentColors.border }} />

              {/* Quản lý khóa học */}
              <div className="pt-1">
                <button
                  onClick={() => toggleSection('courses')}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
                  style={{ 
                    color: currentColors.textSecondary,
                    backgroundColor: 'transparent'
                  }}
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="flex-1 text-left">Quản lý khóa học</span>
                  {expandedSections.courses ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                
                {expandedSections.courses && (
                  <div className="mt-2 space-y-1 ml-2">
                    <Link
                      to="/instructor/courses/create"
                      onClick={() => setSidebarOpen(false)}
                      className={`sidebar-menu-item ${activeMenu === 'create-course' ? 'active' : ''} w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200`}
                      style={{
                        backgroundColor: activeMenu === 'create-course' ? currentColors.primary + '20' : 'transparent',
                        color: activeMenu === 'create-course' ? currentColors.primary : currentColors.text,
                        fontWeight: activeMenu === 'create-course' ? '600' : '500'
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-sm">Tạo khóa học</span>
                    </Link>

                    <Link
                      to="/instructor/dashboard"
                      onClick={() => setSidebarOpen(false)}
                      className={`sidebar-menu-item ${activeMenu === 'my-courses' ? 'active' : ''} w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200`}
                      style={{
                        backgroundColor: activeMenu === 'my-courses' ? currentColors.primary + '20' : 'transparent',
                        color: activeMenu === 'my-courses' ? currentColors.primary : currentColors.text,
                        fontWeight: activeMenu === 'my-courses' ? '600' : '500'
                      }}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span className="text-sm">Khóa học của tôi</span>
                    </Link>

                    <Link
                      to="/instructor/dashboard?tab=submissions"
                      onClick={() => setSidebarOpen(false)}
                      className={`sidebar-menu-item w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200`}
                      style={{
                        color: currentColors.text,
                        fontWeight: '500'
                      }}
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Chấm điểm bài thi</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Doanh thu & Thống kê */}
              <div className="pt-2">
                <button
                  onClick={() => toggleSection('analytics')}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
                  style={{ 
                    color: currentColors.textSecondary,
                    backgroundColor: 'transparent'
                  }}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="flex-1 text-left">Doanh thu & Thống kê</span>
                  {expandedSections.analytics ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                
                {expandedSections.analytics && (
                  <div className="mt-2 space-y-1 ml-2">
                    <Link
                      to="/instructor/dashboard?tab=analytics"
                      onClick={() => setSidebarOpen(false)}
                      className={`sidebar-menu-item w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200`}
                      style={{
                        color: currentColors.text,
                        fontWeight: '500'
                      }}
                    >
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm">Biểu đồ doanh thu</span>
                    </Link>

                    <Link
                      to="/instructor/dashboard?tab=students"
                      onClick={() => setSidebarOpen(false)}
                      className={`sidebar-menu-item w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200`}
                      style={{
                        color: currentColors.text,
                        fontWeight: '500'
                      }}
                    >
                      <Users className="w-4 h-4" />
                      <span className="text-sm">Thống kê học viên</span>
                    </Link>

                    <Link
                      to="/instructor/dashboard?tab=analytics"
                      onClick={() => setSidebarOpen(false)}
                      className={`sidebar-menu-item w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200`}
                      style={{
                        color: currentColors.text,
                        fontWeight: '500'
                      }}
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">Báo cáo hiệu suất</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="h-px my-3" style={{ backgroundColor: currentColors.border }} />

              {/* Settings */}
              <Link
                to="/instructor/settings"
                onClick={() => setSidebarOpen(false)}
                className={`sidebar-menu-item ${activeMenu === 'settings' ? 'active' : ''} w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200`}
                style={{
                  backgroundColor: activeMenu === 'settings' ? currentColors.primary + '20' : 'transparent',
                  color: activeMenu === 'settings' ? currentColors.primary : currentColors.text,
                  fontWeight: activeMenu === 'settings' ? '600' : '500'
                }}
              >
                <div 
                  className="p-2 rounded-lg"
                  style={{
                    backgroundColor: activeMenu === 'settings' 
                      ? (theme === 'dark' ? 'rgba(94, 234, 212, 0.2)' : 'rgba(255, 255, 255, 0.5)')
                      : 'transparent'
                  }}
                >
                  <Settings className="w-5 h-5" />
                </div>
                <span className="font-medium">Cài đặt</span>
              </Link>

            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div 
        className="transition-all duration-300"
        style={{ 
          marginLeft: '0',
          paddingTop: '80px'
        }}
      >
        <div className="lg:ml-64">
          {children}
        </div>
      </div>
    </div>
  );
};

export default InstructorLayout;
