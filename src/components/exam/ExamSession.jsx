import React, { useState, useEffect, useCallback } from 'react';
import { Clock, AlertCircle, CheckCircle2, Send } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

/**
 * ExamSession Component
 * Main exam interface with timer, questions, and answer selection
 * Features: 20-minute countdown, question navigation, answer tracking
 */
const ExamSession = ({ 
  examId,
  attemptId,
  questions,
  duration_minutes,
  onSubmit,
  onAutoSubmit,
  submitting = false
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(duration_minutes * 60); // in seconds
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((event) => {
    // Ignore if user is typing in an input or modal is open
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        navigateQuestion('prev');
        break;
      case 'ArrowRight':
        event.preventDefault();
        navigateQuestion('next');
        break;
      case 'Enter':
        event.preventDefault();
        if (showConfirmSubmit) {
          handleSubmit();
        } else {
          setShowConfirmSubmit(true);
        }
        break;
      case 'Escape':
        event.preventDefault();
        setShowConfirmSubmit(false);
        break;
      case ' ':
        event.preventDefault();
        // Select answer A, B, C, D with spacebar cycling
        const currentQuestion = questions[currentQuestionIndex];
        if (currentQuestion && currentQuestion.options) {
          const currentAnswer = answers[currentQuestion.id];
          const options = ['A', 'B', 'C', 'D'];
          const currentIndex = options.indexOf(currentAnswer);
          const nextIndex = (currentIndex + 1) % options.length;
          handleAnswerSelect(currentQuestion.id, options[nextIndex]);
        }
        break;
      case '1':
      case 'a':
      case 'A':
        event.preventDefault();
        if (questions[currentQuestionIndex]) {
          handleAnswerSelect(questions[currentQuestionIndex].id, 'A');
        }
        break;
      case '2':
      case 'b':
      case 'B':
        event.preventDefault();
        if (questions[currentQuestionIndex]) {
          handleAnswerSelect(questions[currentQuestionIndex].id, 'B');
        }
        break;
      case '3':
      case 'c':
      case 'C':
        event.preventDefault();
        if (questions[currentQuestionIndex]) {
          handleAnswerSelect(questions[currentQuestionIndex].id, 'C');
        }
        break;
      case '4':
      case 'd':
      case 'D':
        event.preventDefault();
        if (questions[currentQuestionIndex]) {
          handleAnswerSelect(questions[currentQuestionIndex].id, 'D');
        }
        break;
    }
  }, [currentQuestionIndex, questions, answers, showConfirmSubmit]);

  // Add keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-submit when time runs out
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAutoSubmit = () => {
    const formattedAnswers = Object.entries(answers).map(([qid, option]) => ({
      question_id: parseInt(qid),
      selected_option: option
    }));
    onAutoSubmit?.(formattedAnswers);
  };

  const navigateQuestion = (direction) => {
    if (direction === 'next' && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (direction === 'prev' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleAnswerSelect = (questionId, selectedOption) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: selectedOption
    }));
  };

  const handleSubmit = () => {
    const formattedAnswers = Object.entries(answers).map(([qid, option]) => ({
      question_id: parseInt(qid),
      selected_option: option
    }));
    onSubmit(formattedAnswers);
    setShowConfirmSubmit(false);
  };

  const selectAnswer = (questionId, option) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer color based on time left
  const getTimerColor = () => {
    const percentage = (timeLeft / (duration_minutes * 60)) * 100;
    if (percentage > 50) return 'text-green-600 bg-green-100';
    if (percentage > 25) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100 animate-pulse';
  };

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header with Timer */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="secondary">
                Question {currentQuestionIndex + 1} of {questions.length}
              </Badge>
              <Badge variant="outline">
                Answered: {answeredCount}/{questions.length}
              </Badge>
            </div>
            
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold ${getTimerColor()}`}>
              <Clock className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Question Panel */}
          <div className="col-span-12 lg:col-span-9">
            <Card>
              <CardContent className="p-6">
                {/* Question */}
                <div className="mb-6">
                  <div className="flex items-start gap-3 mb-4">
                    <Badge className="text-lg px-3 py-1">
                      {currentQuestionIndex + 1}
                    </Badge>
                    <h2 className="text-xl font-semibold text-gray-900 flex-1">
                      {currentQuestion.stem}
                    </h2>
                  </div>
                  
                  {currentQuestion.difficulty && (
                    <Badge variant={
                      currentQuestion.difficulty === 'easy' ? 'success' :
                      currentQuestion.difficulty === 'medium' ? 'warning' : 'destructive'
                    }>
                      {currentQuestion.difficulty}
                    </Badge>
                  )}
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option) => {
                    const isSelected = answers[currentQuestion.question_id] === option.label;
                    
                    return (
                      <button
                        key={option.option_id}
                        onClick={() => selectAnswer(currentQuestion.question_id, option.label)}
                        className={`
                          w-full text-left p-4 rounded-lg border-2 transition-all
                          ${isSelected 
                            ? 'border-blue-500 bg-blue-50 shadow-md' 
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0
                            ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}
                          `}>
                            {option.label}
                          </div>
                          <span className={`flex-1 ${isSelected ? 'text-blue-900 font-medium' : 'text-gray-700'}`}>
                            {option.content}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-blue-500" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={previousQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </Button>

                  <div className="flex gap-2">
                    {currentQuestionIndex === questions.length - 1 ? (
                      <Button
                        onClick={() => setShowConfirmSubmit(true)}
                        disabled={submitting}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {submitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Submit Exam
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={nextQuestion}
                      >
                        Next
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Navigator Sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <Card className="sticky top-24">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                  Question Navigator
                </h3>
                <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                  {questions.map((q, index) => {
                    const isAnswered = answers[q.question_id];
                    const isCurrent = index === currentQuestionIndex;
                    
                    return (
                      <button
                        key={q.question_id}
                        onClick={() => goToQuestion(index)}
                        className={`
                          aspect-square rounded-lg text-sm font-medium transition-all
                          ${isCurrent 
                            ? 'bg-blue-500 text-white ring-2 ring-blue-500 ring-offset-2' 
                            : isAnswered
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }
                        `}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-4 pt-4 border-t space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-gray-600">Current</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 rounded"></div>
                    <span className="text-gray-600">Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-100 rounded"></div>
                    <span className="text-gray-600">Not answered</span>
                  </div>
                </div>

                {/* Warning if not all answered */}
                {!allAnswered && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex gap-2 text-xs text-yellow-800">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{questions.length - answeredCount} questions unanswered</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Submit Exam?
              </h3>
              
              <div className="space-y-3 mb-6">
                <p className="text-gray-700">
                  You have answered <strong>{answeredCount}</strong> out of <strong>{questions.length}</strong> questions.
                </p>
                
                {!allAnswered && (
                  <div className="flex gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>
                      You still have <strong>{questions.length - answeredCount}</strong> unanswered questions. 
                      These will be marked as incorrect.
                    </span>
                  </div>
                )}
                
                <p className="text-sm text-gray-600">
                  Once submitted, you cannot change your answers.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmSubmit(false)}
                  className="flex-1"
                  disabled={submitting}
                >
                  Review Answers
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Yes, Submit'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ExamSession;
