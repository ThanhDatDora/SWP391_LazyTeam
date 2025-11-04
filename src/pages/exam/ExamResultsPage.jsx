import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Award, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  TrendingUp,
  Target,
  Calendar
} from 'lucide-react';

const ExamResultsPage = () => {
  const { instanceId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResults();
  }, [instanceId]);

  const fetchResults = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/exams/instances/${instanceId}/results`);
      
      if (!response.ok) {
        throw new Error('Không thể tải kết quả thi');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyText = (difficulty) => {
    switch(difficulty) {
      case 'easy': return 'Dễ';
      case 'medium': return 'Trung bình';
      case 'hard': return 'Khó';
      default: return difficulty;
    }
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-100' };
    if (percentage >= 85) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100' };
    if (percentage >= 80) return { grade: 'B+', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (percentage >= 75) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (percentage >= 70) return { grade: 'C+', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (percentage >= 65) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (percentage >= 60) return { grade: 'D+', color: 'text-orange-600', bg: 'bg-orange-100' };
    if (percentage >= 50) return { grade: 'D', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { grade: 'F', color: 'text-red-600', bg: 'bg-red-100' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải kết quả...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Lỗi</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  const gradeInfo = getGrade(results.percentage);
  const passed = results.percentage >= 60; // Assuming 60% is passing grade
  const timeSpent = results.instance.duration_minutes * 60 - results.instance.time_remaining_sec;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Quay lại
          </button>
        </div>

        {/* Results Summary Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className={`p-8 ${passed ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-pink-500'} text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{results.exam.name}</h1>
                <p className="text-white/90">
                  {passed ? '🎉 Chúc mừng! Bạn đã vượt qua bài thi' : '😔 Bạn chưa đạt điểm tối thiểu'}
                </p>
              </div>
              <div className="text-right">
                <div className={`inline-block px-6 py-3 rounded-xl ${gradeInfo.bg} ${gradeInfo.color} text-4xl font-bold`}>
                  {gradeInfo.grade}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Score Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Điểm số</p>
                <p className="text-2xl font-bold text-gray-900">
                  {results.score}/{results.maxScore}
                </p>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Phần trăm</p>
                <p className="text-2xl font-bold text-gray-900">{results.percentage}%</p>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Số câu đúng</p>
                <p className="text-2xl font-bold text-gray-900">
                  {results.correctCount}/{results.questions.length}
                </p>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Thời gian làm bài</p>
                <p className="text-2xl font-bold text-gray-900">{formatTime(timeSpent)}</p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg mb-8">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Thời gian nộp bài</p>
                  <p className="font-medium text-gray-900">{formatDate(results.instance.submitted_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Lần thi</p>
                  <p className="font-medium text-gray-900">
                    Lần {results.instance.attempt_number}/{results.exam.attempts_allowed}
                  </p>
                </div>
              </div>
            </div>

            {/* Retry Info */}
            {!passed && results.instance.attempt_number < results.exam.attempts_allowed && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
                <p className="text-yellow-800">
                  💡 <strong>Bạn còn {results.exam.attempts_allowed - results.instance.attempt_number} lần thi.</strong> Hãy xem lại các câu sai và thử lại nhé!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Results */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-blue-600" />
            Chi tiết đáp án
          </h2>

          <div className="space-y-6">
            {results.questions.map((question, index) => {
              const isCorrect = question.is_correct;
              const userAnswers = question.user_answers || [];
              
              return (
                <div 
                  key={question.question_id}
                  className={`border-2 rounded-lg p-6 ${
                    isCorrect 
                      ? 'border-green-200 bg-green-50/30' 
                      : 'border-red-200 bg-red-50/30'
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(question.difficulty)}`}>
                          {getDifficultyText(question.difficulty)}
                        </span>
                        {isCorrect ? (
                          <span className="text-green-600 flex items-center gap-1 text-sm font-medium">
                            <CheckCircle className="h-4 w-4" />
                            Đúng (+{question.points} điểm)
                          </span>
                        ) : (
                          <span className="text-red-600 flex items-center gap-1 text-sm font-medium">
                            <XCircle className="h-4 w-4" />
                            Sai (0 điểm)
                          </span>
                        )}
                      </div>
                      <p className="text-gray-900 font-medium text-lg">{question.stem}</p>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-3 ml-11">
                    {question.options.map((option) => {
                      const isUserAnswer = userAnswers.includes(option.option_id);
                      const isCorrectOption = option.is_correct;
                      
                      let optionClass = 'border-gray-200 bg-white';
                      let iconColor = 'text-gray-400';
                      let icon = null;

                      if (isCorrectOption) {
                        optionClass = 'border-green-500 bg-green-50';
                        iconColor = 'text-green-600';
                        icon = <CheckCircle className="h-5 w-5" />;
                      } else if (isUserAnswer && !isCorrectOption) {
                        optionClass = 'border-red-500 bg-red-50';
                        iconColor = 'text-red-600';
                        icon = <XCircle className="h-5 w-5" />;
                      }

                      return (
                        <div
                          key={option.option_id}
                          className={`border-2 rounded-lg p-4 flex items-center gap-3 ${optionClass}`}
                        >
                          <div className={iconColor}>
                            {icon || <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>}
                          </div>
                          <span className={`flex-1 ${
                            isCorrectOption ? 'font-semibold text-green-900' :
                            isUserAnswer ? 'font-medium text-red-900' :
                            'text-gray-700'
                          }`}>
                            {option.option_text}
                          </span>
                          {isCorrectOption && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                              Đáp án đúng
                            </span>
                          )}
                          {isUserAnswer && !isCorrectOption && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium">
                              Bạn đã chọn
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation (if available) */}
                  {question.explanation && (
                    <div className="mt-4 ml-11 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-semibold text-blue-900 mb-1">💡 Giải thích:</p>
                      <p className="text-sm text-blue-800">{question.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Quay lại khóa học
          </button>
          {!passed && results.instance.attempt_number < results.exam.attempts_allowed && (
            <button
              onClick={() => navigate(`/exam/${results.exam.exam_id}`)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Thi lại
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamResultsPage;
