import React, { useState, useEffect } from 'react';
import { 
  Clock, AlertTriangle, Award, ArrowLeft, Send, FileText,
  CheckCircle, XCircle, TrendingUp, Target, Shield
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useNavigation } from '../hooks/useNavigation';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../hooks/useToast';

const ExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigation();
  const { toast } = useToast();

  // State
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [examStarted, setExamStarted] = useState(false);
  const [showWarning, setShowWarning] = useState(true);

  useEffect(() => {
    loadExam();
  }, [examId]);

  useEffect(() => {
    if (examStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit(); // Auto submit when time's up
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [examStarted, timeLeft]);

  const loadExam = async () => {
    try {
      setLoading(true);
      // Mock data - Replace with real API call
      const mockExam = {
        exam_id: parseInt(examId),
        title: 'Final Exam: Java Servlet & React',
        description: 'Bài thi tổng hợp kiến thức toàn khóa học. Cần đạt 80% để hoàn thành khóa học.',
        passing_score: 80,
        time_limit_minutes: 60,
        max_attempts: 3,
        course: {
          course_id: 1,
          title: 'Java Servlet & React Web Development'
        },
        questions: [
          {
            question_id: 1,
            question_text: 'Giải thích vòng đời của Servlet (init, service, destroy)',
            question_type: 'essay',
            points: 20,
            order_index: 1
          },
          {
            question_id: 2,
            question_text: 'So sánh GET và POST method, cho ví dụ khi nào nên dùng mỗi loại',
            question_type: 'essay',
            points: 15,
            order_index: 2
          },
          {
            question_id: 3,
            question_text: 'Session và Cookie khác nhau như thế nào? Khi nào nên sử dụng Session, khi nào dùng Cookie?',
            question_type: 'essay',
            points: 15,
            order_index: 3
          },
          {
            question_id: 4,
            question_text: 'Làm thế nào để tích hợp React frontend với Java Servlet backend? Giải thích về REST API và CORS.',
            question_type: 'essay',
            points: 20,
            order_index: 4
          },
          {
            question_id: 5,
            question_text: 'Giải thích CORS (Cross-Origin Resource Sharing) và cách configure trong Servlet Filter',
            question_type: 'essay',
            points: 15,
            order_index: 5
          },
          {
            question_id: 6,
            question_text: 'Liệt kê và giải thích các best practices khi xây dựng REST API với Java Servlet',
            question_type: 'essay',
            points: 15,
            order_index: 6
          }
        ],
        attempts: [
          { attempt_id: 1, score: 75, attempted_at: '2025-10-20T14:30:00Z', status: 'failed' }
        ],
        remaining_attempts: 2
      };

      setExam(mockExam);
      setQuestions(mockExam.questions);
      setTimeLeft(mockExam.time_limit_minutes * 60);
    } catch (error) {
      console.error('Failed to load exam:', error);
      toast.error('Không thể tải bài thi');
    } finally {
      setLoading(false);
    }
  };

  const startExam = () => {
    if (exam.remaining_attempts <= 0) {
      toast.error('Bạn đã hết lượt thi');
      return;
    }
    setExamStarted(true);
    setShowWarning(false);
    setTimeLeft(exam.time_limit_minutes * 60);
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers({
      ...answers,
      [questionId]: value
    });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // For essay questions, we'll simulate auto-grading (in real app, needs manual grading)
      // Here we'll just give a random score for demo
      const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
      
      // Simulate scoring based on answer length (demo only)
      let earnedPoints = 0;
      questions.forEach(question => {
        const answer = answers[question.question_id] || '';
        const wordCount = answer.trim().split(/\s+/).length;
        
        // Simple scoring: longer answers get more points (demo logic)
        if (wordCount >= 100) {
          earnedPoints += question.points;
        } else if (wordCount >= 50) {
          earnedPoints += question.points * 0.8;
        } else if (wordCount >= 20) {
          earnedPoints += question.points * 0.5;
        } else {
          earnedPoints += question.points * 0.3;
        }
      });

      const score = Math.round((earnedPoints / totalPoints) * 100);
      const passed = score >= exam.passing_score;

      // Mock API call to save attempt
      // await api.exams.submitAttempt(examId, { answers, score });

      setResult({
        score,
        passed,
        earnedPoints: Math.round(earnedPoints),
        totalPoints,
        answeredQuestions: Object.keys(answers).length,
        totalQuestions: questions.length
      });

      if (passed) {
        toast.success(`🎉 Xuất sắc! Bạn đã đạt ${score}% và hoàn thành khóa học!`);
      } else {
        toast.error(`Chưa đạt. Bạn được ${score}% (cần ${exam.passing_score}%). Còn ${exam.remaining_attempts - 1} lần thi.`);
      }
    } catch (error) {
      console.error('Failed to submit exam:', error);
      toast.error('Không thể nộp bài thi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải bài thi...</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bài thi không tồn tại</h2>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  // Result View
  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="shadow-2xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                {result.passed ? (
                  <>
                    <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Award className="w-16 h-16 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                      🎓 Chúc mừng!
                    </h1>
                    <p className="text-2xl text-gray-700 mb-2">
                      Bạn đã hoàn thành khóa học
                    </p>
                    <p className="text-xl text-gray-600">
                      Điểm số: {result.score}% ({result.earnedPoints}/{result.totalPoints} điểm)
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Target className="w-16 h-16 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                      Chưa đạt yêu cầu
                    </h1>
                    <p className="text-xl text-gray-700 mb-2">
                      Điểm số: {result.score}% (cần {exam.passing_score}%)
                    </p>
                    <p className="text-lg text-gray-600">
                      Bạn còn {exam.remaining_attempts - 1} lần thi
                    </p>
                  </>
                )}
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {result.score}%
                  </div>
                  <div className="text-sm text-gray-600">Điểm số</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {result.earnedPoints}
                  </div>
                  <div className="text-sm text-gray-600">Điểm đạt được</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">
                    {result.totalPoints}
                  </div>
                  <div className="text-sm text-gray-600">Tổng điểm</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600">
                    {result.answeredQuestions}/{result.totalQuestions}
                  </div>
                  <div className="text-sm text-gray-600">Câu trả lời</div>
                </div>
              </div>

              {/* Review Answers */}
              <div className="space-y-4 mb-8">
                <h3 className="font-semibold text-xl text-gray-900 mb-4">📝 Câu trả lời của bạn:</h3>
                {questions.map((question, idx) => {
                  const answer = answers[question.question_id] || '';
                  const wordCount = answer.trim().split(/\s+/).length;

                  return (
                    <Card key={question.question_id} className="border-l-4 border-l-orange-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium text-gray-900 flex-1">
                            Câu {idx + 1}: {question.question_text}
                          </h4>
                          <Badge variant="outline">{question.points} điểm</Badge>
                        </div>
                        
                        {answer ? (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-800 whitespace-pre-wrap">{answer}</p>
                            <div className="mt-2 text-sm text-gray-500">
                              {wordCount} từ
                            </div>
                          </div>
                        ) : (
                          <div className="bg-red-50 p-4 rounded-lg text-red-700">
                            ⚠️ Chưa trả lời câu này
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex gap-4 justify-center">
                {!result.passed && exam.remaining_attempts > 1 && (
                  <Button
                    onClick={() => {
                      setResult(null);
                      setAnswers({});
                      setExamStarted(false);
                      setShowWarning(true);
                      setTimeLeft(exam.time_limit_minutes * 60);
                    }}
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                  >
                    Thi lại
                  </Button>
                )}
                <Button
                  onClick={() => navigate(-1)}
                  variant="outline"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Quay về khóa học
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Warning & Start Exam View
  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>

          <Card className="shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-8 w-8" />
                <CardTitle className="text-3xl">Bài Thi Cuối Khóa</CardTitle>
              </div>
              <p className="text-orange-100">{exam.course.title}</p>
            </CardHeader>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {exam.title}
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                {exam.description}
              </p>

              {/* Exam Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <Clock className="h-8 w-8 text-blue-600 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-gray-600">Thời gian</div>
                    <div className="text-xl font-bold text-gray-900">
                      {exam.time_limit_minutes} phút
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <Target className="h-8 w-8 text-green-600 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-gray-600">Điểm đạt</div>
                    <div className="text-xl font-bold text-gray-900">
                      {exam.passing_score}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                  <FileText className="h-8 w-8 text-purple-600 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-gray-600">Số câu hỏi</div>
                    <div className="text-xl font-bold text-gray-900">
                      {questions.length} câu
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-orange-600 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-gray-600">Lần thi</div>
                    <div className="text-xl font-bold text-gray-900">
                      {exam.attempts.length + 1}/{exam.max_attempts}
                    </div>
                  </div>
                </div>
              </div>

              {/* Previous Attempts */}
              {exam.attempts.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-semibold text-gray-900 mb-3">📊 Lịch sử thi:</h3>
                  <div className="space-y-2">
                    {exam.attempts.map((attempt, idx) => (
                      <div key={attempt.attempt_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">
                          Lần {idx + 1}: {new Date(attempt.attempted_at).toLocaleDateString('vi-VN')}
                        </span>
                        <Badge variant={attempt.status === 'passed' ? 'default' : 'secondary'}>
                          {attempt.score}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warning Box */}
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-8">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-red-900 text-lg mb-2">⚠️ QUY ĐỊNH QUAN TRỌNG</h4>
                    <ul className="text-sm text-red-800 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="flex-shrink-0">•</span>
                        <span>Đây là bài thi CHÍNH THỨC, không thể tạm dừng giữa chừng</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex-shrink-0">•</span>
                        <span>Bạn có <strong>{exam.time_limit_minutes} phút</strong> để hoàn thành tất cả câu hỏi</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex-shrink-0">•</span>
                        <span>Cần đạt tối thiểu <strong>{exam.passing_score}%</strong> để pass</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex-shrink-0">•</span>
                        <span>Bạn còn <strong>{exam.remaining_attempts} lần thi</strong> (tối đa {exam.max_attempts} lần)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex-shrink-0">•</span>
                        <span>Bài thi tự động nộp khi hết giờ</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex-shrink-0">•</span>
                        <span>Không được mở tài liệu, tra Google trong khi thi</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Gợi ý:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ Đọc kỹ đề trước khi trả lời</li>
                  <li>✓ Trả lời chi tiết, có ví dụ minh họa</li>
                  <li>✓ Quản lý thời gian hợp lý cho mỗi câu</li>
                  <li>✓ Kiểm tra lại trước khi nộp bài</li>
                </ul>
              </div>

              {/* Start Button */}
              <Button
                onClick={startExam}
                disabled={exam.remaining_attempts <= 0}
                size="lg"
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-lg h-14"
              >
                {exam.remaining_attempts <= 0 ? (
                  'Đã hết lượt thi'
                ) : (
                  <>
                    <Shield className="mr-2 h-6 w-6" />
                    Bắt đầu thi
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Exam Taking View
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{exam.title}</h1>
              <p className="text-sm text-orange-100">
                {Object.keys(answers).length}/{questions.length} câu đã trả lời
              </p>
            </div>

            <div className={`flex items-center gap-2 px-6 py-3 rounded-lg font-mono text-2xl font-bold ${
              timeLeft < 600 ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-orange-600'
            }`}>
              <Clock className="h-6 w-6" />
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="space-y-6 mb-8">
          {questions.map((question, idx) => (
            <Card key={question.question_id} className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">
                    <Badge className="mr-2 bg-orange-600">Câu {idx + 1}</Badge>
                    {question.question_text}
                  </CardTitle>
                  <Badge variant="outline" className="text-lg">
                    {question.points} điểm
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <textarea
                  value={answers[question.question_id] || ''}
                  onChange={(e) => handleAnswerChange(question.question_id, e.target.value)}
                  placeholder="Nhập câu trả lời chi tiết của bạn tại đây... (Nên viết ít nhất 50-100 từ)"
                  rows={8}
                  className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none resize-none"
                />
                <div className="mt-2 text-sm text-gray-600">
                  {(answers[question.question_id] || '').trim().split(/\s+/).filter(w => w).length} từ
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Submit Button */}
        <Card className="sticky bottom-4 shadow-2xl border-2 border-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                {Object.keys(answers).length === questions.length ? (
                  <span className="text-green-600 font-medium flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Đã trả lời đủ câu hỏi
                  </span>
                ) : (
                  <span className="text-red-600 font-medium flex items-center gap-2">
                    <XCircle className="h-5 w-5" />
                    Còn {questions.length - Object.keys(answers).length} câu chưa trả lời
                  </span>
                )}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                size="lg"
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 h-12 px-8"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div>
                    Đang nộp bài...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Nộp bài thi
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExamPage;
