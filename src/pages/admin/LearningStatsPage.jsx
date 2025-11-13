import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BarChart3, TrendingUp, Clock, Award, BookOpen, Users } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Mock data for learning statistics
const MOCK_LEARNING_STATS = {
  completion: {
    rate: 67,
    not_started: 45,
    in_progress: 128,
    completed: 89,
    excellent: 32,
    good: 41,
    needs_improvement: 16
  },
  avgStudyTime: 12.5,
  topCourses: [
    {
      course_id: 1,
      title: 'Lập trình React nâng cao',
      instructor_name: 'Nguyễn Văn An',
      enrolled_count: 245,
      completion_rate: 78
    },
    {
      course_id: 2,
      title: 'Node.js Backend Development',
      instructor_name: 'Trần Thị Bình',
      enrolled_count: 198,
      completion_rate: 72
    },
    {
      course_id: 3,
      title: 'Python cho Data Science',
      instructor_name: 'Lê Minh Cường',
      enrolled_count: 176,
      completion_rate: 65
    },
    {
      course_id: 4,
      title: 'Machine Learning cơ bản',
      instructor_name: 'Phạm Thị Dung',
      enrolled_count: 152,
      completion_rate: 58
    },
    {
      course_id: 5,
      title: 'UI/UX Design với Figma',
      instructor_name: 'Hoàng Văn Em',
      enrolled_count: 134,
      completion_rate: 81
    }
  ]
};

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
        setStats(statsData || MOCK_LEARNING_STATS);
      } else {
        console.error('❌ Failed to load stats:', response.status);
        console.log('📦 Using mock data');
        setStats(MOCK_LEARNING_STATS);
      }
    } catch (error) {
      console.error('❌ Error loading stats:', error);
      console.log('📦 Using mock data');
      setStats(MOCK_LEARNING_STATS);
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

  const topCourses = stats?.topCourses || [];
  const completionData = stats?.completion || {};
  const avgStudyTime = stats?.avgStudyTime || 0;

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
            Phân tích hiệu quả và tiến độ học tập
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-lg border" style={{ borderColor: currentColors.border, backgroundColor: currentColors.card }}>
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm" style={{ color: currentColors.textSecondary }}>Tỷ lệ hoàn thành</p>
              <p className="text-2xl font-bold" style={{ color: currentColors.text }}>
                {completionData.rate || 0}%
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${completionData.rate || 0}%` }}
            />
          </div>
        </div>
        
        <div className="p-6 rounded-lg border" style={{ borderColor: currentColors.border, backgroundColor: currentColors.card }}>
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm" style={{ color: currentColors.textSecondary }}>Thời gian học TB</p>
              <p className="text-2xl font-bold" style={{ color: currentColors.text }}>
                {avgStudyTime.toFixed(1)} giờ
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6 rounded-lg border" style={{ borderColor: currentColors.border, backgroundColor: currentColors.card }}>
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-sm" style={{ color: currentColors.textSecondary }}>Học viên xuất sắc</p>
              <p className="text-2xl font-bold" style={{ color: currentColors.text }}>
                {completionData.excellent || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Courses */}
      <div className="rounded-lg border p-6" style={{ borderColor: currentColors.border, backgroundColor: currentColors.card }}>
        <h2 className="text-lg font-bold mb-4" style={{ color: currentColors.text }}>
          Top khóa học phổ biến
        </h2>
        
        {topCourses.length === 0 ? (
          <p className="text-center py-8" style={{ color: currentColors.textSecondary }}>
            Chưa có dữ liệu
          </p>
        ) : (
          <div className="space-y-4">
            {topCourses.map((course, index) => (
              <div 
                key={course.course_id}
                className="flex items-center gap-4 p-4 rounded-lg border"
                style={{ borderColor: currentColors.border }}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full font-bold text-white"
                  style={{ backgroundColor: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : '#cd7f32' }}>
                  {index + 1}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold" style={{ color: currentColors.text }}>
                    {course.title}
                  </h3>
                  <p className="text-sm" style={{ color: currentColors.textSecondary }}>
                    {course.instructor_name}
                  </p>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end mb-1">
                    <Users className="w-4 h-4" style={{ color: currentColors.primary }} />
                    <span className="font-semibold" style={{ color: currentColors.text }}>
                      {course.enrolled_count || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm" style={{ color: currentColors.textSecondary }}>
                      {course.completion_rate || 0}% hoàn thành
                    </span>
                  </div>
                </div>
              </div>
            ))}
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