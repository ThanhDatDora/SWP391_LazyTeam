import React from 'react';
import { FileCheck, Lock, CheckCircle, Clock, Award } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

/**
 * ExamCard Component
 * Displays exam status in the MOOC list of CourseLearningPage
 * Shows: Lock status, previous attempts, best score, "Take Exam" button
 */
const ExamCard = ({ 
  moocId,
  moocTitle,
  canTakeExam,
  lessonsCompleted,
  totalLessons,
  previousAttempts,
  bestScore,
  passed,
  onStartExam,
  loading = false
}) => {
  // Determine card status
  const isLocked = !canTakeExam;
  const hasAttempts = previousAttempts > 0;
  const hasPassed = passed;

  return (
    <Card className={`
      border-l-4 transition-all duration-200
      ${hasPassed ? 'border-l-green-500 bg-white shadow-sm' : ''}
      ${isLocked ? 'border-l-gray-300 bg-white opacity-60' : ''}
      ${!isLocked && !hasPassed ? 'border-l-blue-500 hover:shadow-md bg-white' : ''}
    `}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Icon & Info */}
          <div className="flex gap-3 flex-1">
            {/* Icon */}
            <div className={`
              p-3 rounded-lg flex-shrink-0
              ${hasPassed ? 'bg-green-100 text-green-600' : ''}
              ${isLocked ? 'bg-gray-100 text-gray-400' : ''}
              ${!isLocked && !hasPassed ? 'bg-blue-100 text-blue-600' : ''}
            `}>
              {isLocked ? (
                <Lock className="w-5 h-5" />
              ) : hasPassed ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <FileCheck className="w-5 h-5" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-800">
                  Exam: {moocTitle}
                </h3>
                {hasPassed && (
                  <Badge variant="success" className="text-xs">
                    <Award className="w-3 h-3 mr-1" />
                    Passed
                  </Badge>
                )}
              </div>

              {/* Status message */}
              <p className="text-sm text-gray-600">
                {isLocked ? (
                  <span className="flex items-center gap-1">
                    <Lock className="w-4 h-4" />
                    Complete all {totalLessons} lessons to unlock ({lessonsCompleted}/{totalLessons} done)
                  </span>
                ) : hasPassed ? (
                  <span className="text-green-700 font-medium flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    You passed with {bestScore}%
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    10 questions • 20 minutes • 70% to pass
                  </span>
                )}
              </p>

              {/* Attempts info */}
              {hasAttempts && (
                <div className="flex items-center gap-4 text-xs text-gray-700 font-medium">
                  <span>Attempts: {previousAttempts}</span>
                  {bestScore !== null && (
                    <span>Best score: {bestScore}%</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Action Button */}
          <div className="flex-shrink-0">
            {!isLocked && (
              <Button
                onClick={onStartExam}
                disabled={loading}
                variant={hasPassed ? "outline" : "default"}
                size="sm"
                className={hasPassed ? "text-green-600 hover:bg-green-50" : ""}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Loading...
                  </>
                ) : hasPassed ? (
                  'Retake Exam'
                ) : hasAttempts ? (
                  'Try Again'
                ) : (
                  'Take Exam'
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExamCard;
