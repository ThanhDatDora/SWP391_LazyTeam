import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/ui/loading';

// Auth Pages - Keep immediately available
import AuthPage from '../pages/auth/AuthPage';
import AuthCallback from '../pages/auth/AuthCallback';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

// Critical Pages - Keep immediately available
import Landing from '../pages/Landing';
import LandingSimple from '../pages/LandingSimple';
import LandingLearner from '../pages/LandingLearner';
import AuthDebug from '../pages/AuthDebug';

// Lazy Load Main Pages for Performance
const LearnerDashboard = lazy(() => import('../pages/learner/LearnerDashboard'));
const CoursePage = lazy(() => import('../pages/course/CoursePage'));
const CoursesPage = lazy(() => import('../pages/CoursesPage'));
const CourseDetailPage = lazy(() => import('../pages/CourseDetailPageNew'));
const CatalogPage = lazy(() => import('../pages/CatalogPage'));
const ExamPage = lazy(() => import('../pages/exam/ExamPage'));
const ExamHistoryPage = lazy(() => import('../pages/exam/ExamHistoryPage'));
const ExamResultsPage = lazy(() => import('../pages/exam/ExamResultsPage'));
const QuizPageNew = lazy(() => import('../pages/QuizPage'));
const ExamPageNew = lazy(() => import('../pages/ExamPage'));
const ProgressPage = lazy(() => import('../pages/ProgressPage'));
const CourseLearningPage = lazy(() => import('../pages/CourseLearningPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const MyProfilePage = lazy(() => import('../pages/MyProfilePage'));
const NotificationsPage = lazy(() => import('../pages/NotificationsPage'));
const CoursePlayerPage = lazy(() => import('../pages/CoursePlayerPage'));
const MyCoursesPage = lazy(() => import('../pages/MyCoursesPage'));
const CartPage = lazy(() => import('../pages/CartPage'));

// Guest Pages
const AboutPage = lazy(() => import('../pages/AboutPage'));
const ContactPage = lazy(() => import('../pages/ContactPage'));

// Admin Layout & Pages - Heavy components, lazy load
const AdminPanel = lazy(() => import('../pages/admin/AdminPanel'));
const AdminUsersPage = lazy(() => import('../pages/admin/UsersPage'));
const AdminLearnersPage = lazy(() => import('../pages/admin/LearnersPage'));
const AdminInstructorsListPage = lazy(() => import('../pages/admin/InstructorsListPage'));
const AdminCoursesPage = lazy(() => import('../pages/admin/CoursesPage'));
const AdminCategoriesPage = lazy(() => import('../pages/admin/CategoriesPage'));
const CoursePendingPage = lazy(() => import('../pages/admin/CoursePendingPage'));
const LearningStatsPage = lazy(() => import('../pages/admin/LearningStatsPage'));
const ConversationsPage = lazy(() => import('../pages/admin/ConversationsPage'));
const InstructorReportsPage = lazy(() => import('../pages/admin/InstructorReportsPage'));
const InstructorRequestsPage = lazy(() => import('../pages/admin/InstructorRequestsPage'));
const PayoutsPage = lazy(() => import('../pages/admin/PayoutsPage'));

// Instructor Pages
const InstructorDashboard = lazy(() => import('../pages/instructor/InstructorDashboard'));
const CourseManagement = lazy(() => import('../pages/instructor/CourseManagement'));

// Legacy Pages (keeping for compatibility) - Lazy load these
const TestPage = lazy(() => import('../pages/TestPage'));
const Catalog = lazy(() => import('../pages/Catalog'));
const BlogList = lazy(() => import('../pages/BlogList'));
const BlogDetail = lazy(() => import('../pages/BlogDetail'));
const Pricing = lazy(() => import('../pages/Pricing'));
const Checkout = lazy(() => import('../pages/Checkout'));
const Exam = lazy(() => import('../pages/Exam'));

// Course Components - Lazy load
const CourseDetail = lazy(() => import('../components/course/CourseDetail'));
const EnhancedCourseDetail = lazy(() => import('../components/course/EnhancedCourseDetail'));
const CoursePlayer = lazy(() => import('../components/course/CoursePlayer'));

// Protected Route Component with Lazy Loading Support
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { state, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(state.user?.role_id)) {
    return <Navigate to="/" replace />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      {children}
    </Suspense>
  );
};

// Public Route Component with Lazy Loading Support  
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      {children}
    </Suspense>
  );
};

// Wrapper components to handle URL parameters
const LegacyCourseDetailPage = () => {
  const { courseId } = useParams();
  return <EnhancedCourseDetail courseId={courseId} />;
};

const PlayerPage = () => {
  const { moocId } = useParams();
  return <CoursePlayer moocId={moocId} />;
};

const LegacyExamPage = () => {
  const { moocId } = useParams();
  return <Exam moocId={moocId} />;
};

// Component to conditionally render home page based on user role
const HomePage = () => {
  const { isAuthenticated, state } = useAuth();
  
  if (isAuthenticated && state.user) {
    const roleId = state.user.role_id;
    
    // Admin - redirect to admin panel
    if (roleId === 1) {
      return <Navigate to="/admin" replace />;
    }
    
    // Instructor - redirect to instructor dashboard
    if (roleId === 2) {
      return <Navigate to="/instructor" replace />;
    }
    
    // Learner - show learner landing
    if (roleId === 3) {
      return <LandingLearner />;
    }
  }
  
  // Guest users see main landing page
  return <Landing />;
};

const AppRouter = () => {
  const { isAuthenticated, state } = useAuth();

  // Get dashboard route based on user role
  const getDashboardRoute = () => {
    if (!isAuthenticated || !state.user) {return '/';}
    
    const roleId = state.user.role_id;
    switch (roleId) {
      case 1: // Admin
        return '/admin';
      case 2: // Instructor  
        return '/instructor';
      case 3: // Learner
        return '/';
      default:
        return '/dashboard';
    }
  };

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public Auth Routes */}
        <Route 
          path="/auth" 
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          } 
        />
      <Route 
        path="/auth/callback" 
        element={<AuthCallback />} 
      />
      <Route 
        path="/forgot-password" 
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        } 
      />
      <Route 
        path="/reset-password" 
        element={
          <PublicRoute>
            <ResetPasswordPage />
          </PublicRoute>
        } 
      />
      <Route 
        path="/login" 
        element={<Navigate to="/auth" replace />} 
      />
      <Route 
        path="/register" 
        element={<Navigate to="/auth" replace />} 
      />

      {/* Home Route - Show appropriate landing based on user role */}
      <Route 
        path="/" 
        element={<HomePage />} 
      />
      
      {/* Test original landing */}
      <Route 
        path="/landing-original" 
        element={<Landing />} 
      />
      
      {/* Test Routes */}
      <Route 
        path="/test" 
        element={<TestPage />} 
      />
      <Route 
        path="/auth-debug" 
        element={<AuthDebug />} 
      />
      <Route 
        path="/landingfixed" 
        element={<Landing />} 
      />
      
      {/* Dashboard Route - Redirect learners to home for LandingLearner experience */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute allowedRoles={[3]}>
            <Navigate to="/" replace />
          </ProtectedRoute>
        } 
      />
      
      {/* Profile Route */}
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />
      
      {/* My Profile Route */}
      <Route 
        path="/my-profile" 
        element={
          <ProtectedRoute>
            <MyProfilePage />
          </ProtectedRoute>
        } 
      />
      
      {/* Notifications Route */}
      <Route 
        path="/notifications" 
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Course Player Route */}
      <Route 
        path="/course-player/:courseId" 
        element={
          <ProtectedRoute>
            <CoursePlayerPage />
          </ProtectedRoute>
        } 
      />
      
      {/* My Courses Route */}
      <Route 
        path="/my-courses" 
        element={
          <ProtectedRoute>
            <MyCoursesPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Cart Route */}
      <Route 
        path="/cart" 
        element={
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/catalog" 
        element={
          <ProtectedRoute>
            <CatalogPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/courses" 
        element={
          <ProtectedRoute>
            <CoursesPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/courses/:id" 
        element={
          <ProtectedRoute>
            <CourseDetailPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/course/:id" 
        element={
          isAuthenticated ? (
            <ProtectedRoute>
              <CoursePage />
            </ProtectedRoute>
          ) : (
            <Navigate to="/auth" replace />
          )
        } 
      />
      <Route 
        path="/exam/:id" 
        element={
          <ProtectedRoute>
            <ExamPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/exam-results/:instanceId" 
        element={
          <ProtectedRoute>
            <ExamResultsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/exam-history" 
        element={
          <ProtectedRoute>
            <ExamHistoryPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/progress" 
        element={
          <ProtectedRoute>
            <ProgressPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/learn/:courseId" 
        element={
          <ProtectedRoute>
            <CourseLearningPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/quiz/:quizId" 
        element={
          <ProtectedRoute>
            <QuizPageNew />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/exam/:examId" 
        element={
          <ProtectedRoute>
            <ExamPageNew />
          </ProtectedRoute>
        } 
      />
      
      {/* Public Pages */}
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      
      {/* Legacy Routes for backward compatibility */}
      <Route path="/landing" element={<Landing />} />
      <Route path="/old-catalog" element={<Catalog />} />
      <Route path="/blog" element={<BlogList />} />
      <Route path="/blog/:slug" element={<BlogDetail />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/course/:courseId/detail" element={<LegacyCourseDetailPage />} />
      <Route path="/player/:moocId" element={<PlayerPage />} />
      <Route path="/legacy-exam/:moocId" element={<LegacyExamPage />} />
      
      {/* Admin Routes - Nested Layout */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={[1]}>
            <AdminPanel />
          </ProtectedRoute>
        }
      >
        {/* Admin nested routes - NO index route since AdminPanel shows Overview by default at /admin */}
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="learners" element={<AdminLearnersPage />} />
        <Route path="instructors-list" element={<AdminInstructorsListPage />} />
        <Route path="courses" element={<AdminCoursesPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="course-pending" element={<CoursePendingPage />} />
        <Route path="conversations" element={<ConversationsPage />} />
        <Route path="learning-stats" element={<LearningStatsPage />} />
        <Route path="instructor-reports" element={<InstructorReportsPage />} />
        <Route path="instructor-requests" element={<InstructorRequestsPage />} />
        <Route path="payouts" element={<PayoutsPage />} />
        <Route path="lock-accounts" element={<div className="p-6">Lock Accounts - Coming Soon</div>} />
        <Route path="unlock-accounts" element={<div className="p-6">Unlock Accounts - Coming Soon</div>} />
        <Route path="settings" element={<div className="p-6">Settings - Coming Soon</div>} />
      </Route>
      
      {/* Instructor Routes */}
      <Route 
        path="/instructor" 
        element={
          <ProtectedRoute allowedRoles={[2, 1]}>
            <InstructorDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/instructor/courses/:id" 
        element={
          <ProtectedRoute allowedRoles={[2, 1]}>
            <CourseManagement />
          </ProtectedRoute>
        } 
      />
      
      {/* Legacy learner routes redirect to new routes */}
      <Route path="/my/attempts" element={<Navigate to="/exam-history" replace />} />
      <Route path="/my/progress" element={<Navigate to="/progress" replace />} />
      <Route path="/my-learning" element={<Navigate to="/progress" replace />} />
      
      {/* Calendar & Search (to be implemented) */}
      <Route 
        path="/calendar" 
        element={
          <ProtectedRoute>
            <div className="p-8 text-center">Lịch học - Đang phát triển</div>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/search" 
        element={
          <ProtectedRoute>
            <div className="p-8 text-center">Tìm kiếm - Đang phát triển</div>
          </ProtectedRoute>
        } 
      />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
};

export default AppRouter;