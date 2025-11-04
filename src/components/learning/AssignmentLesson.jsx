import React from 'react';
import { FileText, Upload, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';

/**
 * Assignment Lesson Component
 * For homework and project submissions
 */
const AssignmentLesson = ({ lesson, onComplete }) => {
  const [assignmentData, setAssignmentData] = React.useState(null);
  const [parseError, setParseError] = React.useState(false);
  const [file, setFile] = React.useState(null);
  const [submissionText, setSubmissionText] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    // Check if content_url is null or invalid
    if (!lesson.content_url || lesson.content_url === 'null' || lesson.content_url === 'N/A') {
      console.warn('⚠️ Assignment has no content_url:', lesson);
      setParseError(true);
      return;
    }

    try {
      const parsed = JSON.parse(lesson.content_url);
      setAssignmentData(parsed);
    } catch (error) {
      console.error('Failed to parse assignment data:', error);
      setParseError(true);
    }
  }, [lesson.content_url]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!submissionText.trim() && !file) {
      toast.error('Vui lòng nhập nội dung hoặc upload file!');
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.assignments.submit(
        lesson.lesson_id,
        submissionText,
        file
      );

      if (response.success) {
        setSubmitted(true);
        toast.success('Nộp bài thành công!');

        // Mark as complete
        if (onComplete && !lesson.completed) {
          setTimeout(() => {
            onComplete();
          }, 1000);
        }
      } else {
        throw new Error(response.error || 'Submission failed');
      }
    } catch (error) {
      console.error('❌ Submission error:', error);
      toast.error('Nộp bài thất bại. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  // Error UI if no valid assignment data
  if (parseError || !assignmentData) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-yellow-50">
        <div className="text-center p-8">
          <div className="w-20 h-20 rounded-full bg-orange-100 mx-auto mb-4 flex items-center justify-center">
            <FileText className="h-10 w-10 text-orange-600" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">Bài tập chưa có nội dung</h3>
          <p className="text-gray-600 mb-4">Bài tập này đang trong quá trình cập nhật</p>
          <p className="text-xs text-gray-500 font-mono bg-gray-100 p-3 rounded inline-block">
            content_url: {lesson.content_url || 'null'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      {/* Header */}
      <div className="bg-white border-b px-8 py-6 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Bài tập</p>
              <h1 className="text-2xl font-bold text-gray-900">{assignmentData.title || lesson.title}</h1>
            </div>
          </div>

          {lesson.completed && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Đã nộp bài</span>
            </div>
          )}

          {assignmentData.deadline && (
            <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-4 py-2 rounded-lg mt-3">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">
                Hạn nộp: {new Date(assignmentData.deadline).toLocaleDateString('vi-VN')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Description */}
          {assignmentData.description && (
            <Card className="shadow-md">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Mô tả bài tập</h3>
                <p className="text-gray-700">{assignmentData.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          {assignmentData.instructions && (
            <Card className="shadow-md">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hướng dẫn chi tiết</h3>
                <div 
                  className="prose prose-sm max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: assignmentData.instructions }}
                />
              </CardContent>
            </Card>
          )}

          {/* Max Score */}
          {assignmentData.maxScore && (
            <Card className="shadow-md bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Điểm tối đa</p>
                    <p className="text-lg font-bold text-blue-700">{assignmentData.maxScore} điểm</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submission Form */}
          {!submitted && !lesson.completed && (
            <Card className="shadow-lg border-2 border-orange-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Nộp bài làm</h3>

                {/* Text Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung bài làm
                  </label>
                  <textarea
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    placeholder="Nhập nội dung bài làm hoặc link đến project của bạn..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* File Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload file (không bắt buộc)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors">
                        <Upload className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {file ? file.name : 'Chọn file để upload'}
                        </span>
                      </div>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.zip,.rar,.jpg,.png"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Hỗ trợ: PDF, Word, ZIP, RAR, JPG, PNG (Max 10MB)
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={(!submissionText.trim() && !file) || submitting}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-3"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang nộp bài...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Nộp bài
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Success Message */}
          {submitted && (
            <Card className="shadow-lg border-2 border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 mx-auto mb-4 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-900 mb-2">Nộp bài thành công!</h3>
                  <p className="text-green-700">
                    Bài làm của bạn đã được gửi. Giảng viên sẽ chấm điểm và phản hồi sớm nhất.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentLesson;
