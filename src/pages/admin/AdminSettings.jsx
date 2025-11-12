import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Settings, 
  Bell, 
  Shield, 
  Database, 
  Mail, 
  Globe,
  Save,
  RefreshCw,
  Trash2,
  Download,
  Upload
} from 'lucide-react';

const AdminSettings = () => {
  const { theme } = useOutletContext();
  const [settings, setSettings] = useState({
    // Notification settings
    emailNotifications: true,
    newUserNotifications: true,
    courseApprovalNotifications: true,
    paymentNotifications: true,
    
    // System settings
    maintenanceMode: false,
    allowNewRegistrations: true,
    allowCourseCreation: true,
    
    // Platform settings
    platformName: 'Mini Coursera',
    platformEmail: 'admin@minicoursera.com',
    defaultCurrency: 'VND',
    
    // Security settings
    requireEmailVerification: true,
    minPasswordLength: 8,
    sessionTimeout: 24
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // TODO: Save to backend
    console.log('💾 Saving settings:', settings);
    alert('✅ Cài đặt đã được lưu thành công!');
    setHasChanges(false);
  };

  const handleReset = () => {
    if (confirm('Bạn có chắc muốn khôi phục cài đặt mặc định?')) {
      // TODO: Load default settings
      alert('🔄 Đã khôi phục cài đặt mặc định');
      setHasChanges(false);
    }
  };

  return (
    <div className="px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: theme === 'dark' ? '#fff' : '#1f2937' }}>
            Cài đặt hệ thống
          </h1>
          <p className="text-gray-500 mt-1">Quản lý cấu hình và tùy chọn nền tảng</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Khôi phục mặc định
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              hasChanges 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            Lưu thay đổi
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Thông báo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email thông báo</p>
                <p className="text-sm text-gray-500">Nhận email về hoạt động hệ thống</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Người dùng mới</p>
                <p className="text-sm text-gray-500">Thông báo khi có đăng ký mới</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.newUserNotifications}
                  onChange={(e) => handleSettingChange('newUserNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Duyệt khóa học</p>
                <p className="text-sm text-gray-500">Thông báo khi có khóa học mới cần duyệt</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.courseApprovalNotifications}
                  onChange={(e) => handleSettingChange('courseApprovalNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Thanh toán</p>
                <p className="text-sm text-gray-500">Thông báo về giao dịch thanh toán</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.paymentNotifications}
                  onChange={(e) => handleSettingChange('paymentNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Hệ thống
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Chế độ bảo trì</p>
                <p className="text-sm text-gray-500">Tạm khóa truy cập người dùng</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Cho phép đăng ký</p>
                <p className="text-sm text-gray-500">Người dùng mới có thể tạo tài khoản</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowNewRegistrations}
                  onChange={(e) => handleSettingChange('allowNewRegistrations', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Tạo khóa học</p>
                <p className="text-sm text-gray-500">Giảng viên có thể tạo khóa học mới</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowCourseCreation}
                  onChange={(e) => handleSettingChange('allowCourseCreation', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Platform Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Nền tảng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên nền tảng
              </label>
              <input
                type="text"
                value={settings.platformName}
                onChange={(e) => handleSettingChange('platformName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email nền tảng
              </label>
              <input
                type="email"
                value={settings.platformEmail}
                onChange={(e) => handleSettingChange('platformEmail', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đơn vị tiền tệ mặc định
              </label>
              <select
                value={settings.defaultCurrency}
                onChange={(e) => handleSettingChange('defaultCurrency', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="VND">VND - Việt Nam Đồng</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Bảo mật
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Xác thực email</p>
                <p className="text-sm text-gray-500">Yêu cầu xác thực email khi đăng ký</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.requireEmailVerification}
                  onChange={(e) => handleSettingChange('requireEmailVerification', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Độ dài mật khẩu tối thiểu
              </label>
              <input
                type="number"
                min="6"
                max="20"
                value={settings.minPasswordLength}
                onChange={(e) => handleSettingChange('minPasswordLength', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian phiên (giờ)
              </label>
              <input
                type="number"
                min="1"
                max="168"
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Database Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Quản lý dữ liệu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              Sao lưu dữ liệu
            </button>
            <button className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Upload className="w-4 h-4" />
              Khôi phục dữ liệu
            </button>
            <button className="flex items-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              <Trash2 className="w-4 h-4" />
              Xóa cache
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
