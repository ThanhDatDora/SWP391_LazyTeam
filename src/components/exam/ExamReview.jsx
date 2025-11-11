import React, { useState } from 'react';
import { 
  CheckCircle2, XCircle, ArrowLeft, ChevronLeft, 
  ChevronRight, AlertCircle 
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

/**
 * ExamReview Component
 * Detailed answer review showing correct/incorrect for each question
 * Shows: User's answer, correct answer, question by question navigation
 */
const ExamReview = ({ 
  reviewData,
  onClose,
  loading = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!reviewData || !reviewData.answers) return null;

  const {
    score,
    correct_answers,
    total_questions,
    passed,
    answers
  } = reviewData;

  const currentAnswer = answers[currentIndex];

  const nextQuestion = () => {
    if (currentIndex < answers.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const goToQuestion = (index) => {
    setCurrentIndex(index);
  };

  // Get counts
  const correctCount = answers.filter(a => a.is_correct).length;
  const incorrectCount = answers.filter(a => !a.is_correct).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={loading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Results
            </Button>

            <div className="flex items-center gap-4">
              <Badge variant="secondary">
                Question {currentIndex + 1} of {answers.length}
              </Badge>
              <Badge variant="success">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {correctCount} Correct
              </Badge>
              <Badge variant="destructive">
                <XCircle className="w-3 h-3 mr-1" />
                {incorrectCount} Incorrect
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Question Review Panel */}
          <div className="col-span-12 lg:col-span-9">
            <Card className={`
              border-l-4
              ${currentAnswer.is_correct ? 'border-l-green-500' : 'border-l-red-500'}
            `}>
              <CardContent className="p-6">
                {/* Status Badge */}
                <div className="mb-6">
                  <Badge 
                    variant={currentAnswer.is_correct ? "success" : "destructive"}
                    className="text-lg px-4 py-2"
                  >
                    {currentAnswer.is_correct ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Correct Answer
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 mr-2" />
                        Incorrect Answer
                      </>
                    )}
                  </Badge>
                </div>

                {/* Question */}
                <div className="mb-6">
                  <div className="flex items-start gap-3 mb-4">
                    <Badge className="text-lg px-3 py-1">
                      {currentIndex + 1}
                    </Badge>
                    <h2 className="text-xl font-semibold text-gray-900 flex-1">
                      {currentAnswer.question_text}
                    </h2>
                  </div>
                </div>

                {/* Options with feedback */}
                <div className="space-y-3">
                  {currentAnswer.options.map((option) => {
                    const isUserAnswer = option.label === currentAnswer.user_answer;
                    const isCorrectAnswer = option.is_correct;
                    
                    let cardClass = 'border-2 border-gray-200 bg-white';
                    let iconComponent = null;

                    if (isCorrectAnswer) {
                      cardClass = 'border-2 border-green-500 bg-green-50';
                      iconComponent = <CheckCircle2 className="w-5 h-5 text-green-600" />;
                    } else if (isUserAnswer && !isCorrectAnswer) {
                      cardClass = 'border-2 border-red-500 bg-red-50';
                      iconComponent = <XCircle className="w-5 h-5 text-red-600" />;
                    }

                    return (
                      <div
                        key={option.option_id}
                        className={`p-4 rounded-lg ${cardClass} transition-all`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0
                            ${isCorrectAnswer 
                              ? 'bg-green-500 text-white' 
                              : isUserAnswer 
                                ? 'bg-red-500 text-white' 
                                : 'bg-gray-100 text-gray-600'
                            }
                          `}>
                            {option.label}
                          </div>
                          
                          <span className={`flex-1 ${
                            isCorrectAnswer 
                              ? 'text-green-900 font-semibold' 
                              : isUserAnswer 
                                ? 'text-red-900 font-medium' 
                                : 'text-gray-700'
                          }`}>
                            {option.content}
                          </span>
                          
                          {iconComponent}
                        </div>

                        {/* Labels */}
                        {isUserAnswer && !isCorrectAnswer && (
                          <div className="mt-2 ml-11">
                            <Badge variant="destructive" className="text-xs">
                              Your answer
                            </Badge>
                          </div>
                        )}
                        {isCorrectAnswer && (
                          <div className="mt-2 ml-11">
                            <Badge variant="success" className="text-xs">
                              {isUserAnswer ? 'Your answer (Correct!)' : 'Correct answer'}
                            </Badge>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation (if available) */}
                {currentAnswer.explanation && (
                  <Card className="mt-6 bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-blue-900 mb-1">Explanation</h4>
                          <p className="text-sm text-blue-800">{currentAnswer.explanation}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={previousQuestion}
                    disabled={currentIndex === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>

                  <span className="text-sm text-gray-600">
                    {currentIndex + 1} / {answers.length}
                  </span>

                  <Button
                    variant="outline"
                    onClick={nextQuestion}
                    disabled={currentIndex === answers.length - 1}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Navigator Sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <Card className="sticky top-24">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                  All Questions
                </h3>
                
                {/* Summary */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Score:</span>
                    <span className="font-semibold">{Math.round(score)}%</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Correct:</span>
                    <span className="font-semibold">{correctCount}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Incorrect:</span>
                    <span className="font-semibold">{incorrectCount}</span>
                  </div>
                </div>

                {/* Question Grid */}
                <div className="grid grid-cols-5 lg:grid-cols-4 gap-2 mb-4">
                  {answers.map((answer, index) => {
                    const isCurrent = index === currentIndex;
                    
                    return (
                      <button
                        key={answer.question_id}
                        onClick={() => goToQuestion(index)}
                        className={`
                          aspect-square rounded-lg text-sm font-medium transition-all
                          ${isCurrent 
                            ? 'ring-2 ring-blue-500 ring-offset-2' 
                            : ''
                          }
                          ${answer.is_correct 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }
                        `}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="pt-4 border-t space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 rounded"></div>
                    <span className="text-gray-600">Correct</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 rounded"></div>
                    <span className="text-gray-600">Incorrect</span>
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

export default ExamReview;
