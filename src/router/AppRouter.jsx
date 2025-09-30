import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Auth Pages
import AuthPage from '@/pages/auth/AuthPage';

// Main Pages  
import HomePage from '@/pages/HomePage';
import CoursePage from '@/pages/course/CoursePage';
import CatalogPage from '@/pages/CatalogPage';
import ExamPage from '@/pages/exam/ExamPage';
import ExamHistoryPage from '@/pages/exam/ExamHistoryPage';
import ProgressPage from '@/pages/ProgressPage';

// Guest Pages
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';

// Admin Pages
import AdminPanel from '@/pages/admin/AdminPanel';

// Instructor Pages
import InstructorDashboard from '@/pages/instructor/InstructorDashboard';
import CourseManagement from '@/pages/instructor/CourseManagement';

// Legacy Pages (keeping for compatibility)
import Landing from '@/pages/Landing';
import Catalog from '@/pages/Catalog';
import BlogList from '@/pages/BlogList';
import BlogDetail from '@/pages/BlogDetail';
import Pricing from '@/pages/Pricing';
import Checkout from '@/pages/Checkout';
import Exam from '@/pages/Exam';

// Course Components
import CourseDetail from '@/components/course/CourseDetail';
import EnhancedCourseDetail from '@/components/course/EnhancedCourseDetail';
import CoursePlayer from '@/components/course/CoursePlayer';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { state, isAuthenticated, hasRole } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.some(role => hasRole(role))) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Wrapper components to handle URL parameters
const CourseDetailPage = () => {
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

const AppRouter = () => {
  const { isAuthenticated } = useAuth();

  return (
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
        path="/login" 
        element={<Navigate to="/auth" replace />} 
      />
      <Route 
        path="/register" 
        element={<Navigate to="/auth" replace />} 
      />

      {/* Home Route - Landing for guests, HomePage for authenticated users */}
      <Route 
        path="/" 
        element={
          isAuthenticated() ? <HomePage /> : <Landing />
        } 
      />
      <Route 
        path="/catalog" 
        element={
          isAuthenticated() ? (
            <ProtectedRoute>
              <CatalogPage />
            </ProtectedRoute>
          ) : (
            <Navigate to="/auth" replace />
          )
        } 
      />
      <Route 
        path="/course/:id" 
        element={
          isAuthenticated() ? (
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
      <Route path="/course/:courseId/detail" element={<CourseDetailPage />} />
      <Route path="/player/:moocId" element={<PlayerPage />} />
      <Route path="/legacy-exam/:moocId" element={<LegacyExamPage />} />
      
      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminPanel />
          </ProtectedRoute>
        } 
      />
      
      {/* Instructor Routes */}
      <Route 
        path="/instructor" 
        element={
          <ProtectedRoute allowedRoles={['instructor', 'admin']}>
            <InstructorDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/instructor/courses/:id" 
        element={
          <ProtectedRoute allowedRoles={['instructor', 'admin']}>
            <CourseManagement />
          </ProtectedRoute>
        } 
      />
      
      {/* Legacy learner routes redirect to new routes */}
      <Route path="/my/attempts" element={<Navigate to="/exam-history" replace />} />
      <Route path="/my/progress" element={<Navigate to="/progress" replace />} />
      
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
  );
};

export default AppRouter;