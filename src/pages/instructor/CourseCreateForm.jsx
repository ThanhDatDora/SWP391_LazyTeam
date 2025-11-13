import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import RichTextEditor from '../../components/ui/RichTextEditor';
import InstructorLayout from '../../components/layout/InstructorLayout';
import { useNavigation } from '@/hooks/useNavigation';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Save, Upload, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CATEGORIES = [
  { value: 'programming', label: 'Lập trình' },
  { value: 'web-development', label: 'Phát triển Web' },
  { value: 'mobile-development', label: 'Phát triển Mobile' },
  { value: 'data-science', label: 'Khoa học dữ liệu' },
  { value: 'machine-learning', label: 'Machine Learning' },
  { value: 'design', label: 'Thiết kế' },
  { value: 'business', label: 'Kinh doanh' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'language', label: 'Ngôn ngữ' },
  { value: 'other', label: 'Khác' }
];

const CourseCreateForm = () => {
  const navigate = useNavigation();
  const { state: authState } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    duration: '',
    level: 'beginner',
    language: 'vi',
    thumbnail_url: '',
    is_free: false,
    requirements: '',
    what_you_will_learn: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file ảnh');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({
          ...prev,
          thumbnail_url: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tên khóa học');
      return false;
    }

    if (!formData.description.trim()) {
      toast.error('Vui lòng nhập mô tả khóa học');
      return false;
    }

    if (!formData.category) {
      toast.error('Vui lòng chọn danh mục');
      return false;
    }

    if (!formData.is_free) {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price < 0) {
        toast.error('Vui lòng nhập giá hợp lệ');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const submitData = {
        ...formData,
        price: formData.is_free ? 0 : parseFloat(formData.price),
        duration: parseInt(formData.duration) || 0
      };

      console.log('📤 Sending course data:', submitData);

      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();
      
      console.log('📥 Server response:', data);

      if (response.ok && data.success) {
        toast.success('Tạo khóa học thành công!');
        navigate(`/instructor/courses/${data.data.course_id}`);
      } else {
        console.error('❌ Error response:', data);
        toast.error(data.message || 'Có lỗi xảy ra khi tạo khóa học');
      }

    } catch (error) {
      console.error('❌ Error creating course:', error);
      toast.error('Không thể tạo khóa học. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <InstructorLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/instructor/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại dashboard
          </Button>

          <h1 className="text-3xl font-bold text-gray-900">
            Tạo khóa học mới
          </h1>
          <p className="text-gray-600 mt-2">
            Điền thông tin để tạo khóa học của bạn
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tên khóa học <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Nhập tên khóa học..."
                  maxLength={255}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.title.length}/255 ký tự
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Mô tả <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(value) => handleInputChange('description', value)}
                  placeholder="Mô tả chi tiết về khóa học của bạn..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Sử dụng editor để format text, thêm lists, links, etc.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn danh mục">
                        {formData.category ? CATEGORIES.find(c => c.value === formData.category)?.label : 'Chọn danh mục'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Cấp độ
                  </label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) => handleInputChange('level', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn cấp độ">
                        {formData.level === 'beginner' && 'Beginner (Người mới)'}
                        {formData.level === 'intermediate' && 'Intermediate (Trung cấp)'}
                        {formData.level === 'advanced' && 'Advanced (Nâng cao)'}
                        {!formData.level && 'Chọn cấp độ'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner (Người mới)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (Trung cấp)</SelectItem>
                      <SelectItem value="advanced">Advanced (Nâng cao)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Định giá</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_free}
                    onChange={(e) => handleInputChange('is_free', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium">Khóa học miễn phí</span>
                </label>
              </div>

              {!formData.is_free && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Giá (USD) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0.00"
                    required={!formData.is_free}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Platform sẽ giữ 20% phí. Bạn nhận 80% doanh thu.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Course Details */}
          <Card>
            <CardHeader>
              <CardTitle>Chi tiết khóa học</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Thời lượng ước tính (giờ)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="Ví dụ: 20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Yêu cầu đầu vào
                </label>
                <Textarea
                  value={formData.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  placeholder="Ví dụ: Kiến thức cơ bản về lập trình"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Những gì học viên sẽ học được
                </label>
                <Textarea
                  value={formData.what_you_will_learn}
                  onChange={(e) => handleInputChange('what_you_will_learn', e.target.value)}
                  placeholder="Ví dụ: - Xây dựng ứng dụng web&#10;- Làm việc với database&#10;- Deploy lên production"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Mỗi mục trên một dòng mới
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Thumbnail */}
          <Card>
            <CardHeader>
              <CardTitle>Ảnh đại diện</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label 
                    htmlFor="thumbnail-upload"
                    className="flex items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-teal-500 transition-colors"
                  >
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Click để upload ảnh
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG lên đến 5MB
                        </p>
                      </div>
                    )}
                    <input
                      id="thumbnail-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {imagePreview && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData(prev => ({ ...prev, thumbnail_url: '' }));
                    }}
                  >
                    Xóa ảnh
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/instructor/dashboard')}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Tạo khóa học
                </>
              )}
            </Button>
          </div>
        </form>
        </div>
      </div>
    </InstructorLayout>
  );
};

export default CourseCreateForm;
