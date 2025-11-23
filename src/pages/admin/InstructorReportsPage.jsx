import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Activity, GraduationCap, BookOpen, Users, DollarSign, Star, Search } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const InstructorReportsPage = () => {
  const { theme, currentColors } = useOutletContext();
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('📡 Fetching instructor reports from:', `${API_BASE_URL}/admin/instructor-reports`);
      
      const response = await fetch(`${API_BASE_URL}/admin/instructor-reports`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 Instructor reports response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('📦 Instructor reports response:', result);

        let reportsList = [];
        if (result.success && result.data) {
          if (Array.isArray(result.data)) {
            reportsList = result.data;
          } else if (result.data.reports && Array.isArray(result.data.reports)) {
            reportsList = result.data.reports;
          }
        } else if (Array.isArray(result)) {
          reportsList = result;
        } else if (result.reports && Array.isArray(result.reports)) {
          reportsList = result.reports;
        }

        console.log('✅ Parsed reports:', reportsList.length);
        setReports(reportsList);
      } else {
        console.error('❌ Failed to load reports:', response.status);
        setReports([]);
      }
    } catch (error) {
      console.error('❌ Error loading reports:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const filteredReports = reports.filter(report => 
    (report.instructor_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (report.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const totalCourses = reports.reduce((sum, r) => sum + (r.total_courses || 0), 0);
  const totalStudents = reports.reduce((sum, r) => sum + (r.total_students || 0), 0);
  const totalRevenue = reports.reduce((sum, r) => sum + (r.total_revenue || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg" style={{ backgroundColor: currentColors.primary + '20' }}>
          <Activity className="w-6 h-6" style={{ color: currentColors.primary }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: currentColors.text }}>
            Báo cáo giảng viên
          </h1>
          <p style={{ color: currentColors.textSecondary }}>
            Tổng quan hiệu suất và đóng góp
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border" style={{ borderColor: currentColors.border, backgroundColor: currentColors.card }}>
          <div className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8" style={{ color: currentColors.primary }} />
            <div>
              <p className="text-sm" style={{ color: currentColors.textSecondary }}>Giảng viên</p>
              <p className="text-2xl font-bold" style={{ color: currentColors.text }}>{reports.length}</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 rounded-lg border" style={{ borderColor: currentColors.border, backgroundColor: currentColors.card }}>
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm" style={{ color: currentColors.textSecondary }}>Khóa học</p>
              <p className="text-2xl font-bold" style={{ color: currentColors.text }}>{totalCourses}</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 rounded-lg border" style={{ borderColor: currentColors.border, backgroundColor: currentColors.card }}>
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm" style={{ color: currentColors.textSecondary }}>Học viên</p>
              <p className="text-2xl font-bold" style={{ color: currentColors.text }}>{totalStudents}</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 rounded-lg border" style={{ borderColor: currentColors.border, backgroundColor: currentColors.card }}>
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-sm" style={{ color: currentColors.textSecondary }}>Doanh thu</p>
              <p className="text-xl font-bold" style={{ color: currentColors.text }}>
                {formatCurrency(totalRevenue)}
              </p>
            </div>
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
                <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Giảng viên</th>
                <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Khóa học</th>
                <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Học viên</th>
                <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Doanh thu</th>
                <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Đánh giá TB</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center" style={{ color: currentColors.textSecondary }}>
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr 
                    key={report.user_id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    style={{ borderBottomColor: currentColors.border, borderBottomWidth: '1px' }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                          style={{ backgroundColor: currentColors.primary }}>
                          {report.instructor_name?.charAt(0) || 'I'}
                        </div>
                        <span className="font-medium" style={{ color: currentColors.text }}>
                          {report.instructor_name || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: currentColors.textSecondary }}>
                      {report.email}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" style={{ color: currentColors.primary }} />
                        <span className="font-medium" style={{ color: currentColors.text }}>
                          {report.total_courses || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-green-600" />
                        <span className="font-medium" style={{ color: currentColors.text }}>
                          {report.total_students || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-yellow-600" />
                        <span className="font-medium" style={{ color: currentColors.text }}>
                          {formatCurrency(report.total_revenue || 0)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium" style={{ color: currentColors.text }}>
                          {report.average_rating ? report.average_rating.toFixed(1) : 'N/A'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InstructorReportsPage;