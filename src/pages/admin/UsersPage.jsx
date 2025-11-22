import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users, Lock, Unlock, Eye, Search, Filter } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const UsersPage = () => {
  const { theme, currentColors } = useOutletContext();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('📡 Fetching users from:', `${API_BASE_URL}/admin/users`);
      
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 Users response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('📦 Users response:', result);

        // Handle different response formats safely
        let usersList = [];
        if (result.success && result.data) {
          if (Array.isArray(result.data)) {
            usersList = result.data;
          } else if (result.data.users && Array.isArray(result.data.users)) {
            usersList = result.data.users;
          }
        } else if (Array.isArray(result)) {
          usersList = result;
        } else if (result.users && Array.isArray(result.users)) {
          usersList = result.users;
        }

        console.log('✅ Parsed users:', usersList.length);
        setUsers(usersList);
      } else {
        console.error('❌ Failed to load users:', response.status);
        setUsers([]);
      }
    } catch (error) {
      console.error('❌ Error loading users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      setActionLoading(userId);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/toggle-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_locked: !currentStatus })
      });

      if (response.ok) {
        setUsers(prev => prev.map(u => 
          u.user_id === userId ? { ...u, is_locked: !currentStatus } : u
        ));
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleName = (roleId) => {
    const roles = { 1: 'Admin', 2: 'Giảng Viên', 3: 'Học Viên' };
    return roles[roleId] || 'Unknown';
  };

  const getRoleBadge = (roleId) => {
    const variants = {
      1: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      2: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      3: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    };
    return variants[roleId] || variants[3];
  };

  const getStatusBadge = (isLocked) => {
    return isLocked
      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role_id === Number(roleFilter);
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && !user.is_locked) ||
      (statusFilter === 'locked' && user.is_locked);

    return matchesSearch && matchesRole && matchesStatus;
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
            <Users className="w-6 h-6" style={{ color: currentColors.primary }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: currentColors.text }}>
              Quản lý người dùng
            </h1>
            <p style={{ color: currentColors.textSecondary }}>
              Tổng số: {users.length} người dùng
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
              placeholder="Tìm kiếm theo tên hoặc email..."
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
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border"
          style={{
            backgroundColor: currentColors.card,
            color: currentColors.text,
            borderColor: currentColors.border
          }}
        >
          <option value="all">Tất cả vai trò</option>
          <option value="1">Admin</option>
          <option value="2">Giảng viên</option>
          <option value="3">Học viên</option>
        </select>

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
          <option value="active">Hoạt động</option>
          <option value="locked">Bị khóa</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden" style={{ borderColor: currentColors.border }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: currentColors.card }}>
              <tr style={{ borderBottomColor: currentColors.border, borderBottomWidth: '1px' }}>
                <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Họ tên</th>
                <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Vai trò</th>
                <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Trạng thái</th>
                <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center" style={{ color: currentColors.textSecondary }}>
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr 
                    key={user.user_id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    style={{ borderBottomColor: currentColors.border, borderBottomWidth: '1px' }}
                  >
                    <td className="px-6 py-4 text-sm" style={{ color: currentColors.text }}>{user.user_id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                          style={{ backgroundColor: currentColors.primary }}>
                          {user.full_name?.charAt(0) || 'U'}
                        </div>
                        <span className="font-medium" style={{ color: currentColors.text }}>
                          {user.full_name || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: currentColors.textSecondary }}>{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role_id)}`}>
                        {getRoleName(user.role_id)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(user.is_locked)}`}>
                        {user.is_locked ? 'Bị khóa' : 'Hoạt động'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowModal(true);
                          }}
                          className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" style={{ color: currentColors.primary }} />
                        </button>
                        
                        {user.role_id !== 1 && (
                          <button
                            onClick={() => handleToggleStatus(user.user_id, user.is_locked)}
                            disabled={actionLoading === user.user_id}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                            title={user.is_locked ? 'Mở khóa' : 'Khóa tài khoản'}
                          >
                            {actionLoading === user.user_id ? (
                              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                            ) : user.is_locked ? (
                              <Unlock className="w-4 h-4 text-green-600" />
                            ) : (
                              <Lock className="w-4 h-4 text-red-600" />
                            )}
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

      {/* View User Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="rounded-lg max-w-2xl w-full p-6" style={{ backgroundColor: currentColors.card }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: currentColors.text }}>
              Thông tin người dùng
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium" style={{ color: currentColors.textSecondary }}>ID</label>
                  <p className="mt-1" style={{ color: currentColors.text }}>{selectedUser.user_id}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium" style={{ color: currentColors.textSecondary }}>Họ tên</label>
                  <p className="mt-1" style={{ color: currentColors.text }}>{selectedUser.full_name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium" style={{ color: currentColors.textSecondary }}>Email</label>
                  <p className="mt-1" style={{ color: currentColors.text }}>{selectedUser.email}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium" style={{ color: currentColors.textSecondary }}>Vai trò</label>
                  <p className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(selectedUser.role_id)}`}>
                      {getRoleName(selectedUser.role_id)}
                    </span>
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium" style={{ color: currentColors.textSecondary }}>Trạng thái</label>
                  <p className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedUser.is_locked)}`}>
                      {selectedUser.is_locked ? 'Bị khóa' : 'Hoạt động'}
                    </span>
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium" style={{ color: currentColors.textSecondary }}>Ngày tạo</label>
                  <p className="mt-1" style={{ color: currentColors.text }}>
                    {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString('vi-VN') : 'N/A'}
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

export default UsersPage;