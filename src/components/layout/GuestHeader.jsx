import React, { useState } from 'react';
import { GraduationCap, Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigation } from '../../hooks/useNavigation';

const GuestHeader = () => {
  const navigate = useNavigation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);

  const navItems = [
    { label: 'Trang chủ', href: '/' },
    { 
      label: 'Khóa học', 
      href: '/catalog',
      hasDropdown: true,
      dropdownItems: [
        { label: 'Tất cả khóa học', href: '/catalog' },
        { label: 'Lập trình Web', href: '/catalog?category=web' },
        { label: 'Khoa học dữ liệu', href: '/catalog?category=data-science' },
        { label: 'Thiết kế UI/UX', href: '/catalog?category=design' },
        { label: 'Marketing Digital', href: '/catalog?category=marketing' }
      ]
    },
    { label: 'Giảng viên', href: '/instructors' },
    { label: 'Blog', href: '/blog' },
    { label: 'Về chúng tôi', href: '/about' },
    { label: 'Liên hệ', href: '/contact' }
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="bg-teal-600 text-white py-2 text-sm">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span>📞 1800-6666</span>
            <span>✉️ support@minicousera.com</span>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <span>🌐 Tiếng Việt</span>
            <span>Theo dõi chúng tôi:</span>
            <div className="flex gap-2">
              <a href="#" className="hover:text-teal-200">📘</a>
              <a href="#" className="hover:text-teal-200">🐦</a>
              <a href="#" className="hover:text-teal-200">📷</a>
              <a href="#" className="hover:text-teal-200">💼</a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
              <GraduationCap className="w-8 h-8 text-teal-600" />
              Mini‑Coursera
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((item, index) => (
                <div key={index} className="relative group">
                  {item.hasDropdown ? (
                    <>
                      <button
                        className="flex items-center gap-1 text-gray-700 hover:text-teal-600 font-medium py-2"
                        onMouseEnter={() => setIsCoursesOpen(true)}
                        onMouseLeave={() => setIsCoursesOpen(false)}
                      >
                        {item.label}
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      
                      {/* Dropdown Menu */}
                      <div 
                        className={`absolute top-full left-0 w-64 bg-white border border-gray-200 rounded-lg shadow-lg py-2 transition-all duration-200 ${
                          isCoursesOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                        }`}
                        onMouseEnter={() => setIsCoursesOpen(true)}
                        onMouseLeave={() => setIsCoursesOpen(false)}
                      >
                        {item.dropdownItems?.map((dropItem, dropIndex) => (
                          <a
                            key={dropIndex}
                            href={dropItem.href}
                            className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-teal-600"
                            onClick={(e) => {
                              e.preventDefault();
                              navigate('/auth');
                            }}
                          >
                            {dropItem.label}
                          </a>
                        ))}
                      </div>
                    </>
                  ) : (
                    <a
                      href={item.href}
                      className="text-gray-700 hover:text-teal-600 font-medium"
                      onClick={(e) => {
                        if (item.href !== '/' && item.href !== '/blog' && item.href !== '/about' && item.href !== '/contact') {
                          e.preventDefault();
                          navigate('/auth');
                        }
                      }}
                    >
                      {item.label}
                    </a>
                  )}
                </div>
              ))}
            </nav>

            {/* Auth Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/auth')}
                className="text-gray-700"
              >
                Đăng nhập
              </Button>
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-teal-600 hover:bg-teal-700"
              >
                Đăng ký miễn phí
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t bg-white">
            <nav className="container mx-auto px-4 py-4">
              <div className="space-y-4">
                {navItems.map((item, index) => (
                  <div key={index}>
                    {item.hasDropdown ? (
                      <div>
                        <button
                          className="flex items-center justify-between w-full text-left text-gray-700 font-medium py-2"
                          onClick={() => setIsCoursesOpen(!isCoursesOpen)}
                        >
                          {item.label}
                          <ChevronDown className={`w-4 h-4 transition-transform ${isCoursesOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isCoursesOpen && (
                          <div className="ml-4 mt-2 space-y-2">
                            {item.dropdownItems?.map((dropItem, dropIndex) => (
                              <a
                                key={dropIndex}
                                href={dropItem.href}
                                className="block text-gray-600 py-1 hover:text-teal-600"
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigate('/auth');
                                }}
                              >
                                {dropItem.label}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <a
                        href={item.href}
                        className="block text-gray-700 font-medium py-2 hover:text-teal-600"
                        onClick={(e) => {
                          if (item.href !== '/' && item.href !== '/blog' && item.href !== '/about' && item.href !== '/contact') {
                            e.preventDefault();
                            navigate('/auth');
                          }
                        }}
                      >
                        {item.label}
                      </a>
                    )}
                  </div>
                ))}
                
                {/* Mobile Auth Buttons */}
                <div className="pt-4 border-t space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-center"
                    onClick={() => navigate('/auth')}
                  >
                    Đăng nhập
                  </Button>
                  <Button 
                    className="w-full justify-center bg-teal-600 hover:bg-teal-700"
                    onClick={() => navigate('/auth')}
                  >
                    Đăng ký miễn phí
                  </Button>
                </div>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default GuestHeader;