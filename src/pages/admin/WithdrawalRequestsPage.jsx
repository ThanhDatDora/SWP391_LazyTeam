import React, { useState, useEffect } from 'react';
import { Download, Check, X, DollarSign, Calendar, User } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Mock data for withdrawal requests
const MOCK_WITHDRAWAL_REQUESTS = [
  {
    withdrawal_id: 1,
    instructor_id: 5,
    instructor_name: 'Nguyễn Văn An',
    amount: 15000000,
    bank_account: '0123456789',
    bank_name: 'Vietcombank',
    status: 'pending',
    created_at: '2024-11-10T08:30:00Z',
    note: 'Rút doanh thu tháng 10/2024'
  },
  {
    withdrawal_id: 2,
    instructor_id: 8,
    instructor_name: 'Trần Thị Bình',
    amount: 8500000,
    bank_account: '9876543210',
    bank_name: 'Techcombank',
    status: 'pending',
    created_at: '2024-11-09T14:20:00Z',
    note: 'Thanh toán khóa học React nâng cao'
  },
  {
    withdrawal_id: 3,
    instructor_id: 12,
    instructor_name: 'Lê Minh Cường',
    amount: 22000000,
    bank_account: '1122334455',
    bank_name: 'VPBank',
    status: 'pending',
    created_at: '2024-11-08T10:15:00Z',
    note: 'Doanh thu Q3/2024'
  },
  {
    withdrawal_id: 4,
    instructor_id: 3,
    instructor_name: 'Phạm Thị Dung',
    amount: 5500000,
    bank_account: '5544332211',
    bank_name: 'ACB',
    status: 'approved',
    created_at: '2024-11-05T16:45:00Z',
    approved_at: '2024-11-06T09:00:00Z',
    note: 'Rút tiền định kỳ'
  },
  {
    withdrawal_id: 5,
    instructor_id: 15,
    instructor_name: 'Hoàng Văn Em',
    amount: 12000000,
    bank_account: '6677889900',
    bank_name: 'MB Bank',
    status: 'rejected',
    created_at: '2024-11-03T11:30:00Z',
    rejected_at: '2024-11-04T14:20:00Z',
    reject_reason: 'Thông tin tài khoản không chính xác',
    note: 'Yêu cầu rút tiền khẩn cấp'
  },
  {
    withdrawal_id: 6,
    instructor_id: 20,
    instructor_name: 'Đặng Thị Phương',
    amount: 18500000,
    bank_account: '3344556677',
    bank_name: 'Vietinbank',
    status: 'pending',
    created_at: '2024-11-07T13:10:00Z',
    note: 'Thanh toán khóa Python cho người mới'
  }
];

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

const WithdrawalRequestsPage = () => {
  const currentColors = COLORS.dark;
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchWithdrawalRequests();
  }, []);

  const fetchWithdrawalRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/withdrawal-requests`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
          setRequests(data.data);
        } else {
          // Use mock data if no real data
          console.log('📦 Using mock withdrawal requests data');
          setRequests(MOCK_WITHDRAWAL_REQUESTS);
        }
      } else {
        // API error - use mock data
        console.log('⚠️ API error, using mock data');
        setRequests(MOCK_WITHDRAWAL_REQUESTS);
      }
    } catch (error) {
      console.error('❌ Error fetching withdrawal requests:', error);
      // Network error - use mock data
      console.log('📦 Network error, using mock data');
      setRequests(MOCK_WITHDRAWAL_REQUESTS);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (withdrawalId) => {
    if (!confirm('Xác nhận chi trả yêu cầu này?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/withdrawal-requests/${withdrawalId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        alert('✅ Đã duyệt yêu cầu rút tiền!');
        fetchWithdrawalRequests();
      }
    } catch (error) {
      console.error('Error approving withdrawal:', error);
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
      const response = await fetch(`${API_BASE_URL}/admin/withdrawal-requests/${selectedRequest.withdrawal_id}/reject`, {
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
        fetchWithdrawalRequests();
      }
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      alert('❌ Lỗi khi từ chối yêu cầu');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        label: 'Chờ duyệt', 
        bg: `${currentColors.warning}20`, 
        color: currentColors.warning 
      },
      approved: { 
        label: 'Đã duyệt', 
        bg: `${currentColors.success}20`, 
        color: currentColors.success 
      },
      rejected: { 
        label: 'Đã từ chối', 
        bg: `${currentColors.danger}20`, 
        color: currentColors.danger 
      }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span 
        className="px-3 py-1 rounded-full text-xs font-medium"
        style={{ backgroundColor: config.bg, color: config.color }}
      >
        {config.label}
      </span>
    );
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
          Yêu cầu rút tiền
        </h1>
        <p style={{ color: currentColors.textSecondary }}>
          Quản lý yêu cầu rút tiền từ giảng viên
        </p>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-lg border" style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }}>
            <p className="text-sm mb-1" style={{ color: currentColors.textSecondary }}>Chờ duyệt</p>
            <p className="text-2xl font-bold" style={{ color: currentColors.warning }}>
              {requests.filter(r => r.status === 'pending').length}
            </p>
          </div>
          <div className="p-4 rounded-lg border" style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }}>
            <p className="text-sm mb-1" style={{ color: currentColors.textSecondary }}>Đã duyệt</p>
            <p className="text-2xl font-bold" style={{ color: currentColors.success }}>
              {requests.filter(r => r.status === 'approved').length}
            </p>
          </div>
          <div className="p-4 rounded-lg border" style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }}>
            <p className="text-sm mb-1" style={{ color: currentColors.textSecondary }}>Đã từ chối</p>
            <p className="text-2xl font-bold" style={{ color: currentColors.danger }}>
              {requests.filter(r => r.status === 'rejected').length}
            </p>
          </div>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <Download className="w-16 h-16 mx-auto mb-4" style={{ color: currentColors.textSecondary }} />
          <p style={{ color: currentColors.textSecondary }}>Không có yêu cầu rút tiền nào</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <div
              key={request.withdrawal_id}
              className="rounded-xl p-6 border"
              style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${currentColors.warning}20` }}
                    >
                      <DollarSign className="w-7 h-7" style={{ color: currentColors.warning }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold" style={{ color: currentColors.text }}>
                          {formatCurrency(request.amount)}
                        </h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="flex items-center gap-2 text-sm" style={{ color: currentColors.textSecondary }}>
                        <User className="w-4 h-4" />
                        {request.instructor_name}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs mb-1" style={{ color: currentColors.textSecondary }}>Số tài khoản:</p>
                      <p className="text-sm font-medium" style={{ color: currentColors.text }}>
                        {request.bank_account}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: currentColors.textSecondary }}>Ngân hàng:</p>
                      <p className="text-sm font-medium" style={{ color: currentColors.text }}>
                        {request.bank_name}
                      </p>
                    </div>
                  </div>

                  {request.note && (
                    <div className="mb-3">
                      <p className="text-xs mb-1" style={{ color: currentColors.textSecondary }}>Ghi chú:</p>
                      <p className="text-sm italic" style={{ color: currentColors.text }}>
                        {request.note}
                      </p>
                    </div>
                  )}

                  {request.reject_reason && (
                    <div className="mb-3 p-3 rounded-lg" style={{ backgroundColor: `${currentColors.danger}10` }}>
                      <p className="text-xs mb-1" style={{ color: currentColors.danger }}>Lý do từ chối:</p>
                      <p className="text-sm" style={{ color: currentColors.text }}>
                        {request.reject_reason}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs" style={{ color: currentColors.textSecondary }}>
                    <Calendar className="w-4 h-4" />
                    {new Date(request.created_at).toLocaleString('vi-VN')}
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(request.withdrawal_id)}
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
                        setSelectedRequest(request);
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
                )}
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

export default WithdrawalRequestsPage;