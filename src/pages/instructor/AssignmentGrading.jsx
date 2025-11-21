import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import { useNavigation } from '@/hooks/useNavigation';
import api from '@/services/api';
import { 
  FileText, 
  Download, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ArrowLeft,
  Save,
  Send,
  Eye,
  User,
  Calendar,
  Award
} from 'lucide-react';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';

const AssignmentGrading = () => {
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const lessonId = searchParams.get('lessonId');
  const navigate = useNavigation();

  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);
  const [lessonInfo, setLessonInfo] = useState(null);

  useEffect(() => {
    if (lessonId) {
      loadSubmissions();
      loadLessonInfo();
    }
  }, [lessonId]);

  const loadLessonInfo = async () => {
    try {
      // Get lesson details
      const response = await fetch(`/api/lessons/${lessonId}`);
      const data = await response.json();
      if (data.success) {
        setLessonInfo(data.data);
      }
    } catch (error) {
      console.error('Error loading lesson info:', error);
    }
  };

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const result = await api.assignments.getSubmissions(lessonId);
      
      if (result.success) {
        setSubmissions(result.data);
        if (result.data.length > 0 && !selectedSubmission) {
          selectSubmission(result.data[0]);
        }
      } else {
        toast.error(result.error || 'Không thể tải danh sách bài nộp');
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast.error('Không thể tải danh sách bài nộp');
    } finally {
      setLoading(false);
    }
  };

  const selectSubmission = (submission) => {
    setSelectedSubmission(submission);
    setScore(submission.score || '');
    setFeedback(submission.feedback || '');
  };

  const handleGrade = async () => {
    if (!selectedSubmission) return;

    // Validate score
    const scoreValue = parseFloat(score);
    if (isNaN(scoreValue) || scoreValue < 0 || scoreValue > 100) {
      toast.error('Điểm phải từ 0 đến 100');
      return;
    }

    if (!feedback || feedback.trim().length < 10) {
      toast.error('Vui lòng nhập nhận xét (ít nhất 10 ký tự)');
      return;
    }

    try {
      setGrading(true);
      const result = await api.assignments.grade(
        selectedSubmission.essay_submission_id,
        scoreValue,
        feedback.trim()
      );

      if (result.success) {
        toast.success('Chấm điểm thành công!');
        await loadSubmissions();
        
        // Update selected submission in the list
        const updatedSubmissions = submissions.map(sub => 
          sub.essay_submission_id === selectedSubmission.essay_submission_id 
            ? { ...sub, score: scoreValue, feedback: feedback.trim(), status: 'graded' }
            : sub
        );
        setSubmissions(updatedSubmissions);
        
        // Move to next ungraded submission
        const nextUngraded = updatedSubmissions.find(s => s.status === 'submitted');
        if (nextUngraded) {
          selectSubmission(nextUngraded);
        }
      } else {
        toast.error(result.error || result.message || 'Không thể chấm điểm');
      }
    } catch (error) {
      console.error('Error grading submission:', error);
      toast.error('Đã xảy ra lỗi khi chấm điểm');
    } finally {
      setGrading(false);
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'graded':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Đã chấm</Badge>;
      case 'submitted':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Chờ chấm</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải bài nộp...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/instructor/courses/${courseId}`)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại khóa học
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chấm điểm Assignment
            </h1>
            <p className="text-gray-600 mt-1">
              {lessonInfo?.title || 'Assignment'} - {submissions.length} bài nộp
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">
              {submissions.filter(s => s.status === 'submitted').length} chưa chấm
            </Badge>
            <Badge variant="default">
              {submissions.filter(s => s.status === 'graded').length} đã chấm
            </Badge>
          </div>
        </div>
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có bài nộp nào
            </h3>
            <p className="text-gray-600">
              Chưa có học viên nào nộp bài assignment này
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submissions List */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Danh sách bài nộp ({submissions.length})
            </h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {submissions.map((submission) => (
                <Card
                  key={submission.essay_submission_id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedSubmission?.essay_submission_id === submission.essay_submission_id
                      ? 'ring-2 ring-teal-500 bg-teal-50'
                      : ''
                  }`}
                  onClick={() => selectSubmission(submission)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-sm">
                          {submission.student_name}
                        </span>
                      </div>
                      {getStatusBadge(submission.status)}
                    </div>

                    <div className="text-xs text-gray-500 mb-2">
                      {submission.student_email}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {formatDate(submission.submitted_at)}
                    </div>

                    {submission.score !== null && (
                      <div className={`mt-2 text-sm font-bold ${getScoreColor(submission.score)}`}>
                        Điểm: {submission.score}/100
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Grading Panel */}
          <div className="lg:col-span-2">
            {selectedSubmission ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5" />
                      <div>
                        <div className="text-lg">{selectedSubmission.student_name}</div>
                        <div className="text-sm font-normal text-gray-500">
                          {selectedSubmission.student_email}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(selectedSubmission.status)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Submission Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Thời gian nộp:</span>
                        <div className="font-medium">
                          {formatDate(selectedSubmission.submitted_at)}
                        </div>
                      </div>
                      {selectedSubmission.graded_at && (
                        <div>
                          <span className="text-gray-600">Thời gian chấm:</span>
                          <div className="font-medium">
                            {formatDate(selectedSubmission.graded_at)}
                          </div>
                        </div>
                      )}
                      {selectedSubmission.grader_name && (
                        <div>
                          <span className="text-gray-600">Người chấm:</span>
                          <div className="font-medium">
                            {selectedSubmission.grader_name}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Student's Submission */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Bài làm của học viên
                    </h4>

                    {selectedSubmission.content_text && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
                        <div className="text-gray-700 whitespace-pre-wrap">
                          {selectedSubmission.content_text}
                        </div>
                      </div>
                    )}

                    {selectedSubmission.file_url && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(selectedSubmission.file_url, '_blank')}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Tải file đính kèm
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(selectedSubmission.file_url, '_blank')}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Xem file
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Grading Section */}
                  <div className="border-t pt-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Chấm điểm
                    </h4>

                    <div className="space-y-4">
                      {/* Score Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Điểm số (0-100) <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          value={score}
                          onChange={(e) => setScore(e.target.value)}
                          placeholder="Nhập điểm (0-100)"
                          className="max-w-xs"
                          disabled={grading}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Nhập điểm từ 0 đến 100
                        </p>
                      </div>

                      {/* Feedback Textarea */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nhận xét <span className="text-red-500">*</span>
                        </label>
                        <Textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Nhập nhận xét chi tiết cho học viên..."
                          rows={6}
                          disabled={grading}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Nhận xét giúp học viên hiểu rõ hơn về bài làm của mình
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <Button
                          onClick={handleGrade}
                          disabled={grading || !score || !feedback}
                          className="flex-1"
                        >
                          {grading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              Đang lưu...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Chấm điểm và gửi kết quả
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setScore('');
                            setFeedback('');
                          }}
                          disabled={grading}
                        >
                          Làm mới
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Previous Feedback (if already graded) */}
                  {selectedSubmission.status === 'graded' && selectedSubmission.feedback && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <h5 className="font-medium text-blue-900 mb-1">
                            Bài làm đã được chấm điểm
                          </h5>
                          <p className="text-sm text-blue-700">
                            Bạn có thể cập nhật điểm và nhận xét mới nếu cần
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Chọn bài nộp để chấm điểm
                  </h3>
                  <p className="text-gray-600">
                    Chọn một bài nộp từ danh sách bên trái
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentGrading;
