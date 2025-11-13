import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Check, X, User, Calendar, DollarSign, FileText, Clock, AlertCircle, Eye } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Toast component với AdminPanel styling
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-emerald-500 dark:bg-emerald-600',
    error: 'bg-red-500 dark:bg-red-600',
    warning: 'bg-amber-500 dark:bg-amber-600',
    info: 'bg-indigo-500 dark:bg-indigo-600'
  }[type] || 'bg-gray-500 dark:bg-gray-600';

  return (
    <div className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 pointer-events-auto animate-slideIn`}>
      {type === 'success' && <Check className="w-5 h-5 text-white" />}
      {type === 'error' && <X className="w-5 h-5 text-white" />}
      {type === 'warning' && <AlertCircle className="w-5 h-5 text-white" />}
      {type === 'info' && <AlertCircle className="w-5 h-5 text-white" />}
      <span className="font-medium text-white">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80">
        <X className="w-4 h-4 text-white" />
      </button>
    </div>
  );
};

export default function CoursePendingPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCourse, setOpenCourse] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, course: null, action: null });
  const [rejectModal, setRejectModal] = useState({ open: false, course: null, reason: '' });
  const [toasts, setToasts] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  
  const rejectReasonRef = useRef(null);

  useEffect(() => {
    fetchPendingCourses();
  }, []);

  // Close modals on ESC key & manage body overflow
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (openCourse) setOpenCourse(null);
        if (confirmModal.open) setConfirmModal({ open: false, course: null, action: null });
        if (rejectModal.open) setRejectModal({ open: false, course: null, reason: '' });
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [openCourse, confirmModal.open, rejectModal.open]);

  // Manage body overflow when modal is open
  useEffect(() => {
    if (openCourse || confirmModal.open || rejectModal.open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [openCourse, confirmModal.open, rejectModal.open]);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const seedPendingCourses = async () => {
    try {
      console.log('🌱 Seeding pending courses...');
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/admin/courses/seed-pending`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      const data = await response.json();
      console.log('🌱 Seed response:', data);

      if (response.ok && data.success) {
        showToast(`Đã tạo ${data.inserted} khóa học mẫu`, 'success');
        return true;
      } else {
        console.log('ℹ️ Seed info:', data.message);
        return false;
      }
    } catch (error) {
      console.error('❌ Error seeding courses:', error);
      showToast('Lỗi khi tạo dữ liệu mẫu', 'error');
      return false;
    }
  };

  const fetchPendingCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      console.log('📡 Fetching pending courses from:', `${API_BASE_URL}/admin/courses/pending`);
      
      const response = await fetch(`${API_BASE_URL}/admin/courses/pending`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      console.log('📊 Pending courses response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📦 Pending courses response:', data);
        
        // Safely normalize response
        const list = Array.isArray(data?.data) ? data.data : 
                     Array.isArray(data?.data?.courses) ? data.data.courses :
                     Array.isArray(data) ? data : [];

        console.log('✅ Parsed pending courses:', list.length);
        
        // If empty, try to seed data
        if (list.length === 0) {
          console.log('⚠️ No pending courses found, attempting to seed...');
          const seeded = await seedPendingCourses();
          
          if (seeded) {
            // Refetch after seeding
            const refetchResponse = await fetch(`${API_BASE_URL}/admin/courses/pending`, {
              headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
            });
            
            if (refetchResponse.ok) {
              const refetchData = await refetchResponse.json();
              const refetchList = Array.isArray(refetchData?.data) ? refetchData.data : 
                                 Array.isArray(refetchData?.data?.courses) ? refetchData.data.courses :
                                 Array.isArray(refetchData) ? refetchData : [];
              setCourses(refetchList);
            } else {
              setCourses([]);
            }
          } else {
            setCourses([]);
          }
        } else {
          setCourses(list);
        }
      } else {
        console.error('❌ Failed to load pending courses:', response.status);
        setError('Không thể tải danh sách khóa học');
        setCourses([]);
      }
    } catch (error) {
      console.error('❌ Error fetching pending courses:', error);
      setError('Lỗi kết nối đến server');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCourse = (course) => {
    console.log('👁️ Viewing course:', course.course_id);
    setOpenCourse(course);
  };

  const handleApproveClick = (course) => {
    setConfirmModal({ open: true, course, action: 'approve' });
  };

  const handleRejectClick = (course) => {
    setRejectModal({ open: true, course, reason: '' });
  };

  const confirmApprove = async () => {
    const { course } = confirmModal;
    if (!course) return;

    try {
      setActionLoading(true);
      console.log('📡 Approving course:', course.course_id);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/admin/courses/${course.course_id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📊 Approve response status:', response.status);
      
      if (response.ok) {
        console.log('✅ Course approved successfully');
        showToast('Đã duyệt khóa học thành công!', 'success');
        
        // Optimistic UI update
        setCourses(prev => prev.filter(c => (c.course_id || c.id) !== (course.course_id || course.id)));
        setConfirmModal({ open: false, course: null, action: null });
        if (openCourse && (openCourse.course_id === course.course_id)) {
          setOpenCourse(null);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Failed to approve course:', errorData);
        showToast(errorData.message || errorData.error || 'Không thể duyệt khóa học', 'error');
      }
    } catch (error) {
      console.error('❌ Error approving course:', error);
      showToast('Lỗi kết nối đến server', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmReject = async () => {
    const { course, reason } = rejectModal;
    if (!course) return;
    
    if (!reason.trim()) {
      showToast('Vui lòng nhập lý do từ chối', 'warning');
      rejectReasonRef.current?.focus();
      return;
    }

    try {
      setActionLoading(true);
      console.log('📡 Rejecting course:', course.course_id);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/admin/courses/${course.course_id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      console.log('📊 Reject response status:', response.status);
      
      if (response.ok) {
        console.log('✅ Course rejected successfully');
        showToast('Đã từ chối khóa học', 'success');
        
        // Optimistic UI update
        setCourses(prev => prev.filter(c => (c.course_id || c.id) !== (course.course_id || course.id)));
        setRejectModal({ open: false, course: null, reason: '' });
        if (openCourse && (openCourse.course_id === course.course_id)) {
          setOpenCourse(null);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Failed to reject course:', errorData);
        showToast(errorData.message || errorData.error || 'Không thể từ chối khóa học', 'error');
      }
    } catch (error) {
      console.error('❌ Error rejecting course:', error);
      showToast('Lỗi kết nối đến server', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return 'Miễn phí';
    let priceVND = amount < 1000 ? amount * 25000 : amount;
    return priceVND.toLocaleString('vi-VN') + ' ₫';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return '—';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  const coursesList = Array.isArray(courses) ? courses : [];

  return (
    <div className="space-y-6 p-6">
      {/* Toast Container */}
      <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-[9999] pointer-events-none flex flex-col gap-2">
        {toasts.map(toast => (
          <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
          <Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Khóa học chờ duyệt
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Tổng số: {coursesList.length} khóa học đang chờ phê duyệt
          </p>
        </div>
      </div>

      {/* Main Content Section */}
            {/* Main Section */}
      <section className="bg-gray-50 dark:bg-slate-900 shadow-md rounded-xl p-6 border border-gray-200 dark:border-slate-700/50">
        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 p-4 mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <div>
              <p className="font-medium text-red-800 dark:text-red-300">{error}</p>
              <p className="text-sm text-red-600 dark:text-red-400">
                Đang hiển thị dữ liệu mẫu để bạn có thể tiếp tục làm việc.
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {coursesList.length === 0 ? (
          <div className="text-center py-12 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-inner">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-slate-500" />
            <p className="text-lg font-medium mb-2 text-gray-900 dark:text-slate-100">
              Không có khóa học chờ duyệt
            </p>
            <p className="text-gray-600 dark:text-slate-400">
              Tất cả khóa học đã được xử lý
            </p>
          </div>
        ) : (
          /* Course Grid */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {coursesList.map((course) => {
              const courseId = course.course_id || course.id;
              const isPending = course.status === 'pending';
              const badgeClass = isPending 
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800/30 dark:text-slate-300';
              
              return (
                <div
                  key={courseId}
                  className="rounded-xl border border-gray-200 dark:border-slate-700/50 bg-gray-50 dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Course Image */}
                  <div className="relative h-48 bg-gray-100 dark:bg-slate-900 flex items-center justify-center">
                    {course.image_url || course.thumbnail ? (
                      <>
                        <img 
                          src={course.image_url || course.thumbnail} 
                          alt={course.title ?? 'Khóa học'} 
                          className="w-full h-full object-cover brightness-95 dark:brightness-75" 
                        />
                        <div className="absolute inset-0 bg-black/0 dark:bg-black/30" />
                      </>
                    ) : (
                      <BookOpen className="w-16 h-16 text-gray-400 dark:text-slate-500" />
                    )}
                  </div>

                  {/* Course Info */}
                  <div className="p-4 space-y-3 bg-gray-50 dark:bg-slate-800">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 line-clamp-2">
                        {course.title ?? '—'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-slate-400 line-clamp-2 mt-1">
                        {course.description ?? 'Chưa có mô tả'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                        <span className="text-gray-600 dark:text-slate-400 truncate">
                          {course.instructor_name ?? 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                        <span className="text-gray-600 dark:text-slate-400">
                          {formatDate(course.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                        <span className="text-gray-600 dark:text-slate-400">
                          {course.total_lessons || 0} bài học
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                          {formatCurrency(course.price)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
                        {isPending ? 'Chờ duyệt' : 'Bản nháp'}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleViewCourse(course)}
                        className="flex-1 px-3 py-2 rounded-lg font-medium flex items-center justify-center gap-2 border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                        aria-label="Xem chi tiết khóa học"
                      >
                        <Eye className="w-4 h-4" />
                        Xem
                      </button>
                      <button
                        onClick={() => handleApproveClick(course)}
                        className="px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white transition-colors"
                        aria-label="Duyệt khóa học"
                      >
                        <Check className="w-4 h-4" />
                        Duyệt
                      </button>
                      <button
                        onClick={() => handleRejectClick(course)}
                        className="px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white transition-colors"
                        aria-label="Từ chối khóa học"
                      >
                        <X className="w-4 h-4" />
                        Từ chối
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Detail Modal - Centered */}
      {openCourse && (
        <div className="fixed inset-0 z-[9999]">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpenCourse(null)}
            aria-hidden="true"
          />
          
          {/* Centered Container */}
          <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
            {/* Modal Panel */}
            <div 
              className="w-full max-w-3xl md:w-[80%] lg:w-[60%] rounded-xl border-4 border-white dark:border-white/90 bg-gray-50 dark:bg-slate-800 shadow-2xl overflow-hidden animate-scaleIn"
              role="dialog"
              aria-modal="true"
              aria-labelledby="detail-title"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700/50 bg-gray-100 dark:bg-slate-900">
                <h2 id="detail-title" className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Chi tiết khóa học
                </h2>
                <button
                  onClick={() => setOpenCourse(null)}
                  className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Đóng"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-slate-400" />
                </button>
              </div>

              {/* Body - Scrollable */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Course Image */}
                {(openCourse.image_url || openCourse.thumbnail) && (
                  <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-800">
                    <img 
                      src={openCourse.image_url || openCourse.thumbnail} 
                      alt={openCourse.title}
                      className="w-full h-64 object-cover brightness-95 dark:brightness-90"
                    />
                  </div>
                )}

                {/* Course Info */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-slate-400">
                      Tên khóa học
                    </label>
                    <p className="text-xl font-semibold mt-1 text-gray-900 dark:text-slate-100">
                      {openCourse.title ?? '—'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-slate-400">
                      Mô tả chi tiết
                    </label>
                    <p className="mt-1 text-gray-600 dark:text-slate-300 whitespace-pre-wrap">
                      {openCourse.description ?? 'Chưa có mô tả'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-slate-400">
                        Giảng viên
                      </label>
                      <p className="mt-1 text-gray-900 dark:text-slate-100 font-medium">
                        {openCourse.instructor_name ?? 'N/A'}
                      </p>
                      {openCourse.instructor_email && (
                        <p className="text-sm text-gray-600 dark:text-slate-400">
                          {openCourse.instructor_email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-slate-400">
                        Trạng thái
                      </label>
                      <div className="mt-1">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          openCourse.status === 'pending' 
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800/30 dark:text-slate-300'
                        }`}>
                          {openCourse.status === 'pending' ? 'Chờ duyệt' : 'Bản nháp'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-slate-400">
                        Giá
                      </label>
                      <p className="text-lg font-semibold mt-1 text-indigo-600 dark:text-indigo-400">
                        {formatCurrency(openCourse.price)}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-slate-400">
                        Số bài học
                      </label>
                      <p className="mt-1 text-gray-900 dark:text-slate-100 font-medium">
                        {openCourse.total_lessons || 0} bài học
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-slate-400">
                        Ngày tạo
                      </label>
                      <p className="mt-1 text-gray-900 dark:text-slate-100">
                        {formatDate(openCourse.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/80">
                <button
                  onClick={() => {
                    setOpenCourse(null);
                    handleApproveClick(openCourse);
                  }}
                  className="flex-1 px-4 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white"
                  aria-label="Duyệt khóa học"
                >
                  <Check className="w-5 h-5" />
                  Duyệt khóa học
                </button>
                <button
                  onClick={() => {
                    setOpenCourse(null);
                    handleRejectClick(openCourse);
                  }}
                  className="flex-1 px-4 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white"
                  aria-label="Từ chối khóa học"
                >
                  <X className="w-5 h-5" />
                  Từ chối
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Approve Modal */}
      {confirmModal.open && confirmModal.action === 'approve' && (
        <div className="fixed inset-0 z-[9999]">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !actionLoading && setConfirmModal({ open: false, course: null, action: null })}
            aria-hidden="true"
          />
          <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
            <div 
              className="w-full max-w-md rounded-xl border-4 border-white dark:border-white/90 bg-gray-50 dark:bg-slate-800 shadow-2xl p-6 animate-scaleIn"
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-title"
            >
              <h3 id="confirm-title" className="text-xl font-semibold mb-4 text-gray-900 dark:text-slate-100">
                Xác nhận duyệt khóa học
              </h3>
              <p className="text-gray-600 dark:text-slate-300 mb-6">
                Bạn có chắc chắn muốn duyệt khóa học <strong className="text-gray-900 dark:text-slate-100">"{confirmModal.course?.title}"</strong>?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmModal({ open: false, course: null, action: null })}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 rounded-lg font-medium border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmApprove}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 rounded-lg font-medium bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Duyệt
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-[9999]">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !actionLoading && setRejectModal({ open: false, course: null, reason: '' })}
            aria-hidden="true"
          />
          <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
            <div 
              className="w-full max-w-md rounded-xl border-4 border-white dark:border-white/90 bg-gray-50 dark:bg-slate-800 shadow-2xl p-6 animate-scaleIn"
              role="dialog"
              aria-modal="true"
              aria-labelledby="reject-title"
            >
              <h3 id="reject-title" className="text-xl font-semibold mb-4 text-gray-900 dark:text-slate-100">
                Từ chối khóa học
              </h3>
              <p className="text-sm text-gray-600 dark:text-slate-300 mb-4">
                Khóa học: <strong className="text-gray-900 dark:text-slate-100">{rejectModal.course?.title}</strong>
              </p>
              <textarea
                ref={rejectReasonRef}
                value={rejectModal.reason}
                onChange={(e) => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Nhập lý do từ chối khóa học... (VD: Nội dung không phù hợp, vi phạm quy định, chất lượng thấp...)"
                rows={4}
                className="w-full p-3 rounded-lg border-2 border-blue-400 dark:border-blue-500 bg-white dark:bg-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 mb-4"
                style={{ color: '#111827', backgroundColor: '#ffffff' }}
                aria-label="Lý do từ chối"
                required
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setRejectModal({ open: false, course: null, reason: '' })}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 rounded-lg font-medium border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmReject}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      <X className="w-5 h-5" />
                      Xác nhận từ chối
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateY(-1rem);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}