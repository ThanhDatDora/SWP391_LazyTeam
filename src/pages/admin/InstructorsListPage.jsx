import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { GraduationCap, Lock, Unlock, Eye, Search, BookOpen, DollarSign, Star } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const InstructorsListPage = () => {
  const { theme, currentColors } = useOutletContext();
  
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });
  const [modalState, setModalState] = useState({ type: null, isOpen: false, data: null });

  useEffect(() => {
    loadInstructors();
  }, []);

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast({ show: false, type: '', message: '' });
    }, 4500);
  };

  const loadInstructors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('📡 Fetching instructors from:', `${API_BASE_URL}/admin/instructors`);
      
      const response = await fetch(`${API_BASE_URL}/admin/instructors`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 Instructors response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('📦 Instructors response:', result);

        // Handle different response formats safely
        let instructorsList = [];
        if (result.success && result.data) {
          if (Array.isArray(result.data)) {
            instructorsList = result.data;
          } else if (result.data.instructors && Array.isArray(result.data.instructors)) {
            instructorsList = result.data.instructors;
          }
        } else if (Array.isArray(result)) {
          instructorsList = result;
        } else if (result.instructors && Array.isArray(result.instructors)) {
          instructorsList = result.instructors;
        }

        console.log('✅ Parsed instructors:', instructorsList.length);
        
        // Sort by user_id in ascending order
        instructorsList.sort((a, b) => a.user_id - b.user_id);
        
        // CRITICAL: Normalize ALL possible lock status fields
        const normalizedInstructors = instructorsList.map(instructor => {
          const raw = instructor.is_locked ?? instructor.locked ?? instructor.isLocked ?? instructor.status;
          const isLocked = (
            raw === 1 || 
            raw === '1' || 
            raw === true || 
            raw === 'true' || 
            raw === 'locked'
          );
          console.log(`🔍 Instructor ${instructor.user_id}: raw=${JSON.stringify(raw)} → locked=${isLocked}`);
          return {
            ...instructor,
            is_locked: isLocked
          };
        });
        
        setInstructors(normalizedInstructors);
      } else {
        console.error('❌ Failed to load instructors:', response.status);
        setInstructors([]);
      }
    } catch (error) {
      console.error('❌ Error loading instructors:', error);
      setInstructors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLockUser = async (userId) => {
    setModalState({
      type: 'lock',
      isOpen: true,
      data: { userId }
    });
  };

  const confirmLockUser = async () => {
    const { userId } = modalState.data;
    const token = localStorage.getItem('token');
    try {
      console.log(`🔒 Locking instructor ${userId}...`);
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/lock`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('Lock response:', data);
      
      if (response.ok && data.success) {
        showToast('success', 'Tài khoản giảng viên đã bị khóa');
        await new Promise(r => setTimeout(r, 150));
        await loadInstructors();
      } else {
        const errorMsg = data.error?.message || 'Không thể khóa tài khoản';
        console.error('Lock failed:', errorMsg);
        showToast('error', errorMsg);
      }
    } catch (error) {
      console.error('Lock user error:', error);
      showToast('error', 'Lỗi khi khóa tài khoản: ' + error.message);
    } finally {
      setModalState({ type: null, isOpen: false, data: null });
    }
  };

  const handleUnlockUser = async (userId) => {
    setModalState({
      type: 'unlock',
      isOpen: true,
      data: { userId }
    });
  };

  const confirmUnlockUser = async () => {
    const { userId } = modalState.data;
    const token = localStorage.getItem('token');
    try {
      console.log(`🔓 Unlocking instructor ${userId}...`);
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/unlock`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('Unlock response:', data);
      
      if (response.ok && data.success) {
        showToast('success', 'Tài khoản giảng viên đã mở khóa');
        await new Promise(r => setTimeout(r, 150));
        await loadInstructors();
      } else {
        const errorMsg = data.error?.message || 'Không thể mở khóa tài khoản';
        console.error('Unlock failed:', errorMsg);
        showToast('error', errorMsg);
      }
    } catch (error) {
      console.error('Unlock user error:', error);
      showToast('error', 'Lỗi khi mở khóa tài khoản: ' + error.message);
    } finally {
      setModalState({ type: null, isOpen: false, data: null });
    }
  };

  const getStatusBadge = (isLocked) => {
    return isLocked
      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const filteredInstructors = instructors.filter(instructor => 
    (instructor.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (instructor.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg" style={{ backgroundColor: currentColors.primary + '20' }}>
            <GraduationCap className="w-6 h-6" style={{ color: currentColors.primary }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: currentColors.text }}>
              Danh sách giảng viên
            </h1>
            <p style={{ color: currentColors.textSecondary }}>
              Tổng số: {instructors.length} giảng viên
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" 
            style={{ color: currentColors.textSecondary }} />
          <input
            type="text"
            placeholder="Tìm kiếm giảng viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border"
            style={{
              backgroundColor: currentColors.card,
              color: currentColors.text,
              borderColor: currentColors.border
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden" style={{ borderColor: currentColors.border }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: currentColors.card }}>
              <tr style={{ borderBottomColor: currentColors.border, borderBottomWidth: '1px' }}>
                <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Giảng viên</th>
                <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Khóa học</th>
                <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Doanh thu</th>
                <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Đánh giá</th>
                <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Trạng thái</th>
                <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredInstructors.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center" style={{ color: currentColors.textSecondary }}>
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                filteredInstructors.map((instructor) => (
                  <tr 
                    key={instructor.user_id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    style={{ borderBottomColor: currentColors.border, borderBottomWidth: '1px' }}
                  >
                    <td className="px-6 py-4 text-sm" style={{ color: currentColors.text }}>{instructor.user_id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                          style={{ backgroundColor: currentColors.primary }}>
                          {instructor.full_name?.charAt(0) || 'I'}
                        </div>
                        <span className="font-medium" style={{ color: currentColors.text }}>
                          {instructor.full_name || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: currentColors.textSecondary }}>{instructor.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" style={{ color: currentColors.primary }} />
                        <span className="font-medium" style={{ color: currentColors.text }}>
                          {instructor.total_courses || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="font-medium" style={{ color: currentColors.text }}>
                          {formatCurrency(instructor.total_revenue || 0)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium" style={{ color: currentColors.text }}>
                          {instructor.average_rating ? instructor.average_rating.toFixed(1) : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(instructor.is_locked)}`}>
                        {instructor.is_locked ? 'Bị khóa' : 'Hoạt động'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedInstructor(instructor);
                            setShowModal(true);
                          }}
                          className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" style={{ color: currentColors.primary }} />
                        </button>
                        
                        {instructor.is_locked ? (
                          <button
                            onClick={() => handleUnlockUser(instructor.user_id)}
                            className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
                            title="Mở khóa tài khoản"
                          >
                            <Unlock className="w-4 h-4 text-green-600" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleLockUser(instructor.user_id)}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Khóa tài khoản"
                          >
                            <Lock className="w-4 h-4 text-red-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Instructor Modal */}
      {showModal && selectedInstructor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="rounded-lg max-w-2xl w-full p-6" style={{ backgroundColor: currentColors.card }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: currentColors.text }}>
              Thông tin giảng viên
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium" style={{ color: currentColors.textSecondary }}>ID</label>
                  <p className="mt-1" style={{ color: currentColors.text }}>{selectedInstructor.user_id}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium" style={{ color: currentColors.textSecondary }}>Họ tên</label>
                  <p className="mt-1" style={{ color: currentColors.text }}>{selectedInstructor.full_name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium" style={{ color: currentColors.textSecondary }}>Email</label>
                  <p className="mt-1" style={{ color: currentColors.text }}>{selectedInstructor.email}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium" style={{ color: currentColors.textSecondary }}>Số khóa học</label>
                  <p className="mt-1" style={{ color: currentColors.text }}>{selectedInstructor.total_courses || 0}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium" style={{ color: currentColors.textSecondary }}>Tổng doanh thu</label>
                  <p className="mt-1" style={{ color: currentColors.text }}>{formatCurrency(selectedInstructor.total_revenue || 0)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium" style={{ color: currentColors.textSecondary }}>Đánh giá trung bình</label>
                  <p className="mt-1" style={{ color: currentColors.text }}>
                    {selectedInstructor.average_rating ? `${selectedInstructor.average_rating.toFixed(1)} ⭐` : 'Chưa có'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium" style={{ color: currentColors.textSecondary }}>Trạng thái</label>
                  <p className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedInstructor.is_locked)}`}>
                      {selectedInstructor.is_locked ? 'Bị khóa' : 'Hoạt động'}
                    </span>
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium" style={{ color: currentColors.textSecondary }}>Ngày tạo</label>
                  <p className="mt-1" style={{ color: currentColors.text }}>
                    {selectedInstructor.created_at ? new Date(selectedInstructor.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg font-medium"
                style={{
                  backgroundColor: currentColors.primary,
                  color: 'white'
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Lock/Unlock Modal */}
      {modalState.isOpen && (modalState.type === 'lock' || modalState.type === 'unlock') && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="rounded-lg max-w-md w-full p-6" style={{ backgroundColor: currentColors.card }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: currentColors.text }}>
              {modalState.type === 'lock' ? 'Xác nhận khóa tài khoản' : 'Xác nhận mở khóa tài khoản'}
            </h2>
            
            <p className="mb-6" style={{ color: currentColors.textSecondary }}>
              {modalState.type === 'lock' 
                ? 'Bạn có chắc chắn muốn khóa tài khoản giảng viên này? Người dùng sẽ không thể đăng nhập sau khi bị khóa.'
                : 'Bạn có chắc chắn muốn mở khóa tài khoản giảng viên này? Người dùng sẽ có thể đăng nhập lại.'}
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setModalState({ type: null, isOpen: false, data: null })}
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: currentColors.border,
                  color: currentColors.text
                }}
              >
                Hủy
              </button>
              <button
                onClick={modalState.type === 'lock' ? confirmLockUser : confirmUnlockUser}
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: modalState.type === 'lock' ? '#dc2626' : '#059669',
                  color: 'white'
                }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-top fade-in duration-300">
          <div className={`flex items-center gap-3 p-4 rounded-lg shadow-lg max-w-md ${
            toast.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
            toast.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' :
            'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
          }`}>
            <span className={`text-sm font-medium ${
              toast.type === 'success' ? 'text-green-800 dark:text-green-200' :
              toast.type === 'error' ? 'text-red-800 dark:text-red-200' :
              'text-blue-800 dark:text-blue-200'
            }`}>
              {toast.message}
            </span>
            <button
              onClick={() => setToast({ show: false, type: '', message: '' })}
              className="ml-auto"
            >
              <span className="text-lg">×</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorsListPage;