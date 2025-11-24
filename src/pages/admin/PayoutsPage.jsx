import React, { useState, useEffect } from 'react';
import { DollarSign, User, Calendar, CreditCard, Building, CheckCircle, Clock } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const COLORS = {
  light: {
    primary: '#4f46e5',
    secondary: '#0891b2',
    success: '#059669',
    danger: '#dc2626',
    warning: '#d97706',
    background: '#f9fafb',
    card: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
  },
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
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('adminTheme') || 'light';
  });
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // all, hasCommission, noCommission
  
  const currentColors = COLORS[theme];

  // Listen to theme changes from AdminPanel
  useEffect(() => {
    const handleThemeChange = (e) => {
      const newTheme = e.detail?.theme || localStorage.getItem('adminTheme') || 'light';
      setTheme(newTheme);
    };
    
    window.addEventListener('adminThemeChanged', handleThemeChange);
    
    // Check localStorage on mount
    const currentTheme = localStorage.getItem('adminTheme') || 'light';
    if (currentTheme !== theme) {
      setTheme(currentTheme);
    }
    
    return () => window.removeEventListener('adminThemeChanged', handleThemeChange);
  }, [theme]);

  // Calculate payment due date (5th of next month)
  const getPaymentDueDate = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 5);
    return nextMonth;
  };

  // Check if payment is overdue
  const isPaymentOverdue = () => {
    const now = new Date();
    const dueDate = getPaymentDueDate();
    return now > dueDate;
  };

  useEffect(() => {
    fetchInstructorRevenue();
  }, []);

  const fetchInstructorRevenue = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/instructor-revenue`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setInstructors(data.data);
        } else {
          setInstructors([]);
        }
      } else {
        console.error('⚠️ API error');
        setInstructors([]);
      }
    } catch (error) {
      console.error('❌ Error fetching instructor revenue:', error);
      setInstructors([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredInstructors = instructors.filter((instructor) => {
    const commission = (instructor.total_revenue || 0) * 0.10;
    if (filterStatus === 'hasCommission') return commission > 0;
    if (filterStatus === 'noCommission') return commission === 0;
    return true;
  });

  // Calculate summary stats
  const totalRevenue = instructors.reduce((sum, i) => sum + (i.total_revenue || 0), 0);
  const totalCommission = instructors.reduce((sum, i) => sum + ((i.total_revenue || 0) * 0.10), 0);
  const instructorsWithCommission = instructors.filter(i => ((i.total_revenue || 0) * 0.10) > 0).length;

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
          Doanh thu nền tảng
        </h1>
        <p style={{ color: currentColors.textSecondary }}>
          Quản lý doanh thu 10% từ doanh thu giảng viên - Hạn thanh toán: ngày 5 hàng tháng
        </p>
        
        {/* Payment Due Date Badge */}
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg" 
             style={{ 
               backgroundColor: isPaymentOverdue() ? currentColors.danger + '20' : currentColors.primary + '20',
               color: isPaymentOverdue() ? currentColors.danger : currentColors.primary
             }}>
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">
            Hạn thanh toán kỳ tiếp: {getPaymentDueDate().toLocaleDateString('vi-VN')}
            {isPaymentOverdue() && ' (Quá hạn)'}
          </span>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-lg border" style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }}>
            <p className="text-sm mb-1" style={{ color: currentColors.textSecondary }}>Tổng doanh thu GV</p>
            <p className="text-2xl font-bold" style={{ color: currentColors.text }}>
              {formatCurrency(totalRevenue)}
            </p>
          </div>
          <div className="p-4 rounded-lg border" style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }}>
            <p className="text-sm mb-1" style={{ color: currentColors.textSecondary }}>Tổng Doanh thu nền tảng (10%)</p>
            <p className="text-2xl font-bold" style={{ color: currentColors.warning }}>
              {formatCurrency(totalCommission)}
            </p>
          </div>
          <div className="p-4 rounded-lg border" style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }}>
            <p className="text-sm mb-1" style={{ color: currentColors.textSecondary }}>GV có doanh thu</p>
            <p className="text-2xl font-bold" style={{ color: currentColors.primary }}>
              {instructorsWithCommission}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'all', label: 'Tất cả' },
          { id: 'hasCommission', label: 'Có doanh thu' },
          { id: 'noCommission', label: 'Không có doanh thu' },
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs mb-1" style={{ color: currentColors.textSecondary }}>
                        Doanh thu GV
                      </p>
                      <p className="text-lg font-bold" style={{ color: currentColors.text }}>
                        {formatCurrency(instructor.total_revenue || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: currentColors.textSecondary }}>
                        Doanh thu nền tảng (10%)
                      </p>
                      <p className="text-lg font-bold" style={{ color: currentColors.warning }}>
                        {formatCurrency((instructor.total_revenue || 0) * 0.10)}
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

                {/* Commission Info */}
                <div className="ml-6 text-right">
                  {((instructor.total_revenue || 0) * 0.10) > 0 ? (
                    <div>
                      <div className="px-4 py-2 rounded-lg mb-2" 
                           style={{ backgroundColor: currentColors.warning + '20' }}>
                        <p className="text-xs" style={{ color: currentColors.textSecondary }}>
                          Doanh thu phải thu
                        </p>
                        <p className="text-xl font-bold" style={{ color: currentColors.warning }}>
                          {formatCurrency((instructor.total_revenue || 0) * 0.10)}
                        </p>
                      </div>
                      <p className="text-xs" style={{ color: currentColors.textSecondary }}>
                        Hạn: {getPaymentDueDate().toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm" style={{ color: currentColors.textSecondary }}>
                      <CheckCircle className="w-5 h-5" />
                      Chưa có doanh thu
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PayoutsPage;