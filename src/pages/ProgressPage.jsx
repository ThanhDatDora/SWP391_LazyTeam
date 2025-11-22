import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, Clock, TrendingUp, Award, Target, Calendar, BarChart3 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../hooks/useNavigation';

const ProgressPage = () => {
  const navigate = useNavigation();
  const { state: authState } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      setLoading(true);
      
      console.log('📊 [ProgressPage] Fetching enrollments from API...');
      
      // Fetch real enrollments from API
      const response = await api.enrollments.getMyEnrollments();
      
      console.log('📊 [ProgressPage] API Response:', response);
      
      if (response && response.success) {
        const enrollments = response.data || [];
        
        console.log('✅ [ProgressPage] Received enrollments:', enrollments.length);
        console.log('📋 [ProgressPage] Sample enrollment:', enrollments[0]);
        
        setEnrollments(enrollments);
        calculateOverallStats(enrollments);
      } else {
        console.warn('⚠️ [ProgressPage] API failed, using mock data');
        // Fallback to mock data if API fails
        const mockEnrollments = [
          {
            enrollment_id: 1,
            course: {
              course_id: 1,
              title: 'Java Servlet & React Web Dev',
              description: 'Khóa học toàn diện về phát triển web với Java và React',
              total_moocs: 4
            },
            enrolled_at: '2025-01-10T00:00:00.000Z',
            progress: {
              completed_moocs: 2,
              total_moocs: 4,
              completed_lessons: 8,
              total_lessons: 16,
              exam_scores: [
                { exam_name: 'Quiz Servlet Cơ bản', best_score: 4, max_score: 5 },
                { exam_name: 'Quiz React Foundation', best_score: 5, max_score: 5 }
              ],
              last_activity: '2025-01-16T14:20:00.000Z'
            }
          },
          {
            enrollment_id: 2,
            course: {
              course_id: 2,
              title: 'Spring Boot Microservices',
              description: 'Xây dựng microservices với Spring Boot',
              total_moocs: 3
            },
            enrolled_at: '2025-01-05T00:00:00.000Z',
            progress: {
              completed_moocs: 1,
              total_moocs: 3,
              completed_lessons: 4,
              total_lessons: 12,
              exam_scores: [
                { exam_name: 'Spring Boot Basics', best_score: 3, max_score: 5 }
              ],
              last_activity: '2025-01-12T10:30:00.000Z'
            }
          }
        ];

        setEnrollments(mockEnrollments);
        calculateOverallStats(mockEnrollments);
      }
    } catch (err) {
      console.error('❌ [ProgressPage] Load progress error:', err);
      setError('Không thể tải tiến độ học tập');
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallStats = (enrollments) => {
    console.log('📊 [ProgressPage] Calculating stats for', enrollments.length, 'enrollments');
    
    const totalCourses = enrollments.length;
    let completedCourses = 0;
    let totalLessons = 0;
    let completedLessons = 0;
    let totalExams = 0;
    let passedExams = 0;
    let totalStudyTime = 0; // Mock data

    enrollments.forEach(enrollment => {
      const progress = enrollment.progress;
      
      console.log(`  📚 Course: ${enrollment.course.title}`);
      console.log(`     - Lessons: ${progress.completed_lessons}/${progress.total_lessons}`);
      console.log(`     - MOOCs: ${progress.completed_moocs}/${progress.total_moocs}`);
      console.log(`     - Exams: ${progress.exam_scores?.length || 0}`);
      
      // Course completion (if all MOOCs completed)
      if (progress.completed_moocs === progress.total_moocs) {
        completedCourses++;
      }
      
      // Lesson stats
      totalLessons += progress.total_lessons;
      completedLessons += progress.completed_lessons;
      
      // Exam stats
      totalExams += progress.exam_scores.length;
      passedExams += progress.exam_scores.filter(exam => 
        (exam.best_score / exam.max_score) >= 0.6
      ).length;
      
      // Mock study time (hours)
      totalStudyTime += progress.completed_lessons * 0.5; // 30 mins per lesson
    });

    const calculatedStats = {
      totalCourses,
      completedCourses,
      totalLessons,
      completedLessons,
      totalExams,
      passedExams,
      totalStudyTime: Math.round(totalStudyTime * 10) / 10,
      overallProgress: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
    };
    
    console.log('📊 [ProgressPage] Overall stats:', calculatedStats);

    setStats(calculatedStats);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) {return 'bg-green-500';}
    if (percentage >= 60) {return 'bg-yellow-500';}
    return 'bg-red-500';
  };

  const getProgressBadgeVariant = (percentage) => {
    if (percentage >= 80) {return 'default';}
    if (percentage >= 60) {return 'secondary';}
    return 'destructive';
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

  const formatRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {return 'Hôm nay';}
    if (diffDays === 1) {return 'Hôm qua';}
    if (diffDays < 7) {return `${diffDays} ngày trước`;}
    if (diffDays < 30) {return `${Math.floor(diffDays / 7)} tuần trước`;}
    return `${Math.floor(diffDays / 30)} tháng trước`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải tiến độ học tập...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadProgress}>Thử lại</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      {/* Header/Navbar */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left: Title & Navigation */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg p-2">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Tiến độ học tập</h1>
                  <p className="text-xs text-gray-500">Theo dõi quá trình học tập của bạn</p>
                </div>
              </div>
            </div>

            {/* Right: Quick Actions */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/my-learning')}
                className="hidden md:flex items-center space-x-2"
              >
                <BookOpen className="h-4 w-4" />
                <span>Khóa học của tôi</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/courses')}
                className="hidden md:flex items-center space-x-2"
              >
                <Target className="h-4 w-4" />
                <span>Khám phá khóa học</span>
              </Button>

              <div className="flex items-center space-x-2 pl-4 border-l border-gray-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{authState.user?.full_name || 'Học viên'}</p>
                  <p className="text-xs text-gray-500">Cấp độ: {stats?.completedCourses || 0} khóa hoàn thành</p>
                </div>
                {authState.user?.avatar_url ? (
                  <img 
                    src={authState.user.avatar_url} 
                    alt="Avatar" 
                    className="h-10 w-10 rounded-full border-2 border-teal-500"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold">
                    {(authState.user?.full_name || 'H').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-6">

      {/* Overall Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.completedCourses}/{stats.totalCourses}
                  </p>
                  <p className="text-sm text-gray-600">Khóa học hoàn thành</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.completedLessons}/{stats.totalLessons}
                  </p>
                  <p className="text-sm text-gray-600">Bài học hoàn thành</p>
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
                    {stats.passedExams}/{stats.totalExams}
                  </p>
                  <p className="text-sm text-gray-600">Bài thi đạt yêu cầu</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStudyTime}h</p>
                  <p className="text-sm text-gray-600">Tổng thời gian học</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Overall Progress */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Tiến độ tổng quan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tiến độ hoàn thành</span>
                <span className="text-sm text-gray-600">{stats.overallProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(stats.overallProgress)}`}
                  style={{ width: `${stats.overallProgress}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{stats.completedLessons}</p>
                  <p className="text-xs text-gray-600">Bài học hoàn thành</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{stats.passedExams}</p>
                  <p className="text-xs text-gray-600">Bài thi đạt yêu cầu</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{stats.totalStudyTime}h</p>
                  <p className="text-xs text-gray-600">Thời gian học</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Progress */}
      {enrollments.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Chi tiết khóa học</h2>
          
          {enrollments.map((enrollment) => {
            const progress = enrollment.progress;
            const courseProgress = Math.round((progress.completed_moocs / progress.total_moocs) * 100);
            const lessonProgress = Math.round((progress.completed_lessons / progress.total_lessons) * 100);
            const avgExamScore = progress.exam_scores.length > 0 
              ? progress.exam_scores.reduce((sum, exam) => sum + (exam.best_score / exam.max_score) * 100, 0) / progress.exam_scores.length
              : 0;

            return (
              <Card key={enrollment.enrollment_id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{enrollment.course.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{enrollment.course.description}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={getProgressBadgeVariant(courseProgress)}>
                        {courseProgress}% hoàn thành
                      </Badge>
                      <p className="text-xs text-gray-600 mt-1">
                        Hoạt động cuối: {formatRelativeTime(progress.last_activity)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* MOOC Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Tiến độ khóa học
                      </span>
                      <span className="text-sm text-gray-600">
                        {progress.completed_moocs}/{progress.total_moocs} chương
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(courseProgress)}`}
                        style={{ width: `${courseProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Lesson Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Tiến độ bài học
                      </span>
                      <span className="text-sm text-gray-600">
                        {progress.completed_lessons}/{progress.total_lessons} bài học
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(lessonProgress)}`}
                        style={{ width: `${lessonProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Exam Results */}
                  {progress.exam_scores.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
                        <Award className="w-4 h-4" />
                        Kết quả thi ({progress.exam_scores.length} bài)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {progress.exam_scores.map((exam, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{exam.exam_name}</span>
                              <Badge variant={getProgressBadgeVariant((exam.best_score / exam.max_score) * 100)}>
                                {exam.best_score}/{exam.max_score}
                              </Badge>
                            </div>
                            <div className="mt-2">
                              <div className="w-full bg-gray-200 rounded-full h-1">
                                <div 
                                  className={`h-1 rounded-full ${getProgressColor((exam.best_score / exam.max_score) * 100)}`}
                                  style={{ width: `${(exam.best_score / exam.max_score) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-900">Điểm trung bình</span>
                          <span className="text-sm font-bold text-blue-900">
                            {Math.round(avgExamScore)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Course Info */}
                  <div className="pt-4 border-t flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Đăng ký: {formatDate(enrollment.enrolled_at)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        Mục tiêu: {progress.total_moocs} chương
                      </div>
                    </div>
                    <Button
                      onClick={() => navigate(`/learn/${enrollment.course.course_id}`)}
                      size="sm"
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      {progress.completed_moocs > 0 ? 'Tiếp tục học' : 'Bắt đầu học'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa tham gia khóa học nào</h3>
            <p className="text-gray-600 mb-4">
              Bắt đầu hành trình học tập của bạn bằng cách tham gia một khóa học!
            </p>
            <Button onClick={() => navigate('/catalog')}>
              Khám phá khóa học
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
    </div>
  );
};

export default ProgressPage;