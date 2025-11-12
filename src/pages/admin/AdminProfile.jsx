import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, Calendar, Shield, Edit2, Save, X, Camera } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3001/api';

const AdminProfile = () => {
  const { theme } = useOutletContext();
  const [adminData, setAdminData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminProfile();
  }, []);

  const loadAdminProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const userData = data.data || data;
        setAdminData(userData);
        setFormData({
          full_name: userData.full_name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          bio: userData.bio || ''
        });
      }
    } catch (error) {
      console.error('Error loading admin profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadAdminProfile();
        setIsEditing(false);
        alert('✅ Cập nhật hồ sơ thành công!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('❌ Có lỗi xảy ra khi cập nhật hồ sơ');
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: adminData.full_name || '',
      email: adminData.email || '',
      phone: adminData.phone || '',
      bio: adminData.bio || ''
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: theme === 'dark' ? '#fff' : '#1f2937' }}>
            Hồ sơ Admin
          </h1>
          <p className="text-gray-500 mt-1">Quản lý thông tin cá nhân của bạn</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Chỉnh sửa
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Lưu
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
              Hủy
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar & Basic Info */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              {/* Avatar */}
              <div className="relative mb-4">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                  {adminData?.full_name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Name & Role */}
              <h2 className="text-2xl font-bold mb-1" style={{ color: theme === 'dark' ? '#fff' : '#1f2937' }}>
                {adminData?.full_name || 'Admin'}
              </h2>
              <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full mb-4">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-semibold">Administrator</span>
              </div>

              {/* Stats */}
              <div className="w-full mt-4 pt-4 border-t border-gray-200">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày tạo:</span>
                    <span className="font-semibold" style={{ color: theme === 'dark' ? '#fff' : '#1f2937' }}>
                      {adminData?.created_at ? new Date(adminData.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                      Hoạt động
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Thông tin chi tiết</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4" />
                Họ và tên
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg" style={{ color: theme === 'dark' ? '#1f2937' : '#1f2937' }}>
                  {adminData?.full_name || 'Chưa cập nhật'}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-600">
                {adminData?.email || 'Chưa cập nhật'}
                <span className="ml-2 text-xs text-gray-500">(Không thể thay đổi)</span>
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4" />
                Số điện thoại
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg" style={{ color: theme === 'dark' ? '#1f2937' : '#1f2937' }}>
                  {adminData?.phone || 'Chưa cập nhật'}
                </p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                Giới thiệu
              </label>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Viết vài dòng về bản thân..."
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg min-h-[100px]" style={{ color: theme === 'dark' ? '#1f2937' : '#1f2937' }}>
                  {adminData?.bio || 'Chưa có giới thiệu'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin tài khoản</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4" />
                Ngày tạo tài khoản
              </label>
              <p className="px-4 py-2 bg-gray-50 rounded-lg">
                {adminData?.created_at ? new Date(adminData.created_at).toLocaleString('vi-VN') : 'N/A'}
              </p>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Shield className="w-4 h-4" />
                Quyền hạn
              </label>
              <p className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg font-semibold">
                Administrator (Toàn quyền quản trị)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProfile;
