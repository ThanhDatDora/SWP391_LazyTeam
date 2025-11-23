import React, { useState, useEffect } from 'react';
import { BookOpen, Check, X, User, Calendar, Eye } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const COLORS = {
  dark: {
    primary: '#818cf8',
    secondary: '#22d3ee',
    success: '#34d399',
    danger: '#f87171',
    warning: '#fbbf24',
    background: '#0f172a',
    card: '#1e293b',
    text: '#f9fafb',
    textSecondary: '#9ca3af',
    border: '#374155',
  }
};

const CoursePendingPage = () => {
  const currentColors = COLORS.dark;
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchPendingCourses();
  }, []);

  const fetchPendingCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/courses/pending`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setCourses(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching pending courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCourse = async (courseId) => {
    if (!confirm('Duyệt khóa học này?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/courses/${courseId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        alert('✅ Đã duyệt khóa học!');
        fetchPendingCourses();
      }
    } catch (error) {
      console.error('Error approving course:', error);
      alert('❌ Lỗi khi duyệt khóa học');
    }
  };

  const handleRejectCourse = async () => {
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/courses/${selectedCourse.course_id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: rejectReason }),
      });
      
      if (response.ok) {
        alert('✅ Đã từ chối khóa học!');
        setShowRejectModal(false);
        setRejectReason('');
        fetchPendingCourses();
      }
    } catch (error) {
      console.error('Error rejecting course:', error);
      alert('❌ Lỗi khi từ chối khóa học');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full" style={{ backgroundColor: currentColors.background }}>
        <p style={{ color: currentColors.text }}>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="p-6" style={{ backgroundColor: currentColors.background, minHeight: '100vh' }}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: currentColors.text }}>
          Duyệt khóa học
        </h1>
        <p style={{ color: currentColors.textSecondary }}>
          Xem xét và duyệt các khóa học chờ phê duyệt
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: currentColors.textSecondary }} />
          <p style={{ color: currentColors.textSecondary }}>Không có khóa học chờ duyệt</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {courses.map((course) => (
            <div
              key={course.course_id}
              className="rounded-xl p-6 border"
              style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }}
            >
              <div className="flex gap-4">
                {/* Course Image */}
                <div className="flex-shrink-0">
                  <div
                    className="w-32 h-32 rounded-lg overflow-hidden"
                    style={{ backgroundColor: `${currentColors.primary}20` }}
                  >
                    {course.image_url ? (
                      <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-12 h-12" style={{ color: currentColors.primary }} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Course Info */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2" style={{ color: currentColors.text }}>
                    {course.title}
                  </h3>
                  
                  <p className="text-sm mb-3 line-clamp-2" style={{ color: currentColors.textSecondary }}>
                    {course.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" style={{ color: currentColors.textSecondary }} />
                      <span className="text-sm" style={{ color: currentColors.text }}>
                        {course.instructor_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" style={{ color: currentColors.textSecondary }} />
                      <span className="text-sm" style={{ color: currentColors.textSecondary }}>
                        {new Date(course.created_at).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${currentColors.warning}20`,
                        color: currentColors.warning,
                      }}
                    >
                      Chờ duyệt
                    </span>
                    <span className="text-sm font-bold" style={{ color: currentColors.primary }}>
                      {course.price ? `${course.price.toLocaleString('vi-VN')} VND` : 'Miễn phí'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => window.open(`/course/${course.course_id}/detail`, '_blank')}
                    className="px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                    style={{
                      backgroundColor: `${currentColors.secondary}20`,
                      color: currentColors.secondary,
                    }}
                  >
                    <Eye className="w-4 h-4" />
                    Xem
                  </button>
                  <button
                    onClick={() => handleApproveCourse(course.course_id)}
                    className="px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                    style={{
                      backgroundColor: `${currentColors.success}20`,
                      color: currentColors.success,
                    }}
                  >
                    <Check className="w-4 h-4" />
                    Duyệt
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCourse(course);
                      setShowRejectModal(true);
                    }}
                    className="px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                    style={{
                      backgroundColor: `${currentColors.danger}20`,
                      color: currentColors.danger,
                    }}
                  >
                    <X className="w-4 h-4" />
                    Từ chối
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg p-6 max-w-md w-full mx-4" style={{ backgroundColor: currentColors.card }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: currentColors.text }}>
              Lý do từ chối khóa học
            </h3>
            <p className="text-sm mb-4" style={{ color: currentColors.textSecondary }}>
              Khóa học: <strong>{selectedCourse?.title}</strong>
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối..."
              rows={4}
              className="w-full p-3 rounded-lg border outline-none mb-4"
              style={{
                backgroundColor: currentColors.background,
                borderColor: currentColors.border,
                color: currentColors.text,
              }}
            />
            <div className="flex gap-3">
              <button
                onClick={handleRejectCourse}
                className="flex-1 px-4 py-2 rounded-lg font-medium"
                style={{ backgroundColor: currentColors.danger, color: 'white' }}
              >
                Xác nhận từ chối
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="flex-1 px-4 py-2 rounded-lg font-medium"
                style={{ backgroundColor: currentColors.border, color: currentColors.text }}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursePendingPage;