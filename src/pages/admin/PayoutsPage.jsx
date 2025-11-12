import React, { useState, useEffect } from 'react';
import { DollarSign, User, Calendar, CreditCard, Building, CheckCircle, Clock } from 'lucide-react';

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
      const data = await response.json();
      if (data.success) {
        setInstructors(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching instructor revenue:', error);
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