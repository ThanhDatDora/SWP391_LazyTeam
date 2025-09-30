import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Award, TrendingUp, Clock, Star, ArrowRight } from 'lucide-react';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/hooks/useNavigation';

const HomePage = () => {
  const navigate = useNavigation();
  const { state: authState } = useAuth();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load courses with error handling
      try {
        const coursesResponse = await api.courses.getCourses();
        if (coursesResponse.success && coursesResponse.data) {
          setCourses(coursesResponse.data.data ? coursesResponse.data.data.slice(0, 6) : coursesResponse.data.slice(0, 6));
        } else {
          console.warn('Failed to load courses:', coursesResponse.error);
          setCourses([]); // Set empty array as fallback
        }
      } catch (courseError) {
        console.error('Course loading error:', courseError);
        setCourses([]); // Set empty array as fallback
      }

      // Mock statistics based on user role
      const mockStats = {
        totalCourses: courses.length || 0,
        enrolledCourses: 2,
        completedCourses: 1,
        totalStudents: 150,
        totalInstructors: 12,
        activeExams: 8
      };
      setStats(mockStats);

      // Mock recent activity
      const mockActivity = [
        {
          type: 'course_completion',
          title: 'Hoàn thành khóa học Java Servlet Cơ bản',
          time: '2 giờ trước',
          icon: Award,
          color: 'text-green-600'
        },
        {
          type: 'exam_pass',
          title: 'Đạt điểm 4/5 trong Quiz React Foundation',
          time: '1 ngày trước',
          icon: Star,
          color: 'text-yellow-600'
        },
        {
          type: 'enrollment',
          title: 'Đăng ký khóa học Spring Boot Microservices',
          time: '3 ngày trước',
          icon: BookOpen,
          color: 'text-blue-600'
        }
      ];
      setRecentActivity(mockActivity);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getWelcomeMessage = () => {
    const user = authState.user;
    const hour = new Date().getHours();
    let timeGreeting = '';
    
    if (hour < 12) timeGreeting = 'Chào buổi sáng';
    else if (hour < 18) timeGreeting = 'Chào buổi chiều';
    else timeGreeting = 'Chào buổi tối';
    
    return `${timeGreeting}, ${user?.full_name || 'bạn'}!`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">{getWelcomeMessage()}</h1>
        <p className="text-teal-100">
          Chào mừng bạn quay trở lại với hành trình học tập. Hãy tiếp tục khám phá và phát triển kỹ năng của mình!
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
                  <p className="text-2xl font-bold text-gray-900">{stats.enrolledCourses}</p>
                  <p className="text-sm text-gray-600">Khóa học đang theo học</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.completedCourses}</p>
                  <p className="text-sm text-gray-600">Khóa học hoàn thành</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                  <p className="text-sm text-gray-600">Tổng số học viên</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.activeExams}</p>
                  <p className="text-sm text-gray-600">Bài thi có sẵn</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Featured Courses */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Khóa học nổi bật</h2>
            <Button variant="outline" onClick={() => navigate("/catalog")}>
              Xem tất cả
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {courses.slice(0, 4).map(course => (
              <Card key={course.course_id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="aspect-video bg-gradient-to-br from-teal-400 to-blue-500 rounded-lg mb-3 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {course.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {course.level || 'Cơ bản'}
                      </Badge>
                      <div className="flex items-center text-xs text-gray-500">
                        <Users className="w-3 h-3 mr-1" />
                        {course.enrolled_count || 0}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-teal-600">
                        {course.is_free ? 'Miễn phí' : formatPrice(course.price)}
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-3" 
                    size="sm"
                    onClick={() => navigate(`/course/${course.course_id}`)}
                  >
                    Xem chi tiết
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Hoạt động gần đây</h2>
          
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-b-0 last:pb-0">
                    <div className={`p-2 rounded-full bg-gray-100 ${activity.color}`}>
                      <activity.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {activity.title}
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
                
                {recentActivity.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">Chưa có hoạt động nào</p>
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t mt-4">
                <Button variant="outline" className="w-full" size="sm">
                  Xem tất cả hoạt động
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Quick Actions */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate("/catalog")}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Khám phá khóa học
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate("/progress")}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Xem tiến độ
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate("/exam-history")}
              >
                <Award className="w-4 h-4 mr-2" />
                Lịch sử thi
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomePage;