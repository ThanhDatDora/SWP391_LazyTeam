import React, { useState, useEffect } from 'react';
import { DollarSign, User, Calendar, CreditCard, Building, CheckCircle, Clock } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Mock data for instructor payouts
const MOCK_INSTRUCTOR_PAYOUTS = [
  {
    instructor_id: 5,
    instructor_name: 'Nguyễn Văn An',
    email: 'nguyenvanan@example.com',
    total_revenue: 45000000,
    pending_amount: 12000000,
    total_paid: 33000000,
    course_count: 8,
    bank_account: '0123456789',
    bank_name: 'Vietcombank',
    last_payment_date: '2024-11-01T10:30:00Z'
  },
  {
    instructor_id: 8,
    instructor_name: 'Trần Thị Bình',
    email: 'tranthibinh@example.com',
    total_revenue: 38500000,
    pending_amount: 8500000,
    total_paid: 30000000,
    course_count: 6,
    bank_account: '9876543210',
    bank_name: 'Techcombank',
    last_payment_date: '2024-10-28T14:20:00Z'
  },
  {
    instructor_id: 12,
    instructor_name: 'Lê Minh Cường',
    email: 'leminhcuong@example.com',
    total_revenue: 52000000,
    pending_amount: 15000000,
    total_paid: 37000000,
    course_count: 10,
    bank_account: '1122334455',
    bank_name: 'VPBank',
    last_payment_date: '2024-11-05T09:15:00Z'
  },
  {
    instructor_id: 3,
    instructor_name: 'Phạm Thị Dung',
    email: 'phamthidung@example.com',
    total_revenue: 28000000,
    pending_amount: 0,
    total_paid: 28000000,
    course_count: 5,
    bank_account: '5544332211',
    bank_name: 'ACB',
    last_payment_date: '2024-11-10T16:45:00Z'
  },
  {
    instructor_id: 15,
    instructor_name: 'Hoàng Văn Em',
    email: 'hoangvanem@example.com',
    total_revenue: 41000000,
    pending_amount: 18000000,
    total_paid: 23000000,
    course_count: 7,
    bank_account: '6677889900',
    bank_name: 'MB Bank',
    last_payment_date: '2024-10-25T11:30:00Z'
  },
  {
    instructor_id: 20,
    instructor_name: 'Đặng Thị Phương',
    email: 'dangthiphuong@example.com',
    total_revenue: 35000000,
    pending_amount: 9500000,
    total_paid: 25500000,
    course_count: 6,
    bank_account: '3344556677',
    bank_name: 'Vietinbank',
    last_payment_date: '2024-11-03T13:10:00Z'
  },
  {
    instructor_id: 25,
    instructor_name: 'Võ Minh Khang',
    email: 'vominhkhang@example.com',
    total_revenue: 22000000,
    pending_amount: 5500000,
    total_paid: 16500000,
    course_count: 4,
    bank_account: '7788990011',
    bank_name: 'Sacombank',
    last_payment_date: '2024-10-30T08:25:00Z'
  },
  {
    instructor_id: 30,
    instructor_name: 'Bùi Thị Lan',
    email: 'buithilan@example.com',
    total_revenue: 19500000,
    pending_amount: 0,
    total_paid: 19500000,
    course_count: 3,
    bank_account: '2233445566',
    bank_name: 'BIDV',
    last_payment_date: '2024-11-08T15:40:00Z'
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

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

const PayoutsPage = () => {
  const currentColors = COLORS.dark;
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, paid

  useEffect(() => {
    fetchInstructorRevenue();
  }, []);

  const fetchInstructorRevenue = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/revenue/instructors`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
          setInstructors(data.data);
        } else {
          console.log('📦 Using mock instructor payouts data');
          setInstructors(MOCK_INSTRUCTOR_PAYOUTS);
        }
      } else {
        console.log('⚠️ API error, using mock data');
        setInstructors(MOCK_INSTRUCTOR_PAYOUTS);
      }
    } catch (error) {
      console.error('❌ Error fetching instructor revenue:', error);
      console.log('📦 Network error, using mock data');
      setInstructors(MOCK_INSTRUCTOR_PAYOUTS);
    } finally {
      setLoading(false);
    }
  };

  const handlePayRevenue = async (instructorId, amount) => {
    if (!confirm(`Xác nhận thanh toán ${formatCurrency(amount)} cho instructor?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/revenue/pay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instructor_id: instructorId, amount }),
      });

      if (response.ok) {
        alert('✅ Đã thanh toán thành công!');
        fetchInstructorRevenue();
      }
    } catch (error) {
      console.error('Error paying revenue:', error);
      alert('❌ Lỗi khi thanh toán');
    }
  };

  const filteredInstructors = instructors.filter((instructor) => {
    if (filterStatus === 'pending') return instructor.pending_amount > 0;
    if (filterStatus === 'paid') return instructor.total_paid > 0;
    return true;
  });

  // Calculate summary stats
  const totalRevenue = instructors.reduce((sum, i) => sum + (i.total_revenue || 0), 0);
  const totalPending = instructors.reduce((sum, i) => sum + (i.pending_amount || 0), 0);
  const totalPaid = instructors.reduce((sum, i) => sum + (i.total_paid || 0), 0);
  const instructorsWithPending = instructors.filter(i => i.pending_amount > 0).length;

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
          Thanh toán doanh thu
        </h1>
        <p style={{ color: currentColors.textSecondary }}>
          Quản lý và thanh toán doanh thu cho instructors
        </p>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-lg border" style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }}>
            <p className="text-sm mb-1" style={{ color: currentColors.textSecondary }}>Tổng doanh thu</p>
            <p className="text-2xl font-bold" style={{ color: currentColors.text }}>
              {formatCurrency(totalRevenue)}
            </p>
          </div>
          <div className="p-4 rounded-lg border" style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }}>
            <p className="text-sm mb-1" style={{ color: currentColors.textSecondary }}>Chờ thanh toán</p>
            <p className="text-2xl font-bold" style={{ color: currentColors.warning }}>
              {formatCurrency(totalPending)}
            </p>
          </div>
          <div className="p-4 rounded-lg border" style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }}>
            <p className="text-sm mb-1" style={{ color: currentColors.textSecondary }}>Đã thanh toán</p>
            <p className="text-2xl font-bold" style={{ color: currentColors.success }}>
              {formatCurrency(totalPaid)}
            </p>
          </div>
          <div className="p-4 rounded-lg border" style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }}>
            <p className="text-sm mb-1" style={{ color: currentColors.textSecondary }}>GV cần thanh toán</p>
            <p className="text-2xl font-bold" style={{ color: currentColors.primary }}>
              {instructorsWithPending}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'all', label: 'Tất cả' },
          { id: 'pending', label: 'Chờ thanh toán' },
          { id: 'paid', label: 'Đã thanh toán' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: filterStatus === tab.id ? currentColors.primary : currentColors.card,
              color: filterStatus === tab.id ? 'white' : currentColors.textSecondary,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredInstructors.length === 0 ? (
        <div className="text-center py-12">
          <DollarSign className="w-16 h-16 mx-auto mb-4" style={{ color: currentColors.textSecondary }} />
          <p style={{ color: currentColors.textSecondary }}>Không có dữ liệu</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredInstructors.map((instructor) => (
            <div
              key={instructor.instructor_id}
              className="rounded-xl p-6 border"
              style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${currentColors.primary}20` }}
                    >
                      <User className="w-6 h-6" style={{ color: currentColors.primary }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold" style={{ color: currentColors.text }}>
                        {instructor.instructor_name}
                      </h3>
                      <p className="text-sm" style={{ color: currentColors.textSecondary }}>
                        {instructor.email}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs mb-1" style={{ color: currentColors.textSecondary }}>
                        Tổng doanh thu
                      </p>
                      <p className="text-lg font-bold" style={{ color: currentColors.text }}>
                        {formatCurrency(instructor.total_revenue || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: currentColors.textSecondary }}>
                        Chờ thanh toán
                      </p>
                      <p className="text-lg font-bold" style={{ color: currentColors.warning }}>
                        {formatCurrency(instructor.pending_amount || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: currentColors.textSecondary }}>
                        Đã thanh toán
                      </p>
                      <p className="text-lg font-bold" style={{ color: currentColors.success }}>
                        {formatCurrency(instructor.total_paid || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: currentColors.textSecondary }}>
                        Số khóa học
                      </p>
                      <p className="text-lg font-bold" style={{ color: currentColors.text }}>
                        {instructor.course_count || 0}
                      </p>
                    </div>
                  </div>

                  {instructor.bank_account && (
                    <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: currentColors.background }}>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" style={{ color: currentColors.textSecondary }} />
                          <span style={{ color: currentColors.textSecondary }}>Tài khoản:</span>
                          <span style={{ color: currentColors.text }}>{instructor.bank_account}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4" style={{ color: currentColors.textSecondary }} />
                          <span style={{ color: currentColors.textSecondary }}>Ngân hàng:</span>
                          <span style={{ color: currentColors.text }}>{instructor.bank_name || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pay Button */}
                <div className="ml-6">
                  {instructor.pending_amount > 0 ? (
                    <button
                      onClick={() => handlePayRevenue(instructor.instructor_id, instructor.pending_amount)}
                      className="px-6 py-3 rounded-lg font-medium flex items-center gap-2"
                      style={{ backgroundColor: currentColors.success, color: 'white' }}
                    >
                      <DollarSign className="w-5 h-5" />
                      Thanh toán
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-sm" style={{ color: currentColors.textSecondary }}>
                      <CheckCircle className="w-5 h-5" />
                      Không có số dư
                    </div>
                  )}
                </div>
              </div>

              {/* Last Payment Date */}
              {instructor.last_payment_date && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: currentColors.border }}>
                  <div className="flex items-center gap-2 text-sm" style={{ color: currentColors.textSecondary }}>
                    <Calendar className="w-4 h-4" />
                    Thanh toán gần nhất: {new Date(instructor.last_payment_date).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PayoutsPage;