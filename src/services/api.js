// Real API implementation for production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Import fallback utilities
import { 
  getMockCourse, 
  getMockCourses, 
  apiWithFallback 
} from '../utils/fallbackData';

// Token management with refresh capability
const getToken = () => localStorage.getItem('authToken');
const setToken = (token) => localStorage.setItem('authToken', token);
const removeToken = () => localStorage.removeItem('authToken');

// JWT token utilities
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    // Check if token expires within 5 minutes (300 seconds)
    return payload.exp < (currentTime + 300);
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

const refreshToken = async () => {
  try {
    console.log('🔄 Attempting token refresh...');
    const currentToken = getToken();
    
    if (!currentToken) {
      throw new Error('No token to refresh');
    }
    
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.token) {
        setToken(data.token);
        console.log('✅ Token refreshed successfully');
        return data.token;
      }
    }
    
    throw new Error('Token refresh failed');
  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    removeToken();
    // Redirect to login or trigger logout
    window.location.href = '/login';
    throw error;
  }
};

// Simple in-memory cache for API responses
const apiCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// API request helper with improved caching and token refresh
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  let token = getToken();
  
  // Check if token needs refresh (skip for auth endpoints)
  const isAuthEndpoint = endpoint.includes('/auth/');
  if (token && !isAuthEndpoint && isTokenExpired(token)) {
    try {
      token = await refreshToken();
    } catch (error) {
      // Token refresh failed, user will be redirected to login
      return;
    }
  }
  
  // Check cache for GET requests (unless forced refresh or auth endpoint)
  const cacheKey = `${endpoint}_${JSON.stringify(options.body || {})}`;
  if ((!options.method || options.method === 'GET') && !options.forceRefresh && !isAuthEndpoint) {
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`🎯 Cache hit for ${endpoint}`);
      return cached.data;
    }
  }
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    }
  };

  try {
    console.log(`📡 API Request: ${endpoint}`);
    console.log(`📤 Request config:`, { method: config.method, headers: config.headers, body: config.body });
    const response = await fetch(url, config);
    
    // Handle 401 unauthorized - try token refresh once
    if (response.status === 401 && !isAuthEndpoint && !options._retryAttempt) {
      console.log('🔄 401 detected, attempting token refresh...');
      try {
        const newToken = await refreshToken();
        if (newToken) {
          // Retry request with new token
          return await apiRequest(endpoint, { 
            ...options, 
            _retryAttempt: true,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${newToken}`
            }
          });
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed on 401:', refreshError);
        // Let the original 401 response be processed below
      }
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      // Handle validation errors specifically
      if (response.status === 400 && data.errors) {
        console.log('🔍 Validation errors detected:', data.errors);
        return {
          success: false,
          error: data.message || 'Validation failed',
          validationErrors: data.errors
        };
      }
      throw new Error(data.message || 'API request failed');
    }
    
    // ✅ FIX: Don't double-wrap if backend already returns { success: true, data: ... }
    // Just return the backend response directly
    const result = data.success !== undefined ? data : { success: true, data };
    
    // Cache successful GET requests (but not auth endpoints)
    if ((!options.method || options.method === 'GET') && !isAuthEndpoint) {
      apiCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
    }
    
    return result;
  } catch (error) {
    console.error(`❌ API Error [${endpoint}]:`, error);
    return { 
      success: false, 
      error: error.message || 'Network error occurred'
    };
  }
};

// Auth API
export const authAPI = {
  async login(email, password) {
    console.log('🔑 authAPI.login called with:', { email, password: password ? '***' : undefined });
    console.log('🔑 Creating request body:', { email, password });
    const requestBody = JSON.stringify({ email, password });
    console.log('🔑 Stringified body:', requestBody);
    console.log('🔑 Body length:', requestBody.length);
    
    // Always force fresh request for auth, never cache
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      body: requestBody,
      forceRefresh: true,
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (result.success && result.data && result.data.token) {
      setToken(result.data.token);
    }
    
    return result;
  },

  async register(userData) {
    const result = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    if (result.success && result.data.token) {
      setToken(result.data.token);
    }
    
    return result;
  },

  async logout() {
    removeToken();
    return { success: true, data: null };
  },

  async getCurrentUser() {
    return await apiRequest('/auth/profile');
  },

  async updateProfile(profileData) {
    return await apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  async updateAvatar(formData) {
    // Remove Content-Type header to let browser set it with boundary for FormData
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/auth/avatar`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload avatar');
    }

    return data;
  },

  async refreshToken() {
    // Implementation depends on your refresh token strategy
    return { success: true, data: { token: getToken() } };
  }
};

// Course API
export const courseAPI = {
  async getCourses(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/courses${queryString ? `?${queryString}` : ''}`;
    
    // Use fallback wrapper
    const result = await apiWithFallback(
      async () => await apiRequest(endpoint),
      () => {
        const courses = getMockCourses(params);
        return {
          data: {
            courses: courses,
            pagination: {
              total: courses.length,
              page: 1,
              limit: params.limit || 10,
              totalPages: 1
            }
          }
        };
      }
    );
    
    if (result.success) {
      return {
        success: true,
        data: {
          data: result.data.courses || [],
          total: result.data.pagination?.total || 0,
          page: result.data.pagination?.page || 1,
          per_page: result.data.pagination?.limit || 10,
          total_pages: result.data.pagination?.totalPages || 1
        },
        offline: result.offline
      };
    }
    
    return result;
  },

  async getCourseById(courseId) {
    // Use fallback wrapper
    const result = await apiWithFallback(
      async () => await apiRequest(`/courses/${courseId}`),
      () => ({
        data: {
          course: getMockCourse(courseId)
        }
      })
    );
    
    if (result.success) {
      return {
        success: true,
        data: result.data.course,
        offline: result.offline
      };
    }
    
    return result;
  },

  async createCourse(courseData) {
    return await apiRequest('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData)
    });
  },

  async updateCourse(courseId, courseData) {
    return await apiRequest(`/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(courseData)
    });
  },

  async deleteCourse(courseId) {
    return await apiRequest(`/courses/${courseId}`, {
      method: 'DELETE'
    });
  },

  async getMyCourses() {
    // For learners: get enrolled courses
    // For instructors: get their own courses
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (user.role === 'learner') {
      return await apiRequest('/courses/my-enrolled');
    } else {
      return await apiRequest('/courses/instructor/my-courses');
    }
  },

  async enrollInCourse(courseId) {
    return await apiRequest(`/courses/${courseId}/enroll`, {
      method: 'POST'
    });
  },

  async getCategories() {
    const result = await apiRequest('/courses/categories/list');
    
    if (result.success) {
      return {
        success: true,
        data: result.data.categories || []
      };
    }
    
    return result;
  },

  // Admin functions
  async getPendingCourses() {
    return await apiRequest('/courses/admin/pending');
  },

  async approveCourse(courseId, feedback) {
    return await apiRequest(`/courses/admin/${courseId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ feedback })
    });
  },

  async rejectCourse(courseId, feedback) {
    return await apiRequest(`/courses/admin/${courseId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ feedback })
    });
  }
};

// Enrollment API
export const enrollmentAPI = {
  async enrollInCourse(courseId) {
    return await courseAPI.enrollInCourse(courseId);
  },

  async getMyEnrollments() {
    return await apiRequest('/enrollments/my-enrollments');
  },

  async getEnrollmentById(enrollmentId) {
    return await apiRequest(`/enrollments/${enrollmentId}`);
  },

  async getCourseProgress(courseId) {
    return await apiRequest(`/enrollments/course/${courseId}/progress`);
  },

  async getCourseContent(courseId) {
    return await apiRequest(`/enrollments/course/${courseId}/content`);
  },

  async markLessonComplete(lessonId, data) {
    return await apiRequest(`/enrollments/lesson/${lessonId}/complete`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getCourseEnrollments(courseId) {
    return await apiRequest(`/courses/${courseId}/enrollments`);
  }
};

// Quiz API (new learning system)
export const quizAPI = {
  async getQuizById(quizId) {
    return await apiRequest(`/quizzes/${quizId}`);
  },

  async submitQuiz(quizId, answers) {
    return await apiRequest(`/quizzes/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers })
    });
  },

  async getQuizAttempts(quizId) {
    return await apiRequest(`/quizzes/${quizId}/attempts`);
  }
};

// Exam API (new learning system)
export const newExamAPI = {
  async getExamByMooc(moocId) {
    return await apiRequest(`/learning/exams/mooc/${moocId}`);
  },

  async startExam(examId) {
    return await apiRequest(`/learning/exams/${examId}/start`, {
      method: 'POST'
    });
  },

  async submitExam(examId, attemptId, answers) {
    return await apiRequest(`/learning/exams/${examId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ attempt_id: attemptId, answers })
    });
  },

  async getExamResult(attemptId) {
    return await apiRequest(`/learning/exams/attempts/${attemptId}/result`);
  },

  async getCourseProgress(courseId) {
    return await apiRequest(`/learning/exams/course/${courseId}/progress`);
  },

  async getCertificate(courseId) {
    return await apiRequest(`/exams/certificate/${courseId}`);
  }
};

// Content API (for lessons, MOOCs, etc.)
export const contentAPI = {
  async getMoocsByCourse(courseId) {
    return await apiRequest(`/courses/${courseId}/moocs`);
  },

  async createMooc(moocData) {
    return await apiRequest('/content/moocs', {
      method: 'POST',
      body: JSON.stringify(moocData)
    });
  },

  async updateMooc(moocId, moocData) {
    return await apiRequest(`/content/moocs/${moocId}`, {
      method: 'PUT',
      body: JSON.stringify(moocData)
    });
  },

  async deleteMooc(moocId) {
    return await apiRequest(`/content/moocs/${moocId}`, {
      method: 'DELETE'
    });
  },

  async getLessonsByMooc(moocId) {
    return await apiRequest(`/content/moocs/${moocId}/lessons`);
  },

  async getLessonById(lessonId) {
    return await apiRequest(`/content/lessons/${lessonId}`);
  },

  async createLesson(lessonData) {
    return await apiRequest('/content/lessons', {
      method: 'POST',
      body: JSON.stringify(lessonData)
    });
  },

  async updateLesson(lessonId, lessonData) {
    return await apiRequest(`/content/lessons/${lessonId}`, {
      method: 'PUT',
      body: JSON.stringify(lessonData)
    });
  },

  async deleteLesson(lessonId) {
    return await apiRequest(`/content/lessons/${lessonId}`, {
      method: 'DELETE'
    });
  }
};

// Exam API
export const examAPI = {
  async getExamByMooc(moocId) {
    return await apiRequest(`/exams/mooc/${moocId}`);
  },

  async createExam(examData) {
    return await apiRequest('/exams', {
      method: 'POST',
      body: JSON.stringify(examData)
    });
  },

  async updateExam(examId, examData) {
    return await apiRequest(`/exams/${examId}`, {
      method: 'PUT',
      body: JSON.stringify(examData)
    });
  },

  async getQuestionsByMooc(moocId) {
    return await apiRequest(`/exams/mooc/${moocId}/questions`);
  },

  async createQuestion(questionData) {
    return await apiRequest('/exams/questions', {
      method: 'POST',
      body: JSON.stringify(questionData)
    });
  },

  async updateQuestion(questionId, questionData) {
    return await apiRequest(`/exams/questions/${questionId}`, {
      method: 'PUT',
      body: JSON.stringify(questionData)
    });
  },

  async deleteQuestion(questionId) {
    return await apiRequest(`/exams/questions/${questionId}`, {
      method: 'DELETE'
    });
  },

  async startExam(examId) {
    return await apiRequest(`/exams/${examId}/start`, {
      method: 'POST'
    });
  },

  async submitExam(examId, attemptData) {
    return await apiRequest(`/exams/${examId}/submit`, {
      method: 'POST',
      body: JSON.stringify(attemptData)
    });
  },

  async getMySubmissions(examId) {
    return await apiRequest(`/exams/${examId}/my-submissions`);
  },

  async getSubmissionDetails(submissionId) {
    return await apiRequest(`/exams/submissions/${submissionId}`);
  }
};

// User API
export const userAPI = {
  async getAllUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/users${queryString ? `?${queryString}` : ''}`;
    return await apiRequest(endpoint);
  },

  async updateUserStatus(userId, status) {
    return await apiRequest(`/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  async updateUserRole(userId, roleId) {
    return await apiRequest(`/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ roleId })
    });
  }
};

// Admin API
export const adminAPI = {
  async getDashboardStats() {
    return await apiRequest('/admin/stats');
  },

  async getCourseStats() {
    return await apiRequest('/admin/stats/courses');
  },

  async getUserStats() {
    return await apiRequest('/admin/stats/users');
  },

  async getAllUsers(params = {}) {
    return await userAPI.getAllUsers(params);
  },

  async getAllCourses() {
    return await apiRequest('/admin/courses');
  },

  async approveCourse(courseId) {
    return await courseAPI.approveCourse(courseId);
  },

  async rejectCourse(courseId) {
    return await courseAPI.rejectCourse(courseId);
  },

  async updateUserRole(userId, roleId) {
    return await userAPI.updateUserRole(userId, roleId);
  },

  async updateUserStatus(userId, status) {
    return await userAPI.updateUserStatus(userId, status);
  },

  // Revenue APIs
  async getRevenueSummary() {
    return await apiRequest('/admin/revenue/summary');
  },

  async getPendingPayments() {
    return await apiRequest('/admin/revenue/pending-payments');
  },

  async getInstructorRevenue() {
    return await apiRequest('/admin/revenue/instructor-revenue');
  },

  async verifyPayment(paymentId, verified, note = '') {
    return await apiRequest(`/admin/revenue/verify-payment/${paymentId}`, {
      method: 'POST',
      body: JSON.stringify({ verified, note })
    });
  }
};

// Instructor API  
export const instructorAPI = {
  async getCourses() {
    return await apiRequest('/instructor/courses');
  },

  async getStudents() {
    return await apiRequest('/instructor/students');
  },

  async getDashboardStats() {
    return await apiRequest('/instructor/stats');
  },

  async getSubmissions() {
    return await apiRequest('/instructor/submissions');
  },

  async createCourse(courseData) {
    return await courseAPI.createCourse(courseData);
  },

  async updateCourse(courseId, courseData) {
    return await courseAPI.updateCourse(courseId, courseData);
  },

  // Revenue APIs
  async getRevenueSummary() {
    return await apiRequest('/instructor/revenue/summary');
  },

  async getTransactions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/instructor/revenue/transactions${queryString ? '?' + queryString : ''}`);
  }
};

// Learner API
export const learnerAPI = {
  async getEnrolledCourses() {
    return await apiRequest('/learner/enrolled-courses');
  },

  async getRecommendedCourses() {
    return await apiRequest('/learner/recommended-courses');
  },

  async getProgress() {
    return await apiRequest('/learner/progress');
  },

  async getDashboardStats() {
    return await apiRequest('/learner/stats');
  },

  async getExamHistory() {
    return await apiRequest('/learner/exam-history');
  }
};

// Checkout API
const checkoutAPI = {
  async createOrder(orderData) {
    return await apiRequest('/checkout/create-order', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },

  async enrollNow(enrollData) {
    return await apiRequest('/checkout/enroll-now', {
      method: 'POST',
      body: JSON.stringify(enrollData)
    });
  },

  async completePayment(paymentData) {
    return await apiRequest('/checkout/complete-payment', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  },

  async getInvoices() {
    return await apiRequest('/checkout/invoices');
  }
};

// Assignments API
const assignmentsAPI = {
  async submit(lessonId, contentText, file) {
    const formData = new FormData();
    formData.append('lesson_id', lessonId);
    formData.append('content_text', contentText);
    if (file) {
      formData.append('file', file);
    }
    
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/assignments/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Submission failed');
      }
      
      return data;
    } catch (error) {
      console.error('❌ Assignment submission error:', error);
      return {
        success: false,
        error: error.message || 'Network error occurred'
      };
    }
  },

  async getSubmission(lessonId) {
    return await apiRequest(`/assignments/submission/${lessonId}`);
  },

  async grade(submissionId, score, feedback) {
    return await apiRequest('/assignments/grade', {
      method: 'POST',
      body: JSON.stringify({
        submission_id: submissionId,
        score,
        feedback
      })
    });
  },

  async getSubmissions(lessonId) {
    return await apiRequest(`/assignments/lesson/${lessonId}/submissions`);
  }
};

// Cache utilities
export const cacheUtils = {
  clear: () => {
    apiCache.clear();
    console.log('🗑️ API cache cleared');
  },
  
  clearPattern: (pattern) => {
    const keysToDelete = [];
    for (const key of apiCache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => apiCache.delete(key));
    console.log(`🗑️ Cleared ${keysToDelete.length} cached entries matching "${pattern}"`);
  },
  
  forceRefresh: async (endpoint, options = {}) => {
    return await apiRequest(endpoint, { ...options, forceRefresh: true });
  }
};

// Main API object
export const api = {
  auth: authAPI,
  courses: courseAPI,
  content: contentAPI,
  exams: examAPI,
  enrollments: enrollmentAPI,
  quizzes: quizAPI,
  newExams: newExamAPI,
  admin: adminAPI,
  instructor: instructorAPI,
  learner: learnerAPI,
  users: userAPI,
  checkout: checkoutAPI,
  assignments: assignmentsAPI,
  cache: cacheUtils
};

export default api;