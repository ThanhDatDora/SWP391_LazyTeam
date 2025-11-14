import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Folder, Plus, Edit2, Trash2, BookOpen } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const CategoriesPage = () => {
  const { theme, currentColors } = useOutletContext();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' | 'edit'
  const [formData, setFormData] = useState({ name: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('📡 Fetching categories from:', `${API_BASE_URL}/admin/categories`);
      
      const response = await fetch(`${API_BASE_URL}/admin/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 Categories response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('📦 Categories response:', result);

        // Backend returns { success: true, categories: [...] }
        const categoriesList = result.categories || [];
        
        console.log('✅ Parsed categories:', categoriesList.length);
        setCategories(categoriesList);
      } else {
        console.error('❌ Failed to load categories:', response.status);
        setCategories([]);
      }
    } catch (error) {
      console.error('❌ Error loading categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setModalType('add');
    setFormData({ name: '' });
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setModalType('edit');
    setEditingId(category.id);
    setFormData({ name: category.name });
    setShowModal(true);
  };

  const handleDelete = async (categoryId) => {
    if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        loadCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!formData.name || !formData.name.trim()) {
        alert('Vui lòng nhập tên danh mục');
        return;
      }

      const url = modalType === 'add' 
        ? `${API_BASE_URL}/admin/categories`
        : `${API_BASE_URL}/admin/categories/${editingId}`;
      
      const response = await fetch(url, {
        method: modalType === 'add' ? 'POST' : 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: formData.name.trim() })
      });

      if (response.ok) {
        setShowModal(false);
        loadCategories();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Lỗi khi lưu danh mục');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Lỗi khi lưu danh mục');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg" style={{ backgroundColor: currentColors.primary + '20' }}>
            <Folder className="w-6 h-6" style={{ color: currentColors.primary }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: currentColors.text }}>
              Danh mục khóa học
            </h1>
            <p style={{ color: currentColors.textSecondary }}>
              Tổng số: {categories.length} danh mục
            </p>
          </div>
        </div>
        
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white"
          style={{ backgroundColor: currentColors.primary }}
        >
          <Plus className="w-5 h-5" />
          Thêm danh mục
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.length === 0 ? (
          <div className="col-span-full text-center py-12" style={{ color: currentColors.textSecondary }}>
            Không có dữ liệu
          </div>
        ) : (
          categories.map((category) => (
            <div 
              key={category.id}
              className="p-6 rounded-lg border"
              style={{ borderColor: currentColors.border, backgroundColor: currentColors.card }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: currentColors.primary + '20' }}>
                    <Folder className="w-5 h-5" style={{ color: currentColors.primary }} />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: currentColors.text }}>
                      {category.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      <BookOpen className="w-3 h-3" style={{ color: currentColors.textSecondary }} />
                      <span className="text-xs" style={{ color: currentColors.textSecondary }}>
                        {category.courseCount || 0} khóa học
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Show courses list */}
              {category.courses && category.courses.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium mb-2" style={{ color: currentColors.textSecondary }}>
                    Khóa học:
                  </p>
                  <div className="space-y-1">
                    {category.courses.slice(0, 3).map(course => (
                      <p key={course.id} className="text-xs pl-2" style={{ color: currentColors.textSecondary }}>
                        • {course.title}
                      </p>
                    ))}
                    {category.courses.length > 3 && (
                      <p className="text-xs pl-2 italic" style={{ color: currentColors.textSecondary }}>
                        +{category.courses.length - 3} khóa học khác
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  style={{ borderColor: currentColors.border }}
                >
                  <Edit2 className="w-4 h-4" style={{ color: currentColors.primary }} />
                  <span className="text-sm" style={{ color: currentColors.text }}>Sửa</span>
                </button>
                
                <button
                  onClick={() => handleDelete(category.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border hover:bg-red-50 dark:hover:bg-red-900/20"
                  style={{ borderColor: currentColors.border }}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                  <span className="text-sm" style={{ color: currentColors.text }}>Xóa</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="rounded-lg max-w-md w-full p-6" style={{ backgroundColor: currentColors.card }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: currentColors.text }}>
              {modalType === 'add' ? 'Thêm danh mục mới' : 'Sửa danh mục'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: currentColors.text }}>
                  Tên danh mục
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{
                    backgroundColor: currentColors.card,
                    color: currentColors.text,
                    borderColor: currentColors.border
                  }}
                  placeholder="Nhập tên danh mục..."
                  autoFocus
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border font-medium"
                style={{
                  borderColor: currentColors.border,
                  color: currentColors.text
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 rounded-lg font-medium text-white"
                style={{ backgroundColor: currentColors.primary }}
              >
                {modalType === 'add' ? 'Thêm' : 'Cập nhật'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;