/**
 * Utility functions for formatting data
 */

// Price formatting
export const formatPrice = (price) => {
  if (price === 0 || price === '0' || !price) {return 'Miễn phí';}
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

export const formatPriceShort = (price) => {
  if (price === 0 || price === '0' || !price) {return 'Miễn phí';}
  
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)}M VND`;
  }
  if (price >= 1000) {
    return `${(price / 1000).toFixed(0)}K VND`;
  }
  return `${price} VND`;
};

// Legacy alias for backward compatibility
export const formatCurrency = formatPrice;

// Date formatting
export const formatDate = (dateString, options = {}) => {
  if (!dateString) {return '';}
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {return '';}
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  return date.toLocaleDateString('vi-VN', { ...defaultOptions, ...options });
};

export const formatDateTime = (dateString, options = {}) => {
  if (!dateString) {return '';}
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {return '';}
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return date.toLocaleString('vi-VN', { ...defaultOptions, ...options });
};

export const formatDateShort = (dateString) => {
  return formatDate(dateString, {
    month: 'short',
    day: 'numeric'
  });
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) {return '';}
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {return '';}
  
  const now = new Date();
  const diffInMs = now - date;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInMinutes < 1) {return 'Vừa xong';}
  if (diffInMinutes < 60) {return `${diffInMinutes} phút trước`;}
  if (diffInHours < 24) {return `${diffInHours} giờ trước`;}
  if (diffInDays < 7) {return `${diffInDays} ngày trước`;}
  if (diffInWeeks < 4) {return `${diffInWeeks} tuần trước`;}
  if (diffInMonths < 12) {return `${diffInMonths} tháng trước`;}
  return `${diffInYears} năm trước`;
};

// Duration formatting
export const formatDuration = (minutes) => {
  if (!minutes || minutes <= 0) {return '0 phút';}
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    if (mins > 0) {
      return `${hours} giờ ${mins} phút`;
    }
    return `${hours} giờ`;
  }
  return `${mins} phút`;
};

export const formatDurationShort = (minutes) => {
  if (!minutes || minutes <= 0) {return '0m';}
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    if (mins > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${hours}h`;
  }
  return `${mins}m`;
};

// Text formatting
export const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (!text) {return '';}
  if (text.length <= maxLength) {return text;}
  return text.substring(0, maxLength).trim() + suffix;
};

export const capitalizeFirst = (text) => {
  if (!text) {return '';}
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const capitalizeWords = (text) => {
  if (!text) {return '';}
  return text.split(' ')
    .map(word => capitalizeFirst(word))
    .join(' ');
};

export const slugify = (text) => {
  if (!text) {return '';}
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// File size formatting
export const formatFileSize = (bytes) => {
  if (bytes === 0) {return '0 Bytes';}
  if (!bytes) {return '';}
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Number formatting
export const formatNumber = (number, options = {}) => {
  if (number === null || number === undefined) {return '';}
  
  const defaultOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  };
  
  return new Intl.NumberFormat('vi-VN', { ...defaultOptions, ...options }).format(number);
};

export const formatPercentage = (decimal, decimals = 1) => {
  if (decimal === null || decimal === undefined) {return '';}
  return `${(decimal * 100).toFixed(decimals)}%`;
};

// Status formatting
export const formatStatus = (status) => {
  const statusMap = {
    'active': 'Hoạt động',
    'inactive': 'Không hoạt động',
    'pending': 'Đang chờ',
    'approved': 'Đã duyệt',
    'rejected': 'Đã từ chối',
    'draft': 'Bản nháp',
    'published': 'Đã xuất bản',
    'archived': 'Đã lưu trữ',
    'suspended': 'Tạm ngưng'
  };
  
  return statusMap[status] || capitalizeFirst(status);
};

// Level formatting
export const formatLevel = (level) => {
  const levelMap = {
    'beginner': 'Cơ bản',
    'intermediate': 'Trung cấp',
    'advanced': 'Nâng cao'
  };
  
  return levelMap[level] || capitalizeFirst(level);
};

// Role formatting
export const formatRole = (role) => {
  const roleMap = {
    'admin': 'Quản trị viên',
    'instructor': 'Giảng viên',
    'learner': 'Học viên'
  };
  
  return roleMap[role] || capitalizeFirst(role);
};

export default {
  formatPrice,
  formatPriceShort,
  formatCurrency, // legacy alias
  formatDate,
  formatDateTime,
  formatDateShort,
  formatRelativeTime,
  formatDuration,
  formatDurationShort,
  truncateText,
  capitalizeFirst,
  capitalizeWords,
  slugify,
  formatFileSize,
  formatNumber,
  formatPercentage,
  formatStatus,
  formatLevel,
  formatRole
};