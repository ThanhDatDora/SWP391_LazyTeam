import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  ArrowLeft, 
  Save, 
  X,
  HelpCircle,
  BarChart3
} from 'lucide-react';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import { useNavigation } from '@/hooks/useNavigation';

const QuestionBank = () => {
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const moocId = searchParams.get('moocId');
  const moocTitle = searchParams.get('moocTitle');
  const navigate = useNavigation();

  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    stem: '',
    qtype: 'mcq',
    difficulty: 'medium',
    max_score: 1.0,
    options: [
      { label: 'A', content: '', is_correct: false },
      { label: 'B', content: '', is_correct: false },
      { label: 'C', content: '', is_correct: false },
      { label: 'D', content: '', is_correct: false }
    ]
  });

  useEffect(() => {
    if (moocId) {
      loadQuestions();
      loadStats();
    }
  }, [moocId]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const result = await api.questionBank.getQuestionsByMooc(moocId);
      if (result.success) {
        setQuestions(result.data);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      toast.error('Không thể tải danh sách câu hỏi');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await api.questionBank.getQuestionStats(moocId);
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleCreateNew = () => {
    setEditingQuestion(null);
    setFormData({
      stem: '',
      qtype: 'mcq',
      difficulty: 'medium',
      max_score: 1.0,
      options: [
        { label: 'A', content: '', is_correct: false },
        { label: 'B', content: '', is_correct: false },
        { label: 'C', content: '', is_correct: false },
        { label: 'D', content: '', is_correct: false }
      ]
    });
    setShowForm(true);
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      stem: question.stem,
      qtype: question.qtype,
      difficulty: question.difficulty,
      max_score: question.max_score,
      options: question.options.map(opt => ({
        label: opt.label,
        content: opt.content,
        is_correct: opt.is_correct
      }))
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    // Validation
    if (!formData.stem.trim()) {
      toast.error('Vui lòng nhập nội dung câu hỏi');
      return;
    }

    const filledOptions = formData.options.filter(opt => opt.content.trim());
    if (filledOptions.length < 2) {
      toast.error('Cần ít nhất 2 đáp án');
      return;
    }

    const hasCorrect = filledOptions.some(opt => opt.is_correct);
    if (!hasCorrect) {
      toast.error('Phải có ít nhất 1 đáp án đúng');
      return;
    }

    try {
      const questionData = {
        mooc_id: parseInt(moocId),
        stem: formData.stem.trim(),
        qtype: formData.qtype,
        difficulty: formData.difficulty,
        max_score: parseFloat(formData.max_score),
        options: filledOptions
      };

      let result;
      if (editingQuestion) {
        result = await api.questionBank.updateQuestion(editingQuestion.question_id, questionData);
      } else {
        result = await api.questionBank.createQuestion(questionData);
      }

      if (result.success) {
        toast.success(editingQuestion ? 'Cập nhật câu hỏi thành công!' : 'Tạo câu hỏi mới thành công!');
        setShowForm(false);
        loadQuestions();
        loadStats();
      } else {
        toast.error(result.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error('Không thể lưu câu hỏi');
    }
  };

  const handleDelete = async (questionId) => {
    if (!confirm('Bạn có chắc muốn xóa câu hỏi này?')) return;

    try {
      const result = await api.questionBank.deleteQuestion(questionId);
      if (result.success) {
        toast.success('Xóa câu hỏi thành công!');
        loadQuestions();
        loadStats();
      } else {
        toast.error(result.error || 'Không thể xóa câu hỏi');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Có lỗi xảy ra');
    }
  };

  const updateOption = (index, field, value) => {
    const newOptions = [...formData.options];
    newOptions[index][field] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const toggleCorrectAnswer = (index) => {
    const newOptions = formData.options.map((opt, i) => ({
      ...opt,
      is_correct: i === index ? !opt.is_correct : opt.is_correct
    }));
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    const nextLabel = String.fromCharCode(65 + formData.options.length); // A, B, C, D, E...
    setFormData({
      ...formData,
      options: [...formData.options, { label: nextLabel, content: '', is_correct: false }]
    });
  };

  const removeOption = (index) => {
    if (formData.options.length <= 2) {
      toast.error('Phải có ít nhất 2 đáp án');
      return;
    }
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  const getDifficultyBadge = (difficulty) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800'
    };
    const labels = {
      easy: 'Dễ',
      medium: 'Trung bình',
      hard: 'Khó'
    };
    return (
      <Badge className={colors[difficulty] || colors.medium}>
        {labels[difficulty] || difficulty}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải câu hỏi...</p>
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
              Ngân hàng câu hỏi
            </h1>
            <p className="text-gray-600 mt-1">{moocTitle}</p>
          </div>
          <Button onClick={handleCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            Tạo câu hỏi mới
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600">{stats.total_questions || 0}</div>
                <div className="text-sm text-gray-600">Tổng câu hỏi</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-green-600">{stats.easy_count || 0}</div>
                <div className="text-sm text-gray-600">Dễ</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-yellow-600">{stats.medium_count || 0}</div>
                <div className="text-sm text-gray-600">Trung bình</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-red-600">{stats.hard_count || 0}</div>
                <div className="text-sm text-gray-600">Khó</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question Form Modal */}
      {showForm && (
        <Card className="mb-6 border-2 border-teal-500">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{editingQuestion ? 'Chỉnh sửa câu hỏi' : 'Tạo câu hỏi mới'}</span>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Question Text */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Nội dung câu hỏi <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={formData.stem}
                onChange={(e) => setFormData({ ...formData, stem: e.target.value })}
                placeholder="Nhập nội dung câu hỏi..."
                rows={3}
              />
            </div>

            {/* Question Type & Difficulty */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Loại câu hỏi</label>
                <select
                  value={formData.qtype}
                  onChange={(e) => setFormData({ ...formData, qtype: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="mcq">Trắc nghiệm</option>
                  <option value="tf">Đúng/Sai</option>
                  <option value="essay">Tự luận</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Độ khó</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="easy">Dễ</option>
                  <option value="medium">Trung bình</option>
                  <option value="hard">Khó</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Điểm tối đa</label>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.max_score}
                  onChange={(e) => setFormData({ ...formData, max_score: e.target.value })}
                />
              </div>
            </div>

            {/* Options */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium">
                  Đáp án <span className="text-red-500">*</span>
                </label>
                <Button variant="outline" size="sm" onClick={addOption}>
                  <Plus className="w-3 h-3 mr-1" />
                  Thêm đáp án
                </Button>
              </div>

              <div className="space-y-2">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="checkbox"
                        checked={option.is_correct}
                        onChange={() => toggleCorrectAnswer(index)}
                        className="mt-2 h-4 w-4 text-teal-600 rounded"
                      />
                      <Input
                        value={option.label}
                        onChange={(e) => updateOption(index, 'label', e.target.value)}
                        className="w-16"
                        placeholder="A"
                      />
                      <Input
                        value={option.content}
                        onChange={(e) => updateOption(index, 'content', e.target.value)}
                        placeholder="Nội dung đáp án..."
                        className="flex-1"
                      />
                    </div>
                    {formData.options.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(index)}
                        className="mt-1"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                ✓ Tích chọn ô checkbox để đánh dấu đáp án đúng
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                {editingQuestion ? 'Cập nhật' : 'Tạo câu hỏi'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Hủy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      {questions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có câu hỏi nào
            </h3>
            <p className="text-gray-600 mb-4">
              Hãy tạo câu hỏi đầu tiên cho MOOC này
            </p>
            <Button onClick={handleCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              Tạo câu hỏi mới
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((question, index) => (
            <Card key={question.question_id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">Câu {index + 1}</Badge>
                      {getDifficultyBadge(question.difficulty)}
                      <Badge variant="secondary">{question.max_score} điểm</Badge>
                    </div>
                    <p className="text-gray-900 font-medium mb-3">{question.stem}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(question)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(question.question_id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  {question.options.map((option) => (
                    <div
                      key={option.option_id}
                      className={`flex items-center gap-2 p-2 rounded ${
                        option.is_correct ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                      }`}
                    >
                      <span className="font-medium text-sm w-6">{option.label}.</span>
                      <span className="text-sm">{option.content}</span>
                      {option.is_correct && (
                        <Badge className="ml-auto bg-green-500 text-white text-xs">Đúng</Badge>
                      )}
                    </div>
                  ))}
                </div>

                {question.creator_name && (
                  <div className="text-xs text-gray-500 mt-3">
                    Tạo bởi: {question.creator_name} | {new Date(question.created_at).toLocaleDateString('vi-VN')}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionBank;
