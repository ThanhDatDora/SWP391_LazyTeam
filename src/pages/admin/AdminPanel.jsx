import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Users,
  BookOpen,
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
  Eye,
  Edit3,
  Shield,
  BarChart3,
  TrendingUp,
  DollarSign,
  Award
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const AdminPanel = () => {
  const { state: authState } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    pendingCourses: 0,
    totalRevenue: 0,
    activeInstructors: 0,
    monthlySignups: 0
  });
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [pendingCourses, setPendingCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load statistics
      const [usersResponse, coursesResponse] = await Promise.all([
        api.admin.getAllUsers(),
        api.admin.getAllCourses()
      ]);

      const allUsers = usersResponse.data;
      const allCourses = coursesResponse.data;

      // Calculate stats
      setStats({
        totalUsers: allUsers.length,
        totalCourses: allCourses.length,
        pendingCourses: allCourses.filter(c => c.status === 'submitted').length,
        totalRevenue: allCourses
          .filter(c => !c.is_free)
          .reduce((sum, c) => sum + (c.price * (c.enrolled_count || 0)), 0),
        activeInstructors: allUsers.filter(u => u.role_id === 2).length,
        monthlySignups: allUsers.filter(u => {
          const createdAt = new Date(u.created_at);
          const now = new Date();
          return createdAt.getMonth() === now.getMonth() && 
                 createdAt.getFullYear() === now.getFullYear();
        }).length
      });

      setUsers(allUsers);
      setCourses(allCourses);
      setPendingCourses(allCourses.filter(c => c.status === 'submitted'));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveCourse = async (courseId) => {
    try {
      const response = await api.admin.approveCourse(courseId);
      if (response.success) {
        loadDashboardData(); // Reload data
      }
    } catch (error) {
      console.error('Error approving course:', error);
    }
  };

  const rejectCourse = async (courseId) => {
    try {
      const response = await api.admin.rejectCourse(courseId);
      if (response.success) {
        loadDashboardData(); // Reload data
      }
    } catch (error) {
      console.error('Error rejecting course:', error);
    }
  };

  const updateUserRole = async (userId, newRoleId) => {
    try {
      const response = await api.admin.updateUserRole(userId, newRoleId);
      if (response.success) {
        setUsers(prev => prev.map(user => 
          user.user_id === userId 
            ? { ...user, role_id: newRoleId }
            : user
        ));
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = userFilter === 'all' || 
                         (userFilter === 'instructors' && user.role_id === 2) ||
                         (userFilter === 'learners' && user.role_id === 3) ||
                         (userFilter === 'admins' && user.role_id === 1);

    return matchesSearch && matchesFilter;
  });

  const getRoleName = (roleId) => {
    const roles = {
      1: 'Admin',
      2: 'Giảng viên',
      3: 'Học viên'
    };
    return roles[roleId] || 'Unknown';
  };

  const getRoleColor = (roleId) => {
    const colors = {
      1: 'destructive',
      2: 'default',
      3: 'secondary'
    };
    return colors[roleId] || 'secondary';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bảng điều khiển Admin</h1>
          <p className="text-gray-600 mt-1">Quản lý hệ thống Mini Coursera</p>
        </div>
        <Badge variant="destructive" className="px-3 py-1">
          <Shield className="w-4 h-4 mr-2" />
          Admin Access
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                <p className="text-sm text-green-600">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  +{stats.monthlySignups} tháng này
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng khóa học</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
                <p className="text-sm text-orange-600">
                  <AlertCircle className="w-3 h-3 inline mr-1" />
                  {stats.pendingCourses} chờ duyệt
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Doanh thu</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats.totalRevenue / 1000000).toFixed(1)}M VNĐ
                </p>
                <p className="text-sm text-green-600">
                  <DollarSign className="w-3 h-3 inline mr-1" />
                  Từ khóa học có phí
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Giảng viên</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeInstructors}</p>
                <p className="text-sm text-purple-600">
                  <Award className="w-3 h-3 inline mr-1" />
                  Đang hoạt động
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="courses">Duyệt khóa học</TabsTrigger>
          <TabsTrigger value="users">Quản lý người dùng</TabsTrigger>
          <TabsTrigger value="analytics">Thống kê</TabsTrigger>
          <TabsTrigger value="settings">Cài đặt</TabsTrigger>
        </TabsList>

        {/* Course Approval Tab */}
        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Khóa học chờ duyệt ({stats.pendingCourses})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingCourses.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Không có khóa học nào chờ duyệt
                  </h3>
                  <p className="text-gray-600">Tất cả khóa học đã được xem xét và phê duyệt</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingCourses.map((course) => (
                    <div key={course.course_id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{course.title}</h3>
                            <Badge variant={course.price === 0 ? 'secondary' : 'outline'}>
                              {course.price === 0 ? 'Miễn phí' : `${course.price.toLocaleString('vi-VN')} VNĐ`}
                            </Badge>
                            <Badge variant="outline">{course.level}</Badge>
                          </div>
                          
                          <p className="text-gray-600 mb-2 line-clamp-2">{course.description}</p>
                          
                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <span>Giảng viên: {course.instructor_name || 'N/A'}</span>
                            <span>{course.duration_hours} giờ</span>
                            <span>Tạo: {new Date(course.created_at).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(`/course/${course.course_id}`, '_blank')}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => approveCourse(course.course_id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Duyệt
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => rejectCourse(course.course_id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Từ chối
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Quản lý người dùng ({users.length})
                </CardTitle>
                
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Tìm kiếm người dùng..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  
                  <select
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="all">Tất cả</option>
                    <option value="admins">Admin</option>
                    <option value="instructors">Giảng viên</option>
                    <option value="learners">Học viên</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Người dùng</th>
                      <th className="text-left py-3 px-2">Email</th>
                      <th className="text-left py-3 px-2">Vai trò</th>
                      <th className="text-left py-3 px-2">Ngày tham gia</th>
                      <th className="text-left py-3 px-2">Trạng thái</th>
                      <th className="text-left py-3 px-2">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.user_id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-teal-600">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium">{user.username}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-gray-600">{user.email}</td>
                        <td className="py-3 px-2">
                          <Badge variant={getRoleColor(user.role_id)}>
                            {getRoleName(user.role_id)}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-gray-600">
                          {new Date(user.created_at).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant="default">Hoạt động</Badge>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <select
                              value={user.role_id}
                              onChange={(e) => updateUserRole(user.user_id, parseInt(e.target.value))}
                              className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                              disabled={user.user_id === authState.user.user_id}
                            >
                              <option value={1}>Admin</option>
                              <option value={2}>Giảng viên</option>
                              <option value={3}>Học viên</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thống kê tổng quan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      {((stats.totalRevenue / courses.length) || 0).toLocaleString('vi-VN')} VNĐ
                    </div>
                    <div className="text-sm text-gray-600">Doanh thu trung bình/khóa học</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      {(courses.reduce((sum, c) => sum + (c.enrolled_count || 0), 0) / courses.length || 0).toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">Học viên trung bình/khóa học</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      {((stats.pendingCourses / stats.totalCourses) * 100 || 0).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Tỷ lệ khóa học chờ duyệt</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Khóa học phổ biến</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {courses
                    .sort((a, b) => (b.enrolled_count || 0) - (a.enrolled_count || 0))
                    .slice(0, 5)
                    .map((course, index) => (
                      <div key={course.course_id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-teal-600">{index + 1}</span>
                          </div>
                          <div>
                            <div className="font-medium">{course.title}</div>
                            <div className="text-sm text-gray-600">
                              Giảng viên: {course.instructor_name || 'N/A'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{course.enrolled_count || 0} học viên</div>
                          <div className="text-sm text-gray-600">
                            {course.is_free ? 'Miễn phí' : `${course.price?.toLocaleString('vi-VN')} VNĐ`}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt hệ thống</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Cài đặt hệ thống đang được phát triển</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;