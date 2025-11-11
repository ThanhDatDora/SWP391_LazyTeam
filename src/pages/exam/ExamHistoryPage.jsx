import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, Award, TrendingUp, FileText, CheckCircle, XCircle,
  AlertTriangle, ArrowLeft, Eye, Calendar
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../contexts/AuthContext';

const ExamHistoryPage = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const [loading, setLoading] = useState(true);
  const [examHistory, setExamHistory] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadExamHistory();
  }, []);

  const loadExamHistory = async () => {
    try {
      setLoading(true);
      
      // Mock data - Replace with real API call
      const mockHistory = [
        {
          exam_id: 1,
          exam_title: 'Final Exam: Java Servlet & React',
          course_title: 'Java Servlet & React Web Development',
          attempts: [
            {
              attempt_id: 1,
              score: 75,
              status: 'failed',
              attempted_at: '2025-10-20T14:30:00Z',
              time_taken_minutes: 58
            },
            {
              attempt_id: 2,
              score: 85,
              status: 'passed',
              attempted_at: '2025-10-22T10:15:00Z',
              time_taken_minutes: 52
            }
          ],
          passing_score: 80,
          max_attempts: 3,
          time_limit_minutes: 60
        },
        {
          exam_id: 2,
          exam_title: 'Mid-term Exam: React Fundamentals',
          course_title: 'Modern React Development',
          attempts: [
            {
              attempt_id: 3,
              score: 92,
              status: 'passed',
              attempted_at: '2025-10-15T16:45:00Z',
              time_taken_minutes: 45
            }
          ],
          passing_score: 70,
          max_attempts: 2,
          time_limit_minutes: 60
        }
      ];

      setExamHistory(mockHistory);

      // Calculate stats
      const totalAttempts = mockHistory.reduce((sum, exam) => sum + exam.attempts.length, 0);
      const passedExams = mockHistory.filter(exam => 
        exam.attempts.some(attempt => attempt.status === 'passed')
      ).length;
      const avgScore = mockHistory.reduce((sum, exam) => {
        const latestAttempt = exam.attempts[exam.attempts.length - 1];
        return sum + latestAttempt.score;
      }, 0) / mockHistory.length;

      setStats({
        totalExams: mockHistory.length,
        totalAttempts,
        passedExams,
        avgScore: Math.round(avgScore)
      });

    } catch (error) {
      console.error('Failed to load exam history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    return status === 'passed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusIcon = (status) => {
    return status === 'passed' ? 
      <CheckCircle className="h-4 w-4" /> : 
      <XCircle className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải lịch sử thi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📚 Lịch sử thi
          </h1>
          <p className="text-gray-600 text-lg">
            Xem lại tất cả các bài thi bạn đã hoàn thành
          </p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-600">Tổng bài thi</div>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalExams}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-purple-600" />
                  <div>
                    <div className="text-sm text-gray-600">Lượt thi</div>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalAttempts}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <div className="text-sm text-gray-600">Đã đạt</div>
                    <div className="text-2xl font-bold text-gray-900">{stats.passedExams}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                  <div>
                    <div className="text-sm text-gray-600">Điểm TB</div>
                    <div className="text-2xl font-bold text-gray-900">{stats.avgScore}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Exam History List */}
        <div className="space-y-6">
          {examHistory.map((exam) => {
            const latestAttempt = exam.attempts[exam.attempts.length - 1];
            const isPassed = latestAttempt.status === 'passed';

            return (
              <Card key={exam.exam_id} className="shadow-lg">
                <CardHeader className={`${isPassed ? 'bg-green-50' : 'bg-gray-50'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {exam.exam_title}
                      </CardTitle>
                      <p className="text-sm text-gray-600">{exam.course_title}</p>
                    </div>
                    <Badge className={getStatusColor(latestAttempt.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(latestAttempt.status)}
                        {latestAttempt.status === 'passed' ? 'Đã đạt' : 'Chưa đạt'}
                      </span>
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  {/* Exam Info */}
                  <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Điểm cần đạt</div>
                      <div className="text-lg font-bold text-gray-900">{exam.passing_score}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Thời gian</div>
                      <div className="text-lg font-bold text-gray-900">{exam.time_limit_minutes} phút</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Lượt thi</div>
                      <div className="text-lg font-bold text-gray-900">
                        {exam.attempts.length}/{exam.max_attempts}
                      </div>
                    </div>
                  </div>

                  {/* Attempts History */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 mb-3">Lịch sử các lần thi:</h4>
                    {exam.attempts.map((attempt, idx) => (
                      <div 
                        key={attempt.attempt_id} 
                        className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-center min-w-[60px]">
                            <div className="text-xs text-gray-500">Lần {idx + 1}</div>
                            <div className={`text-2xl font-bold ${
                              attempt.status === 'passed' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {attempt.score}%
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              {new Date(attempt.attempted_at).toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                              <Clock className="h-4 w-4" />
                              Hoàn thành trong {attempt.time_taken_minutes} phút
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/exam-results/${attempt.attempt_id}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Xem chi tiết
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Retry Button if not passed and has attempts left */}
                  {!isPassed && exam.attempts.length < exam.max_attempts && (
                    <div className="mt-4 text-center">
                      <Button
                        onClick={() => navigate(`/exam/${exam.exam_id}`)}
                        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                      >
                        Thi lại ({exam.max_attempts - exam.attempts.length} lần còn lại)
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {examHistory.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Chưa có lịch sử thi
              </h3>
              <p className="text-gray-600 mb-4">
                Bạn chưa hoàn thành bài thi nào
              </p>
              <Button onClick={() => navigate('/courses')}>
                Khám phá khóa học
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ExamHistoryPage;
