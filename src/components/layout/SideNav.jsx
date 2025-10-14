import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { ROLES, isAdmin, isInstructor, isLearner } from '../../contexts/AuthContext';

const SideNav = ({ user }) => {
  const getMenuItems = (user) => {
    if (!user) {
      return [
        { to: '/catalog', label: 'Danh mục khóa học' },
        { to: '/pricing', label: 'Bảng giá' },
        { to: '/auth', label: 'Đăng nhập/Đăng ký' }
      ];
    }

    if (isAdmin(user)) {
      return [
        { to: '/', label: 'Trang chủ' },
        { to: '/admin', label: 'Tổng quan Admin' },
        { to: '/admin/courses', label: 'Duyệt khóa học' },
        { to: '/admin/users', label: 'Quản lý người dùng' },
        { to: '/catalog', label: 'Danh mục khóa học' },
        { to: '/progress', label: 'Tiến độ học tập' }
      ];
    }
    
    if (isInstructor(user)) {
      return [
        { to: '/', label: 'Trang chủ' },
        { to: '/instructor', label: 'Tổng quan Giảng viên' },
        { to: '/instructor/courses', label: 'Khóa học của tôi' },
        { to: '/instructor/exams', label: 'Quản lý đề thi' },
        { to: '/catalog', label: 'Danh mục khóa học' },
        { to: '/progress', label: 'Tiến độ học tập' }
      ];
    }
    
    // Learner
    return [
      { to: '/', label: 'Trang chủ' },
      { to: '/catalog', label: 'Danh mục khóa học' },
      { to: '/progress', label: 'Tiến độ học tập' },
      { to: '/exam-history', label: 'Lịch sử thi' },
      { to: '/certificates', label: 'Chứng chỉ' }
    ];
  };

  const menuItems = getMenuItems(user);
  
  const getRoleName = (user) => {
    if (!user) return 'Khách';
    switch (user.role_id) {
      case ROLES.ADMIN: return 'Quản trị viên';
      case ROLES.INSTRUCTOR: return 'Giảng viên';
      case ROLES.LEARNER: return 'Học viên';
      default: return 'Người dùng';
    }
  };

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle>Menu</CardTitle>
        <CardDescription>
          {user ? `Vai trò: ${getRoleName(user)}` : 'Khách'}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-1">
        {menuItems.map(item => (
          <a
            key={item.to}
            href={item.to}
            className="px-3 py-2 rounded-xl hover:bg-muted transition-colors text-sm"
          >
            {item.label}
          </a>
        ))}
      </CardContent>
    </Card>
  );
};

export default SideNav;