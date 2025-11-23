// Database entity types based on SQL schema

export interface Role {
  role_id: number;
  role_name: 'admin' | 'instructor' | 'learner';
}

export interface User {
  user_id: number;
  full_name: string;
  email: string;
  password_hash: string;
  role_id: number;
  status: 'active' | 'inactive' | 'banned';
  created_at: string;
  // Relations
  role?: Role;
}

export interface Category {
  category_id: number;
  name: string;
}

export interface Tag {
  tag_id: number;
  name: string;
}

export interface Course {
  course_id: number;
  owner_instructor_id: number;
  category_id?: number;
  title: string;
  description?: string;
  language_code?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  start_at: string;
  end_at?: string;
  status: 'draft' | 'submitted' | 'published' | 'archived' | 'needs_changes';
  approved_by_admin_id?: number;
  review_feedback?: string;
  // Relations
  instructor?: User;
  category?: Category;
  tags?: Tag[];
  moocs?: MOOC[];
  enrollments_count?: number;
}

export interface CourseTag {
  course_id: number;
  tag_id: number;
}

export interface MOOC {
  mooc_id: number;
  course_id: number;
  title: string;
  order_no: number;
  pass_mark: number;
  exam_open_at?: string;
  exam_close_at?: string;
  // Relations
  course?: Course;
  lessons?: Lesson[];
  questions?: Question[];
  exam?: Exam;
}

export interface Lesson {
  lesson_id: number;
  mooc_id: number;
  title: string;
  content_type: 'video' | 'pdf' | 'link' | 'text';
  content_url?: string;
  order_no: number;
  is_preview: boolean;
  // Relations
  mooc?: MOOC;
  qna_threads?: QnaThread[];
}

export interface Question {
  question_id: number;
  mooc_id: number;
  qtype: 'mcq' | 'true_false';
  stem: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  // Relations
  mooc?: MOOC;
  options?: QuestionOption[];
}

export interface QuestionOption {
  option_id: number;
  question_id: number;
  label?: string;
  content: string;
  is_correct: boolean;
}

export interface Exam {
  exam_id: number;
  mooc_id: number;
  name?: string;
  duration_minutes: number;
  // Relations
  mooc?: MOOC;
  items?: ExamItem[];
  submissions?: Submission[];
}

export interface ExamItem {
  exam_id: number;
  question_id: number;
  order_no: number;
  points: number;
  // Relations
  question?: Question;
}

export interface Enrollment {
  enrollment_id: number;
  user_id: number;
  course_id: number;
  enrolled_at: string;
  completed_at?: string;
  status: 'active' | 'completed' | 'dropped';
  // Relations
  user?: User;
  course?: Course;
}

export interface Invoice {
  invoice_id: number;
  user_id: number;
  course_id: number;
  amount: number;
  status: 'paid' | 'failed' | 'pending';
  created_at: string;
  paid_at?: string;
  // Relations
  user?: User;
  course?: Course;
}

export interface EssayTask {
  task_id: number;
  mooc_id: number;
  title: string;
  max_score: number;
  due_at?: string;
  // Relations
  mooc?: MOOC;
  submissions?: EssaySubmission[];
}

export interface EssaySubmission {
  essay_submission_id: number;
  task_id: number;
  user_id: number;
  content_text?: string;
  score?: number;
  feedback?: string;
  graded_by?: number;
  graded_at?: string;
  status: 'submitted' | 'graded' | 'draft';
  // Relations
  task?: EssayTask;
  user?: User;
  grader?: User;
}

export interface QnaThread {
  thread_id: number;
  lesson_id: number;
  author_user_id: number;
  title: string;
  body: string;
  created_at: string;
  // Relations
  lesson?: Lesson;
  author?: User;
  posts?: QnaPost[];
}

export interface QnaPost {
  post_id: number;
  thread_id: number;
  author_user_id: number;
  body: string;
  is_answer: boolean;
  created_at: string;
  // Relations
  thread?: QnaThread;
  author?: User;
}

export interface Submission {
  submission_id: number;
  exam_id: number;
  user_id: number;
  attempt_no: number; // 1-3
  score: number;
  max_score: number;
  submitted_at: string;
  is_best: boolean;
  // Relations
  exam?: Exam;
  user?: User;
  answers?: SubmissionAnswer[];
}

export interface SubmissionAnswer {
  submission_answer_id: number;
  submission_id: number;
  question_id: number;
  selected_option_id?: number;
  is_correct?: boolean;
  // Relations
  submission?: Submission;
  question?: Question;
  selected_option?: QuestionOption;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Frontend specific types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ExamAttemptData {
  exam_id: number;
  answers: { question_id: number; selected_option_id?: number }[];
}

export interface CourseProgress {
  course_id: number;
  completed_moocs: number;
  total_moocs: number;
  completed_lessons: number;
  total_lessons: number;
  current_lesson_id?: number;
  completion_percentage: number;
}