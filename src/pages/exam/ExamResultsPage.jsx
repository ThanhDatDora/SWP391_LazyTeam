import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Award, ArrowLeft, CheckCircle, XCircle, Clock, Calendar,
  TrendingUp, Target, FileText
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

const ExamResultsPage = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    loadExamResult();
  }, [attemptId]);

  const loadExamResult = async () => {
    try {
      setLoading(true);
      
      // Mock data - Replace with real API call
      const mockResult = {
        attempt_id: parseInt(attemptId),
        exam: {
          exam_id: 1,
          title: 'Final Exam: Java Servlet & React',
          course_title: 'Java Servlet & React Web Development',
          passing_score: 80,
          time_limit_minutes: 60
        },
        score: 85,
        status: 'passed',
        attempted_at: '2025-10-22T10:15:00Z',
        time_taken_minutes: 52,
        total_points: 100,
        earned_points: 85,
        total_questions: 6,
        answered_questions: 6,
        questions: [
          {
            question_id: 1,
            question_text: 'Giải thích vòng đời của Servlet (init, service, destroy)',
            points: 20,
            earned_points: 18,
            answer: 'Servlet lifecycle bao gồm 3 giai đoạn chính:\n\n1. init(): Được gọi một lần khi servlet được khởi tạo, dùng để initialize resources.\n\n2. service(): Được gọi mỗi khi có request, xử lý logic chính của servlet.\n\n3. destroy(): Được gọi khi servlet bị hủy, dùng để cleanup resources.',
            feedback: 'Câu trả lời tốt, đã giải thích đầy đủ 3 giai đoạn'
          },
          {
            question_id: 2,
            question_text: 'So sánh GET và POST method, cho ví dụ khi nào nên dùng mỗi loại',
            points: 15,
            earned_points: 15,
            answer: 'GET: Dùng để lấy dữ liệu, parameters trong URL, có thể cache, bookmark. VD: tìm kiếm, lọc sản phẩm.\n\nPOST: Dùng để gửi dữ liệu nhạy cảm, không giới hạn size, không cache. VD: login, đăng ký, upload file.',
            feedback: 'Xuất sắc! So sánh rõ ràng với ví dụ thực tế'
          },
          {
            question_id: 3,
            question_text: 'Session và Cookie khác nhau như thế nào?',
            points: 15,
            earned_points: 12,
            answer: 'Session lưu ở server, an toàn hơn. Cookie lưu ở client, có thể bị đánh cắp. Session có thể lưu nhiều data hơn.',
            feedback: 'Đúng nhưng thiếu chi tiết về lifecycle và use cases'
          },
          {
            question_id: 4,
            question_text: 'Làm thế nào để tích hợp React frontend với Java Servlet backend?',
            points: 20,
            earned_points: 18,
            answer: 'Dùng REST API để giao tiếp giữa React và Servlet. React gọi API bằng fetch/axios, Servlet trả về JSON. Cần config CORS để cho phép cross-origin requests.',
            feedback: 'Câu trả lời tốt, đã đề cập đến CORS'
          },
          {
            question_id: 5,
            question_text: 'Giải thích CORS và cách configure trong Servlet Filter',
            points: 15,
            earned_points: 12,
            answer: 'CORS là Cross-Origin Resource Sharing, cho phép frontend từ domain khác gọi API. Configure bằng cách thêm headers trong Filter: Access-Control-Allow-Origin, Access-Control-Allow-Methods.',
            feedback: 'Đúng nhưng thiếu ví dụ code cụ thể'
          },
          {
            question_id: 6,
            question_text: 'Liệt kê các best practices khi xây dựng REST API với Java Servlet',
            points: 15,
            earned_points: 10,
            answer: 'Use proper HTTP methods (GET, POST, PUT, DELETE), return JSON, handle errors properly, validate input.',
            feedback: 'Cần thêm về security, authentication, versioning'
          }
        ]
      };

      setResult(mockResult);
    } catch (error) {
      console.error('Failed to load exam result:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải kết quả...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy kết quả</h2>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPassed = result.status === 'passed';

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>

        {/* Result Header */}
        <Card className="shadow-2xl mb-6">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              {isPassed ? (
                <>
                  <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Award className="w-16 h-16 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-3">
                    🎓 Chúc mừng! Đã đạt
                  </h1>
                </>
              ) : (
                <>
                  <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Target className="w-16 h-16 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-3">
                    Chưa đạt yêu cầu
                  </h1>
                </>
              )}
              
              <h2 className="text-2xl font-bold text-gray-700 mb-2">
                {result.exam.title}
              </h2>
              <p className="text-gray-600">{result.exam.course_title}</p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {result.score}%
                </div>
                <div className="text-sm text-gray-600">Điểm số</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {result.earned_points}
                </div>
                <div className="text-sm text-gray-600">Điểm đạt được</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {result.answered_questions}/{result.total_questions}
                </div>
                <div className="text-sm text-gray-600">Câu trả lời</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-3xl font-bold text-orange-600">
                  {result.time_taken_minutes}
                </div>
                <div className="text-sm text-gray-600">Phút</div>
              </div>
            </div>

            {/* Attempt Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                Thi vào: {new Date(result.attempted_at).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                Thời gian: {result.time_taken_minutes}/{result.exam.time_limit_minutes} phút
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Answers */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">📝 Chi tiết câu trả lời</h3>
          
          {result.questions.map((question, idx) => {
            const percentage = (question.earned_points / question.points) * 100;
            
            return (
              <Card key={question.question_id} className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg flex-1">
                      <Badge className="mr-2 bg-orange-600">Câu {idx + 1}</Badge>
                      {question.question_text}
                    </CardTitle>
                    <div className="text-right">
                      <Badge variant={percentage >= 70 ? 'default' : 'secondary'}>
                        {question.earned_points}/{question.points} điểm
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  {/* Answer */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Câu trả lời của bạn:</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-800 whitespace-pre-wrap">{question.answer}</p>
                    </div>
                  </div>

                  {/* Feedback */}
                  {question.feedback && (
                    <div className={`p-4 rounded-lg ${
                      percentage >= 70 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
                    }`}>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        {percentage >= 70 ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-yellow-600" />
                        )}
                        Nhận xét:
                      </h4>
                      <p className={percentage >= 70 ? 'text-green-800' : 'text-yellow-800'}>
                        {question.feedback}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-4 justify-center">
          <Button
            onClick={() => navigate('/exam-history')}
            variant="outline"
          >
            <FileText className="mr-2 h-4 w-4" />
            Xem lịch sử thi
          </Button>
          
          {!isPassed && (
            <Button
              onClick={() => navigate(`/exam/${result.exam.exam_id}`)}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              Thi lại
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamResultsPage;
