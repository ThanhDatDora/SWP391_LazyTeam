import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import {
  ArrowLeft,
  FileText,
  Download,
  User,
  Calendar,
  CheckCircle,
  AlertCircle,
  Save,
  Clock
} from 'lucide-react';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';

/**
 * Assignment Grading Page for Instructors
 * View student submissions and provide grades + feedback
 */
const AssignmentGradingPage = () => {
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const lessonId = searchParams.get('lessonId');
  const submissionId = searchParams.get('submissionId');

  const [lesson, setLesson] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (lessonId) {
      loadSubmissions();
    }
  }, [lessonId]);

  useEffect(() => {
    if (submissionId && submissions.length > 0) {
      const submission = submissions.find(s => s.essay_submission_id.toString() === submissionId);
      if (submission) {
        selectSubmission(submission);
      }
    } else if (submissions.length > 0) {
      // Auto-select first pending submission
      const pending = submissions.find(s => s.status === 'pending');
      if (pending) {
        selectSubmission(pending);
      } else {
        selectSubmission(submissions[0]);
      }
    }
  }, [submissionId, submissions]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);

      // Load lesson info
      const lessonResponse = await fetch(`/api/assignments/lesson-info/${lessonId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const lessonData = await lessonResponse.json();
      if (lessonData.success) {
        setLesson(lessonData.data);
      }

      // Load all submissions for this lesson
      const submissionsResponse = await fetch(`/api/assignments/lesson/${lessonId}/submissions`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const submissionsData = await submissionsResponse.json();
      
      if (submissionsData.success) {
        setSubmissions(submissionsData.data || []);
      }

    } catch (error) {
      console.error('❌ Error loading submissions:', error);
      toast.error('Không thể tải danh sách bài nộp');
    } finally {
      setLoading(false);
    }
  };

  const selectSubmission = (submission) => {
    setCurrentSubmission(submission);
    setScore(submission.score?.toString() || '');
    setFeedback(submission.feedback || '');
  };

  const handleSaveGrade = async () => {
    if (!currentSubmission) return;

    // Validate score
    const scoreNum = parseFloat(score);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      toast.error('Điểm phải từ 0 đến 100');
      return;
    }

    if (!feedback.trim()) {
      toast.error('Vui lòng nhập nhận xét');
      return;
    }

    try {
      setSaving(true);

      const response = await api.assignments.grade(
        currentSubmission.essay_submission_id,
        scoreNum,
        feedback
      );

      if (response.success) {
        toast.success('✅ Chấm điểm thành công!');
        
        // Reload submissions to update status
        await loadSubmissions();
        
        // Move to next pending submission if exists
        const nextPending = submissions.find(
          s => s.status === 'pending' && s.essay_submission_id !== currentSubmission.essay_submission_id
        );
        if (nextPending) {
          selectSubmission(nextPending);
        }
      } else {
        throw new Error(response.error || 'Failed to save grade');
      }

    } catch (error) {
      console.error('❌ Error saving grade:', error);
      toast.error('Không thể lưu điểm. Vui lòng thử lại!');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning" className="bg-yellow-100 text-yellow-800">Chưa chấm</Badge>;
      case 'graded':
        return <Badge variant="success" className="bg-green-100 text-green-800">Đã chấm</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(`/instructor/courses/${courseId}`)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Chấm điểm bài tập</h1>
              <p className="text-gray-600">{lesson?.title || 'Assignment'}</p>
            </div>
            <Badge variant="secondary">
              {submissions.filter(s => s.status === 'pending').length} / {submissions.length} chưa chấm
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left: Submissions List */}
          <div className="col-span-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Danh sách bài nộp</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {submissions.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>Chưa có bài nộp nào</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {submissions.map((submission) => (
                      <div
                        key={submission.essay_submission_id}
                        onClick={() => selectSubmission(submission)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          currentSubmission?.essay_submission_id === submission.essay_submission_id
                            ? 'bg-orange-50 border-l-4 border-l-orange-600'
                            : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-sm">{submission.student_name}</span>
                          </div>
                          {getStatusBadge(submission.status)}
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {formatDate(submission.submitted_at)}
                        </div>

                        {submission.score !== null && (
                          <div className="mt-2">
                            <span className="text-sm font-bold text-green-600">
                              Điểm: {submission.score}/100
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Submission Details & Grading */}
          <div className="col-span-8 space-y-6">
            {!currentSubmission ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Chọn một bài nộp để chấm điểm
                  </h3>
                  <p className="text-gray-600">
                    Click vào bài nộp bên trái để xem chi tiết
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Student Info */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Thông tin học viên</CardTitle>
                      {getStatusBadge(currentSubmission.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Họ tên</p>
                        <p className="font-medium">{currentSubmission.student_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Email</p>
                        <p className="font-medium">{currentSubmission.student_email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Thời gian nộp</p>
                        <p className="font-medium">{formatDate(currentSubmission.submitted_at)}</p>
                      </div>
                      {currentSubmission.graded_at && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Thời gian chấm</p>
                          <p className="font-medium">{formatDate(currentSubmission.graded_at)}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Submission Content */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Nội dung bài làm</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentSubmission.content_text ? (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="whitespace-pre-wrap text-gray-800">
                          {currentSubmission.content_text}
                        </p>
                      </div>
                    ) : (
                      <div className="text-gray-500 italic mb-4">
                        (Không có nội dung văn bản)
                      </div>
                    )}

                    {currentSubmission.file_url && (
                      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900">File đính kèm</p>
                          <p className="text-xs text-blue-700">{currentSubmission.file_url}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(currentSubmission.file_url, '_blank')}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Tải xuống
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Grading Form */}
                <Card className="border-2 border-orange-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-orange-600" />
                      Chấm điểm
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Score Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Điểm số (0-100)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        placeholder="Nhập điểm..."
                        className="text-lg font-semibold"
                        disabled={currentSubmission.status === 'graded'}
                      />
                    </div>

                    {/* Feedback */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nhận xét
                      </label>
                      <Textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Nhập nhận xét cho học viên..."
                        rows={6}
                        className="resize-none"
                        disabled={currentSubmission.status === 'graded'}
                      />
                    </div>

                    {/* Save Button */}
                    {currentSubmission.status === 'pending' ? (
                      <Button
                        onClick={handleSaveGrade}
                        disabled={!score || !feedback.trim() || saving}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                        size="lg"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Đang lưu...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Lưu điểm
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="text-green-800 font-medium">
                          Bài này đã được chấm điểm
                        </p>
                        <p className="text-sm text-green-600 mt-1">
                          Điểm: {currentSubmission.score}/100
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentGradingPage;
