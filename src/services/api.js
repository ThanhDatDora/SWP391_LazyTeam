// Real API implementation for production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Token management
const getToken = () => localStorage.getItem('authToken');
const setToken = (token) => localStorage.setItem('authToken', token);
const removeToken = () => localStorage.removeItem('authToken');

// API request helper
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return { success: true, data };
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    return { 
      success: false, 
      error: error.message || 'Network error occurred'
    };
  }
};

// Auth API
export const authAPI = {
  async login(email, password) {
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (result.success && result.data.token) {
      setToken(result.data.token);
    }
    
    return result;
  },

  async register(userData) {
    const result = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
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
      body: JSON.stringify(profileData),
    });
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
    
    const result = await apiRequest(endpoint);
    
    if (result.success) {
      return {
        success: true,
        data: {
          data: result.data.courses || [],
          total: result.data.pagination?.total || 0,
          page: result.data.pagination?.page || 1,
          per_page: result.data.pagination?.limit || 10,
          total_pages: result.data.pagination?.totalPages || 1
        }
      };
    }
    
    return result;
  },

  async getCourseById(courseId) {
    const result = await apiRequest(`/courses/${courseId}`);
    
    if (result.success) {
      return {
        success: true,
        data: result.data.course
      };
    }
    
    return result;
  },

  async createCourse(courseData) {
    return await apiRequest('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  },

  async updateCourse(courseId, courseData) {
    return await apiRequest(`/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  },

  async deleteCourse(courseId) {
    return await apiRequest(`/courses/${courseId}`, {
      method: 'DELETE',
    });
  },

  async getMyCourses() {
    return await apiRequest('/courses/instructor/my-courses');
  },

  async enrollInCourse(courseId) {
    return await apiRequest(`/courses/${courseId}/enroll`, {
      method: 'POST',
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
      body: JSON.stringify({ feedback }),
    });
  },

  async rejectCourse(courseId, feedback) {
    return await apiRequest(`/courses/admin/${courseId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ feedback }),
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

  async markLessonComplete(lessonId) {
    return await apiRequest(`/enrollments/lesson/${lessonId}/complete`, {
      method: 'POST',
    });
  },

  async getCourseEnrollments(courseId) {
    return await apiRequest(`/courses/${courseId}/enrollments`);
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
      body: JSON.stringify(moocData),
    });
  },

  async updateMooc(moocId, moocData) {
    return await apiRequest(`/content/moocs/${moocId}`, {
      method: 'PUT',
      body: JSON.stringify(moocData),
    });
  },

  async deleteMooc(moocId) {
    return await apiRequest(`/content/moocs/${moocId}`, {
      method: 'DELETE',
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
      body: JSON.stringify(lessonData),
    });
  },

  async updateLesson(lessonId, lessonData) {
    return await apiRequest(`/content/lessons/${lessonId}`, {
      method: 'PUT',
      body: JSON.stringify(lessonData),
    });
  },

  async deleteLesson(lessonId) {
    return await apiRequest(`/content/lessons/${lessonId}`, {
      method: 'DELETE',
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
      body: JSON.stringify(examData),
    });
  },

  async updateExam(examId, examData) {
    return await apiRequest(`/exams/${examId}`, {
      method: 'PUT',
      body: JSON.stringify(examData),
    });
  },

  async getQuestionsByMooc(moocId) {
    return await apiRequest(`/exams/mooc/${moocId}/questions`);
  },

  async createQuestion(questionData) {
    return await apiRequest('/exams/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
  },

  async updateQuestion(questionId, questionData) {
    return await apiRequest(`/exams/questions/${questionId}`, {
      method: 'PUT',
      body: JSON.stringify(questionData),
    });
  },

  async deleteQuestion(questionId) {
    return await apiRequest(`/exams/questions/${questionId}`, {
      method: 'DELETE',
    });
  },

  async startExam(examId) {
    return await apiRequest(`/exams/${examId}/start`, {
      method: 'POST',
    });
  },

  async submitExam(examId, attemptData) {
    return await apiRequest(`/exams/${examId}/submit`, {
      method: 'POST',
      body: JSON.stringify(attemptData),
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
      body: JSON.stringify({ status }),
    });
  },

  async updateUserRole(userId, roleId) {
    return await apiRequest(`/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ roleId }),
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
  }
};

// Main API object
export const api = {
  auth: authAPI,
  courses: courseAPI,
  content: contentAPI,
  exams: examAPI,
  enrollments: enrollmentAPI,
  admin: adminAPI,
  users: userAPI
};

export default api;