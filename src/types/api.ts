// API Service interfaces for communicating with backend
import { 
  User, Course, MOOC, Lesson, Question, Exam, Enrollment, 
  Submission, QnaThread, QnaPost, EssayTask, EssaySubmission,
  ApiResponse, PaginatedResponse, ExamAttemptData, CourseProgress
} from './database';

// Authentication API
export interface AuthAPI {
  login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>>;
  register(userData: Omit<User, 'user_id' | 'created_at'>): Promise<ApiResponse<User>>;
  logout(): Promise<ApiResponse<null>>;
  getCurrentUser(): Promise<ApiResponse<User>>;
  refreshToken(): Promise<ApiResponse<{ token: string }>>;
}

// Course Management API
export interface CourseAPI {
  getCourses(params?: {
    category_id?: number;
    level?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<ApiResponse<PaginatedResponse<Course>>>;
  
  getCourseById(courseId: number): Promise<ApiResponse<Course>>;
  createCourse(courseData: Omit<Course, 'course_id' | 'start_at'>): Promise<ApiResponse<Course>>;
  updateCourse(courseId: number, courseData: Partial<Course>): Promise<ApiResponse<Course>>;
  deleteCourse(courseId: number): Promise<ApiResponse<null>>;
  
  // Instructor specific
  getMyCourses(): Promise<ApiResponse<Course[]>>;
  submitForReview(courseId: number): Promise<ApiResponse<Course>>;
  
  // Admin specific
  getPendingCourses(): Promise<ApiResponse<Course[]>>;
  approveCourse(courseId: number, feedback?: string): Promise<ApiResponse<Course>>;
  rejectCourse(courseId: number, feedback: string): Promise<ApiResponse<Course>>;
}

// MOOC & Lesson API
export interface ContentAPI {
  // MOOCs
  getMoocsByCourse(courseId: number): Promise<ApiResponse<MOOC[]>>;
  createMooc(moocData: Omit<MOOC, 'mooc_id'>): Promise<ApiResponse<MOOC>>;
  updateMooc(moocId: number, moocData: Partial<MOOC>): Promise<ApiResponse<MOOC>>;
  deleteMooc(moocId: number): Promise<ApiResponse<null>>;
  
  // Lessons
  getLessonsByMooc(moocId: number): Promise<ApiResponse<Lesson[]>>;
  getLessonById(lessonId: number): Promise<ApiResponse<Lesson>>;
  createLesson(lessonData: Omit<Lesson, 'lesson_id'>): Promise<ApiResponse<Lesson>>;
  updateLesson(lessonId: number, lessonData: Partial<Lesson>): Promise<ApiResponse<Lesson>>;
  deleteLesson(lessonId: number): Promise<ApiResponse<null>>;
}

// Exam & Question API
export interface ExamAPI {
  // Questions
  getQuestionsByMooc(moocId: number): Promise<ApiResponse<Question[]>>;
  createQuestion(questionData: Omit<Question, 'question_id'>): Promise<ApiResponse<Question>>;
  updateQuestion(questionId: number, questionData: Partial<Question>): Promise<ApiResponse<Question>>;
  deleteQuestion(questionId: number): Promise<ApiResponse<null>>;
  
  // Exams
  getExamByMooc(moocId: number): Promise<ApiResponse<Exam>>;
  createExam(examData: Omit<Exam, 'exam_id'>): Promise<ApiResponse<Exam>>;
  updateExam(examId: number, examData: Partial<Exam>): Promise<ApiResponse<Exam>>;
  
  // Taking exams
  startExam(examId: number): Promise<ApiResponse<Exam>>;
  submitExam(examId: number, attemptData: ExamAttemptData): Promise<ApiResponse<Submission>>;
  getMySubmissions(examId: number): Promise<ApiResponse<Submission[]>>;
  getSubmissionDetails(submissionId: number): Promise<ApiResponse<Submission>>;
}

// Enrollment API
export interface EnrollmentAPI {
  enrollInCourse(courseId: number): Promise<ApiResponse<Enrollment>>;
  getMyEnrollments(): Promise<ApiResponse<Enrollment[]>>;
  getEnrollmentById(enrollmentId: number): Promise<ApiResponse<Enrollment>>;
  getCourseProgress(courseId: number): Promise<ApiResponse<CourseProgress>>;
  markLessonComplete(lessonId: number): Promise<ApiResponse<null>>;
  
  // Instructor view
  getCourseEnrollments(courseId: number): Promise<ApiResponse<PaginatedResponse<Enrollment>>>;
}

// Q&A API
export interface QnaAPI {
  getThreadsByLesson(lessonId: number): Promise<ApiResponse<QnaThread[]>>;
  createThread(threadData: Omit<QnaThread, 'thread_id' | 'created_at'>): Promise<ApiResponse<QnaThread>>;
  getPostsByThread(threadId: number): Promise<ApiResponse<QnaPost[]>>;
  createPost(postData: Omit<QnaPost, 'post_id' | 'created_at'>): Promise<ApiResponse<QnaPost>>;
  markAsAnswer(postId: number): Promise<ApiResponse<QnaPost>>;
}

// Essay API
export interface EssayAPI {
  getTasksByMooc(moocId: number): Promise<ApiResponse<EssayTask[]>>;
  createTask(taskData: Omit<EssayTask, 'task_id'>): Promise<ApiResponse<EssayTask>>;
  
  // Student submissions
  submitEssay(taskId: number, content: string): Promise<ApiResponse<EssaySubmission>>;
  getMySubmission(taskId: number): Promise<ApiResponse<EssaySubmission>>;
  
  // Instructor grading
  getSubmissionsForTask(taskId: number): Promise<ApiResponse<EssaySubmission[]>>;
  gradeSubmission(submissionId: number, score: number, feedback: string): Promise<ApiResponse<EssaySubmission>>;
}

// Payment API
export interface PaymentAPI {
  createPaymentIntent(courseId: number): Promise<ApiResponse<{ client_secret: string; amount: number }>>;
  confirmPayment(invoiceId: number): Promise<ApiResponse<{ status: string }>>;
  getMyInvoices(): Promise<ApiResponse<PaginatedResponse<any>>>;
}

// Admin API
export interface AdminAPI {
  // User management
  getAllUsers(params?: { 
    role?: string; 
    status?: string; 
    page?: number; 
    per_page?: number; 
  }): Promise<ApiResponse<PaginatedResponse<User>>>;
  updateUserStatus(userId: number, status: string): Promise<ApiResponse<User>>;
  updateUserRole(userId: number, roleId: number): Promise<ApiResponse<User>>;
  
  // Course management
  getAllCourses(): Promise<ApiResponse<Course[]>>;
  approveCourse(courseId: number): Promise<ApiResponse<Course>>;
  rejectCourse(courseId: number): Promise<ApiResponse<Course>>;
  
  // Analytics
  getDashboardStats(): Promise<ApiResponse<{
    total_users: number;
    total_courses: number;
    total_enrollments: number;
    revenue: number;
  }>>;
  
  getCourseStats(): Promise<ApiResponse<any[]>>;
  getUserStats(): Promise<ApiResponse<any[]>>;
}

// Combined API interface
export interface MiniCourseraAPI {
  auth: AuthAPI;
  courses: CourseAPI;
  content: ContentAPI;
  exams: ExamAPI;
  enrollments: EnrollmentAPI;
  qna: QnaAPI;
  essays: EssayAPI;
  payments: PaymentAPI;
  admin: AdminAPI;
}