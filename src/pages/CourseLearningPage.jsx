import { useState, useEffect } from 'react';
import { 
  ChevronRight, ChevronDown, CheckCircle, Circle, 
  ArrowLeft, BookOpen, FileText, Award, Menu, X,
  MessageSquare, HelpCircle, Video
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useNavigation } from '../hooks/useNavigation';
import { useAuth } from '../contexts/AuthContext';
import { useParams, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../hooks/useToast';

// Import content type components
import VideoLesson from '../components/learning/VideoLesson';
import ReadingLesson from '../components/learning/ReadingLesson';
import QuizLesson from '../components/learning/QuizLesson';
import DiscussionLesson from '../components/learning/DiscussionLesson';
import AssignmentLesson from '../components/learning/AssignmentLesson';

// Import exam components
import { ExamCard, ExamIntro, ExamSession, ExamResult, ExamReview } from '../components/exam';

const CourseLearningPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigation();
  const location = useLocation();
  const { state: authState } = useAuth();
  const { toast } = useToast();

  // State
  const [loading, setLoading] = useState(true);
  const [courseContent, setCourseContent] = useState(null);
  const [currentMoocIndex, setCurrentMoocIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMoocs, setExpandedMoocs] = useState([0]); // First MOOC expanded by default
  const [videoProgress, setVideoProgress] = useState(0); // For video lessons
  
  // Exam state
  const [examState, setExamState] = useState('none'); // 'none' | 'intro' | 'session' | 'result' | 'review'
  const [examData, setExamData] = useState(null);
  const [currentAttemptId, setCurrentAttemptId] = useState(null);
  const [examQuestions, setExamQuestions] = useState([]);
  const [examResult, setExamResult] = useState(null);
  const [examReview, setExamReview] = useState(null);
  const [examLoading, setExamLoading] = useState(false);
  const [examAttempts, setExamAttempts] = useState({}); // Store exam attempts by mooc_id

  useEffect(() => {
    loadCourseContent();
  }, [courseId]);

  // Reload exam attempts when returning from exam completion
  // Updated: 2025-11-11 16:15 - Fixed null check for response object
  useEffect(() => {
    if (location?.state?.examCompleted && courseContent?.moocs) {
      console.log('🔄 Exam completed, reloading attempts...');
      
      // Reload exam attempts
      loadExamAttempts(courseContent.moocs).then(() => {
        console.log('✅ Exam attempts reloaded successfully');
      }).catch((error) => {
        console.error('❌ Failed to reload exam attempts:', error);
      });
      
      // Show toast based on exam result (with null check)
      if (toast) {
        if (location?.state?.examError) {
          toast.error(location.state.examError);
        } else if (location?.state?.examPassed) {
          toast.success('🎉 Chúc mừng! Bạn đã vượt qua bài thi!');
        } else if (location?.state?.examPassed === false) {
          toast.info('Đã hoàn thành bài thi. Bạn có thể thử lại để cải thiện điểm.');
        } else {
          toast.success('Đã hoàn thành bài thi! Kiểm tra kết quả.');
        }
      }
      
      // Clear navigation state
      window.history.replaceState({}, document.title);
    }
  }, [location?.state, courseContent, toast]);

  const loadCourseContent = async () => {
    try {
      setLoading(true);
      const response = await api.enrollments.getCourseContent(courseId);
      
      if (response.success) {
        setCourseContent(response.data);
        
        // Load exam attempts for all MOOCs with exams
        await loadExamAttempts(response.data.moocs);
        
        // Find first incomplete lesson (SHOW ALL, even without content_url for debugging)
        let found = false;
        response.data.moocs.forEach((mooc, moocIdx) => {
          mooc.lessons.forEach((lesson, lessonIdx) => {
            if (!found && !lesson.completed) {
              setCurrentMoocIndex(moocIdx);
              setCurrentLessonIndex(lessonIdx);
              setExpandedMoocs([moocIdx]);
              found = true;
            }
          });
        });
        
        // If no incomplete lesson found, start from first lesson
        if (!found && response.data.moocs.length > 0 && response.data.moocs[0].lessons.length > 0) {
          setCurrentMoocIndex(0);
          setCurrentLessonIndex(0);
          setExpandedMoocs([0]);
        }
      }
    } catch (error) {
      console.error('Failed to load course content:', error);
      toast.error('Không thể tải nội dung khóa học');
    } finally {
      setLoading(false);
    }
  };

  const loadExamAttempts = async (moocs) => {
    try {
      const attemptsData = {};
      
      // Load attempts for each MOOC that has an exam
      for (const mooc of moocs) {
        if (mooc.mooc_id) { // Use mooc_id
          try {
            const response = await api.newExams.getExamByMooc(mooc.mooc_id);
            if (response && response.success && response.data) {
              const data = response.data;
              const hasAttempts = (data.previous_attempts || 0) > 0;
              const bestScore = data.best_score || 0;
              const passingScore = data.passing_score || 70;
              
              // Determine if passed based on best_score >= passing_score
              const passed = hasAttempts && bestScore >= passingScore;
              
              attemptsData[mooc.mooc_id] = {
                hasAttempts: hasAttempts,
                attemptCount: data.previous_attempts || 0,
                bestScore: bestScore,
                passed: passed,
                passingScore: passingScore
              };
              
              console.log(`📊 MOOC ${mooc.mooc_id} exam status:`, {
                attempts: data.previous_attempts,
                bestScore: bestScore,
                passingScore: passingScore,
                passed: passed
              });
            }
          } catch (error) {
            console.error(`Failed to load exam attempts for MOOC ${mooc.mooc_id}:`, error);
          }
        }
      }
      
      setExamAttempts(attemptsData);
    } catch (error) {
      console.error('Failed to load exam attempts:', error);
    }
  };

  const markLessonComplete = async () => {
    try {
      const currentLesson = getCurrentLesson();
      if (!currentLesson || currentLesson.completed) {
        console.log('⚠️ Cannot mark complete - Lesson already completed or not found');
        return;
      }

      console.log('🔄 Marking lesson complete:', {
        lessonId: currentLesson.lesson_id,
        title: currentLesson.title,
        videoProgress,
        durationMinutes: currentLesson.duration_minutes
      });

      const response = await api.enrollments.markLessonComplete(currentLesson.lesson_id, {
        lastPositionSec: Math.floor(videoProgress * (currentLesson.duration_minutes || 0) * 60)
      });

      console.log('✅ Mark complete response:', response);

      if (response && response.success) {
        // Update local state
        const updated = { ...courseContent };
        updated.moocs[currentMoocIndex].lessons[currentLessonIndex].completed = true;
        updated.moocs[currentMoocIndex].lessons[currentLessonIndex].completed_at = new Date().toISOString();
        setCourseContent(updated);

        console.log('✅ Local state updated, lesson marked as completed');

        toast.success('✅ Đã hoàn thành bài học!');

        // Auto move to next lesson
        try {
          moveToNextLesson();
        } catch (navError) {
          console.error('⚠️ Navigation error (non-critical):', navError);
        }
      } else {
        console.error('❌ API response not successful:', response);
        toast.error(response?.error || 'Không thể đánh dấu hoàn thành');
      }
    } catch (error) {
      console.error('❌ Failed to mark lesson complete:', error);
      toast.error(error?.message || 'Không thể đánh dấu hoàn thành');
    }
  };

  const getCurrentLesson = () => {
    if (!courseContent) return null;
    return courseContent.moocs[currentMoocIndex]?.lessons[currentLessonIndex];
  };

  const getCurrentMooc = () => {
    if (!courseContent) return null;
    return courseContent.moocs[currentMoocIndex];
  };

  const moveToNextLesson = () => {
    if (!courseContent || !courseContent.moocs[currentMoocIndex]) return;
    
    const currentMooc = courseContent.moocs[currentMoocIndex];

    // Simple navigation - no skipping for debugging
    let nextMoocIdx = currentMoocIndex;
    let nextLessonIdx = currentLessonIndex + 1;

    // If next lesson exists in current MOOC, go to it
    if (nextLessonIdx < currentMooc.lessons.length) {
      setCurrentMoocIndex(nextMoocIdx);
      setCurrentLessonIndex(nextLessonIdx);
    } 
    // Otherwise try next MOOC
    else if (currentMoocIndex + 1 < courseContent.moocs.length) {
      nextMoocIdx = currentMoocIndex + 1;
      nextLessonIdx = 0;
      setCurrentMoocIndex(nextMoocIdx);
      setCurrentLessonIndex(nextLessonIdx);
      setExpandedMoocs([...expandedMoocs, nextMoocIdx]);
    }
    else {
      toast.success('🎉 Chúc mừng! Bạn đã hoàn thành tất cả bài học!');
    }
    
    setVideoProgress(0);
  };

  const moveToPreviousLesson = () => {
    // Simple navigation - no skipping for debugging
    let prevMoocIdx = currentMoocIndex;
    let prevLessonIdx = currentLessonIndex - 1;

    // If previous lesson exists in current MOOC, go to it
    if (prevLessonIdx >= 0) {
      setCurrentMoocIndex(prevMoocIdx);
      setCurrentLessonIndex(prevLessonIdx);
    }
    // Otherwise try previous MOOC
    else if (currentMoocIndex > 0) {
      prevMoocIdx = currentMoocIndex - 1;
      const prevMooc = courseContent.moocs[prevMoocIdx];
      prevLessonIdx = prevMooc.lessons.length - 1;
      setCurrentMoocIndex(prevMoocIdx);
      setCurrentLessonIndex(prevLessonIdx);
    }
    
    setVideoProgress(0);
  };

  const selectLesson = (moocIndex, lessonIndex) => {
    setCurrentMoocIndex(moocIndex);
    setCurrentLessonIndex(lessonIndex);
    setVideoProgress(0);
  };

  const toggleMoocExpand = (moocIndex) => {
    if (expandedMoocs.includes(moocIndex)) {
      setExpandedMoocs(expandedMoocs.filter(idx => idx !== moocIndex));
    } else {
      setExpandedMoocs([...expandedMoocs, moocIndex]);
    }
  };

  const calculateProgress = () => {
    if (!courseContent) return 0;
    const totalLessons = courseContent.moocs.reduce((sum, mooc) => sum + mooc.lessons.length, 0);
    const completedLessons = courseContent.moocs.reduce((sum, mooc) => 
      sum + mooc.lessons.filter(l => l.completed).length, 0
    );
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  };

  // Exam handlers
  const handleExamStart = async (moocId) => {
    try {
      setExamLoading(true);
      console.log('🎓 Starting exam for MOOC:', moocId);
      
      const response = await api.newExams.getExamByMooc(moocId);
      console.log('📋 Exam info response:', response);
      
      if (response.success && response.data) {
        // Navigate to standalone exam page directly
        navigate(`/learn/${courseId}/exam/${response.data.exam_id}`);
      } else {
        toast.error(response.error || 'Không thể tải thông tin bài thi');
      }
    } catch (error) {
      console.error('❌ Failed to start exam:', error);
      toast.error('Không thể tải bài thi');
    } finally {
      setExamLoading(false);
    }
  };

  const handleStartExamSession = async () => {
    // Navigate to standalone exam page instead of modal
    navigate(`/learn/${courseId}/exam/${examData.exam_id}`);
  };

  const handleExamSubmit = async (answers) => {
    try {
      setExamLoading(true);
      console.log('📤 Submitting exam:', {
        exam_id: examData.exam_id,
        attempt_id: currentAttemptId,
        answers_count: answers.length
      });
      
      const response = await api.newExams.submitExam(
        examData.exam_id,
        currentAttemptId,
        answers
      );
      console.log('✅ Submit response:', response);
      
      if (response.success && response.data) {
        setExamResult(response.data);
        setExamState('result');
        
        // Reload course content to update progress
        await loadCourseContent();
        
        if (response.data.passed) {
          toast.success('🎉 Chúc mừng! Bạn đã đạt yêu cầu!');
        } else {
          toast.error('Chưa đạt yêu cầu. Hãy thử lại!');
        }
      } else {
        toast.error(response.error || 'Không thể nộp bài');
      }
    } catch (error) {
      console.error('❌ Failed to submit exam:', error);
      toast.error('Không thể nộp bài thi');
    } finally {
      setExamLoading(false);
    }
  };

  const handleReviewAnswers = async () => {
    try {
      setExamLoading(true);
      console.log('👀 Loading exam review for attempt:', currentAttemptId);
      
      const response = await api.newExams.getExamResult(currentAttemptId);
      console.log('📊 Review data response:', response);
      
      if (response.success && response.data) {
        setExamReview(response.data);
        setExamState('review');
      } else {
        toast.error(response.error || 'Không thể tải kết quả chi tiết');
      }
    } catch (error) {
      console.error('❌ Failed to load review:', error);
      toast.error('Không thể tải đánh giá bài thi');
    } finally {
      setExamLoading(false);
    }
  };

  const handleCloseExam = () => {
    setExamState('none');
    setExamData(null);
    setCurrentAttemptId(null);
    setExamQuestions([]);
    setExamResult(null);
    setExamReview(null);
  };

  const handleRetakeExam = () => {
    setExamState('intro');
    setExamResult(null);
    setExamReview(null);
  };

  const handleContinueLearning = () => {
    handleCloseExam();
    toast.success('Tiếp tục học tập!');
  };

  // Content Type Router - render different components based on lesson type
  const renderLessonContent = () => {
    const lesson = getCurrentLesson();
    if (!lesson) return null;

    console.log('🎓 Rendering lesson:', {
      lesson_id: lesson.lesson_id,
      title: lesson.title,
      content_type: lesson.content_type,
      has_content_url: !!lesson.content_url,
      content_url: lesson.content_url
    });

    const contentType = lesson.content_type || 'video';

    switch (contentType) {
      case 'video':
        return (
          <VideoLesson
            lesson={lesson}
            onComplete={markLessonComplete}
            onProgressUpdate={(progress) => setVideoProgress(progress)}
          />
        );

      case 'reading':
      case 'text':
        return (
          <ReadingLesson
            lesson={lesson}
            onComplete={markLessonComplete}
          />
        );

      case 'quiz':
        return (
          <QuizLesson
            lesson={lesson}
            onComplete={markLessonComplete}
          />
        );

      case 'discussion':
        return (
          <DiscussionLesson
            lesson={lesson}
            onComplete={markLessonComplete}
          />
        );

      case 'assignment':
      case 'homework':
        return (
          <AssignmentLesson
            lesson={lesson}
            onComplete={markLessonComplete}
          />
        );

      default:
        return (
          <div className="h-full flex items-center justify-center bg-gray-100">
            <div className="text-center p-8">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Loại nội dung không được hỗ trợ
              </h3>
              <p className="text-gray-500">
                Content type: <code className="bg-gray-200 px-2 py-1 rounded">{contentType}</code>
              </p>
            </div>
          </div>
        );
    }
  };

  // Helper to get icon for content type
  const getContentTypeIcon = (contentType) => {
    switch (contentType) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'reading':
      case 'text':
        return <BookOpen className="h-4 w-4" />;
      case 'quiz':
        return <HelpCircle className="h-4 w-4" />;
      case 'discussion':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-white">Đang tải khóa học...</p>
        </div>
      </div>
    );
  }

  if (!courseContent) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Không thể tải khóa học</p>
          <Button onClick={() => navigate('/progress')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  // Check if course has no lessons
  const totalLessons = courseContent.moocs.reduce((sum, m) => sum + m.lessons.length, 0);
  if (totalLessons === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <BookOpen className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Khóa học đang cập nhật</h2>
          <p className="text-gray-400 mb-6">
            Nội dung bài học cho khóa học này đang được chuẩn bị. 
            Vui lòng quay lại sau hoặc chọn khóa học khác.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate('/progress')} variant="outline" className="bg-gray-800 text-white hover:bg-gray-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
            <Button onClick={() => navigate('/courses')} className="bg-teal-600 hover:bg-teal-700">
              Xem khóa học khác
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentLesson = getCurrentLesson();
  const currentMooc = getCurrentMooc();
  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/progress')}
            className="text-gray-300 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="hidden md:block">
            <h1 className="text-white font-semibold text-lg line-clamp-1">
              {currentMooc?.title || 'Loading...'}
            </h1>
            <p className="text-gray-400 text-sm">
              Bài {currentLessonIndex + 1} / {currentMooc?.lessons.length || 0}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress indicator */}
          <div className="hidden md:flex items-center gap-2 bg-gray-700 px-3 py-1.5 rounded-lg">
            <div className="w-32 bg-gray-600 rounded-full h-2">
              <div 
                className="bg-teal-500 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-white text-sm font-medium">{progress}%</span>
          </div>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-gray-300"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area - Content Type Router */}
        <div className={`flex-1 flex flex-col ${sidebarOpen ? 'lg:mr-96' : ''}`}>
          {currentLesson && renderLessonContent()}
        </div>

        {/* Sidebar - Course Curriculum */}
        <aside 
          className={`
            ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
            fixed lg:fixed right-0 top-[57px] bottom-0 w-96 bg-white border-l border-gray-200 
            transition-transform duration-300 ease-in-out z-40 overflow-y-auto
          `}
        >
          <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
            <h3 className="font-semibold text-lg text-gray-900">Nội dung khóa học</h3>
            <p className="text-sm text-gray-600 mt-1">
              {courseContent.moocs.reduce((sum, m) => sum + m.lessons.filter(l => l.completed).length, 0)} / {courseContent.moocs.reduce((sum, m) => sum + m.lessons.length, 0)} bài học
            </p>
          </div>

          <div className="p-2">
            {courseContent.moocs.map((mooc, moocIdx) => (
              <div key={mooc.mooc_id} className="mb-2">
                {/* MOOC Header */}
                <button
                  onClick={() => toggleMoocExpand(moocIdx)}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 text-left">
                    <div className="flex-shrink-0">
                      {expandedMoocs.includes(moocIdx) ? (
                        <ChevronDown className="h-5 w-5 text-gray-600" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">
                        Week {moocIdx + 1}
                      </p>
                      <p className="text-xs text-gray-700 truncate font-medium">{mooc.title}</p>
                    </div>
                    <Badge variant="outline" className="flex-shrink-0 text-xs">
                      {mooc.lessons.filter(l => l.completed).length}/{mooc.lessons.length}
                    </Badge>
                  </div>
                </button>

                {/* Lessons List */}
                {expandedMoocs.includes(moocIdx) && (
                  <div className="ml-4 mt-1 space-y-1">
                    {mooc.lessons.map((lesson, lessonIdx) => {
                      const hasContent = !!lesson.content_url;
                      const isCurrentLesson = moocIdx === currentMoocIndex && lessonIdx === currentLessonIndex;
                      
                      return (
                        <button
                          key={lesson.lesson_id}
                          onClick={() => selectLesson(moocIdx, lessonIdx)}
                          className={`
                            w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors
                            ${isCurrentLesson
                              ? 'bg-teal-50 border-2 border-teal-500'
                              : 'hover:bg-gray-50 border-2 border-transparent'
                            }
                          `}
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {lesson.completed ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <Circle className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${
                              isCurrentLesson ? 'text-teal-900' : 'text-gray-900'
                            }`}>
                              {lessonIdx + 1}. {lesson.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-600 flex items-center gap-1">
                                {getContentTypeIcon(lesson.content_type)}
                                <span className="capitalize">{lesson.content_type || 'video'}</span>
                              </span>
                              {!hasContent && (
                                <span className="text-xs text-orange-500 bg-orange-50 px-2 py-0.5 rounded">
                                  Debug: N/A
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}

                    {/* Quiz item */}
                    {mooc.quiz && (
                      <button
                        onClick={() => navigate(`/quiz/${mooc.quiz.quiz_id}`)}
                        className="w-full flex items-start gap-3 p-3 rounded-lg text-left hover:bg-purple-50 border-2 border-transparent transition-colors"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {mooc.quiz.passed ? (
                            <Award className="h-5 w-5 text-purple-600" />
                          ) : (
                            <FileText className="h-5 w-5 text-purple-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            Quiz: {mooc.quiz.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {mooc.quiz.passed 
                              ? `✅ Đã đạt ${mooc.quiz.best_score}%` 
                              : `Điểm đạt: ${mooc.quiz.passing_score}%`
                            }
                          </p>
                        </div>
                      </button>
                    )}

                    {/* Exam Card - NEW */}
                    <ExamCard
                      moocId={mooc.mooc_id}
                      moocTitle={mooc.title}
                      canTakeExam={mooc.lessons.every(l => l.completed)}
                      lessonsCompleted={mooc.lessons.filter(l => l.completed).length}
                      totalLessons={mooc.lessons.length}
                      previousAttempts={examAttempts[mooc.mooc_id]?.attemptCount || 0}
                      bestScore={examAttempts[mooc.mooc_id]?.bestScore || 0}
                      passed={examAttempts[mooc.mooc_id]?.passed || false}
                      passingScore={examAttempts[mooc.mooc_id]?.passingScore || 70}
                      onStartExam={() => handleExamStart(mooc.mooc_id)}
                      loading={examLoading}
                    />
                  </div>
                )}
              </div>
            ))}

            {/* Final Exam */}
            {courseContent.exams && courseContent.exams.length > 0 && (
              <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border-2 border-orange-200">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Award className="h-5 w-5 text-orange-600" />
                  Bài thi cuối khóa
                </h4>
                {courseContent.exams.map(exam => (
                  <div key={exam.exam_id} className="text-sm">
                    <p className="text-gray-900 font-medium">{exam.exam_title}</p>
                    <p className="text-gray-600 text-xs mt-1">{exam.exam_description}</p>
                    <Button
                      onClick={() => navigate(`/exam/${exam.exam_id}`)}
                      size="sm"
                      className="mt-3 w-full bg-orange-600 hover:bg-orange-700"
                    >
                      {exam.passed ? 'Xem kết quả' : 'Bắt đầu thi'}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Exam Modals */}
      {examState === 'intro' && examData && (
        <ExamIntro
          examData={examData}
          onStart={handleStartExamSession}
          onClose={handleCloseExam}
          loading={examLoading}
        />
      )}

      {examState === 'session' && examQuestions.length > 0 && (
        <ExamSession
          examId={examData.exam_id}
          attemptId={currentAttemptId}
          questions={examQuestions}
          duration_minutes={examData.duration_minutes}
          onSubmit={handleExamSubmit}
          onAutoSubmit={handleExamSubmit}
          submitting={examLoading}
        />
      )}

      {examState === 'result' && examResult && (
        <ExamResult
          result={examResult}
          onReviewAnswers={handleReviewAnswers}
          onRetake={handleRetakeExam}
          onContinue={handleContinueLearning}
          loading={examLoading}
        />
      )}

      {examState === 'review' && examReview && (
        <ExamReview
          reviewData={examReview}
          onClose={handleCloseExam}
          loading={examLoading}
        />
      )}
    </div>
  );
};

export default CourseLearningPage;

// Force rebuild: 16:21:55
