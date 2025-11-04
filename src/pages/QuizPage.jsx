import React, { useState, useEffect } from 'react';
import { 
  Clock, AlertCircle, CheckCircle, XCircle, ArrowLeft, Send,
  Award, TrendingUp, Target
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useNavigation } from '../hooks/useNavigation';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../hooks/useToast';

const QuizPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigation();
  const { toast } = useToast();

  // State
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  useEffect(() => {
    if (quizStarted && timeLeft > 0) {
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
  }, [quizStarted, timeLeft]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      // Mock data - Replace with real API call
      const mockQuiz = {
        quiz_id: parseInt(quizId),
        title: 'Week 1 Quiz: Servlet Basics',
        description: 'Kiểm tra kiến thức về Java Servlet cơ bản',
        passing_score: 70,
        time_limit_minutes: 15,
        mooc: {
          mooc_id: 1,
          title: 'Week 1: Introduction to Java Servlet'
        },
        questions: [
          {
            question_id: 1,
            question_text: 'Java Servlet là gì?',
            question_type: 'multiple_choice',
            points: 10,
            options: [
              { option_id: 1, option_text: 'Một Java class chạy trên server xử lý HTTP requests', is_correct: true },
              { option_id: 2, option_text: 'Một JavaScript library', is_correct: false },
              { option_id: 3, option_text: 'Một database engine', is_correct: false },
              { option_id: 4, option_text: 'Một HTML template', is_correct: false }
            ]
          },
          {
            question_id: 2,
            question_text: 'Servlet Container nào phổ biến nhất?',
            question_type: 'multiple_choice',
            points: 10,
            options: [
              { option_id: 5, option_text: 'Apache Tomcat', is_correct: true },
              { option_id: 6, option_text: 'Node.js', is_correct: false },
              { option_id: 7, option_text: 'MongoDB', is_correct: false },
              { option_id: 8, option_text: 'Redis', is_correct: false }
            ]
          },
          {
            question_id: 3,
            question_text: 'Method nào được gọi khi Servlet khởi tạo?',
            question_type: 'multiple_choice',
            points: 10,
            options: [
              { option_id: 9, option_text: 'init()', is_correct: true },
              { option_id: 10, option_text: 'start()', is_correct: false },
              { option_id: 11, option_text: 'begin()', is_correct: false },
              { option_id: 12, option_text: 'create()', is_correct: false }
            ]
          },
          {
            question_id: 4,
            question_text: 'Annotation nào dùng để map URL cho Servlet?',
            question_type: 'multiple_choice',
            points: 10,
            options: [
              { option_id: 13, option_text: '@WebServlet', is_correct: true },
              { option_id: 14, option_text: '@Controller', is_correct: false },
              { option_id: 15, option_text: '@Route', is_correct: false },
              { option_id: 16, option_text: '@Path', is_correct: false }
            ]
          },
          {
            question_id: 5,
            question_text: 'Servlet có thể xử lý bao nhiêu requests đồng thời?',
            question_type: 'multiple_choice',
            points: 10,
            options: [
              { option_id: 17, option_text: 'Nhiều requests (multi-threaded)', is_correct: true },
              { option_id: 18, option_text: 'Chỉ 1 request tại một thời điểm', is_correct: false },
              { option_id: 19, option_text: 'Tối đa 10 requests', is_correct: false },
              { option_id: 20, option_text: 'Không giới hạn nhưng phải thủ công', is_correct: false }
            ]
          }
        ],
        previous_attempts: [
          { attempt_id: 1, score: 60, attempted_at: '2025-10-25T10:30:00Z' }
        ]
      };

      setQuiz(mockQuiz);
      setQuestions(mockQuiz.questions);
      setTimeLeft(mockQuiz.time_limit_minutes * 60); // Convert to seconds
    } catch (error) {
      console.error('Failed to load quiz:', error);
      toast.error('Không thể tải quiz');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setTimeLeft(quiz.time_limit_minutes * 60);
  };

  const handleAnswerChange = (questionId, optionId) => {
    setAnswers({
      ...answers,
      [questionId]: optionId
    });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Calculate score
      let correctCount = 0;
      let totalPoints = 0;

      questions.forEach(question => {
        const selectedOptionId = answers[question.question_id];
        const correctOption = question.options.find(opt => opt.is_correct);
        
        totalPoints += question.points;
        if (selectedOptionId === correctOption?.option_id) {
          correctCount++;
        }
      });

      const score = Math.round((correctCount / questions.length) * 100);
      const passed = score >= quiz.passing_score;

      // Mock API call to save attempt
      // await api.quizzes.submitAttempt(quizId, { answers, score });

      setResult({
        score,
        passed,
        correctCount,
        totalQuestions: questions.length,
        totalPoints
      });

      if (passed) {
        toast.success(`🎉 Chúc mừng! Bạn đã đạt ${score}%`);
      } else {
        toast.error(`Chưa đạt yêu cầu. Bạn được ${score}% (cần ${quiz.passing_score}%)`);
      }
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      toast.error('Không thể nộp bài');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz không tồn tại</h2>
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                {result.passed ? (
                  <>
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="w-12 h-12 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      🎉 Xuất sắc!
                    </h1>
                    <p className="text-xl text-gray-600">
                      Bạn đã vượt qua quiz với điểm số {result.score}%
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="w-12 h-12 text-orange-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      Cố gắng thêm nhé!
                    </h1>
                    <p className="text-xl text-gray-600">
                      Bạn được {result.score}% (cần {quiz.passing_score}% để đạt)
                    </p>
                  </>
                )}
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {result.score}%
                  </div>
                  <div className="text-sm text-gray-600">Điểm số</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {result.correctCount}/{result.totalQuestions}
                  </div>
                  <div className="text-sm text-gray-600">Đúng</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">
                    {quiz.passing_score}%
                  </div>
                  <div className="text-sm text-gray-600">Điểm đạt</div>
                </div>
              </div>

              {/* Review Answers */}
              <div className="space-y-4 mb-8">
                <h3 className="font-semibold text-lg text-gray-900">Xem lại câu trả lời:</h3>
                {questions.map((question, idx) => {
                  const selectedOptionId = answers[question.question_id];
                  const correctOption = question.options.find(opt => opt.is_correct);
                  const isCorrect = selectedOptionId === correctOption?.option_id;

                  return (
                    <Card key={question.question_id} className={`border-2 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {isCorrect ? (
                              <CheckCircle className="h-6 w-6 text-green-600" />
                            ) : (
                              <XCircle className="h-6 w-6 text-red-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 mb-2">
                              {idx + 1}. {question.question_text}
                            </p>
                            <div className="space-y-1">
                              {question.options.map(option => {
                                const isSelected = selectedOptionId === option.option_id;
                                const isCorrectOption = option.is_correct;

                                return (
                                  <div
                                    key={option.option_id}
                                    className={`p-2 rounded text-sm ${
                                      isCorrectOption
                                        ? 'bg-green-100 text-green-900 font-medium'
                                        : isSelected
                                        ? 'bg-red-100 text-red-900'
                                        : 'text-gray-600'
                                    }`}
                                  >
                                    {isCorrectOption && '✓ '}
                                    {isSelected && !isCorrectOption && '✗ '}
                                    {option.option_text}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex gap-4 justify-center">
                {!result.passed && (
                  <Button
                    onClick={() => {
                      setResult(null);
                      setAnswers({});
                      setQuizStarted(false);
                      setTimeLeft(quiz.time_limit_minutes * 60);
                    }}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Làm lại
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

  // Start Quiz View
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>

          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <CardTitle className="text-2xl">{quiz.title}</CardTitle>
              <p className="text-purple-100">{quiz.mooc.title}</p>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-gray-600 text-lg mb-8">
                {quiz.description}
              </p>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <Clock className="h-8 w-8 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-600">Thời gian</div>
                    <div className="text-xl font-bold text-gray-900">
                      {quiz.time_limit_minutes} phút
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <Target className="h-8 w-8 text-green-600" />
                  <div>
                    <div className="text-sm text-gray-600">Điểm đạt</div>
                    <div className="text-xl font-bold text-gray-900">
                      {quiz.passing_score}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                  <AlertCircle className="h-8 w-8 text-purple-600" />
                  <div>
                    <div className="text-sm text-gray-600">Số câu hỏi</div>
                    <div className="text-xl font-bold text-gray-900">
                      {questions.length} câu
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                  <div>
                    <div className="text-sm text-gray-600">Lần tốt nhất</div>
                    <div className="text-xl font-bold text-gray-900">
                      {quiz.previous_attempts.length > 0
                        ? `${Math.max(...quiz.previous_attempts.map(a => a.score))}%`
                        : 'Chưa làm'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
                <h4 className="font-semibold text-gray-900 mb-2">⚠️ Lưu ý:</h4>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Bạn có {quiz.time_limit_minutes} phút để hoàn thành quiz</li>
                  <li>Quiz sẽ tự động nộp khi hết giờ</li>
                  <li>Cần đạt tối thiểu {quiz.passing_score}% để pass</li>
                  <li>Bạn có thể làm lại nếu chưa đạt</li>
                </ul>
              </div>

              <Button
                onClick={startQuiz}
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg"
              >
                Bắt đầu làm bài
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Quiz Taking View
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
              <p className="text-sm text-gray-600">
                {Object.keys(answers).length}/{questions.length} câu đã trả lời
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold ${
                timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                <Clock className="h-5 w-5" />
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6 mb-8">
          {questions.map((question, idx) => (
            <Card key={question.question_id} className="shadow-md">
              <CardHeader className="bg-gray-50">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">
                    Câu {idx + 1}: {question.question_text}
                  </CardTitle>
                  <Badge variant="outline">
                    {question.points} điểm
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {question.options.map(option => (
                    <label
                      key={option.option_id}
                      className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        answers[question.question_id] === option.option_id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${question.question_id}`}
                        value={option.option_id}
                        checked={answers[question.question_id] === option.option_id}
                        onChange={() => handleAnswerChange(question.question_id, option.option_id)}
                        className="mt-1 h-5 w-5 text-purple-600"
                      />
                      <span className="flex-1 text-gray-900">
                        {option.option_text}
                      </span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Submit Button */}
        <Card className="sticky bottom-4 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {Object.keys(answers).length === questions.length ? (
                  <span className="text-green-600 font-medium">
                    ✓ Đã trả lời đủ câu hỏi
                  </span>
                ) : (
                  <span className="text-orange-600">
                    ⚠️ Còn {questions.length - Object.keys(answers).length} câu chưa trả lời
                  </span>
                )}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || Object.keys(answers).length === 0}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div>
                    Đang nộp bài...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Nộp bài
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

export default QuizPage;
