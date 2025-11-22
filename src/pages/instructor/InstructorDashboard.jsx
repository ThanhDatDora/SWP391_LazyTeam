import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useNavigation } from '@/hooks/useNavigation';
import { InstructorAdminChat } from '../../components/chat/InstructorAdminChat';
import { 
  BookOpen, 
  Users, 
  Award, 
  TrendingUp, 
  Plus,
  Edit3,
  Eye,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  MessageCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const InstructorDashboard = () => {
  const navigate = useNavigation();
  const { state: authState } = useAuth();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load instructor's courses
      const coursesResponse = await api.courses.getMyCourses();
      const instructorCourses = coursesResponse.data.filter(
        course => course.instructor_id === authState.user.user_id
      );
      setCourses(instructorCourses);

      // Mock submissions for instructor's courses
      const mockSubmissions = [
        {
          submission_id: 1,
          student: { full_name: 'Nguyễn Văn A', email: 'student1@example.com' },
          exam: { name: 'Quiz Java Servlet', course_title: 'Java Web Development' },
          score: 4,
          max_score: 5,
          submitted_at: '2025-01-20T10:30:00.000Z',
          attempt_no: 2
        },
        {
          submission_id: 2,
          student: { full_name: 'Trần Thị B', email: 'student2@example.com' },
          exam: { name: 'Quiz React Basics', course_title: 'Frontend Development' },
          score: 5,
          max_score: 5,
          submitted_at: '2025-01-19T14:20:00.000Z',
          attempt_no: 1
        },
        {
          submission_id: 3,
          student: { full_name: 'Lê Văn C', email: 'student3@example.com' },
          exam: { name: 'Quiz Java Servlet', course_title: 'Java Web Development' },
          score: 2,
          max_score: 5,
          submitted_at: '2025-01-18T09:15:00.000Z',
          attempt_no: 3
        }
      ];
      setSubmissions(mockSubmissions);

      // Calculate stats
      const totalStudents = instructorCourses.reduce((sum, course) => sum + (course.enrolled_count || 0), 0);
      const totalExams = instructorCourses.reduce((sum, course) => sum + (course.exam_count || 2), 0);
      const avgRating = instructorCourses.reduce((sum, course) => sum + (course.rating || 4.5), 0) / instructorCourses.length || 0;

      setStats({
        totalCourses: instructorCourses.length,
        totalStudents,
        totalExams,
        avgRating: avgRating.toFixed(1),
        pendingSubmissions: mockSubmissions.length,
        recentActivity: 15
      });

    } catch (error) {
      console.error('Error loading instructor dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getScoreColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) {return 'text-green-600';}
    if (percentage >= 60) {return 'text-yellow-600';}
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) {return 'default';}
    if (percentage >= 60) {return 'secondary';}
    return 'destructive';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Instructor Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Chào mừng trở lại, {authState.user?.full_name}!
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/instructor/chat')}>
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat với Học viên
          </Button>
          <Button onClick={() => navigate('/instructor/courses/create')}>
            <Plus className="w-4 h-4 mr-2" />
            Tạo khóa học mới
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
                  <p className="text-sm text-gray-600">Khóa học của tôi</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                  <p className="text-sm text-gray-600">Tổng học viên</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.avgRating}</p>
                  <p className="text-sm text-gray-600">Đánh giá trung bình</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingSubmissions}</p>
                  <p className="text-sm text-gray-600">Bài thi mới</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="courses">Khóa học</TabsTrigger>
          <TabsTrigger value="submissions">Bài thi</TabsTrigger>
          <TabsTrigger value="students">Học viên</TabsTrigger>
          <TabsTrigger value="analytics">Thống kê</TabsTrigger>
        </TabsList>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Khóa học của tôi</h2>
            <Button onClick={() => navigate('/instructor/courses/create')}>
              <Plus className="w-4 h-4 mr-2" />
              Tạo khóa học mới
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <Card key={course.course_id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="aspect-video bg-gradient-to-br from-teal-400 to-blue-500 rounded-lg mb-4 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {course.title}
                  </h3>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {course.enrolled_count || 0} học viên
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      {course.rating || 4.5} ⭐
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <Badge variant={course.is_approved ? 'default' : 'secondary'}>
                      {course.is_approved ? 'Đã duyệt' : 'Chờ duyệt'}
                    </Badge>
                    <Badge variant="outline">
                      {course.is_free ? 'Miễn phí' : 'Có phí'}
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => navigate(`/instructor/courses/${course.course_id}`)}
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      Chỉnh sửa
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => navigate(`/course/${course.course_id}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Xem
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {courses.length === 0 && (
              <div className="col-span-full text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Chưa có khóa học nào
                </h3>
                <p className="text-gray-600 mb-4">
                  Tạo khóa học đầu tiên để bắt đầu giảng dạy!
                </p>
                <Button onClick={() => navigate('/instructor/courses/create')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo khóa học đầu tiên
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Submissions Tab */}
        <TabsContent value="submissions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Bài thi gần đây</h2>
            <Button variant="outline" onClick={() => navigate('/instructor/submissions')}>
              Xem tất cả
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Học viên
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bài thi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Điểm
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lần thi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thời gian
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {submissions.map((submission) => (
                      <tr key={submission.submission_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {submission.student.full_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {submission.student.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {submission.exam.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {submission.exam.course_title}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getScoreBadgeVariant(submission.score, submission.max_score)}>
                            {submission.score}/{submission.max_score}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Lần {submission.attempt_no}/3
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatDate(submission.submitted_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Chi tiết
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Học viên của tôi</h2>
            <Button variant="outline">
              Xuất danh sách
            </Button>
          </div>

          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Danh sách học viên
              </h3>
              <p className="text-gray-600 mb-4">
                Tính năng này đang được phát triển
              </p>
              <Button variant="outline">
                Xem học viên theo khóa học
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Thống kê & Phân tích</h2>
            <Button variant="outline">
              Tạo báo cáo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Tổng quan khóa học
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tổng số khóa học</span>
                    <span className="font-bold">{stats?.totalCourses || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Khóa học đã duyệt</span>
                    <span className="font-bold text-green-600">
                      {courses.filter(c => c.is_approved).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Khóa học chờ duyệt</span>
                    <span className="font-bold text-yellow-600">
                      {courses.filter(c => !c.is_approved).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tổng doanh thu</span>
                    <span className="font-bold text-teal-600">250,000,000 VNĐ</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Hiệu suất giảng dạy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Đánh giá trung bình</span>
                    <span className="font-bold">{stats?.avgRating || 0} / 5.0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tỷ lệ hoàn thành</span>
                    <span className="font-bold text-green-600">85%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Học viên tích cực</span>
                    <span className="font-bold">{Math.floor((stats?.totalStudents || 0) * 0.75)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tỷ lệ đậu trung bình</span>
                    <span className="font-bold text-blue-600">78%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Floating Chat Widget - Instructors can contact Admin support */}
      <InstructorAdminChat />
    </div>
  );
};

export default InstructorDashboard;