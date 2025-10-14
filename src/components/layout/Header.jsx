import React, { useState } from 'react';
import { GraduationCap, User, LogOut, Settings, BookOpen } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { useAuth, ROLES, isAdmin, isInstructor, isLearner } from '../../contexts/AuthContext';
import { useNavigation } from '../../hooks/useNavigation';

const Header = ({ user }) => {
  const navigate = useNavigation();
  const { logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = new FormData(e.currentTarget).get('q');
    navigate(`/search?q=${encodeURIComponent(query || '')}`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getRoleName = (roleId) => {
    switch (roleId) {
      case ROLES.ADMIN: return 'Quản trị viên';
      case ROLES.INSTRUCTOR: return 'Giảng viên';
      case ROLES.LEARNER: return 'Học viên';
      default: return 'Người dùng';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
      <div className="container mx-auto px-4 py-3 flex items-center gap-3">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 font-semibold">
          <GraduationCap className="w-5 h-5" />
          Mini‑Coursera
        </a>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl ml-4 flex items-center gap-2">
          <Input 
            name="q" 
            placeholder="Tìm khoá học, chủ đề, giảng viên…"
            className="flex-1"
          />
          <Button type="submit" variant="secondary">
            Tìm
          </Button>
        </form>

        {/* User Menu or Auth Links */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
            >
              <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-sm font-medium">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                <div className="text-xs text-gray-500">{getRoleName(user.role_id)}</div>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-3 border-b">
                  <div className="font-medium text-gray-900">{user.full_name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                  <Badge className="mt-1 bg-teal-100 text-teal-800 text-xs">
                    {getRoleName(user.role_id)}
                  </Badge>
                </div>

                <div className="py-1">
                  <a
                    href="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="w-4 h-4 mr-3" />
                    Hồ sơ cá nhân
                  </a>

                  {isLearner(user) && (
                    <a
                      href="/my-courses"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <BookOpen className="w-4 h-4 mr-3" />
                      Khóa học của tôi
                    </a>
                  )}

                  {isInstructor(user) && (
                    <a
                      href="/instructor"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <BookOpen className="w-4 h-4 mr-3" />
                      Quản lý khóa học
                    </a>
                  )}

                  {isAdmin(user) && (
                    <a
                      href="/admin"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Quản trị hệ thống
                    </a>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <a href="/auth" className="text-sm text-gray-600 hover:text-gray-900">
              Đăng nhập
            </a>
            <span className="text-gray-300">|</span>
            <a href="/auth" className="text-sm text-gray-600 hover:text-gray-900">
              Đăng ký
            </a>
          </div>
        )}
      </div>

      {/* Navigation Bar */}
      <div className="border-t">
        <nav className="container mx-auto px-4 py-2 flex items-center gap-4 text-sm">
          <a href="/catalog" className="hover:underline">
            Danh mục khóa học
          </a>
          <a href="/blog" className="hover:underline">
            Blog
          </a>
          <a href="/pricing" className="hover:underline">
            Bảng giá
          </a>
          {user && (
            <>
              {isLearner(user) && (
                <a href="/my-courses" className="hover:underline">
                  Khóa học của tôi
                </a>
              )}
              {isInstructor(user) && (
                <a href="/instructor" className="hover:underline">
                  Quản lý khóa học
                </a>
              )}
              {isAdmin(user) && (
                <a href="/admin" className="hover:underline">
                  Quản trị
                </a>
              )}
            </>
          )}
        </nav>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};

export default Header;