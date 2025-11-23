import React from 'react';
import { 
  FileCheck, Clock, Award, AlertCircle, X, 
  CheckCircle, TrendingUp, Calendar 
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

/**
 * ExamIntro Component
 * Full-screen modal showing exam details before starting
 * Displays: Requirements, previous attempts, rules, start button
 */
const ExamIntro = ({ 
  examData,
  onStart,
  onClose,
  loading = false
}) => {
  if (!examData) return null;

  const {
    mooc_name,
    total_questions,
    duration_minutes,
    passing_score,
    can_take_exam,
    lessons_completed,
    total_lessons,
    previous_attempts,
    best_score,
    last_attempt_date
  } = examData;

  const hasAttempts = previous_attempts > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Exam: {mooc_name}
              </h2>
              <p className="text-sm text-gray-600">
                Complete this exam to unlock the next MOOC
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Eligibility Check */}
          {!can_take_exam && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-900 mb-1">
                      Lessons Not Complete
                    </h3>
                    <p className="text-sm text-yellow-800">
                      You must complete all {total_lessons} lessons before taking this exam.
                      Currently: {lessons_completed}/{total_lessons} completed.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Exam Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <FileCheck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{total_questions}</div>
                <div className="text-sm text-gray-600">Questions</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{duration_minutes}</div>
                <div className="text-sm text-gray-600">Minutes</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{passing_score}%</div>
                <div className="text-sm text-gray-600">To Pass</div>
              </CardContent>
            </Card>
          </div>

          {/* Previous Attempts */}
          {hasAttempts && (
            <Card>
              <CardHeader className="pb-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Your Progress
                </h3>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Previous Attempts:</span>
                  <Badge variant="secondary">{previous_attempts}</Badge>
                </div>
                {best_score !== null && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Best Score:</span>
                    <Badge 
                      variant={best_score >= passing_score ? "success" : "destructive"}
                      className="text-sm"
                    >
                      {best_score}%
                    </Badge>
                  </div>
                )}
                {last_attempt_date && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Last Attempt:</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(last_attempt_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Exam Rules */}
          <Card>
            <CardHeader className="pb-3">
              <h3 className="font-semibold text-gray-900">Exam Rules</h3>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>You have <strong>{duration_minutes} minutes</strong> to complete the exam</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>All questions are <strong>multiple choice</strong> with 4 options</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>You must score <strong>{passing_score}% or higher</strong> to pass</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>You can <strong>retake the exam</strong> if you don't pass</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>The exam will <strong>auto-submit</strong> when time runs out</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={onStart}
              disabled={!can_take_exam || loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Starting...
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4 mr-2" />
                  Start Exam
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamIntro;
