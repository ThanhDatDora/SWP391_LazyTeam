import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BarChart3, TrendingUp, Clock, Award, BookOpen, Users, Target, CheckCircle, Activity, Trophy, Brain, Calendar } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const LearningStatsPage = () => {
  const { theme, currentColors } = useOutletContext();
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('📡 Fetching learning stats from:', `${API_BASE_URL}/admin/learning-stats`);
      
      const response = await fetch(`${API_BASE_URL}/admin/learning-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 Learning stats response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('📦 Learning stats response:', result);

        let statsData = null;
        if (result.success && result.data) {
          statsData = result.data;
        } else if (result.stats) {
          statsData = result.stats;
        } else {
          statsData = result;
        }

        console.log('✅ Parsed stats:', statsData);
        setStats(statsData);
      } else {
        console.error('❌ Failed to load stats:', response.status);
        setStats(null);
      }
    } catch (error) {
      console.error('❌ Error loading stats:', error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <BarChart3 className="w-16 h-16 text-gray-400" />
        <p className="text-lg font-medium" style={{ color: currentColors.textSecondary }}>
          Không thể tải dữ liệu thống kê
        </p>
        <button
          onClick={loadStats}
          className="px-4 py-2 rounded-lg text-white"
          style={{ backgroundColor: currentColors.primary }}
        >
          Thử lại
        </button>
      </div>
    );
  }

  const overview = stats?.overview || {};
  const topCourses = stats?.topCourses || [];
  const topLearners = stats?.topLearners || [];
  const completionData = stats?.completion || {};
  const studyTime = stats?.studyTime || {};
  const examPerformance = stats?.examPerformance || {};
  const recentActivity = stats?.recentActivity || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg" style={{ backgroundColor: currentColors.primary + '20' }}>
          <BarChart3 className="w-6 h-6" style={{ color: currentColors.primary }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: currentColors.text }}>
            Thống kê học tập
          </h1>
          <p style={{ color: currentColors.textSecondary }}>
            Phân tích hiệu quả và tiến độ học tập chi tiết
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-lg border" style={{ borderColor: currentColors.border, backgroundColor: currentColors.card }}>
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm" style={{ color: currentColors.textSecondary }}>Tổng học viên</p>
              <p className="text-2xl font-bold" style={{ color: currentColors.text }}>
                {overview.total_learners || 0}
              </p>
            </div>
          </div>
          <p className="text-xs" style={{ color: currentColors.textSecondary }}>
            {overview.total_enrollments || 0} lượt đăng ký
          </p>
        </div>

        <div className="p-6 rounded-lg border" style={{ borderColor: currentColors.border, backgroundColor: currentColors.card }}>
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm" style={{ color: currentColors.textSecondary }}>Tiến độ TB</p>
              <p className="text-2xl font-bold" style={{ color: currentColors.text }}>
                {overview.avg_progress || 0}%
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${overview.avg_progress || 0}%` }}
            />
          </div>
        </div>
        
        <div className="p-6 rounded-lg border" style={{ borderColor: currentColors.border, backgroundColor: currentColors.card }}>
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm" style={{ color: currentColors.textSecondary }}>Tỷ lệ hoàn thành</p>
              <p className="text-2xl font-bold" style={{ color: currentColors.text }}>
                {overview.completion_rate || 0}%
              </p>
            </div>
          </div>
          <p className="text-xs" style={{ color: currentColors.textSecondary }}>
            {completionData.completed || 0} khóa học đã hoàn thành
          </p>
        </div>
        
        <div className="p-6 rounded-lg border" style={{ borderColor: currentColors.border, backgroundColor: currentColors.card }}>
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-sm" style={{ color: currentColors.textSecondary }}>Thời gian học TB</p>
              <p className="text-2xl font-bold" style={{ color: currentColors.text }}>
                {studyTime.avg_lesson_time_minutes || 0}<span className="text-sm"> phút</span>
              </p>
            </div>
          </div>
          <p className="text-xs" style={{ color: currentColors.textSecondary }}>
            {studyTime.total_study_time_hours || 0} giờ tổng thời gian
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border p-6" style={{ borderColor: currentColors.border, backgroundColor: currentColors.card }}>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5" style={{ color: currentColors.primary }} />
          <h2 className="text-lg font-bold" style={{ color: currentColors.text }}>
            Hoạt động 30 ngày gần đây
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#f8fafc' }}>
            <Activity className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold" style={{ color: currentColors.text }}>
                {recentActivity.active_users_last_30days || 0}
              </p>
              <p className="text-sm" style={{ color: currentColors.textSecondary }}>Người dùng hoạt động</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#f8fafc' }}>
            <BookOpen className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold" style={{ color: currentColors.text }}>
                {recentActivity.new_enrollments_last_30days || 0}
              </p>
              <p className="text-sm" style={{ color: currentColors.textSecondary }}>Đăng ký mới</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#f8fafc' }}>
            <Trophy className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold" style={{ color: currentColors.text }}>
                {recentActivity.completions_last_30days || 0}
              </p>
              <p className="text-sm" style={{ color: currentColors.textSecondary }}>Hoàn thành khóa học</p>
            </div>
          </div>
        </div>
      </div>

      {/* Study Time & Exam Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border p-6" style={{ borderColor: currentColors.border, backgroundColor: currentColors.card }}>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5" style={{ color: currentColors.primary }} />
            <h2 className="text-lg font-bold" style={{ color: currentColors.text }}>
              Thời gian học tập
            </h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span style={{ color: currentColors.textSecondary }}>Học viên hoạt động</span>
              <span className="font-semibold" style={{ color: currentColors.text }}>
                {studyTime.active_learners || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: currentColors.textSecondary }}>Bài học đã hoàn thành</span>
              <span className="font-semibold" style={{ color: currentColors.text }}>
                {studyTime.total_completed_lessons || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: currentColors.textSecondary }}>Tổng lượt học bài</span>
              <span className="font-semibold" style={{ color: currentColors.text }}>
                {studyTime.total_lesson_attempts || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: currentColors.textSecondary }}>TB thời gian/bài</span>
              <span className="font-semibold" style={{ color: currentColors.text }}>
                {studyTime.avg_lesson_time_minutes || 0} phút
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6" style={{ borderColor: currentColors.border, backgroundColor: currentColors.card }}>
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5" style={{ color: currentColors.primary }} />
            <h2 className="text-lg font-bold" style={{ color: currentColors.text }}>
              Kết quả thi/kiểm tra
            </h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span style={{ color: currentColors.textSecondary }}>Học viên đã thi</span>
              <span className="font-semibold" style={{ color: currentColors.text }}>
                {examPerformance.students_took_exams || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: currentColors.textSecondary }}>Tổng lượt thi</span>
              <span className="font-semibold" style={{ color: currentColors.text }}>
                {examPerformance.total_exam_attempts || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: currentColors.textSecondary }}>Điểm trung bình</span>
              <span className="font-semibold text-blue-600">
                {examPerformance.avg_exam_score || 0}/100
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: currentColors.textSecondary }}>Tỷ lệ đậu</span>
              <span className="font-semibold text-green-600">
                {examPerformance.pass_rate || 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Courses */}
      <div className="rounded-lg border p-6" style={{ borderColor: currentColors.border, backgroundColor: currentColors.card }}>
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5" style={{ color: currentColors.primary }} />
          <h2 className="text-lg font-bold" style={{ color: currentColors.text }}>
            Top khóa học phổ biến
          </h2>
        </div>
        
        {topCourses.length === 0 ? (
          <p className="text-center py-8" style={{ color: currentColors.textSecondary }}>
            Chưa có dữ liệu
          </p>
        ) : (
          <div className="space-y-4">
            {topCourses.map((course, index) => (
              <div 
                key={course.course_id}
                className="flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-md"
                style={{ borderColor: currentColors.border }}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : '#cd7f32' }}>
                  #{index + 1}
                </div>
                
                {course.thumbnail_url && (
                  <img 
                    src={course.thumbnail_url} 
                    alt={course.title}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate" style={{ color: currentColors.text }}>
                    {course.title}
                  </h3>
                  <p className="text-sm truncate" style={{ color: currentColors.textSecondary }}>
                    {course.instructor_name}
                  </p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs" style={{ color: currentColors.textSecondary }}>
                      Tiến độ TB: {course.avg_progress || 0}%
                    </span>
                  </div>
                </div>
                
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-2 justify-end mb-1">
                    <Users className="w-4 h-4" style={{ color: currentColors.primary }} />
                    <span className="font-semibold" style={{ color: currentColors.text }}>
                      {course.enrolled_count || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">
                      {course.completion_rate || 0}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Learners */}
      <div className="rounded-lg border p-6" style={{ borderColor: currentColors.border, backgroundColor: currentColors.card }}>
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5" style={{ color: currentColors.primary }} />
          <h2 className="text-lg font-bold" style={{ color: currentColors.text }}>
            Top học viên xuất sắc
          </h2>
        </div>
        
        {topLearners.length === 0 ? (
          <p className="text-center py-8" style={{ color: currentColors.textSecondary }}>
            Chưa có dữ liệu
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottomColor: currentColors.border }} className="border-b">
                  <th className="text-left py-3 px-4" style={{ color: currentColors.text }}>#</th>
                  <th className="text-left py-3 px-4" style={{ color: currentColors.text }}>Học viên</th>
                  <th className="text-center py-3 px-4" style={{ color: currentColors.text }}>Đăng ký</th>
                  <th className="text-center py-3 px-4" style={{ color: currentColors.text }}>Hoàn thành</th>
                  <th className="text-center py-3 px-4" style={{ color: currentColors.text }}>Tiến độ TB</th>
                </tr>
              </thead>
              <tbody>
                {topLearners.map((learner, index) => (
                  <tr 
                    key={learner.user_id}
                    style={{ borderBottomColor: currentColors.border }}
                    className="border-b last:border-b-0 hover:bg-opacity-5 hover:bg-gray-500 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-white text-sm"
                        style={{ backgroundColor: index < 3 ? (index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : '#cd7f32') : currentColors.primary }}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold" style={{ color: currentColors.text }}>
                          {learner.full_name}
                        </p>
                        <p className="text-xs" style={{ color: currentColors.textSecondary }}>
                          {learner.email}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-semibold" style={{ color: currentColors.text }}>
                        {learner.courses_enrolled}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-semibold text-green-600">
                        {learner.courses_completed}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${learner.avg_progress || 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium" style={{ color: currentColors.text }}>
                          {learner.avg_progress || 0}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Completion Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border p-6" style={{ borderColor: currentColors.border, backgroundColor: currentColors.card }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: currentColors.text }}>
            Tiến độ học tập
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span style={{ color: currentColors.textSecondary }}>Chưa bắt đầu</span>
              <span className="font-semibold" style={{ color: currentColors.text }}>
                {completionData.not_started || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: currentColors.textSecondary }}>Đang học</span>
              <span className="font-semibold" style={{ color: currentColors.text }}>
                {completionData.in_progress || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: currentColors.textSecondary }}>Hoàn thành</span>
              <span className="font-semibold" style={{ color: currentColors.text }}>
                {completionData.completed || 0}
              </span>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border p-6" style={{ borderColor: currentColors.border, backgroundColor: currentColors.card }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: currentColors.text }}>
            Phân loại học viên
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span style={{ color: currentColors.textSecondary }}>Xuất sắc (&gt;80%)</span>
              <span className="font-semibold text-green-600">
                {completionData.excellent || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: currentColors.textSecondary }}>Khá (50-80%)</span>
              <span className="font-semibold text-blue-600">
                {completionData.good || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: currentColors.textSecondary }}>Cần cố gắng (&lt;50%)</span>
              <span className="font-semibold text-yellow-600">
                {completionData.needs_improvement || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningStatsPage;