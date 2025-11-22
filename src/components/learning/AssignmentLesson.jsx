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
  const [existingSubmission, setExistingSubmission] = React.useState(null);
  const [loadingSubmission, setLoadingSubmission] = React.useState(true);
  const [showResubmitForm, setShowResubmitForm] = React.useState(false);

  React.useEffect(() => {
    // Check if content_url is null or invalid
    if (!lesson.content_url || lesson.content_url === 'null' || lesson.content_url === 'N/A') {
      console.warn('⚠️ Assignment has no content_url:', lesson);
      setParseError(true);
      setLoadingSubmission(false);
      return;
    }

    try {
      const parsed = JSON.parse(lesson.content_url);
      setAssignmentData(parsed);
      loadExistingSubmission();
    } catch (error) {
      console.error('Failed to parse assignment data:', error);
      setParseError(true);
      setLoadingSubmission(false);
    }
  }, [lesson.content_url, lesson.lesson_id]);

  const loadExistingSubmission = async () => {
    try {
      setLoadingSubmission(true);
      const result = await api.assignments.getSubmission(lesson.lesson_id);
      console.log('📥 Loaded submission:', result.data);
      if (result.success && result.data) {
        setExistingSubmission(result.data);
        setSubmitted(true);
        setSubmissionText(result.data.content_text || '');
      } else {
        // No existing submission
        setExistingSubmission(null);
        setSubmitted(false);
      }
    } catch (error) {
      console.error('Error loading submission:', error);
    } finally {
      setLoadingSubmission(false);
    }
  };

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
        setShowResubmitForm(false); // Hide form after successful submit
        toast.success('Nộp bài thành công!');
        
        // Reload submission to get latest data
        await loadExistingSubmission();

        // NOTE: Do NOT mark assignment as complete here
        // Assignment should only be completed when instructor grades it
        // The backend will auto-complete when grading happens
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
          {(showResubmitForm || (!submitted && !existingSubmission)) && (
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
                <div className="space-y-2">
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
                        {existingSubmission ? 'Nộp lại bài' : 'Nộp bài'}
                      </>
                    )}
                  </Button>
                  
                  {/* Cancel button when resubmitting */}
                  {showResubmitForm && existingSubmission && (
                    <Button
                      onClick={() => {
                        setShowResubmitForm(false);
                        setSubmitted(true);
                        setSubmissionText(existingSubmission.content_text || '');
                        setFile(null);
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Hủy
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Grading Result & Resubmit */}
          {existingSubmission && !showResubmitForm && (
            <Card className={`shadow-lg border-2 ${
              existingSubmission.score !== null 
                ? existingSubmission.score >= 50 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-red-200 bg-red-50'
                : 'border-yellow-200 bg-yellow-50'
            }`}>
              <CardContent className="p-6">
                {existingSubmission.score !== null ? (
                  <>
                    {/* Graded */}
                    <div className="text-center mb-4">
                      <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                        existingSubmission.score >= 50 ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {existingSubmission.score >= 50 ? (
                          <CheckCircle className="h-10 w-10 text-green-600" />
                        ) : (
                          <AlertCircle className="h-10 w-10 text-red-600" />
                        )}
                      </div>
                      <h3 className={`text-2xl font-bold mb-2 ${
                        existingSubmission.score >= 50 ? 'text-green-900' : 'text-red-900'
                      }`}>
                        Điểm: {existingSubmission.score}/100
                      </h3>
                      <p className={`font-medium ${
                        existingSubmission.score >= 50 ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {existingSubmission.score >= 50 ? 'Đã hoàn thành!' : 'Chưa đạt yêu cầu'}
                      </p>
                    </div>

                    {/* Feedback */}
                    {existingSubmission.feedback && (
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Nhận xét của giảng viên:</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{existingSubmission.feedback}</p>
                      </div>
                    )}

                    {/* Grader Info */}
                    {existingSubmission.grader_name && (
                      <p className="text-sm text-gray-600 text-center mb-4">
                        Chấm bởi: {existingSubmission.grader_name} - {new Date(existingSubmission.graded_at).toLocaleString('vi-VN')}
                      </p>
                    )}

                    {/* Previous Submission Content */}
                    <div className="bg-white rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Nội dung bài làm của bạn:</h4>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {existingSubmission.content_text || 'Không có nội dung văn bản'}
                      </p>
                      {existingSubmission.file_url && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm text-gray-600 mb-2">File đính kèm:</p>
                          <a
                            href={`http://localhost:3001${existingSubmission.file_url}`}
                            download
                            className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                          >
                            <FileText className="w-4 h-4" />
                            {existingSubmission.file_name || 'Tải file đã nộp'}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Resubmit/Improve Buttons */}
                    <div className="mt-4 space-y-2">
                      <Button
                        onClick={() => {
                          setShowResubmitForm(true);
                          setSubmitted(false);
                          setSubmissionText(existingSubmission.content_text || '');
                        }}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                      >
                        {existingSubmission.score < 50 ? 'Làm lại để cải thiện điểm' : 'Nộp lại để cải thiện điểm'}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Waiting for grading */}
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-yellow-100 mx-auto mb-4 flex items-center justify-center">
                        <Clock className="h-8 w-8 text-yellow-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-yellow-900 mb-2">Đang chờ chấm điểm</h3>
                      <p className="text-yellow-700 mb-4">
                        Bài làm của bạn đã được gửi. Giảng viên sẽ chấm điểm và phản hồi sớm nhất.
                      </p>
                      {existingSubmission.submitted_at && (
                        <p className="text-sm text-gray-600">
                          Nộp lúc: {new Date(existingSubmission.submitted_at).toLocaleString('vi-VN')}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentLesson;
