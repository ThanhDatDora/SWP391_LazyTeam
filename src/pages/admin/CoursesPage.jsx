import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BookOpen, Eye, CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const CoursesPage = () => {
  const { theme, currentColors } = useOutletContext();
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('📡 Fetching courses from:', `${API_BASE_URL}/admin/courses`);
      
      const response = await fetch(`${API_BASE_URL}/admin/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 Courses response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('📦 Courses response:', result);

        // Handle different response formats safely
        let coursesList = [];
        if (result.success && result.data) {
          if (Array.isArray(result.data)) {
            coursesList = result.data;
          } else if (result.data.courses && Array.isArray(result.data.courses)) {
            coursesList = result.data.courses;
          }
        } else if (Array.isArray(result)) {
          coursesList = result;
        } else if (result.courses && Array.isArray(result.courses)) {
          coursesList = result.courses;
        }

        console.log('✅ Parsed courses:', coursesList.length);
        setCourses(coursesList);
      } else {
        console.error('❌ Failed to load courses:', response.status);
        setCourses([]);
      }
    } catch (error) {
      console.error('❌ Error loading courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'approved': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'rejected': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return variants[status] || variants['pending'];
  };

  const getStatusLabel = (status) => {
    const labels = {
      'approved': 'Đã duyệt',
      'pending': 'Chờ duyệt',
      'rejected': 'Từ chối'
    };
    return labels[status] || status;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = (course.title?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
            <BookOpen className="w-6 h-6" style={{ color: currentColors.primary }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: currentColors.text }}>
              Quản lý khóa học
            </h1>
            <p style={{ color: currentColors.textSecondary }}>
              Tổng số: {courses.length} khóa học
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" 
              style={{ color: currentColors.textSecondary }} />
            <input
              type="text"
              placeholder="Tìm kiếm khóa học..."
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

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border"
          style={{
            backgroundColor: currentColors.card,
            color: currentColors.text,
            borderColor: currentColors.border
          }}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="approved">Đã duyệt</option>
          <option value="pending">Chờ duyệt</option>
          <option value="rejected">Từ chối</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border" style={{ borderColor: currentColors.border, backgroundColor: currentColors.card }}>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm" style={{ color: currentColors.textSecondary }}>Đã duyệt</p>
              <p className="text-2xl font-bold" style={{ color: currentColors.text }}>
                {courses.filter(c => c.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-4 rounded-lg border" style={{ borderColor: currentColors.border, backgroundColor: currentColors.card }}>
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-sm" style={{ color: currentColors.textSecondary }}>Chờ duyệt</p>
              <p className="text-2xl font-bold" style={{ color: currentColors.text }}>
                {courses.filter(c => c.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-4 rounded-lg border" style={{ borderColor: currentColors.border, backgroundColor: currentColors.card }}>
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm" style={{ color: currentColors.textSecondary }}>Từ chối</p>
              <p className="text-2xl font-bold" style={{ color: currentColors.text }}>
                {courses.filter(c => c.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden" style={{ borderColor: currentColors.border }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: currentColors.card }}>
              <tr style={{ borderBottomColor: currentColors.border, borderBottomWidth: '1px' }}>
                <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Tên khóa học</th>
                <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Giảng viên</th>
                <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Giá</th>
                <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Học viên</th>
                <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Trạng thái</th>
                <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center" style={{ color: currentColors.textSecondary }}>
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr 
                    key={course.course_id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    style={{ borderBottomColor: currentColors.border, borderBottomWidth: '1px' }}
                  >
                    <td className="px-6 py-4 text-sm" style={{ color: currentColors.text }}>{course.course_id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {course.thumbnail && (
                          <img 
                            src={course.thumbnail} 
                            alt={course.title}
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium" style={{ color: currentColors.text }}>{course.title}</p>
                          <p className="text-xs" style={{ color: currentColors.textSecondary }}>
                            {course.category_name || 'Chưa phân loại'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: currentColors.textSecondary }}>
                      {course.instructor_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium" style={{ color: currentColors.text }}>
                      {formatCurrency(course.price)}
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: currentColors.text }}>
                      {course.enrolled_count || 0}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(course.status)}`}>
                        {getStatusLabel(course.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedCourse(course);
                          setShowModal(true);
                        }}
                        className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" style={{ color: currentColors.primary }} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Course Modal */}
      {showModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="rounded-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: currentColors.card }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: currentColors.text }}>
              Chi tiết khóa học
            </h2>
            
            <div className="space-y-4">
              {selectedCourse.thumbnail && (
                <img 
                  src={selectedCourse.thumbnail} 
                  alt={selectedCourse.title}
                  className="w-full h-48 rounded-lg object-cover"
                />
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium" style={{ color: currentColors.textSecondary }}>ID</label>
                  <p className="mt-1" style={{ color: currentColors.text }}>{selectedCourse.course_id}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium" style={{ color: currentColors.textSecondary }}>Trạng thái</label>
                  <p className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedCourse.status)}`}>
                      {getStatusLabel(selectedCourse.status)}
                    </span>
                  </p>
                </div>
                
                <div className="col-span-2">
                  <label className="text-sm font-medium" style={{ color: currentColors.textSecondary }}>Tên khóa học</label>
                  <p className="mt-1 font-medium" style={{ color: currentColors.text }}>{selectedCourse.title}</p>
                </div>
                
                <div className="col-span-2">
                  <label className="text-sm font-medium" style={{ color: currentColors.textSecondary }}>Mô tả</label>
                  <p className="mt-1" style={{ color: currentColors.text }}>{selectedCourse.description || 'Chưa có mô tả'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium" style={{ color: currentColors.textSecondary }}>Giảng viên</label>
                  <p className="mt-1" style={{ color: currentColors.text }}>{selectedCourse.instructor_name || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium" style={{ color: currentColors.textSecondary }}>Danh mục</label>
                  <p className="mt-1" style={{ color: currentColors.text }}>{selectedCourse.category_name || 'Chưa phân loại'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium" style={{ color: currentColors.textSecondary }}>Giá</label>
                  <p className="mt-1 font-semibold" style={{ color: currentColors.text }}>{formatCurrency(selectedCourse.price)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium" style={{ color: currentColors.textSecondary }}>Số học viên</label>
                  <p className="mt-1" style={{ color: currentColors.text }}>{selectedCourse.enrolled_count || 0}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium" style={{ color: currentColors.textSecondary }}>Ngày tạo</label>
                  <p className="mt-1" style={{ color: currentColors.text }}>
                    {selectedCourse.created_at ? new Date(selectedCourse.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium" style={{ color: currentColors.textSecondary }}>Cập nhật lần cuối</label>
                  <p className="mt-1" style={{ color: currentColors.text }}>
                    {selectedCourse.updated_at ? new Date(selectedCourse.updated_at).toLocaleDateString('vi-VN') : 'N/A'}
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
    </div>
  );
};

export default CoursesPage;