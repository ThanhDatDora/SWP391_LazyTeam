import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import InstructorLayout from '../../components/layout/InstructorLayout';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { 
  ArrowLeft, 
  Save, 
  Send, 
  User, 
  Calendar, 
  FileText,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Download
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const BACKEND_URL = API_BASE_URL.replace('/api', ''); // Remove /api suffix for file URLs

const SubmissionDetail = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToast();

  const [submission, setSubmission] = useState(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);

  console.log('🔍 SubmissionDetail mounted - submissionId:', submissionId);

  useEffect(() => {
    if (submissionId) {
      loadSubmissionDetail();
    } else {
      console.error('❌ No submissionId provided');
      showError('Không có ID bài nộp');
      navigate('/instructor/dashboard?tab=submissions');
    }
  }, [submissionId]);

  const loadSubmissionDetail = async () => {
    try {
      setLoading(true);
      console.log('📡 Loading submission detail for ID:', submissionId);
      
      const result = await api.assignments.getSubmissionDetail(submissionId);
      
      console.log('📦 API Response:', result);
      
      if (result.success) {
        const data = result.data;
        console.log('✅ Submission loaded:', data);
        setSubmission(data);
        setScore(data.score || '');
        setFeedback(data.feedback || '');
      } else {
        console.error('❌ API returned error:', result.error);
        showError(result.error || 'Không thể tải chi tiết bài nộp');
        navigate('/instructor/dashboard?tab=submissions');
      }
    } catch (error) {
      console.error('❌ Error loading submission:', error);
      showError('Có lỗi xảy ra khi tải dữ liệu');
      navigate('/instructor/dashboard?tab=submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitGrade = async () => {
    if (!score || score < 0 || score > 100) {
      showError('Điểm phải từ 0 đến 100');
      return;
    }

    try {
      setGrading(true);
      const result = await api.assignments.gradeSubmission(submissionId, {
        score: parseFloat(score),
        feedback: feedback,
        status: 'graded'
      });

      if (result.success) {
        showSuccess('Chấm điểm thành công!');
        loadSubmissionDetail(); // Reload to see updated data
      } else {
        showError(result.error || 'Không thể chấm điểm');
      }
    } catch (error) {
      console.error('Error grading submission:', error);
      showError('Có lỗi xảy ra khi chấm điểm');
    } finally {
      setGrading(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setGrading(true);
      const result = await api.assignments.gradeSubmission(submissionId, {
        score: score ? parseFloat(score) : null,
        feedback: feedback,
        status: submission?.status || 'pending'
      });

      if (result.success) {
        showSuccess('Đã lưu nháp');
        loadSubmissionDetail();
      } else {
        showError('Không thể lưu');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      showError('Có lỗi xảy ra');
    } finally {
      setGrading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <InstructorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </InstructorLayout>
    );
  }

  if (!submission) {
    return (
      <InstructorLayout>
        <div className="text-center py-8">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Không tìm thấy bài nộp</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate('/instructor/dashboard?tab=submissions')}
          >
            Quay lại
          </Button>
        </div>
      </InstructorLayout>
    );
  }

  const isGraded = submission.status === 'graded' || submission.score !== null;

  return (
    <InstructorLayout>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/instructor/dashboard?tab=submissions')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isGraded ? 'Xem chi tiết bài thi' : 'Chấm điểm bài thi'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {submission.lesson_title} - {submission.course_title}
              </p>
            </div>
          </div>
          <Badge variant={isGraded ? 'default' : 'secondary'}>
            {isGraded ? 'Đã chấm' : 'Chưa chấm'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Student Info & Submission */}
          <div className="lg:col-span-2 space-y-6">
            {/* Student Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Thông tin học viên
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Họ tên</p>
                    <p className="font-medium">{submission.student_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{submission.student_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Thời gian nộp</p>
                    <p className="font-medium flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(submission.submitted_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Trạng thái</p>
                    <Badge variant={isGraded ? 'default' : 'secondary'}>
                      {isGraded ? 'Đã chấm' : 'Chờ chấm'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submission Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Bài làm của học viên
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap text-gray-800">
                    {submission.submission_text || 'Không có nội dung'}
                  </p>
                </div>
                
                {submission.file_url && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">File đính kèm:</p>
                    <a 
                      href={`${BACKEND_URL}${submission.file_url}`}
                      download
                      className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>{submission.file_name || 'Tải xuống file'}</span>
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Grading Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Chấm điểm
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Điểm (0-100)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="Nhập điểm"
                    disabled={grading}
                  />
                  {score && (
                    <p className="text-xs text-gray-500 mt-1">
                      {score >= 80 ? '🎉 Xuất sắc' : 
                       score >= 70 ? '👍 Tốt' :
                       score >= 50 ? '📚 Đạt' : '⚠️ Chưa đạt'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Nhận xét
                  </label>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Nhập nhận xét cho học viên..."
                    rows={6}
                    disabled={grading}
                  />
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={handleSubmitGrade}
                    disabled={grading || !score}
                    className="w-full"
                  >
                    {grading ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Gửi điểm
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleSaveDraft}
                    disabled={grading}
                    variant="outline"
                    className="w-full"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Lưu nháp
                  </Button>
                </div>

                {isGraded && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-700 mb-2">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Đã chấm điểm</span>
                    </div>
                    <p className="text-sm text-green-600">
                      Điểm: <strong>{submission.score}/100</strong>
                    </p>
                    {submission.feedback && (
                      <p className="text-sm text-gray-600 mt-2">
                        Nhận xét: {submission.feedback}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </InstructorLayout>
  );
};

export default SubmissionDetail;
