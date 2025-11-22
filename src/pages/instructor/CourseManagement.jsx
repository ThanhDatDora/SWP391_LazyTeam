import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { formatCurrency } from '../../utils/formatters';
import { useNavigation } from '../../hooks/useNavigation';
import { 
  BookOpen, 
  Plus,
  Edit3,
  Trash2,
  Save,
  ArrowLeft,
  FileText,
  Video,
  Award,
  Settings,
  Users,
  Eye
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const CourseManagement = () => {
  const navigate = useNavigation();
  const { id } = useParams();
  const { state: authState } = useAuth();
  const [course, setCourse] = useState(null);
  const [moocs, setMoocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (id && id !== 'create') {
      loadCourse();
    } else {
      // Create new course mode
      setIsEditing(true);
      setCourse({
        title: '',
        description: '',
        price: 0,
        is_free: true,
        level: 'beginner',
        duration_hours: 8,
        instructor_id: authState.user.user_id,
        status: 'draft'
      });
      setFormData({
        title: '',
        description: '',
        price: 0,
        level: 'beginner',
        duration_hours: 8
      });
      setLoading(false);
    }
  }, [id, authState.user]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      
      // Load course details
      const courseResponse = await api.courses.getById(parseInt(id));
      const courseData = courseResponse.data;
      
      // Check if instructor owns this course
      if (courseData.instructor_id !== authState.user.user_id) {
        navigate('/instructor');
        return;
      }

      setCourse(courseData);
      setFormData({
        title: courseData.title,
        description: courseData.description,
        price: courseData.price,
        level: courseData.level,
        duration_hours: courseData.duration_hours
      });

      // Load MOOCs for this course
      const moocsResponse = await api.courses.getCourseContent(parseInt(id));
      setMoocs(moocsResponse.data);

    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (id === 'create') {
        // Create new course
        const response = await api.courses.create({
          ...formData,
          instructor_id: authState.user.user_id,
          status: 'draft',
          start_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        });
        
        if (response.success) {
          navigate(`/instructor/courses/${response.data.course_id}`);
        }
      } else {
        // Update existing course
        const response = await api.courses.updateCourse(parseInt(id), formData);
        
        if (response.success) {
          setCourse({...course, ...formData});
          setIsEditing(false);
        }
      }
    } catch (error) {
      console.error('Error saving course:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addMOOC = () => {
    const newMooc = {
      mooc_id: Date.now(), // Temporary ID
      title: 'Chương mới',
      description: 'Mô tả chương',
      order_index: moocs.length + 1,
      course_id: course.course_id,
      is_temp: true // Flag for new MOOC
    };
    setMoocs([...moocs, newMooc]);
  };

  const updateMOOC = (moocId, field, value) => {
    setMoocs(prev => prev.map(mooc => 
      mooc.mooc_id === moocId 
        ? { ...mooc, [field]: value }
        : mooc
    ));
  };

  const deleteMOOC = (moocId) => {
    setMoocs(prev => prev.filter(mooc => mooc.mooc_id !== moocId));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin khóa học...</p>
        </div>
      </div>
    );
  }

  const isCreateMode = id === 'create';

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/instructor')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isCreateMode ? 'Tạo khóa học mới' : 'Quản lý khóa học'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isCreateMode ? 'Tạo khóa học mới cho học viên' : course?.title}
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          {!isCreateMode && !isEditing && (
            <>
              <Button 
                variant="outline"
                onClick={() => navigate(`/course/${course.course_id}`)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Xem khóa học
              </Button>
              <Button onClick={() => setIsEditing(true)}>
                <Edit3 className="w-4 h-4 mr-2" />
                Chỉnh sửa
              </Button>
            </>
          )}
          
          {(isEditing || isCreateMode) && (
            <>
              <Button 
                variant="outline" 
                onClick={() => {
                  if (isCreateMode) {
                    navigate('/instructor');
                  } else {
                    setIsEditing(false);
                    setFormData({
                      title: course.title,
                      description: course.description,
                      price: course.price,
                      level: course.level,
                      duration_hours: course.duration_hours
                    });
                  }
                }}
              >
                Hủy
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Course Status */}
      {!isCreateMode && (
        <div className="flex items-center gap-4">
          <Badge variant={course?.status === 'published' ? 'default' : 'secondary'}>
            {course?.status === 'published' ? 'Đã duyệt' : course?.status === 'submitted' ? 'Chờ duyệt' : 'Bản nháp'}
          </Badge>
          <Badge variant="outline">
            {course?.price === 0 ? 'Miễn phí' : 'Có phí'}
          </Badge>
          <div className="text-sm text-gray-500">
            {course?.enrolled_count || 0} học viên đã đăng ký
          </div>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
          <TabsTrigger value="content" disabled={isCreateMode}>Nội dung</TabsTrigger>
          <TabsTrigger value="settings" disabled={isCreateMode}>Cài đặt</TabsTrigger>
          <TabsTrigger value="analytics" disabled={isCreateMode}>Thống kê</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên khóa học *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Nhập tên khóa học"
                  disabled={!isEditing && !isCreateMode}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả khóa học *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Mô tả chi tiết về khóa học"
                  rows={4}
                  disabled={!isEditing && !isCreateMode}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cấp độ
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => handleInputChange('level', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    disabled={!isEditing && !isCreateMode}
                  >
                    <option value="beginner">Cơ bản</option>
                    <option value="intermediate">Trung cấp</option>
                    <option value="advanced">Nâng cao</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời lượng (giờ)
                  </label>
                  <Input
                    type="number"
                    value={formData.duration_hours}
                    onChange={(e) => handleInputChange('duration_hours', parseInt(e.target.value))}
                    min="1"
                    disabled={!isEditing && !isCreateMode}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại khóa học
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="courseType"
                        value="free"
                        checked={formData.price === 0}
                        onChange={() => {
                          handleInputChange('price', 0);
                        }}
                        disabled={!isEditing && !isCreateMode}
                        className="mr-2"
                      />
                      Miễn phí
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="courseType"
                        value="paid"
                        checked={formData.price > 0}
                        onChange={() => handleInputChange('price', 100000)}
                        disabled={!isEditing && !isCreateMode}
                        className="mr-2"
                      />
                      Có phí
                    </label>
                  </div>
                </div>
              </div>

              {formData.price > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá khóa học (VNĐ)
                  </label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseInt(e.target.value))}
                    min="0"
                    step="1000"
                    placeholder="500000"
                    disabled={!isEditing && !isCreateMode}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Nội dung khóa học</h2>
              <Button onClick={addMOOC}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm chương
              </Button>
            </div>

            <div className="space-y-4">
              {moocs.map((mooc, index) => (
                <Card key={mooc.mooc_id} className="border-l-4 border-teal-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-teal-600">
                              {index + 1}
                            </span>
                          </div>
                          <Input
                            value={mooc.title}
                            onChange={(e) => updateMOOC(mooc.mooc_id, 'title', e.target.value)}
                            placeholder="Tên chương"
                            className="font-medium"
                          />
                        </div>
                        
                        <Textarea
                          value={mooc.description}
                          onChange={(e) => updateMOOC(mooc.mooc_id, 'description', e.target.value)}
                          placeholder="Mô tả nội dung chương"
                          rows={2}
                        />

                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            {mooc.lesson_count || 0} bài học
                          </div>
                          <div className="flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            {mooc.duration_minutes || 30} phút
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            {mooc.has_exam ? 'Có bài thi' : 'Không có bài thi'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => deleteMOOC(mooc.mooc_id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {moocs.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Chưa có nội dung nào
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Thêm chương đầu tiên để bắt đầu xây dựng khóa học
                    </p>
                    <Button onClick={addMOOC}>
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm chương đầu tiên
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Cài đặt khóa học
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-8">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Cài đặt khóa học đang được phát triển</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Thống kê khóa học
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {course?.enrolled_count || 0}
                  </div>
                  <div className="text-sm text-gray-600">Tổng học viên</div>
                </div>
                
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {course?.rating || 4.5}
                  </div>
                  <div className="text-sm text-gray-600">Đánh giá trung bình</div>
                </div>
                
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 mb-2">85%</div>
                  <div className="text-sm text-gray-600">Tỷ lệ hoàn thành</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseManagement;