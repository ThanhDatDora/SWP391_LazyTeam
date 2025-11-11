import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ExamSession from '../../components/exam/ExamSession';
import { LoadingSpinner } from '../../components/ui/loading';
import { newExamAPI, courseAPI } from '../../services/api';

const ExamStandalonePage = () => {
  const { courseId, examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exam, setExam] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [examStarted, setExamStarted] = useState(false);
  const [examQuestions, setExamQuestions] = useState([]);
  const [attemptId, setAttemptId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch exam and course data
  useEffect(() => {
    const fetchExamData = async () => {
      try {
        setLoading(true);
        
        console.log('🔍 Fetching course data for courseId:', courseId);
        
        // Fetch course details using courseAPI
        const courseResponse = await courseAPI.getCourseById(courseId);
        
        console.log('📋 Direct course response:', courseResponse);
        console.log('📋 Response success:', courseResponse.success);
        console.log('📋 Response course:', courseResponse.course);
        
        if (!courseResponse.success || !courseResponse.course) {
          console.error('❌ Invalid course response:', courseResponse);
          throw new Error(courseResponse.error || 'Không thể tải thông tin khóa học');
        }
        
        const courseData = courseResponse.course;
        console.log('✅ Course data loaded:', courseData);
        setCourse(courseData);

        // Find the mooc that matches the examId (examId = mooc_id)
        let examMooc = null;
        if (courseData.curriculum) {
          examMooc = courseData.curriculum.find(mooc => mooc.id === examId);
        }

        console.log('🔍 Looking for mooc with id:', examId);
        console.log('📚 Found mooc:', examMooc);

        if (!examMooc) {
          throw new Error('Không tìm thấy bài thi trong khóa học này');
        }

        console.log('🎯 Fetching exam data for examId:', examId);
        
        // Fetch exam details using the mooc_id (examId)
        const examResponse = await newExamAPI.getExamByMooc(examId);
        
        console.log('📝 Exam response:', examResponse);
        
        if (examResponse.success && examResponse.data) {
          setExam(examResponse.data);
          console.log('✅ Exam data loaded successfully');
        } else {
          throw new Error(examResponse.error || 'Không thể tải thông tin bài thi');
        }
        
      } catch (err) {
        console.error('Error fetching exam data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (examId && courseId) {
      fetchExamData();
    }
  }, [examId, courseId]);

  // Return to course learning page
  const handleBackToCourse = () => {
    navigate(`/learn/${courseId}`);
  };

  // Start exam and fetch questions
  const handleStartExam = async () => {
    try {
      setLoading(true);
      const response = await newExamAPI.startExam(examId);
      
      if (response.success && response.data) {
        let questions = response.data.questions || [];
        
        // Add mock options if questions don't have proper options
        questions = questions.map(q => {
          if (!q.options || q.options.length === 0 || (typeof q.options === 'string' && q.options.trim().length < 10)) {
            console.warn('Question missing options, adding mock options:', q.question_id);
            return {
              ...q,
              options: [
                { option_id: `${q.question_id}_a`, label: 'A', content: 'Option A (Mock)' },
                { option_id: `${q.question_id}_b`, label: 'B', content: 'Option B (Mock)' },
                { option_id: `${q.question_id}_c`, label: 'C', content: 'Option C (Mock)' },
                { option_id: `${q.question_id}_d`, label: 'D', content: 'Option D (Mock)' }
              ]
            };
          }
          return q;
        });
        
        console.log('✅ Processed questions with options:', questions.length);
        console.log('📝 Sample question:', questions[0]);
        
        setExamQuestions(questions);
        setAttemptId(response.data.attempt_id);
        setExamStarted(true);
      } else {
        setError(response.error || 'Không thể bắt đầu bài thi');
      }
    } catch (error) {
      console.error('Error starting exam:', error);
      setError('Không thể bắt đầu bài thi');
    } finally {
      setLoading(false);
    }
  };

  // Handle exam completion
  const handleExamComplete = async (answers) => {
    try {
      setSubmitting(true);
      console.log('📤 Submitting exam:', {
        examId,
        attemptId,
        answers,
        answersCount: answers?.length || 0
      });
      
      // Submit exam to get score and results
      const response = await newExamAPI.submitExam(examId, attemptId, answers);
      
      console.log('📋 Submit exam response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Submit successful:', response.data);
        
        // Navigate to results page with exam results (use replace to prevent back)
        navigate(`/learn/${courseId}/exam/${examId}/results`, {
          state: {
            examResult: response.data,
            examId: examId,
            courseId: courseId
          },
          replace: true
        });
      } else {
        console.error('❌ Submit failed:', response.error || response);
        alert(`Lỗi submit bài thi: ${response.error || 'Không xác định'}`);
        // Still redirect but with error
        navigate(`/learn/${courseId}`, { 
          state: { 
            examCompleted: true, 
            examError: response.error || 'Không thể submit bài thi',
            examId: examId
          },
          replace: true
        });
      }
    } catch (error) {
      console.error('❌ Failed to submit exam:', error);
      alert(`Lỗi submit bài thi: ${error.message || 'Không xác định'}`);
      // Redirect with error
      navigate(`/learn/${courseId}`, { 
        state: { 
          examCompleted: true, 
          examError: error.message || 'Không thể submit bài thi',
          examId: examId
        },
        replace: true
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Lỗi tải bài thi</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleBackToCourse}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại khóa học
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Bài thi không tồn tại</h2>
            <button
              onClick={handleBackToCourse}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại khóa học
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If exam has started and questions are loaded, show full exam session
  if (examStarted && examQuestions.length > 0 && attemptId) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Minimal header for exam */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackToCourse}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  <span className="hidden sm:inline">Quay lại khóa học</span>
                </button>
                <div className="h-6 w-px bg-gray-300"></div>
                <h1 className="text-lg font-semibold text-gray-900 truncate">
                  {exam.title}
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm text-gray-600">
                  <User className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">{user?.name || 'Student'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full exam session */}
        <div className="max-w-7xl mx-auto">
          <ExamSession 
            examId={exam.exam_id}
            attemptId={attemptId}
            questions={examQuestions}
            duration_minutes={exam.duration_minutes}
            onSubmit={handleExamComplete}
            onAutoSubmit={handleExamComplete}
            submitting={submitting}
            standalone={true}
          />
        </div>
      </div>
    );
  }

  // Show loading when starting exam
  if (examStarted && loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Đang chuẩn bị bài thi...</p>
        </div>
      </div>
    );
  }

  // Exam introduction/start page
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={handleBackToCourse}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Quay lại khóa học
            </button>
            <div className="flex items-center space-x-4">
              {course && (
                <div className="flex items-center text-sm text-gray-600">
                  <BookOpen className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">{course.title}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Exam intro content */}
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Exam header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{exam.title}</h1>
            {exam.description && (
              <p className="text-gray-600 text-lg">{exam.description}</p>
            )}
          </div>

          {/* Exam details */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Thông tin bài thi</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Số câu hỏi:</span>
                  <span className="font-medium">{exam.total_questions || 'N/A'} câu</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thời gian:</span>
                  <span className="font-medium">{exam.duration || 'N/A'} phút</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Điểm đạt:</span>
                  <span className="font-medium">{exam.passing_score || 'N/A'}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số lần thử:</span>
                  <span className="font-medium">
                    {exam.max_attempts ? `${exam.max_attempts} lần` : 'Không giới hạn'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Lưu ý quan trọng</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Đảm bảo kết nối internet ổn định trong suốt quá trình thi</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Không được thoát khỏi trang thi khi đã bắt đầu</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Thời gian sẽ được tính ngay khi bắt đầu bài thi</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Đọc kỹ từng câu hỏi trước khi chọn đáp án</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleBackToCourse}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Quay lại sau
            </button>
            <button
              onClick={handleStartExam}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Bắt đầu làm bài
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamStandalonePage;