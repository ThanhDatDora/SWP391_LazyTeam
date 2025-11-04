import React from 'react';
import { CheckCircle, XCircle, HelpCircle, Clock, Award, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

/**
 * Quiz Lesson Component
 * Interactive quiz with instant feedback
 */
const QuizLesson = ({ lesson, onComplete }) => {
  const [quizData, setQuizData] = React.useState(null);
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const [selectedAnswers, setSelectedAnswers] = React.useState({});
  const [showResults, setShowResults] = React.useState(false);
  const [score, setScore] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(null);
  const [parseError, setParseError] = React.useState(false);

  React.useEffect(() => {
    // Check if content_url is null or invalid
    if (!lesson.content_url || lesson.content_url === 'null' || lesson.content_url === 'N/A') {
      console.warn('⚠️ Quiz has no content_url:', lesson);
      setParseError(true);
      return;
    }

    try {
      const parsed = JSON.parse(lesson.content_url);
      setQuizData(parsed);
      if (parsed.timeLimit) {
        setTimeLeft(parsed.timeLimit * 60); // Convert minutes to seconds
      }
    } catch (error) {
      console.error('Failed to parse quiz data:', error);
      setParseError(true);
    }
  }, [lesson.content_url]);

  React.useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || showResults) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showResults]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    quizData.questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const percentage = (correctCount / quizData.questions.length) * 100;
    setScore(percentage);
    setShowResults(true);

    // Mark as complete if passed
    if (percentage >= (quizData.passingScore || 70) && onComplete && !lesson.completed) {
      setTimeout(() => onComplete(), 1500);
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
    setCurrentQuestion(0);
    if (quizData.timeLimit) {
      setTimeLeft(quizData.timeLimit * 60);
    }
  };

  // Error UI if no valid quiz data
  if (parseError || !quizData) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="text-center p-8">
          <div className="w-20 h-20 rounded-full bg-orange-100 mx-auto mb-4 flex items-center justify-center">
            <HelpCircle className="h-10 w-10 text-orange-600" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">Quiz chưa có nội dung</h3>
          <p className="text-gray-600 mb-4">Quiz này đang trong quá trình cập nhật</p>
          <p className="text-xs text-gray-500 font-mono bg-gray-100 p-3 rounded inline-block">
            content_url: {lesson.content_url || 'null'}
          </p>
        </div>
      </div>
    );
  }

  const currentQ = quizData.questions[currentQuestion];
  const isAnswered = selectedAnswers[currentQ.id] !== undefined;
  const allAnswered = quizData.questions.every(q => selectedAnswers[q.id] !== undefined);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white border-b px-8 py-6 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <HelpCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Bài kiểm tra</p>
                <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
              </div>
            </div>

            {timeLeft !== null && !showResults && (
              <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-lg">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className={`font-mono font-semibold ${timeLeft < 60 ? 'text-red-600' : 'text-orange-600'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>

          {!showResults && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-600 transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / quizData.questions.length) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 font-medium">
                {currentQuestion + 1}/{quizData.questions.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {!showResults ? (
            <Card className="shadow-lg">
              <CardContent className="p-8">
                {/* Question */}
                <div className="mb-8">
                  <Badge variant="secondary" className="mb-4">
                    Câu hỏi {currentQuestion + 1}
                  </Badge>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                    {currentQ.question}
                  </h3>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {currentQ.options.map((option, index) => {
                    const isSelected = selectedAnswers[currentQ.id] === index;
                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(currentQ.id, index)}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-all
                          ${isSelected 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-200 hover:border-purple-200 bg-white'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                            ${isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-300'}`}
                          >
                            {isSelected && <CheckCircle className="h-4 w-4 text-white" />}
                          </div>
                          <span className="text-gray-800 font-medium">{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestion(prev => prev - 1)}
                    disabled={currentQuestion === 0}
                  >
                    Câu trước
                  </Button>

                  <div className="text-sm text-gray-500">
                    {isAnswered ? '✓ Đã trả lời' : 'Chọn một đáp án'}
                  </div>

                  {currentQuestion < quizData.questions.length - 1 ? (
                    <Button
                      onClick={() => setCurrentQuestion(prev => prev + 1)}
                      disabled={!isAnswered}
                      className="bg-gradient-to-r from-purple-500 to-pink-600"
                    >
                      Câu tiếp theo
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={!allAnswered}
                      className="bg-gradient-to-r from-purple-500 to-pink-600"
                    >
                      Nộp bài
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Results */
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center
                    ${score >= (quizData.passingScore || 70) 
                      ? 'bg-green-100' 
                      : 'bg-red-100'
                    }`}
                  >
                    {score >= (quizData.passingScore || 70) ? (
                      <Award className="h-10 w-10 text-green-600" />
                    ) : (
                      <XCircle className="h-10 w-10 text-red-600" />
                    )}
                  </div>
                  
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Kết quả: {score.toFixed(0)}%
                  </h2>
                  
                  <p className={`text-lg ${score >= (quizData.passingScore || 70) ? 'text-green-600' : 'text-red-600'}`}>
                    {score >= (quizData.passingScore || 70) 
                      ? '🎉 Chúc mừng! Bạn đã đạt yêu cầu' 
                      : `Cần ${quizData.passingScore || 70}% để qua. Hãy thử lại!`
                    }
                  </p>
                </div>

                {/* Detailed answers */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Chi tiết câu trả lời:</h3>
                  {quizData.questions.map((q, idx) => {
                    const userAnswer = selectedAnswers[q.id];
                    const isCorrect = userAnswer === q.correctAnswer;
                    
                    return (
                      <div key={q.id} className="border rounded-lg p-4">
                        <div className="flex items-start gap-3 mb-2">
                          {isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 mb-1">Câu {idx + 1}: {q.question}</p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Đáp án của bạn:</span> {q.options[userAnswer]}
                            </p>
                            {!isCorrect && (
                              <p className="text-sm text-green-600">
                                <span className="font-medium">Đáp án đúng:</span> {q.options[q.correctAnswer]}
                              </p>
                            )}
                            {q.explanation && (
                              <p className="text-sm text-gray-500 mt-2 italic">💡 {q.explanation}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-3 mt-8">
                  <Button
                    variant="outline"
                    onClick={handleRetry}
                    className="flex-1"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Làm lại
                  </Button>
                  {score >= (quizData.passingScore || 70) && (
                    <Button
                      onClick={() => onComplete && !lesson.completed && onComplete()}
                      disabled={lesson.completed}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600"
                    >
                      {lesson.completed ? 'Đã hoàn thành' : 'Tiếp tục'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizLesson;
