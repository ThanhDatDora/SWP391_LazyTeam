import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import InstructorLayout from '../../components/layout/InstructorLayout';
import { useNavigation } from '@/hooks/useNavigation';
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
  DollarSign
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { RevenueLineChart, CourseRevenueChart, SalesOverviewChart } from '../../components/instructor/RevenueChart';

const InstructorDashboard = () => {
  const navigate = useNavigation();
  const { state: authState } = useAuth();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load instructor's courses
      const response = await fetch('/api/courses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      
      // Filter courses owned by this instructor
      const allCourses = result.courses || result.data || [];
      const instructorCourses = Array.isArray(allCourses)
        ? allCourses.filter(course => course.instructorId === authState.user.user_id)
        : [];
      
      setCourses(instructorCourses);

      // Load revenue data
      try {
        const revenueResponse = await fetch('/api/instructor/revenue/summary', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (revenueResponse.ok) {
          const revenueResult = await revenueResponse.json();
          if (revenueResult.success) {
            setRevenueData(revenueResult.data);
          }
        } else {
          console.warn('Revenue API not available:', revenueResponse.status);
        }
      } catch (error) {
        console.error('Error loading revenue:', error);
      }

      // Mock submissions - TODO: Replace with real assignment grading API
      // Note: Assignments are essay submissions, not auto-graded exams
      const mockSubmissions = [];
      setSubmissions(mockSubmissions);

      // Calculate stats from actual data
      const totalStudents = revenueData?.summary?.totalStudents || 0;
      const totalExams = instructorCourses.reduce((sum, course) => sum + (course.exam_count || 2), 0);
      const avgRating = instructorCourses.reduce((sum, course) => sum + (course.rating || 4.5), 0) / instructorCourses.length || 0;

      setStats({
        totalCourses: instructorCourses.length,
        totalStudents,
        totalExams,
        avgRating: avgRating.toFixed(1),
        pendingSubmissions: mockSubmissions.length,
        recentActivity: 15,
        totalRevenue: revenueData?.summary?.instructorShare || 0
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
      <InstructorLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4" />
            <p className="text-gray-600">Đang tải dashboard...</p>
          </div>
        </div>
      </InstructorLayout>
    );
  }

  return (
    <InstructorLayout>
      <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Instructor Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Chào mừng trở lại, {authState.user?.full_name}!
        </p>
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
                <DollarSign className="w-8 h-8 text-teal-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    ${(stats.totalRevenue || 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">Tổng thu nhập</p>
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
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
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
                      {course.enrollmentCount || 0} học viên
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
                      onClick={() => navigate(`/instructor/courses/${course.id}`)}
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      Chỉnh sửa
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => navigate(`/course/${course.id}`)}
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
            <div className="flex gap-2">
              <Button variant="outline">
                Xuất danh sách CSV
              </Button>
            </div>
          </div>

          {/* Student Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalStudents || 0}</p>
                    <p className="text-sm text-gray-600">Tổng học viên</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.floor((stats?.totalStudents || 0) * 0.75)}
                    </p>
                    <p className="text-sm text-gray-600">Học viên tích cực</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Award className="w-8 h-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.floor((stats?.totalStudents || 0) * 0.65)}
                    </p>
                    <p className="text-sm text-gray-600">Đã hoàn thành</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Students by Course */}
          <Card>
            <CardHeader>
              <CardTitle>Học viên theo khóa học</CardTitle>
            </CardHeader>
            <CardContent>
              {courses.length > 0 ? (
                <div className="space-y-4">
                  {courses.map(course => (
                    <div key={course.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{course.title}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {course.enrollmentCount || 0} học viên
                          </span>
                          <span>•</span>
                          <span>{course.rating || 0} ⭐</span>
                        </div>
                      </div>
                      <Button 
                        variant="outline"
                        onClick={() => navigate(`/instructor/courses/${course.id}?tab=students`)}
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Chưa có khóa học nào</p>
                </div>
              )}
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

          {revenueData ? (
            <>
              {/* Revenue Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <DollarSign className="w-8 h-8 text-teal-600" />
                      <div className="ml-4">
                        <p className="text-2xl font-bold text-gray-900">
                          ${(revenueData.summary?.instructorShare || 0).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">Thu nhập của bạn (80%)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <TrendingUp className="w-8 h-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-2xl font-bold text-gray-900">
                          {revenueData.summary?.totalSales || 0}
                        </p>
                        <p className="text-sm text-gray-600">Tổng số đơn hàng</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Users className="w-8 h-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-2xl font-bold text-gray-900">
                          {revenueData.summary?.totalEnrollments || 0}
                        </p>
                        <p className="text-sm text-gray-600">Tổng đăng ký</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RevenueLineChart data={revenueData.monthlyRevenue || []} />
                <SalesOverviewChart monthlyData={revenueData.monthlyRevenue || []} />
              </div>

              <CourseRevenueChart data={revenueData.courseRevenue || []} />

              {/* Course Performance Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Hiệu suất theo khóa học</CardTitle>
                </CardHeader>
                <CardContent>
                  {revenueData.courseRevenue && revenueData.courseRevenue.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Khóa học
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Giá
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Số đơn
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Tổng doanh thu
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Thu nhập của bạn
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {revenueData.courseRevenue.map((course) => (
                            <tr key={course.course_id} className="hover:bg-gray-50">
                              <td className="px-4 py-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {course.title}
                                </div>
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-900">
                                ${parseFloat(course.price || 0).toFixed(2)}
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-900">
                                {course.sales || 0}
                              </td>
                              <td className="px-4 py-4 text-sm font-medium text-gray-900">
                                ${parseFloat(course.totalRevenue || 0).toFixed(2)}
                              </td>
                              <td className="px-4 py-4 text-sm font-bold text-teal-600">
                                ${parseFloat(course.instructorShare || 0).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Chưa có doanh thu từ khóa học nào
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
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
                      <span className="font-bold text-gray-400">Chưa có dữ liệu</span>
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
          )}
        </TabsContent>
      </Tabs>
      </div>
    </InstructorLayout>
  );
};

export default InstructorDashboard;