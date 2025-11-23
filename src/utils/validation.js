import { VALIDATION } from '../config/constants.js';

/**
 * Form validation utilities
 */

export class FormValidator {
  constructor() {
    this.errors = {};
  }

  // Reset errors
  reset() {
    this.errors = {};
    return this;
  }

  // Check if validation passed
  isValid() {
    return Object.keys(this.errors).length === 0;
  }

  // Get all errors
  getErrors() {
    return this.errors;
  }

  // Get error for specific field
  getError(field) {
    return this.errors[field];
  }

  // Add error for field
  addError(field, message) {
    this.errors[field] = message;
    return this;
  }

  // Validate required field
  required(field, value, message = `${field} là bắt buộc`) {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      this.addError(field, message);
    }
    return this;
  }

  // Validate email
  email(field, value, message = 'Email không hợp lệ') {
    if (value && !VALIDATION.EMAIL_REGEX.test(value)) {
      this.addError(field, message);
    }
    return this;
  }

  // Validate password
  password(field, value, message = `Mật khẩu phải có ít nhất ${VALIDATION.PASSWORD_MIN_LENGTH} ký tự`) {
    if (value && value.length < VALIDATION.PASSWORD_MIN_LENGTH) {
      this.addError(field, message);
    }
    return this;
  }

  // Validate string length
  length(field, value, min, max, message) {
    if (value) {
      const length = value.length;
      if (min && length < min) {
        this.addError(field, message || `${field} phải có ít nhất ${min} ký tự`);
      }
      if (max && length > max) {
        this.addError(field, message || `${field} không được vượt quá ${max} ký tự`);
      }
    }
    return this;
  }

  // Validate custom rule
  custom(field, value, validator, message) {
    if (!validator(value)) {
      this.addError(field, message);
    }
    return this;
  }

  // Validate confirm password
  confirmPassword(passwordField, confirmField, password, confirmPassword, message = 'Mật khẩu xác nhận không khớp') {
    if (password !== confirmPassword) {
      this.addError(confirmField, message);
    }
    return this;
  }

  // Validate number range
  range(field, value, min, max, message) {
    const num = Number(value);
    if (isNaN(num)) {
      this.addError(field, message || `${field} phải là số`);
    } else if (min !== undefined && num < min) {
      this.addError(field, message || `${field} phải lớn hơn hoặc bằng ${min}`);
    } else if (max !== undefined && num > max) {
      this.addError(field, message || `${field} phải nhỏ hơn hoặc bằng ${max}`);
    }
    return this;
  }

  // Validate file size
  fileSize(field, file, maxSize, message) {
    if (file && file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / 1024 / 1024);
      this.addError(field, message || `File không được lớn hơn ${maxSizeMB}MB`);
    }
    return this;
  }

  // Validate file type
  fileType(field, file, allowedTypes, message) {
    if (file && !allowedTypes.includes(file.type)) {
      this.addError(field, message || 'Định dạng file không được hỗ trợ');
    }
    return this;
  }
}

// Validation schemas for common forms
export const ValidationSchemas = {
  login: (data) => {
    return new FormValidator()
      .required('email', data.email, 'Email là bắt buộc')
      .email('email', data.email)
      .required('password', data.password, 'Mật khẩu là bắt buộc');
  },

  register: (data) => {
    return new FormValidator()
      .required('full_name', data.full_name, 'Họ tên là bắt buộc')
      .length('full_name', data.full_name, VALIDATION.NAME_MIN_LENGTH, VALIDATION.NAME_MAX_LENGTH)
      .required('email', data.email, 'Email là bắt buộc')
      .email('email', data.email)
      .required('password', data.password, 'Mật khẩu là bắt buộc')
      .password('password', data.password)
      .required('confirmPassword', data.confirmPassword, 'Xác nhận mật khẩu là bắt buộc')
      .confirmPassword('password', 'confirmPassword', data.password, data.confirmPassword);
  },

  course: (data) => {
    return new FormValidator()
      .required('title', data.title, 'Tiêu đề khóa học là bắt buộc')
      .length('title', data.title, 5, VALIDATION.TITLE_MAX_LENGTH)
      .required('description', data.description, 'Mô tả là bắt buộc')
      .length('description', data.description, 10, VALIDATION.DESCRIPTION_MAX_LENGTH)
      .required('level', data.level, 'Cấp độ là bắt buộc')
      .required('category_id', data.category_id, 'Danh mục là bắt buộc')
      .range('price', data.price, 0, 10000000, 'Giá phải từ 0 đến 10,000,000 VND');
  },

  profile: (data) => {
    return new FormValidator()
      .required('full_name', data.full_name, 'Họ tên là bắt buộc')
      .length('full_name', data.full_name, VALIDATION.NAME_MIN_LENGTH, VALIDATION.NAME_MAX_LENGTH)
      .email('email', data.email);
  }
};

// Helper function to validate form data
export const validateForm = (schema, data) => {
  const validator = typeof schema === 'function' ? schema(data) : schema;
  return {
    isValid: validator.isValid(),
    errors: validator.getErrors()
  };
};

// Custom validation rules
export const customValidators = {
  isValidPhone: (phone) => {
    const phoneRegex = /^(\+84|84|0)[1-9][0-9]{8,9}$/;
    return phoneRegex.test(phone);
  },

  isValidUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  isStrongPassword: (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  },

  isValidDate: (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  },

  isFutureDate: (dateString) => {
    const date = new Date(dateString);
    return date > new Date();
  }
};

export default {
  FormValidator,
  ValidationSchemas,
  validateForm,
  customValidators
};