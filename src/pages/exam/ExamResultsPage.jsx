import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { ProgressBar } from '../../components/ui/progress';
import { Award, Clock, CheckCircle, XCircle, ArrowLeft, FileText, Target, RotateCcw } from 'lucide-react';

const ExamResultsPage = () => {
  const { courseId, examId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useAuth();
  const [examResult, setExamResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeResults = async () => {
      try {
        setLoading(true);
        
        // Get exam result from navigation state (passed from ExamStandalonePage)
        const resultData = location.state?.examResult;
        
        if (resultData) {
          // Process the exam result data from API response
          const totalQuestions = resultData.total_questions || resultData.totalQuestions || 0;
          const correctAnswers = resultData.correct_answers || resultData.correctAnswers || 0;
          const scorePercentage = resultData.score || 0; // Backend returns score as percentage (0-100)
          const calculatedPercentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
          
          // Use score from backend (which is already percentage), or calculate from correct/total
          const finalPercentage = scorePercentage > 0 ? Math.round(scorePercentage) : calculatedPercentage;
          
          const processedResult = {
            id: examId,
            courseId: courseId,
            examTitle: resultData.examTitle || 'Bài thi',
            courseName: resultData.courseName || 'Khóa học',
            score: scorePercentage,
            maxScore: 100,
            percentage: finalPercentage,
            grade: getGradeFromPercentage(finalPercentage),
            passThreshold: resultData.passThreshold || 70,
            isPassed: resultData.passed || resultData.isPassed || false,
            completedAt: resultData.completedAt || resultData.submitted_at || new Date().toISOString(),
            startedAt: resultData.startedAt || resultData.started_at,
            duration: resultData.duration || 'Không giới hạn',
            timeSpent: resultData.timeSpent || calculateTimeSpent(resultData.started_at, resultData.submitted_at),
            totalQuestions: totalQuestions,
            correctAnswers: correctAnswers,
            incorrectAnswers: totalQuestions - correctAnswers,
            answers: resultData.answers || {}
          };
          
          console.log('📊 Processed exam result:', processedResult);
          setExamResult(processedResult);
        } else {
          // No result data in navigation state - this shouldn't happen normally
          console.error('No exam result data found in navigation state');
          setExamResult(null);
        }
      } catch (error) {
        console.error('Error processing exam result:', error);
        setExamResult(null);
      } finally {
        setLoading(false);
      }
    };

    initializeResults();
  }, [courseId, examId, location.state]);

  const getGradeFromPercentage = (percentage) => {
    if (percentage >= 95) return 'A+';
    if (percentage >= 90) return 'A';
    if (percentage >= 85) return 'B+';
    if (percentage >= 80) return 'B';
    if (percentage >= 75) return 'C+';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const calculateTimeSpent = (startTime, endTime) => {
    if (!startTime || !endTime) return 'Không xác định';
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMinutes = Math.round((end - start) / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (hours > 0) {
      return `${hours} giờ ${minutes} phút`;
    }
    return `${minutes} phút`;
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeBadgeVariant = (grade) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'B+':
      case 'B':
        return 'bg-blue-100 text-blue-800';
      case 'C+':
      case 'C':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (!examResult) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không tìm thấy kết quả thi
            </h3>
            <p className="text-gray-600 mb-4">
              Kết quả thi không tồn tại hoặc chưa được tải.
            </p>
            <Button onClick={() => navigate(`/learn/${courseId}`, {
              state: { examCompleted: true, examId: examId }
            })}>
              Quay lại khóa học
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleRetakeExam = () => {
    // Navigate back to exam page for retake
    navigate(`/learn/${courseId}/exam/${examId}`, { 
      state: { retake: true } 
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button 
          variant="outline" 
          size="sm" 
          className="mb-4 flex items-center gap-2"
          onClick={() => navigate(`/learn/${courseId}`, {
            state: { 
              examCompleted: true,
              examId: examId,
              examPassed: examResult?.isPassed
            }
          })}
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại khóa học
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kết quả bài thi</h1>
        <p className="text-gray-600">{examResult.examTitle}</p>
        {examResult.courseName && (
          <p className="text-sm text-gray-500">{examResult.courseName}</p>
        )}
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-6 w-6 text-yellow-500" />
              Tổng quan kết quả
            </CardTitle>
            <Badge className={getGradeBadgeVariant(examResult.grade)}>
              Điểm {examResult.grade}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${getScoreColor(examResult.percentage)}`}>
                {examResult.score}/{examResult.maxScore}
              </div>
              <div className="text-sm text-gray-600">Điểm số</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${getScoreColor(examResult.percentage)}`}>
                {examResult.percentage}%
              </div>
              <div className="text-sm text-gray-600">Phần trăm</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {examResult.correctAnswers}
              </div>
              <div className="text-sm text-gray-600">Câu đúng</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {examResult.incorrectAnswers}
              </div>
              <div className="text-sm text-gray-600">Câu sai</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Tiến độ hoàn thành</span>
              <span>{examResult.percentage}%</span>
            </div>
            <ProgressBar value={examResult.percentage} max={100} showLabel={false} className="h-3" />
          </div>

          <div className="flex items-center justify-center">
            {examResult.isPassed ? (
              <Badge className="bg-green-100 text-green-800 px-4 py-2 text-lg">
                <CheckCircle className="h-5 w-5 mr-2" />
                Đã qua môn (≥{examResult.passThreshold}%)
              </Badge>
            ) : (
              <Badge className="bg-red-100 text-red-800 px-4 py-2 text-lg">
                <XCircle className="h-5 w-5 mr-2" />
                Chưa qua môn (cần ≥{examResult.passThreshold}%)
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Thông tin thời gian
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {examResult.startedAt && (
              <div className="flex justify-between">
                <span className="text-gray-600">Bắt đầu:</span>
                <span className="font-medium">{formatDate(examResult.startedAt)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Hoàn thành:</span>
              <span className="font-medium">{formatDate(examResult.completedAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Thời gian cho phép:</span>
              <span className="font-medium">{examResult.duration}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Thời gian thực hiện:</span>
              <span className="font-medium">{examResult.timeSpent}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Chi tiết kết quả
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Tổng số câu:</span>
              <span className="font-medium">{examResult.totalQuestions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Câu trả lời đúng:</span>
              <span className="font-medium text-green-600">{examResult.correctAnswers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Câu trả lời sai:</span>
              <span className="font-medium text-red-600">{examResult.incorrectAnswers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tỷ lệ đúng:</span>
              <span className="font-medium">{examResult.percentage}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center gap-4 mt-8 flex-wrap">
        <Button 
          variant="outline"
          onClick={() => navigate(`/learn/${courseId}`, {
            state: { 
              examCompleted: true,
              examId: examId,
              examPassed: examResult.isPassed
            }
          })}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại khóa học
        </Button>
        
        {/* Always show retake button - allow users to improve their score */}
        <Button 
          onClick={handleRetakeExam}
          className={examResult.isPassed ? "bg-blue-600 hover:bg-blue-700" : "bg-orange-600 hover:bg-orange-700"}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          {examResult.isPassed ? "Thi lại để cải thiện điểm" : "Thi lại"}
        </Button>
        
        <Button 
          onClick={() => navigate('/courses')}
          className="bg-green-600 hover:bg-green-700"
        >
          Tiếp tục học tập
        </Button>
      </div>
    </div>
  );
};

export default ExamResultsPage;