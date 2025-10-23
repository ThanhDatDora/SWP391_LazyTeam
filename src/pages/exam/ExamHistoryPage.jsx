import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Award, TrendingUp, Eye } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../hooks/useNavigation';

const ExamHistoryPage = () => {
  const navigate = useNavigation();
  const { state: authState } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      
      // Mock submissions data since we don't have real submissions yet
      const mockSubmissions = [
        {
          submission_id: 1,
          exam: {
            exam_id: 1,
            name: 'Quiz Servlet Cơ bản',
            mooc: {
              title: 'Java Servlet Cơ bản',
              course: {
                title: 'Java Servlet & React Web Dev'
              }
            }
          },
          attempt_no: 1,
          score: 3,
          max_score: 5,
          submitted_at: '2025-01-15T10:30:00.000Z',
          is_best: false
        },
        {
          submission_id: 2,
          exam: {
            exam_id: 1,
            name: 'Quiz Servlet Cơ bản',
            mooc: {
              title: 'Java Servlet Cơ bản',
              course: {
                title: 'Java Servlet & React Web Dev'
              }
            }
          },
          attempt_no: 2,
          score: 4,
          max_score: 5,
          submitted_at: '2025-01-16T14:20:00.000Z',
          is_best: true
        },
        {
          submission_id: 3,
          exam: {
            exam_id: 1,
            name: 'Quiz Servlet Cơ bản',
            mooc: {
              title: 'Java Servlet Cơ bản',
              course: {
                title: 'Java Servlet & React Web Dev'
              }
            }
          },
          attempt_no: 3,
          score: 2,
          max_score: 5,
          submitted_at: '2025-01-17T09:15:00.000Z',
          is_best: false
        }
      ];
      
      setSubmissions(mockSubmissions);
    } catch (err) {
      setError('Không thể tải lịch sử thi');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getScoreColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) {return 'text-green-600';}
    if (percentage >= 60) {return 'text-yellow-600';}
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) {return 'default';}
    if (percentage >= 60) {return 'secondary';}
    return 'destructive';
  };

  const groupSubmissionsByExam = (submissions) => {
    const grouped = {};
    submissions.forEach(sub => {
      const examId = sub.exam.exam_id;
      if (!grouped[examId]) {
        grouped[examId] = {
          exam: sub.exam,
          submissions: [],
          bestScore: 0,
          totalAttempts: 0
        };
      }
      grouped[examId].submissions.push(sub);
      grouped[examId].totalAttempts++;
      if (sub.is_best) {
        grouped[examId].bestScore = sub.score;
      }
    });
    return Object.values(grouped);
  };

  const getOverallStats = (submissions) => {
    if (submissions.length === 0) {return { totalExams: 0, avgScore: 0, bestScores: 0 };}
    
    const examGroups = groupSubmissionsByExam(submissions);
    const bestScores = examGroups.map(group => group.bestScore);
    const avgScore = bestScores.reduce((sum, score) => sum + score, 0) / bestScores.length;
    const passedExams = bestScores.filter(score => score >= 3).length; // Assuming pass mark is 3/5
    
    return {
      totalExams: examGroups.length,
      avgScore: avgScore.toFixed(1),
      passedExams,
      totalAttempts: submissions.length
    };
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải lịch sử thi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadSubmissions}>Thử lại</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = getOverallStats(submissions);
  const examGroups = groupSubmissionsByExam(submissions);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lịch sử thi</h1>
          <p className="text-gray-600 mt-1">Theo dõi kết quả thi và tiến độ học tập</p>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Award className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.totalExams}</p>
                <p className="text-sm text-gray-600">Bài thi đã làm</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.avgScore}</p>
                <p className="text-sm text-gray-600">Điểm trung bình</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Award className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.passedExams}</p>
                <p className="text-sm text-gray-600">Bài thi đạt</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.totalAttempts}</p>
                <p className="text-sm text-gray-600">Tổng lượt thi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exam Results by Course */}
      {examGroups.length > 0 ? (
        <div className="space-y-6">
          {examGroups.map((examGroup) => (
            <Card key={examGroup.exam.exam_id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{examGroup.exam.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {examGroup.exam.mooc?.course?.title} - {examGroup.exam.mooc?.title}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(examGroup.bestScore, 5)}`}>
                      {examGroup.bestScore}/5
                    </div>
                    <p className="text-sm text-gray-600">Điểm cao nhất</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lần thi</TableHead>
                        <TableHead>Thời gian</TableHead>
                        <TableHead>Điểm số</TableHead>
                        <TableHead>Phần trăm</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {examGroup.submissions
                        .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
                        .map((submission) => (
                          <TableRow key={submission.submission_id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                              Lần {submission.attempt_no}
                                {submission.is_best && (
                                  <Badge className="bg-yellow-100 text-yellow-800">
                                  Tốt nhất
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                {formatDate(submission.submitted_at)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={`font-medium ${getScoreColor(submission.score, submission.max_score)}`}>
                                {submission.score}/{submission.max_score}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getScoreBadgeVariant(submission.score, submission.max_score)}>
                                {Math.round((submission.score / submission.max_score) * 100)}%
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                (submission.score / submission.max_score) * 100 >= 60 
                                  ? 'default' : 'destructive'
                              }>
                                {(submission.score / submission.max_score) * 100 >= 60 ? 'Đạt' : 'Chưa đạt'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedSubmission(submission)}
                                className="flex items-center gap-1"
                              >
                                <Eye className="w-4 h-4" />
                              Chi tiết
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Retake exam button */}
                {examGroup.totalAttempts < 3 && (
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      onClick={() => navigate(`/exam/${examGroup.exam.exam_id}`)}
                      className="w-full sm:w-auto"
                    >
                      Thi lại (Lần {examGroup.totalAttempts + 1}/3)
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có lịch sử thi</h3>
            <p className="text-gray-600 mb-4">
              Bạn chưa tham gia bài thi nào. Hãy tham gia một khóa học và làm bài thi đầu tiên!
            </p>
            <Button onClick={() => navigate('/catalog')}>
              Khám phá khóa học
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Chi tiết bài thi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Tên bài thi</label>
                  <p className="font-medium">{selectedSubmission.exam.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Lần thi</label>
                  <p className="font-medium">Lần {selectedSubmission.attempt_no}/3</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Thời gian nộp</label>
                  <p className="font-medium">{formatDate(selectedSubmission.submitted_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Kết quả</label>
                  <p className={`font-medium ${getScoreColor(selectedSubmission.score, selectedSubmission.max_score)}`}>
                    {selectedSubmission.score}/{selectedSubmission.max_score} 
                    ({Math.round((selectedSubmission.score / selectedSubmission.max_score) * 100)}%)
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedSubmission(null)}>
                  Đóng
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ExamHistoryPage;