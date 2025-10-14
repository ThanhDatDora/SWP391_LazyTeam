import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, AlertCircle, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const ExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submissionResult, setSubmissionResult] = useState(null);

  // Load exam data
  useEffect(() => {
    const loadExam = async () => {
      try {
        setLoading(true);
        
        // In real implementation, we'd get exam by ID
        // For demo, we'll use the mock exam
        const mockExam = {
          exam_id: parseInt(examId),
          mooc_id: 1,
          name: 'Quiz Servlet Cơ bản',
          duration_minutes: 20
        };
        
        // Get questions for the MOOC
        const questionsResponse = await api.exams.getQuestionsByMooc(mockExam.mooc_id);
        if (questionsResponse.success) {
          setExam(mockExam);
          setQuestions(questionsResponse.data);
          setTimeRemaining(mockExam.duration_minutes * 60); // Convert to seconds
        } else {
          setError('Không thể tải đề thi');
        }
      } catch (err) {
        setError('Đã có lỗi xảy ra khi tải đề thi');
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      loadExam();
    }
  }, [examId]);

  // Timer countdown
  useEffect(() => {
    let timer;
    if (examStarted && !examSubmitted && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Auto-submit when time is up
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [examStarted, examSubmitted, timeRemaining]);

  const startExam = async () => {
    try {
      const response = await api.exams.startExam(parseInt(examId));
      if (response.success) {
        setExamStarted(true);
      } else {
        setError('Không thể bắt đầu bài thi');
      }
    } catch (err) {
      setError('Đã có lỗi xảy ra khi bắt đầu bài thi');
    }
  };

  const handleAnswerChange = (questionId, optionId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleSubmitExam = async () => {
    try {
      // Prepare submission data
      const submissionData = {
        exam_id: parseInt(examId),
        answers: questions.map(q => ({
          question_id: q.question_id,
          selected_option_id: answers[q.question_id] || null
        }))
      };

      const response = await api.exams.submitExam(parseInt(examId), submissionData);
      if (response.success) {
        setExamSubmitted(true);
        setSubmissionResult(response.data);
      } else {
        setError('Không thể nộp bài thi');
      }
    } catch (err) {
      setError('Đã có lỗi xảy ra khi nộp bài thi');
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const goToQuestion = (index) => {
    setCurrentQuestion(index);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải đề thi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Lỗi</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate(-1)}>Quay lại</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Exam completion screen
  if (examSubmitted && submissionResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Hoàn thành bài thi!</h1>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{submissionResult.score}</div>
                <div className="text-sm text-blue-800">Điểm số</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((submissionResult.score / submissionResult.max_score) * 100)}%
                </div>
                <div className="text-sm text-green-800">Phần trăm</div>
              </div>
            </div>

            <div className="text-gray-600 mb-6">
              <p>Bạn đã trả lời đúng {submissionResult.score}/{submissionResult.max_score} câu hỏi</p>
              <p className="text-sm mt-2">
                Lần thi: {submissionResult.attempt_no}/3 
                {submissionResult.is_best && <Badge className="ml-2 bg-yellow-100 text-yellow-800">Điểm cao nhất</Badge>}
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => navigate(`/course/${exam?.mooc_id}`)}
                variant="outline"
              >
                Quay lại khóa học
              </Button>
              <Button onClick={() => navigate('/exam-history')}>
                Xem lịch sử thi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pre-exam screen
  if (!examStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-center">{exam?.name}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Thời gian làm bài:</span>
                <Badge variant="secondary">{exam?.duration_minutes} phút</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Số câu hỏi:</span>
                <Badge variant="secondary">{questions.length} câu</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Số lần thi tối đa:</span>
                <Badge variant="secondary">3 lần</Badge>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-medium text-yellow-800 mb-1">Lưu ý quan trọng:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Bạn có tối đa 3 lần làm bài thi này</li>
                    <li>• Điểm cao nhất sẽ được tính vào kết quả cuối cùng</li>
                    <li>• Không thể tạm dừng sau khi bắt đầu</li>
                    <li>• Bài thi sẽ tự động nộp khi hết thời gian</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button onClick={startExam} size="lg" className="px-8">
                Bắt đầu làm bài
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Exam interface
  const currentQ = questions[currentQuestion];
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with timer */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">{exam?.name}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-500" />
                <span className={`font-mono text-lg ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <Badge variant="outline">
                {getAnsweredCount()}/{questions.length} câu
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Question navigation sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-sm">Danh sách câu hỏi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                  {questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToQuestion(index)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        index === currentQuestion
                          ? 'bg-teal-600 text-white'
                          : answers[questions[index].question_id]
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-teal-600 rounded"></div>
                    <span>Câu hiện tại</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                    <span>Đã trả lời</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-100 rounded"></div>
                    <span>Chưa trả lời</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main question area */}
          <div className="col-span-12 lg:col-span-9">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-gray-500">
                    Câu hỏi {currentQuestion + 1}/{questions.length}
                  </CardTitle>
                  {currentQ?.difficulty && (
                    <Badge variant={
                      currentQ.difficulty === 'easy' ? 'default' :
                      currentQ.difficulty === 'medium' ? 'secondary' : 'destructive'
                    }>
                      {currentQ.difficulty === 'easy' ? 'Dễ' :
                       currentQ.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Question stem */}
                <div className="text-lg leading-relaxed">
                  {currentQ?.stem}
                </div>

                {/* Answer options */}
                <div className="space-y-3">
                  {currentQ?.options?.map((option) => (
                    <label
                      key={option.option_id}
                      className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 ${
                        answers[currentQ.question_id] === option.option_id
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question_${currentQ.question_id}`}
                        value={option.option_id}
                        checked={answers[currentQ.question_id] === option.option_id}
                        onChange={() => handleAnswerChange(currentQ.question_id, option.option_id)}
                        className="mt-1 text-teal-600"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 mb-1">
                          {option.label}
                        </div>
                        <div className="text-gray-700">
                          {option.content}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Navigation buttons */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <Button
                    onClick={prevQuestion}
                    disabled={currentQuestion === 0}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Câu trước
                  </Button>

                  <div className="flex items-center gap-3">
                    {currentQuestion === questions.length - 1 ? (
                      <Button
                        onClick={handleSubmitExam}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Nộp bài
                      </Button>
                    ) : (
                      <Button
                        onClick={nextQuestion}
                        className="flex items-center gap-2"
                      >
                        Câu tiếp
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPage;