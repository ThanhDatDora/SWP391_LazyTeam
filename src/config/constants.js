/**
 * Application configuration constants
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
};

// User Roles
export const USER_ROLES = {
  ADMIN: 1,
  INSTRUCTOR: 2,
  LEARNER: 3
};

export const ROLE_NAMES = {
  [USER_ROLES.ADMIN]: 'admin',
  [USER_ROLES.INSTRUCTOR]: 'instructor', 
  [USER_ROLES.LEARNER]: 'learner'
};

// Course Status
export const COURSE_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
};

// User Status
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
};

// Course Levels
export const COURSE_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced'
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50
};

// File Upload
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

// UI Constants
export const UI_CONFIG = {
  TOAST_DURATION: 3000,
  MODAL_ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500
};

// Navigation Routes
export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  CATALOG: '/catalog',
  COURSE: '/course/:id',
  PROGRESS: '/progress',
  EXAM: '/exam/:id',
  EXAM_HISTORY: '/exam-history',
  ADMIN: '/admin',
  INSTRUCTOR: '/instructor',
  INSTRUCTOR_COURSES: '/instructor/courses',
  INSTRUCTOR_COURSE_MANAGE: '/instructor/courses/:id',
  PRICING: '/pricing',
  ABOUT: '/about',
  CONTACT: '/contact'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_PREFERENCES: 'userPreferences',
  THEME: 'theme',
  LANGUAGE: 'language'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.',
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  FORBIDDEN: 'Bạn không có quyền thực hiện hành động này.',
  NOT_FOUND: 'Không tìm thấy dữ liệu.',
  SERVER_ERROR: 'Lỗi server. Vui lòng thử lại sau.',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
  UNKNOWN_ERROR: 'Đã có lỗi không mong muốn xảy ra.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Đăng nhập thành công!',
  REGISTER_SUCCESS: 'Đăng ký tài khoản thành công!',
  UPDATE_SUCCESS: 'Cập nhật thành công!',
  DELETE_SUCCESS: 'Xóa thành công!',
  SAVE_SUCCESS: 'Lưu thành công!',
  ENROLL_SUCCESS: 'Đăng ký khóa học thành công!'
};

// Validation Rules
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 2000
};

export default {
  API_CONFIG,
  USER_ROLES,
  ROLE_NAMES,
  COURSE_STATUS,
  USER_STATUS,
  COURSE_LEVELS,
  PAGINATION,
  UPLOAD_CONFIG,
  UI_CONFIG,
  ROUTES,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION
};