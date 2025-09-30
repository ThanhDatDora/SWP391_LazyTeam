import { useNavigate } from 'react-router-dom';

/**
 * Custom navigation hook that provides a consistent way to navigate
 * Replaces direct window.location.href usage
 */
export const useNavigation = () => {
  const navigate = useNavigate();

  return {
    // Navigation methods
    to: (path) => navigate(path),
    replace: (path) => navigate(path, { replace: true }),
    back: () => navigate(-1),
    forward: () => navigate(1),

    // Common navigation shortcuts
    goHome: () => navigate('/'),
    goAuth: () => navigate('/auth'),
    goCatalog: () => navigate('/catalog'),
    goProgress: () => navigate('/progress'),
    goAdmin: () => navigate('/admin'),
    goInstructor: () => navigate('/instructor'),
    
    // Course related
    goCourse: (courseId) => navigate(`/course/${courseId}`),
    goExam: (examId) => navigate(`/exam/${examId}`),
    goExamHistory: () => navigate('/exam-history'),
    
    // External navigation (when needed)
    external: (url) => {
      window.location.href = url;
    }
  };
};