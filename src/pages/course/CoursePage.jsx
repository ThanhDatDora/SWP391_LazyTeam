import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useNavigation } from '../../hooks/useNavigation';
import { 
  BookOpen, 
  Users, 
  Clock, 
  Star, 
  Play, 
  FileText, 
  Award, 
  CheckCircle,
  Lock,
  Globe,
  Calendar,
  Target
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const CoursePage = () => {
  const navigate = useNavigation();
  const { id } = useParams();
  const { state: authState } = useAuth();
  const [course, setCourse] = useState(null);
  const [moocs, setMoocs] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadCourse();
    }
  }, [id]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      setError('');

      // Load course details
      const courseResponse = await api.courses.getCourseById(parseInt(id));
      setCourse(courseResponse.data);

      // Load MOOCs for this course
      const moocsResponse = await api.courses.getCourseContent(parseInt(id));
      setMoocs(moocsResponse.data);

      // Check enrollment status
      try {
        const enrollmentResponse = await api.enrollments.getByUserAndCourse(
          authState.user.user_id, 
          parseInt(id)
        );
        setEnrollment(enrollmentResponse.data);
      } catch (err) {
        // User not enrolled, which is fine
        setEnrollment(null);
      }

    } catch (err) {
      setError('Không thể tải thông tin khóa học');
    } finally {
      setLoading(false);
    }
  };

  const enrollInCourse = async () => {
    try {
      await api.enrollments.enrollInCourse(parseInt(id));
      // Reload course data to update enrollment status
      loadCourse();
    } catch (error) {
      console.error('Error enrolling in course:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  const getCourseLevel = (level) => {
    const levels = {
      'beginner': 'Cơ bản',
      'intermediate': 'Trung cấp',
      'advanced': 'Nâng cao'
    };
    return levels[level] || 'Cơ bản';
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

  if (error || !course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-600 mb-4">{error || 'Không tìm thấy khóa học'}</p>
            <Button onClick={() => navigate('/catalog')}>
              Quay lại danh mục
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Header */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">{getCourseLevel(course.level)}</Badge>
              <Badge variant={course.is_free ? 'default' : 'outline'}>
                {course.is_free ? 'Miễn phí' : 'Có phí'}
              </Badge>
              {course.is_approved && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Đã duyệt
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
            
            <p className="text-lg text-gray-600 mb-6">{course.description}</p>

            {/* Course Stats */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{course.enrolled_count || 0} học viên</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{course.duration_hours || 8} giờ</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>{course.rating || 4.5} ({course.review_count || 0} đánh giá)</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Tạo ngày {formatDate(course.created_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                <span>Tiếng Việt</span>
              </div>
            </div>

            {/* Instructor Info */}
            <div className="flex items-center gap-4 mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-lg font-medium text-gray-600">
                  {course.instructor?.full_name?.[0] || 'I'}
                </span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {course.instructor?.full_name || 'Instructor'}
                </h3>
                <p className="text-sm text-gray-600">
                  {course.instructor?.title || 'Giảng viên'}
                </p>
                <p className="text-sm text-gray-500">
                  {course.instructor?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Course Content Tabs */}
          <Tabs defaultValue="curriculum" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="curriculum">Nội dung khóa học</TabsTrigger>
              <TabsTrigger value="description">Mô tả chi tiết</TabsTrigger>
              <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
            </TabsList>
            
            <TabsContent value="curriculum" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Nội dung khóa học</CardTitle>
                </CardHeader>
                <CardContent>
                  {moocs.length > 0 ? (
                    <div className="space-y-4">
                      {moocs.map((mooc, index) => (
                        <div 
                          key={mooc.mooc_id} 
                          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-teal-600">
                                  {index + 1}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{mooc.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{mooc.description}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    {mooc.lesson_count || 0} bài học
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {mooc.duration_minutes || 30} phút
                                  </span>
                                  {mooc.has_exam && (
                                    <span className="flex items-center gap-1">
                                      <Award className="w-3 h-3" />
                                      Có bài thi
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {enrollment ? (
                                <Button size="sm" variant="outline">
                                  <Play className="w-4 h-4 mr-1" />
                                  Học ngay
                                </Button>
                              ) : (
                                <Lock className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Nội dung khóa học đang được cập nhật</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="description">
              <Card>
                <CardContent className="p-6">
                  <div className="prose max-w-none">
                    <h3>Về khóa học này</h3>
                    <p>{course.description}</p>
                    
                    <h3>Bạn sẽ học được gì?</h3>
                    <ul>
                      <li>Nắm vững các khái niệm cơ bản của lập trình</li>
                      <li>Thực hành với các dự án thực tế</li>
                      <li>Phát triển tư duy giải quyết vấn đề</li>
                      <li>Chuẩn bị cho các vị trí việc làm trong ngành</li>
                    </ul>
                    
                    <h3>Yêu cầu</h3>
                    <ul>
                      <li>Không cần kinh nghiệm lập trình trước đó</li>
                      <li>Máy tính có kết nối internet</li>
                      <li>Tinh thần học tập và thực hành</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Chức năng đánh giá đang được phát triển</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Preview */}
          <Card>
            <CardContent className="p-0">
              <div className="aspect-video bg-gradient-to-br from-teal-400 to-blue-500 rounded-t-lg flex items-center justify-center">
                <Play className="w-16 h-16 text-white" />
              </div>
              <div className="p-6">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {course.is_free ? 'Miễn phí' : formatPrice(course.price)}
                  </div>
                  {course.original_price && course.original_price > course.price && (
                    <div className="text-lg text-gray-500 line-through">
                      {formatPrice(course.original_price)}
                    </div>
                  )}
                </div>

                {enrollment ? (
                  <div className="space-y-3">
                    <Button className="w-full" size="lg">
                      <Play className="w-4 h-4 mr-2" />
                      Tiếp tục học
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate('/progress')}
                    >
                      Xem tiến độ
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={enrollInCourse}
                    >
                      Đăng ký ngay
                    </Button>
                    <Button variant="outline" className="w-full">
                      Thêm vào wishlist
                    </Button>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Thời lượng:</span>
                    <span className="font-medium">{course.duration_hours || 8} giờ</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Cấp độ:</span>
                    <span className="font-medium">{getCourseLevel(course.level)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Số chương:</span>
                    <span className="font-medium">{moocs.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Chứng chỉ:</span>
                    <span className="font-medium">Có</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Truy cập:</span>
                    <span className="font-medium">Trọn đời</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tính năng khóa học</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-teal-600" />
                <span className="text-sm">Mục tiêu học tập rõ ràng</span>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-teal-600" />
                <span className="text-sm">Tài liệu học tập đầy đủ</span>
              </div>
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-teal-600" />
                <span className="text-sm">Bài thi và đánh giá</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-teal-600" />
                <span className="text-sm">Hỗ trợ từ cộng đồng</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-teal-600" />
                <span className="text-sm">Chứng chỉ hoàn thành</span>
              </div>
            </CardContent>
          </Card>

          {/* Share */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Chia sẻ khóa học</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Facebook
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Twitter
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  LinkedIn
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CoursePage;