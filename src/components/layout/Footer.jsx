import { GraduationCap, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useNavigation } from '../../hooks/useNavigation';

const Footer = () => {
  const navigate = useNavigation();
  const quickLinks = [
    'Về chúng tôi',
    'Giảng viên',
    'Khóa học',
    'Blog',
    'Liên hệ',
    'Hỗ trợ',
    'Điều khoản sử dụng',
    'Chính sách bảo mật'
  ];

  const courseCategories = [
    'Lập trình Web',
    'Khoa học dữ liệu',
    'Thiết kế UI/UX',
    'Marketing Digital',
    'Kỹ năng mềm',
    'Quản trị kinh doanh',
    'Ngoại ngữ',
    'Nhiếp ảnh'
  ];

  const supportInfo = [
    { icon: Phone, text: '1800-6666', href: 'tel:18006666' },
    { icon: Mail, text: 'support@minicousera.com', href: 'mailto:support@minicousera.com' },
    { icon: MapPin, text: '123 Đường ABC, Quận 1, TP.HCM' }
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', color: 'hover:text-blue-600' },
    { icon: Twitter, href: '#', color: 'hover:text-blue-400' },
    { icon: Instagram, href: '#', color: 'hover:text-pink-600' },
    { icon: Linkedin, href: '#', color: 'hover:text-blue-700' },
    { icon: Youtube, href: '#', color: 'hover:text-red-600' }
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <GraduationCap className="w-8 h-8 text-teal-400" />
              <span className="font-bold text-xl">Mini‑Coursera</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Nền tảng học trực tuyến hàng đầu Việt Nam, cung cấp các khóa học chất lượng cao từ những chuyên gia trong ngành.
            </p>
            <div className="space-y-2">
              {supportInfo.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  {item.href ? (
                    <a 
                      href={item.href} 
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {item.text}
                    </a>
                  ) : (
                    <span className="text-gray-400">{item.text}</span>
                  )}
                </div>
              ))}
            </div>
            
            {/* Social Links */}
            <div className="flex gap-4 pt-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className={`p-2 bg-gray-800 rounded-lg transition-colors ${social.color}`}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Liên kết nhanh</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href="#" 
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Course Categories */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Danh mục khóa học</h3>
            <ul className="space-y-3">
              {courseCategories.map((category, index) => (
                <li key={index}>
                  <a 
                    href="#" 
                    className="text-gray-400 hover:text-white transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/auth');
                    }}
                  >
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Đăng ký nhận tin</h3>
            <p className="text-gray-400 mb-4">
              Nhận thông báo về khóa học mới và ưu đãi đặc biệt
            </p>
            <form className="space-y-3">
              <Input
                type="email"
                placeholder="Nhập email của bạn"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
              <Button className="w-full bg-teal-600 hover:bg-teal-700">
                Đăng ký
              </Button>
            </form>
            
            {/* Achievement Badges */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                <span className="text-2xl">🏆</span>
                <div>
                  <div className="text-white font-medium">15,000+</div>
                  <div className="text-gray-400 text-sm">Học viên</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                <span className="text-2xl">⭐</span>
                <div>
                  <div className="text-white font-medium">4.8/5</div>
                  <div className="text-gray-400 text-sm">Đánh giá</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm text-center md:text-left">
              © 2025 Mini‑Coursera. Tất cả quyền được bảo lưu.
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white">
                Điều khoản sử dụng
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                Chính sách bảo mật
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                Cookie Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 p-3 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg transition-all hover:scale-110 z-50"
        title="Về đầu trang"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </footer>
  );
};

export default Footer;