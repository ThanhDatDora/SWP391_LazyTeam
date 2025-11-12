import React, { useState, useEffect } from 'react';
import { UserCircle, Check, X, Mail, Calendar } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const COLORS = {
  dark: {
    primary: '#818cf8',
    secondary: '#22d3ee',
    success: '#34d399',
    danger: '#f87171',
    background: '#0f172a',
    card: '#1e293b',
    text: '#f9fafb',
    textSecondary: '#9ca3af',
    border: '#374155',
  }
};

const InstructorRequestsPage = () => {
  const currentColors = COLORS.dark;
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchInstructorRequests();
  }, []);

  const fetchInstructorRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/instructor-requests`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setRequests(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching instructor requests:', error);
      // Mock data for testing
      setRequests([
        {
          user_id: 1,
          full_name: 'Nguyễn Văn A',
          email: 'nguyenvana@example.com',
          created_at: new Date().toISOString(),
          reason: 'Tôi có kinh nghiệm 5 năm giảng dạy lập trình',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    if (!confirm('Bạn có chắc muốn duyệt yêu cầu này?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/instructor-requests/${userId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        alert('✅ Đã duyệt yêu cầu thành công!');
        fetchInstructorRequests();
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert('❌ Lỗi khi duyệt yêu cầu');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/instructor-requests/${selectedRequest.user_id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: rejectReason }),
      });
      
      if (response.ok) {
        alert('✅ Đã từ chối yêu cầu!');
        setShowRejectModal(false);
        setRejectReason('');
        fetchInstructorRequests();
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('❌ Lỗi khi từ chối yêu cầu');
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
          Yêu cầu trở thành giảng viên
        </h1>
        <p style={{ color: currentColors.textSecondary }}>
          Duyệt các yêu cầu đăng ký làm giảng viên
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <UserCircle className="w-16 h-16 mx-auto mb-4" style={{ color: currentColors.textSecondary }} />
          <p style={{ color: currentColors.textSecondary }}>Không có yêu cầu nào</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <div
              key={request.user_id}
              className="rounded-xl p-6 border"
              style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${currentColors.primary}20` }}
                    >
                      <UserCircle className="w-7 h-7" style={{ color: currentColors.primary }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold" style={{ color: currentColors.text }}>
                        {request.full_name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm" style={{ color: currentColors.textSecondary }}>
                        <Mail className="w-4 h-4" />
                        {request.email}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm font-semibold mb-1" style={{ color: currentColors.text }}>
                      Lý do:
                    </p>
                    <p className="text-sm" style={{ color: currentColors.textSecondary }}>
                      {request.reason || 'Không có lý do'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs" style={{ color: currentColors.textSecondary }}>
                    <Calendar className="w-4 h-4" />
                    Yêu cầu lúc: {new Date(request.created_at).toLocaleString('vi-VN')}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(request.user_id)}
                    className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
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
                      setSelectedRequest(request);
                      setShowRejectModal(true);
                    }}
                    className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
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
              Lý do từ chối
            </h3>
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
                onClick={handleReject}
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

export default InstructorRequestsPage;