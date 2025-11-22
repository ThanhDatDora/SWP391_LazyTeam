import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit3, 
  Save, 
  X, 
  Camera, 
  Award,
  BookOpen,
  Clock,
  Star,
  Settings,
  Shield
} from 'lucide-react';
import LearnerNavbar from '../components/layout/LearnerNavbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import { useToast } from '../components/ui/Toast';

const MyProfilePage = () => {
  const { state, updateProfile: updateAuthProfile } = useAuth();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [userStats, setUserStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    totalHours: 0,
    certificates: 0
  });

  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    bio: '',
    address: '',
    gender: '',
    dateOfBirth: '',
    avatarUrl: '',
    joined_date: new Date().toISOString()
  });

  const [editData, setEditData] = useState({ ...profileData });

  // Fetch profile from API on mount
  useEffect(() => {
    loadUserProfile();
    loadUserStats();
  }, []);

  const loadUserProfile = async () => {
    try {
      setFetchingProfile(true);
      console.log('🔍 Fetching profile from API...');
      
      const response = await authAPI.getCurrentUser();
      console.log('📦 Profile response:', response);
      
      if (response.success && response.data?.user) {
        const user = response.data.user;
        console.log('✅ Profile data received:', user);
        
        // Use camelCase property names to match API and form inputs
        const newProfileData = {
          fullName: user.fullName || '',
          email: user.email || '',
          phone: user.phone || '',
          bio: user.bio || '',
          address: user.address || '',
          gender: user.gender || '',
          dateOfBirth: user.dateOfBirth || '',
          avatarUrl: user.avatarUrl || user.avatar_url || '',
          joined_date: user.createdAt || new Date().toISOString()
        };
        
        setProfileData(newProfileData);
        setEditData(newProfileData);
      }
    } catch (error) {
      console.error('❌ Failed to fetch profile:', error);
      // Fallback to localStorage if API fails
      if (state.user) {
        const fallbackData = {
          fullName: state.user.full_name || state.user.fullName || '',
          email: state.user.email || '',
          phone: state.user.phone || '',
          bio: state.user.bio || '',
          address: state.user.address || '',
          gender: state.user.gender || '',
          dateOfBirth: state.user.dateOfBirth || '',
          avatarUrl: state.user.avatarUrl || state.user.avatar_url || '',
          joined_date: state.user.created_at || new Date().toISOString()
        };
        setProfileData(fallbackData);
        setEditData(fallbackData);
      }
    } finally {
      setFetchingProfile(false);
    }
  };

  const loadUserStats = async () => {
    try {
      console.log('📊 Loading user stats...');
      // Fetch enrollment data to calculate stats
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/enrollments/my-enrollments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Enrollments data:', data);
        
        if (data.success && data.data) {
          const enrollments = data.data;
          const totalCourses = enrollments.length;
          const completedCourses = enrollments.filter(e => e.completed_at || e.progress === 100).length;
          const inProgressCourses = enrollments.filter(e => !e.completed_at && e.progress > 0).length;
          
          setUserStats({
            totalCourses,
            completedCourses,
            inProgressCourses,
            totalHours: 120, // TODO: Calculate from actual course durations
            certificates: completedCourses // Certificates = completed courses
          });
          console.log('✅ Stats loaded:', { totalCourses, completedCourses, inProgressCourses, certificates: completedCourses });
        }
      } else {
        console.error('❌ Failed to fetch enrollments');
        // Fallback to hardcoded stats
        setUserStats({
          totalCourses: 0,
          completedCourses: 0,
          inProgressCourses: 0,
          totalHours: 0,
          certificates: 0
        });
      }
    } catch (error) {
      console.error('❌ Error loading user stats:', error);
      setUserStats({
        totalCourses: 0,
        completedCourses: 0,
        inProgressCourses: 0,
        totalHours: 0,
        certificates: 0
      });
    }
  };

  const handleEdit = () => {
    setEditData({ ...profileData });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditData({ ...profileData });
    setIsEditing(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      console.log('💾 Saving profile...', editData);
      
      // Only send fields that have values (avoid validation errors for empty strings)
      const updateData = {};
      
      if (editData.fullName) updateData.fullName = editData.fullName;
      if (editData.phone) updateData.phone = editData.phone;
      if (editData.address) updateData.address = editData.address;
      if (editData.bio) updateData.bio = editData.bio;
      if (editData.gender) updateData.gender = editData.gender;
      if (editData.dateOfBirth) updateData.dateOfBirth = editData.dateOfBirth;
      
      console.log('📤 Sending to API:', updateData);
      
      const response = await authAPI.updateProfile(updateData);

      console.log('📦 Update response:', response);

      if (response.success) {
        // Update local state with new data
        const updatedData = response.data?.user || response.user || editData;
        setProfileData({ ...profileData, ...updatedData });
        setEditData({ ...profileData, ...updatedData });
        setIsEditing(false);
        
        // Update AuthContext with new user data
        updateAuthProfile(updatedData);
        
        // Show beautiful success toast
        toast.success('Cập nhật thông tin cá nhân thành công!', {
          title: '✅ Thành công',
          duration: 4000
        });
      } else {
        // Show validation errors if available
        if (response.validationErrors) {
          const errorMessages = response.validationErrors.map(err => err.msg).join('\n');
          toast.error(errorMessages, {
            title: '❌ Lỗi xác thực',
            duration: 5000
          });
          throw new Error(`Validation errors:\n${errorMessages}`);
        }
        throw new Error(response.error || 'Update failed');
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      toast.error(error.message || 'Không thể cập nhật thông tin. Vui lòng thử lại sau.', {
        title: '❌ Lỗi',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setEditData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAvatarClick = () => {
    document.getElementById('avatar-upload').click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh hợp lệ', {
        title: '❌ Lỗi',
        duration: 3000
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB', {
        title: '❌ Lỗi',
        duration: 3000
      });
      return;
    }

    try {
      setUploadingAvatar(true);
      
      // Convert to base64 for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        
        // Update avatar immediately for preview
        setProfileData(prev => ({
          ...prev,
          avatarUrl: base64String
        }));
        setEditData(prev => ({
          ...prev,
          avatarUrl: base64String
        }));
      };
      reader.readAsDataURL(file);

      // Create FormData to send file
      const formData = new FormData();
      formData.append('avatar', file);

      // Upload to server
      const response = await authAPI.updateAvatar(formData);

      if (response.success) {
        const avatarUrl = response.data?.avatarUrl || response.avatarUrl;
        
        // Update with server URL
        setProfileData(prev => ({
          ...prev,
          avatarUrl: avatarUrl
        }));
        setEditData(prev => ({
          ...prev,
          avatarUrl: avatarUrl
        }));

        // Update auth context
        updateAuthProfile({ avatarUrl });

        toast.success('Cập nhật ảnh đại diện thành công!', {
          title: '✅ Thành công',
          duration: 3000
        });
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (error) {
      console.error('❌ Error uploading avatar:', error);
      toast.error('Không thể tải ảnh lên. Vui lòng thử lại sau.', {
        title: '❌ Lỗi',
        duration: 4000
      });
      
      // Revert to original avatar
      setProfileData(prev => ({
        ...prev,
        avatarUrl: profileData.avatarUrl
      }));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <LearnerNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          </div>
          
          {/* Profile Info */}
          <div className="px-8 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6">
              {/* Avatar */}
              <div className="relative -mt-16 mb-4 sm:mb-0">
                {profileData.avatarUrl ? (
                  <img
                    src={profileData.avatarUrl}
                    alt="Avatar"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg">
                    {(profileData.fullName || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                
                {/* Hidden file input */}
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                
                {/* Camera button */}
                <button
                  onClick={handleAvatarClick}
                  disabled={uploadingAvatar}
                  className="absolute bottom-2 right-2 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Thay đổi ảnh đại diện"
                >
                  {uploadingAvatar ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <Camera className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    {fetchingProfile ? (
                      <>
                        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-2" />
                        <div className="h-4 w-64 bg-gray-200 animate-pulse rounded mb-2" />
                        <div className="h-4 w-40 bg-gray-200 animate-pulse rounded" />
                      </>
                    ) : (
                      <>
                        <h1 className="text-3xl font-bold text-gray-900">
                          {profileData.fullName || 'Người dùng'}
                        </h1>
                        <p className="text-gray-600 flex items-center mt-1">
                          <Mail className="h-4 w-4 mr-2" />
                          {profileData.email}
                        </p>
                        {profileData.phone && (
                          <p className="text-gray-600 flex items-center mt-1">
                            <Phone className="h-4 w-4 mr-2" />
                            {profileData.phone}
                          </p>
                        )}
                        {profileData.address && (
                          <p className="text-gray-600 flex items-center mt-1">
                            <MapPin className="h-4 w-4 mr-2" />
                            {profileData.address}
                          </p>
                        )}
                        <p className="text-gray-500 flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-2" />
                          Tham gia từ {formatDate(profileData.joined_date)}
                        </p>
                      </>
                    )}
                  </div>
                  
                  <div className="mt-4 sm:mt-0">
                    {!isEditing ? (
                      <button
                        onClick={handleEdit}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Chỉnh sửa profile
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSave}
                          disabled={loading}
                          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {loading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Lưu
                        </button>
                        <button
                          onClick={handleCancel}
                          className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Hủy
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            icon={BookOpen}
            title="Tổng khóa học"
            value={userStats.totalCourses}
            color="blue"
          />
          <StatCard
            icon={Award}
            title="Đã hoàn thành"
            value={userStats.completedCourses}
            color="green"
          />
          <StatCard
            icon={Clock}
            title="Đang học"
            value={userStats.inProgressCourses}
            color="yellow"
          />
          <StatCard
            icon={Star}
            title="Giờ học"
            value={userStats.totalHours}
            subtitle="tổng thời gian"
            color="purple"
          />
          <StatCard
            icon={Award}
            title="Chứng chỉ"
            value={userStats.certificates}
            color="orange"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {[
                { key: 'overview', label: 'Tổng quan', icon: User },
                { key: 'courses', label: 'Khóa học của tôi', icon: BookOpen },
                { key: 'certificates', label: 'Chứng chỉ', icon: Award },
                { key: 'settings', label: 'Cài đặt', icon: Settings }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Thông tin cá nhân</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Họ và tên
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="fullName"
                          value={editData.fullName || editData.full_name || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profileData.fullName || profileData.full_name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          value={editData.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profileData.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phone"
                          value={editData.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nhập số điện thoại"
                        />
                      ) : (
                        <p className="text-gray-900">{profileData.phone || 'Chưa cập nhật'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Địa chỉ
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="address"
                          value={editData.address}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nhập địa chỉ"
                        />
                      ) : (
                        <p className="text-gray-900">{profileData.address || 'Chưa cập nhật'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giới thiệu
                      </label>
                      {isEditing ? (
                        <textarea
                          name="bio"
                          value={editData.bio}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Viết vài dòng giới thiệu về bản thân..."
                        />
                      ) : (
                        <p className="text-gray-900">{profileData.bio || 'Chưa có thông tin giới thiệu'}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Hoạt động gần đây</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Award className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Hoàn thành khóa học "React Fundamentals"</p>
                        <p className="text-sm text-gray-500">2 ngày trước</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Bắt đầu khóa học "Advanced JavaScript"</p>
                        <p className="text-sm text-gray-500">1 tuần trước</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Star className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Đạt 100 giờ học tập</p>
                        <p className="text-sm text-gray-500">2 tuần trước</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'courses' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Khóa học của tôi</h3>
                
                {/* Course Filter */}
                <div className="flex space-x-4 mb-6">
                  <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium">
                    Tất cả (12)
                  </button>
                  <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    Đang học (4)
                  </button>
                  <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    Đã hoàn thành (8)
                  </button>
                </div>

                {/* Course Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Sample Course Card */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-40 bg-gradient-to-br from-blue-400 to-purple-600"></div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">React Fundamentals</h4>
                      <p className="text-sm text-gray-600 mb-3">Học cơ bản về React JS</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                          Đã hoàn thành
                        </span>
                        <span className="text-sm text-gray-500">100%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-40 bg-gradient-to-br from-green-400 to-blue-600"></div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Advanced JavaScript</h4>
                      <p className="text-sm text-gray-600 mb-3">JavaScript nâng cao</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                          Đang học
                        </span>
                        <span className="text-sm text-gray-500">60%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-40 bg-gradient-to-br from-purple-400 to-pink-600"></div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">UI/UX Design</h4>
                      <p className="text-sm text-gray-600 mb-3">Thiết kế giao diện người dùng</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                          Đang học
                        </span>
                        <span className="text-sm text-gray-500">30%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'certificates' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Chứng chỉ của tôi</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Certificate Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <Award className="h-5 w-5 text-blue-600 mr-2" />
                          <span className="text-sm font-medium text-blue-600">Chứng chỉ hoàn thành</span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">React Fundamentals</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Hoàn thành ngày: 15/10/2024
                        </p>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Tải xuống →
                        </button>
                      </div>
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <Award className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <Award className="h-5 w-5 text-green-600 mr-2" />
                          <span className="text-sm font-medium text-green-600">Chứng chỉ hoàn thành</span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">HTML & CSS Basics</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Hoàn thành ngày: 01/10/2024
                        </p>
                        <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                          Tải xuống →
                        </button>
                      </div>
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <Award className="h-8 w-8 text-green-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Cài đặt tài khoản</h3>
                
                <div className="space-y-6">
                  {/* Privacy Settings */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Quyền riêng tư
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700">Hiển thị profile công khai</p>
                          <p className="text-sm text-gray-500">Cho phép người khác xem profile của bạn</p>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                          <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition"></span>
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700">Hiển thị khóa học đã hoàn thành</p>
                          <p className="text-sm text-gray-500">Cho phép người khác xem tiến độ học tập</p>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                          <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition"></span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notification Settings */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Thông báo</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700">Email thông báo</p>
                          <p className="text-sm text-gray-500">Nhận thông báo qua email</p>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                          <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition"></span>
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700">Thông báo khóa học mới</p>
                          <p className="text-sm text-gray-500">Thông báo khi có khóa học mới phù hợp</p>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                          <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition"></span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h4 className="font-medium text-red-900 mb-4">Vùng nguy hiểm</h4>
                    <div className="space-y-4">
                      <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                        Đổi mật khẩu
                      </button>
                      <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors ml-4">
                        Xóa tài khoản
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MyProfilePage;