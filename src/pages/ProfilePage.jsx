import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Save, Camera, ArrowLeft, BookOpen } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../hooks/useNavigation';
import { authAPI } from '../services/api';
import AppLayout from '../components/layout/AppLayout';

const ProfilePage = () => {
  const { state, updateProfile } = useAuth();
  const navigate = useNavigation();
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState(null); // Store fetched profile
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    gender: '',
    dateOfBirth: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch profile data from API on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setFetchingProfile(true);
        console.log('🔍 Fetching profile from API...');
        const response = await authAPI.getCurrentUser();
        console.log('📦 Profile response:', response);
        
        if (response.success && response.data?.user) {
          const user = response.data.user;
          console.log('✅ Profile data received:', user);
          
          // Store profile data
          setProfileData(user);
          
          // Update form fields
          setFormData({
            full_name: user.fullName || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
            bio: user.bio || '',
            gender: user.gender || '',
            dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
        }
      } catch (error) {
        console.error('❌ Failed to fetch profile:', error);
      } finally {
        setFetchingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Call actual API
      const response = await authAPI.updateProfile({
        fullName: formData.full_name,
        phone: formData.phone,
        address: formData.address,
        bio: formData.bio,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth
      });

      if (response.success) {
        // Update AuthContext with new user data
        if (response.data?.user) {
          const updatedUser = response.data.user;
          setProfileData(updatedUser); // Update displayed profile
          updateProfile(updatedUser);
        }
        alert('Profile updated successfully!');
      } else {
        throw new Error(response.error?.message || 'Update failed');
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    if (formData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would call actual API
      // await changePassword(formData.currentPassword, formData.newPassword);
      
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      alert('Password changed successfully!');
    } catch (error) {
      console.error('Password change failed:', error);
      alert('Failed to change password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout user={state.user}>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="outline" 
          className="mb-6"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <div className="max-w-4xl mx-auto grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                {/* Avatar Section */}
                <div className="text-center mb-6">
                  {fetchingProfile ? (
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse mb-4" />
                      <div className="h-4 w-32 bg-gray-200 animate-pulse mb-2" />
                      <div className="h-3 w-40 bg-gray-200 animate-pulse" />
                    </div>
                  ) : (
                    <div className="relative inline-block">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                        {(profileData?.fullName || formData.full_name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <button className="absolute bottom-0 right-0 w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white hover:bg-teal-700 transition-colors">
                        <Camera className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  
                  {!fetchingProfile && (
                    <>
                      <h3 className="font-semibold text-gray-900">
                        {profileData?.fullName || formData.full_name || 'User'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {profileData?.email || formData.email}
                      </p>
                      {profileData?.phone && (
                        <p className="text-xs text-gray-400 mt-1">
                          📞 {profileData.phone}
                        </p>
                      )}
                      <div className="inline-block px-3 py-1 bg-teal-100 text-teal-800 text-xs rounded-full mt-2">
                        🎓 {profileData?.role || state.user?.role || 'Learner'}
                      </div>
                    </>
                  )}
                </div>

                {/* Menu Items */}
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'profile' 
                        ? 'bg-teal-100 text-teal-700 font-medium' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <User className="h-4 w-4 inline mr-3" />
                    Profile Information
                  </button>
                  <button
                    onClick={() => setActiveTab('password')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'password' 
                        ? 'bg-teal-100 text-teal-700 font-medium' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Lock className="h-4 w-4 inline mr-3" />
                    Change Password
                  </button>
                  <button
                    onClick={() => navigate('/my-courses')}
                    className="w-full text-left px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <BookOpen className="h-4 w-4 inline mr-3" />
                    My Courses
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-teal-600" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Debug Info - Show fetched data */}
                  {profileData && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="text-sm font-semibold text-blue-900 mb-2">
                        ✅ Dữ liệu đã tải từ API:
                      </h4>
                      <div className="text-xs text-blue-700 space-y-1">
                        <p>• Họ tên: <strong>{profileData.fullName || '(chưa có)'}</strong></p>
                        <p>• Email: <strong>{profileData.email || '(chưa có)'}</strong></p>
                        <p>• Số điện thoại: <strong>{profileData.phone || '(chưa cập nhật)'}</strong></p>
                        <p>• Địa chỉ: <strong>{profileData.address || '(chưa cập nhật)'}</strong></p>
                        <p>• Giới tính: <strong>{profileData.gender || '(chưa cập nhật)'}</strong></p>
                        <p>• Ngày sinh: <strong>{profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString('vi-VN') : '(chưa cập nhật)'}</strong></p>
                        <p>• Giới thiệu: <strong>{profileData.bio ? `${profileData.bio.substring(0, 50)}...` : '(chưa có)'}</strong></p>
                      </div>
                    </div>
                  )}
                  
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <Input
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email"
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <Input
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Enter your phone number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gender
                        </label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date of Birth
                        </label>
                        <Input
                          name="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address
                        </label>
                        <Input
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="Enter your address"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio / Introduction
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Tell us about yourself..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                        maxLength={2000}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.bio.length}/2000 characters
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="bg-teal-600 hover:bg-teal-700"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {activeTab === 'password' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-teal-600" />
                    Change Password
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <Input
                        name="currentPassword"
                        type="password"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        placeholder="Enter current password"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <Input
                        name="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        placeholder="Enter new password"
                        required
                        minLength={6}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <Input
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm new password"
                        required
                        minLength={6}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="bg-teal-600 hover:bg-teal-700"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Changing...
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Change Password
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;