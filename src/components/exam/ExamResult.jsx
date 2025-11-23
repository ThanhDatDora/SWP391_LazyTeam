import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { 
  Trophy, XCircle, TrendingUp, Clock, 
  CheckCircle2, RotateCcw, Eye, ArrowRight 
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

/**
 * ExamResult Component
 * Displays exam results with score, pass/fail status, and actions
 * Shows: Score percentage, correct answers, time taken, next steps
 */
const ExamResult = ({ 
  result,
  onReviewAnswers,
  onRetake,
  onContinue,
  loading = false
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  if (!result) return null;

  const {
    score,
    correct_answers,
    total_questions,
    passed,
    time_taken,
    next_mooc_unlocked
  } = result;

  // Show confetti for passing scores (70% or higher)
  useEffect(() => {
    if (passed && score >= 70) {
      setShowConfetti(true);
      
      // Hide confetti after 4 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [passed, score]);

  // Update window dimensions for responsive confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      {/* Confetti Animation for Passing Scores */}
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
          colors={['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4']}
        />
      )}
      
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Main Result Card */}
        <Card className={`
          border-t-8 shadow-2xl
          ${passed ? 'border-t-green-500' : 'border-t-red-500'}
        `}>
          <CardContent className="p-8">
            {/* Icon and Status */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 shadow-lg">
                {passed ? (
                  <div className="w-full h-full bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                    <Trophy className="w-12 h-12 text-white" />
                  </div>
                ) : (
                  <div className="w-full h-full bg-red-500 rounded-full flex items-center justify-center">
                    <XCircle className="w-12 h-12 text-white" />
                  </div>
                )}
              </div>

              <h1 className={`text-4xl font-bold mb-2 ${passed ? 'text-green-600' : 'text-red-600'}`}>
                {passed ? 'Congratulations!' : 'Not Passed'}
              </h1>
              
              <p className="text-gray-600 text-lg">
                {passed 
                  ? 'You have successfully passed the exam!' 
                  : 'You need 70% or higher to pass. Keep trying!'}
              </p>
            </div>

            {/* Score Display */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="text-center mb-4">
                <div className={`text-6xl font-bold mb-2 ${passed ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.round(score)}%
                </div>
                <p className="text-gray-600">Your Score</p>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-2xl font-bold">{correct_answers}</span>
                  </div>
                  <p className="text-xs text-gray-600">Correct</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
                    <XCircle className="w-5 h-5" />
                    <span className="text-2xl font-bold">{total_questions - correct_answers}</span>
                  </div>
                  <p className="text-xs text-gray-600">Incorrect</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                    <Clock className="w-5 h-5" />
                    <span className="text-2xl font-bold">{formatTime(time_taken)}</span>
                  </div>
                  <p className="text-xs text-gray-600">Time</p>
                </div>
              </div>
            </div>

            {/* Achievement Badge */}
            {passed && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 mb-6 border-2 border-green-200">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-500 rounded-lg">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900 mb-1">
                      {next_mooc_unlocked ? 'Next MOOC Unlocked!' : 'Course Progress Updated'}
                    </h3>
                    <p className="text-sm text-green-700">
                      {next_mooc_unlocked 
                        ? 'Great job! You can now access the next MOOC in this course.'
                        : 'You have completed all MOOCs in this course. Check your progress for certificate eligibility.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Breakdown */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Performance Breakdown
                </h3>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Accuracy</span>
                    <span className="font-semibold">{correct_answers}/{total_questions} questions</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-1000 ${
                        passed ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${score}%` }}
                    ></div>
                  </div>
                </div>

                {/* Passing Threshold Indicator */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${passed ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-gray-600">Passing Threshold: 70%</span>
                  </div>
                  <Badge variant={passed ? "success" : "destructive"}>
                    {passed ? 'Above threshold' : 'Below threshold'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={onReviewAnswers}
                variant="outline"
                className="w-full"
                disabled={loading}
              >
                <Eye className="w-4 h-4 mr-2" />
                Review Answers
              </Button>

              <div className="flex gap-3">
                {!passed && (
                  <Button
                    onClick={onRetake}
                    variant="outline"
                    className="flex-1"
                    disabled={loading}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Retake Exam
                  </Button>
                )}
                
                <Button
                  onClick={onContinue}
                  className={`flex-1 ${passed ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  disabled={loading}
                >
                  {passed ? (
                    <>
                      Continue Learning
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    'Back to Course'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Encouragement Message */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            {passed 
              ? '🎉 Keep up the excellent work!' 
              : '💪 Don\'t give up! Review the materials and try again.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExamResult;
