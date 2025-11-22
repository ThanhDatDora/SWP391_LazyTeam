import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import InstructorLayout from '../../components/layout/InstructorLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import { api } from '../../services/api';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase,
  Award,
  BookOpen,
  Users,
  Star,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  GraduationCap,
  Globe,
  Linkedin,
  Facebook,
  Youtube,
  Calendar,
  TrendingUp
} from 'lucide-react';

const InstructorProfile = () => {
  const { state: authState } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [stats, setStats] = useState(null);
  
  // Profile data
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    avatar_url: '',
    headline: '',
    bio: '',
    awards: '',
    documents: '',
    verified: false
  });

  // Certifications
  const [certifications, setCertifications] = useState([]);
  const [showCertDialog, setShowCertDialog] = useState(false);
  const [certFile, setCertFile] = useState(null);
  const [newCert, setNewCert] = useState({
    name: '',
    issuer: '',
    date: '',
    credential_id: ''
  });

  // Experience
  const [experiences, setExperiences] = useState([]);
  const [showExpDialog, setShowExpDialog] = useState(false);
  const [newExp, setNewExp] = useState({
    title: '',
    company: '',
    start_date: '',
    end_date: '',
    description: ''
  });

  useEffect(() => {
    loadProfile();
    loadStats();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      const response = await api.instructor.getProfile();
      if (response.success) {
        const { profile, certifications, experiences } = response.data;
        
        // Merge with user info
        setProfile({
          full_name: authState.user?.fullName || authState.user?.full_name || '',
          email: authState.user?.email || '',
          phone: authState.user?.phone || '',
          avatar_url: authState.user?.avatar_url || '',
          headline: profile.headline || '',
          bio: profile.bio || '',
          awards: profile.awards || '',
          documents: profile.documents || '',
          verified: profile.verified || false
        });
        
        setCertifications(certifications || []);
        setExperiences(experiences || []);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Không thể tải hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.instructor.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      const response = await api.instructor.updateProfile(profile);
      if (response.success) {
        toast.success('Cập nhật hồ sơ thành công!');
        setEditMode(false);
      } else {
        toast.error(response.message || 'Không thể cập nhật hồ sơ');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Không thể cập nhật hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCertification = async () => {
    if (!newCert.name || !newCert.issuer) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      let response;
      
      if (certFile) {
        // Upload with file
        const formData = new FormData();
        formData.append('certificate', certFile);
        formData.append('name', newCert.name);
        formData.append('issuer', newCert.issuer);
        formData.append('date', newCert.date);
        formData.append('credential_id', newCert.credential_id);
        
        const token = localStorage.getItem('authToken');
        const res = await fetch('http://localhost:3001/api/instructor/certifications/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        response = await res.json();
      } else {
        // Without file
        response = await api.instructor.addCertification(newCert);
      }
      
      if (response.success) {
        setCertifications([...certifications, response.data]);
        setNewCert({ name: '', issuer: '', date: '', credential_id: '' });
        setCertFile(null);
        setShowCertDialog(false);
        toast.success('Đã thêm chứng chỉ');
      } else {
        toast.error(response.message || 'Không thể thêm chứng chỉ');
      }
    } catch (error) {
      console.error('Error adding certification:', error);
      toast.error('Không thể thêm chứng chỉ');
    }
  };

  const handleDeleteCert = async (id) => {
    try {
      const response = await api.instructor.deleteCertification(id);
      if (response.success) {
        setCertifications(certifications.filter(cert => cert.id !== id));
        toast.success('Đã xóa chứng chỉ');
      } else {
        toast.error(response.message || 'Không thể xóa chứng chỉ');
      }
    } catch (error) {
      console.error('Error deleting certification:', error);
      toast.error('Không thể xóa chứng chỉ');
    }
  };

  const handleAddExperience = async () => {
    if (!newExp.title || !newExp.company) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      const response = await api.instructor.addExperience(newExp);
      if (response.success) {
        setExperiences([...experiences, response.data]);
        setNewExp({ title: '', company: '', start_date: '', end_date: '', description: '' });
        setShowExpDialog(false);
        toast.success('Đã thêm kinh nghiệm');
      } else {
        toast.error(response.message || 'Không thể thêm kinh nghiệm');
      }
    } catch (error) {
      console.error('Error adding experience:', error);
      toast.error('Không thể thêm kinh nghiệm');
    }
  };

  const handleDeleteExp = async (id) => {
    try {
      const response = await api.instructor.deleteExperience(id);
      if (response.success) {
        setExperiences(experiences.filter(exp => exp.id !== id));
        toast.success('Đã xóa kinh nghiệm');
      } else {
        toast.error(response.message || 'Không thể xóa kinh nghiệm');
      }
    } catch (error) {
      console.error('Error deleting experience:', error);
      toast.error('Không thể xóa kinh nghiệm');
    }
  };

  return (
    <InstructorLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hồ sơ của tôi</h1>
            <p className="text-gray-600 mt-1">Quản lý thông tin cá nhân và hồ sơ giảng dạy</p>
          </div>
          <Button
            onClick={() => editMode ? handleSaveProfile() : setEditMode(true)}
            disabled={loading}
          >
            {editMode ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                Lưu thay đổi
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4 mr-2" />
                Chỉnh sửa
              </>
            )}
          </Button>
          {editMode && (
            <Button
              variant="outline"
              onClick={() => {
                setEditMode(false);
                loadProfile();
              }}
              className="ml-2"
            >
              <X className="w-4 h-4 mr-2" />
              Hủy
            </Button>
          )}
        </div>

        {/* Profile Overview */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-4xl font-bold">
                  {profile.full_name.charAt(0).toUpperCase() || 'I'}
                </div>
                {editMode && (
                  <Button
                    size="sm"
                    className="absolute bottom-0 right-0 rounded-full"
                    variant="outline"
                  >
                    <Edit3 className="w-3 h-3" />
                  </Button>
                )}
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                {editMode ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Họ và tên</label>
                      <input
                        type="text"
                        value={profile.full_name}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Chức danh</label>
                      <input
                        type="text"
                        value={profile.title}
                        onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900">{profile.full_name}</h2>
                    <p className="text-lg text-gray-600 mt-1">{profile.title}</p>
                  </>
                )}

                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {profile.email}
                  </div>
                  {profile.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {profile.phone}
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {profile.location}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Khóa học</p>
                    <p className="text-2xl font-bold text-teal-600">{stats.totalCourses || 0}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-teal-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Học viên</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalStudents || 0}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Đánh giá TB</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {stats.averageRating?.toFixed(1) || '0.0'}
                    </p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Bài nộp</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.totalSubmissions || 0}</p>
                  </div>
                  <Award className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="about">Giới thiệu</TabsTrigger>
            <TabsTrigger value="certifications">Chứng chỉ</TabsTrigger>
            <TabsTrigger value="experience">Kinh nghiệm</TabsTrigger>
          </TabsList>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-4">
            {/* Headline */}
            <Card>
              <CardHeader>
                <CardTitle>Tiêu đề</CardTitle>
              </CardHeader>
              <CardContent>
                {editMode ? (
                  <input
                    type="text"
                    value={profile.headline}
                    onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="VD: Giảng viên CNTT, Chuyên gia Web Development"
                    maxLength={300}
                  />
                ) : (
                  <p className="text-gray-700">
                    {profile.headline || 'Chưa có tiêu đề'}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Bio */}
            <Card>
              <CardHeader>
                <CardTitle>Tiểu sử</CardTitle>
              </CardHeader>
              <CardContent>
                {editMode ? (
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg min-h-[150px]"
                    placeholder="Giới thiệu về bản thân, kinh nghiệm giảng dạy..."
                  />
                ) : (
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {profile.bio || 'Chưa có thông tin tiểu sử'}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Awards */}
            <Card>
              <CardHeader>
                <CardTitle>Giải thưởng & Thành tích</CardTitle>
              </CardHeader>
              <CardContent>
                {editMode ? (
                  <textarea
                    value={profile.awards}
                    onChange={(e) => setProfile({ ...profile, awards: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg min-h-[100px]"
                    placeholder="Liệt kê các giải thưởng, thành tích đạt được..."
                  />
                ) : (
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {profile.awards || 'Chưa có thông tin giải thưởng'}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle>Tài liệu & Chứng nhận khác</CardTitle>
              </CardHeader>
              <CardContent>
                {editMode ? (
                  <textarea
                    value={profile.documents}
                    onChange={(e) => setProfile({ ...profile, documents: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg min-h-[100px]"
                    placeholder="Liệt kê các tài liệu, chứng nhận khác..."
                  />
                ) : (
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {profile.documents || 'Chưa có thông tin tài liệu'}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Certifications Tab */}
          <TabsContent value="certifications" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Chứng chỉ & Bằng cấp</CardTitle>
                <Button size="sm" onClick={() => setShowCertDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm chứng chỉ
                </Button>
              </CardHeader>
              <CardContent>
                {certifications.length > 0 ? (
                  <div className="space-y-4">
                    {certifications.map((cert) => (
                      <div key={cert.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex gap-4 flex-1">
                          <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                            <Award className="w-6 h-6 text-teal-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                            <p className="text-sm text-gray-600">{cert.issuer}</p>
                            {cert.date && (
                              <p className="text-xs text-gray-500 mt-1">
                                Cấp ngày: {new Date(cert.date).toLocaleDateString('vi-VN')}
                              </p>
                            )}
                            {cert.credential_id && (
                              <p className="text-xs text-gray-500">Mã: {cert.credential_id}</p>
                            )}
                            {cert.file_url && (
                              <a
                                href={`http://localhost:3001${cert.file_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Xem chứng chỉ
                              </a>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteCert(cert.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Chưa có chứng chỉ nào</p>
                )}
              </CardContent>
            </Card>

            {/* Certification Dialog */}
            <Dialog open={showCertDialog} onOpenChange={setShowCertDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Thêm chứng chỉ mới</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Tên chứng chỉ *</label>
                    <input
                      type="text"
                      value={newCert.name}
                      onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border rounded-lg"
                      placeholder="VD: AWS Certified Solutions Architect"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tổ chức cấp *</label>
                    <input
                      type="text"
                      value={newCert.issuer}
                      onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border rounded-lg"
                      placeholder="VD: Amazon Web Services"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Ngày cấp</label>
                    <input
                      type="date"
                      value={newCert.date}
                      onChange={(e) => setNewCert({ ...newCert, date: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Mã chứng chỉ</label>
                    <input
                      type="text"
                      value={newCert.credential_id}
                      onChange={(e) => setNewCert({ ...newCert, credential_id: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border rounded-lg"
                      placeholder="VD: AWS-123456"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tải lên chứng chỉ (PDF/JPG/PNG, max 5MB)</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setCertFile(e.target.files[0])}
                      className="w-full mt-1 px-3 py-2 border rounded-lg"
                    />
                    {certFile && (
                      <p className="text-xs text-gray-600 mt-1">
                        File: {certFile.name} ({(certFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => {
                      setShowCertDialog(false);
                      setCertFile(null);
                    }}>
                      Hủy
                    </Button>
                    <Button onClick={handleAddCertification}>
                      Thêm
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Experience Tab */}
          <TabsContent value="experience" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Kinh nghiệm giảng dạy</CardTitle>
                <Button size="sm" onClick={() => setShowExpDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm kinh nghiệm
                </Button>
              </CardHeader>
              <CardContent>
                {experiences.length > 0 ? (
                  <div className="space-y-4">
                    {experiences.map((exp) => (
                      <div key={exp.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                            <p className="text-sm text-gray-600">{exp.company}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              <Calendar className="w-3 h-3 inline mr-1" />
                              {new Date(exp.start_date).toLocaleDateString('vi-VN')} - 
                              {exp.end_date ? new Date(exp.end_date).toLocaleDateString('vi-VN') : 'Hiện tại'}
                            </p>
                            {exp.description && (
                              <p className="text-sm text-gray-600 mt-2">{exp.description}</p>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteExp(exp.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Chưa có kinh nghiệm nào</p>
                )}
              </CardContent>
            </Card>

            {/* Experience Dialog */}
            <Dialog open={showExpDialog} onOpenChange={setShowExpDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Thêm kinh nghiệm mới</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Vị trí *</label>
                    <input
                      type="text"
                      value={newExp.title}
                      onChange={(e) => setNewExp({ ...newExp, title: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border rounded-lg"
                      placeholder="VD: Senior Instructor"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tổ chức *</label>
                    <input
                      type="text"
                      value={newExp.company}
                      onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border rounded-lg"
                      placeholder="VD: Tech Academy"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Từ ngày</label>
                      <input
                        type="date"
                        value={newExp.start_date}
                        onChange={(e) => setNewExp({ ...newExp, start_date: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Đến ngày</label>
                      <input
                        type="date"
                        value={newExp.end_date}
                        onChange={(e) => setNewExp({ ...newExp, end_date: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Mô tả</label>
                    <textarea
                      value={newExp.description}
                      onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border rounded-lg min-h-[100px]"
                      placeholder="Mô tả công việc và trách nhiệm..."
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowExpDialog(false)}>
                      Hủy
                    </Button>
                    <Button onClick={handleAddExperience}>
                      Thêm
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </InstructorLayout>
  );
};

export default InstructorProfile;
