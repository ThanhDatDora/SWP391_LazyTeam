import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import InstructorLayout from '../../components/layout/InstructorLayout';
import { useNavigation } from '@/hooks/useNavigation';
import { useAuth } from '../../contexts/AuthContext';
import {
  ArrowLeft,
  Plus,
  Edit3,
  Trash2,
  Eye,
  FileText,
  Video,
  BookOpen,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  Award,
  BarChart3,
  Settings,
  Save,
  Upload,
  Download
} from 'lucide-react';
import { api, clearCache } from '../../services/api';
import { toast } from 'react-hot-toast';

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const InstructorCourseManagement = () => {
  const { courseId } = useParams();
  const navigate = useNavigation();
  const { state: authState } = useAuth();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'content';

  const [course, setCourse] = useState(null);
  const [moocs, setMoocs] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [showMoocDialog, setShowMoocDialog] = useState(false);
  const [showLessonDialog, setShowLessonDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  // Form states
  const [moocForm, setMoocForm] = useState({
    title: '',
    description: '',
    order_no: 1
  });

  const [lessonForm, setLessonForm] = useState({
    mooc_id: '',
    title: '',
    content_type: 'video',
    content_url: '',
    description: '',
    instructions: '',
    order_no: 1,
    is_preview: false
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    title: '',
    description: '',
    price: 0
  });

  useEffect(() => {
    // Clear cache for this course when component mounts
    clearCache(`/courses/${courseId}`);
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Loading course data for courseId:', courseId);
      
      // Load course details
      const courseResponse = await api.courses.getCourseById(courseId);
      console.log('📦 Course response:', courseResponse);
      
      if (courseResponse.success && courseResponse.course) {
        setCourse(courseResponse.course);
        // Initialize settings form with course data
        setSettingsForm({
          title: courseResponse.course.title || '',
          description: courseResponse.course.description || '',
          price: courseResponse.course.price || 0
        });
      } else {
        console.error('❌ Failed to load course:', courseResponse);
        toast.error('Không thể tải thông tin khóa học');
        navigate('/instructor/dashboard');
        return;
      }

      // Load MOOCs using content API
      const moocsResponse = await api.content.getMoocsByCourse(courseId);
      if (moocsResponse.success) {
        setMoocs(moocsResponse.data || []);
      }

      // Load all lessons for the course
      const lessonsResponse = await api.courses.getAllLessonsByCourse(courseId);
      if (lessonsResponse.success) {
        setLessons(lessonsResponse.data || []);
      }

      // Load assignment submissions
      await loadAssignments();

      // Load enrolled students
      await loadStudents();

    } catch (error) {
      console.error('Error loading course data:', error);
      toast.error('Không thể tải dữ liệu khóa học');
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async () => {
    try {
      // Get all assignment lessons
      const assignmentLessons = lessons.filter(l => l.content_type === 'assignment');
      
      const allSubmissions = [];
      for (const lesson of assignmentLessons) {
        const response = await fetch(`/api/assignments/lesson/${lesson.lesson_id}/submissions`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          allSubmissions.push(...data.data.map(s => ({
            ...s,
            lesson_title: lesson.title
          })));
        }
      }
      setAssignments(allSubmissions);
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  };

  const loadStudents = async () => {
    try {
      const response = await fetch(`/api/instructor/courses/${courseId}/students`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        // Transform data to add progress and status
        const studentsWithProgress = data.data.map(student => ({
          ...student,
          progress: student.total_lessons > 0 
            ? Math.round((student.completed_lessons / student.total_lessons) * 100)
            : 0,
          status: student.is_completed ? 'completed' : 'active'
        }));
        setStudents(studentsWithProgress);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  // MOOC Management
  const handleCreateMooc = () => {
    setEditingItem(null);
    setMoocForm({
      title: '',
      description: '',
      order_no: moocs.length + 1
    });
    setShowMoocDialog(true);
  };

  const handleEditMooc = (mooc) => {
    setEditingItem(mooc);
    setMoocForm({
      title: mooc.title,
      description: mooc.description || '',
      order_no: mooc.order_no
    });
    setShowMoocDialog(true);
  };

  const handleSaveMooc = async () => {
    try {
      if (!moocForm.title.trim()) {
        toast.error('Vui lòng nhập tên MOOC');
        return;
      }

      const url = editingItem 
        ? `${BACKEND_URL}/content/moocs/${editingItem.mooc_id}`
        : `${BACKEND_URL}/instructor/courses/${courseId}/moocs`;
      
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(moocForm)
      });

      const data = await response.json();
      if (data.success) {
        toast.success(editingItem ? 'Cập nhật MOOC thành công' : 'Tạo MOOC thành công');
        setShowMoocDialog(false);
        await loadCourseData();
      } else {
        toast.error(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error saving MOOC:', error);
      toast.error('Không thể lưu MOOC');
    }
  };

  // Lesson Management
  const handleCreateLesson = (moocId) => {
    setEditingItem(null);
    setLessonForm({
      mooc_id: moocId || '',
      title: '',
      content_type: 'video',
      content_url: '',
      description: '',
      instructions: '',
      numQuestions: 5,
      timeLimit: 10,
      passingScore: 70,
      order_no: 1,
      is_preview: false
    });
    setShowLessonDialog(true);
  };

  const handleEditLesson = (lesson) => {
    setEditingItem(lesson);
    
    // Parse JSON từ content_url cho assignment và quiz
    let description = '';
    let instructions = '';
    let numQuestions = 5;
    let timeLimit = 10;
    let passingScore = 70;
    let content_url = lesson.content_url || '';
    
    if (lesson.content_type === 'assignment' && lesson.content_url) {
      try {
        const assignmentData = JSON.parse(lesson.content_url);
        description = assignmentData.description || '';
        instructions = assignmentData.instructions || '';
        content_url = ''; // Clear URL for assignment
      } catch (e) {
        console.error('Failed to parse assignment data:', e);
      }
    }

    if (lesson.content_type === 'quiz' && lesson.content_url) {
      try {
        const quizData = JSON.parse(lesson.content_url);
        if (quizData.type === 'quiz_v2') {
          // New format - Question Bank
          numQuestions = quizData.numQuestions || 5;
          timeLimit = quizData.timeLimit || 10;
          passingScore = quizData.passingScore || 70;
          content_url = ''; // Clear URL for quiz
        }
        // Old format with questions array - keep as is for backward compatibility
      } catch (e) {
        console.error('Failed to parse quiz data:', e);
      }
    }
    
    setLessonForm({
      mooc_id: lesson.mooc_id,
      title: lesson.title,
      content_type: lesson.content_type,
      content_url: content_url,
      description: description,
      instructions: instructions,
      numQuestions: numQuestions,
      timeLimit: timeLimit,
      passingScore: passingScore,
      order_no: lesson.order_no,
      is_preview: lesson.is_preview || false
    });
    setShowLessonDialog(true);
  };

  const handleSaveLesson = async () => {
    try {
      if (!lessonForm.title.trim()) {
        toast.error('Vui lòng nhập tên bài học');
        return;
      }

      if (!lessonForm.mooc_id) {
        toast.error('Vui lòng chọn MOOC');
        return;
      }

      // Validation cho assignment
      if (lessonForm.content_type === 'assignment') {
        if (!lessonForm.description?.trim()) {
          toast.error('Vui lòng nhập mô tả bài tập');
          return;
        }
        if (!lessonForm.instructions?.trim()) {
          toast.error('Vui lòng nhập hướng dẫn chi tiết');
          return;
        }
      }

      // Validation cho quiz
      if (lessonForm.content_type === 'quiz') {
        if (!lessonForm.numQuestions || lessonForm.numQuestions < 1) {
          toast.error('Số câu hỏi phải >= 1');
          return;
        }
        if (!lessonForm.timeLimit || lessonForm.timeLimit < 1) {
          toast.error('Thời gian phải >= 1 phút');
          return;
        }
        if (lessonForm.passingScore < 0 || lessonForm.passingScore > 100) {
          toast.error('Điểm đạt phải từ 0-100');
          return;
        }
      }

      // Chuẩn bị data
      let dataToSend = { ...lessonForm };
      
      // Nếu là assignment, serialize thành JSON trong content_url
      if (lessonForm.content_type === 'assignment') {
        dataToSend.content_url = JSON.stringify({
          type: 'assignment',
          title: lessonForm.title,
          description: lessonForm.description || '',
          instructions: lessonForm.instructions || ''
        });
        // Xóa description và instructions khỏi request body
        delete dataToSend.description;
        delete dataToSend.instructions;
      }

      // Nếu là quiz, serialize config thành JSON trong content_url
      if (lessonForm.content_type === 'quiz') {
        dataToSend.content_url = JSON.stringify({
          type: 'quiz_v2',  // v2 = uses Question Bank
          numQuestions: lessonForm.numQuestions || 5,
          timeLimit: lessonForm.timeLimit || 10,
          passingScore: lessonForm.passingScore || 70
        });
        // Xóa quiz config khỏi request body
        delete dataToSend.numQuestions;
        delete dataToSend.timeLimit;
        delete dataToSend.passingScore;
        delete dataToSend.description;
      }

      const url = editingItem
        ? `${BACKEND_URL}/instructor/lessons/${editingItem.lesson_id}`
        : `${BACKEND_URL}/instructor/lessons`;

      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();
      if (data.success) {
        toast.success(editingItem ? 'Cập nhật bài học thành công' : 'Tạo bài học thành công');
        setShowLessonDialog(false);
        await loadCourseData();
      } else {
        toast.error(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast.error('Không thể lưu bài học');
    }
  };

  // Delete Management
  const handleDelete = async () => {
    try {
      if (!deleteItem) return;

      const { type, id } = deleteItem;
      const url = type === 'mooc' 
        ? `/api/moocs/${id}`
        : `/api/lessons/${id}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Xóa ${type === 'mooc' ? 'MOOC' : 'bài học'} thành công`);
        setShowDeleteDialog(false);
        setDeleteItem(null);
        await loadCourseData();
      } else {
        toast.error(data.message || 'Không thể xóa');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Có lỗi xảy ra');
    }
  };

  // Update course settings
  const handleUpdateCourseSettings = async () => {
    try {
      console.log('🔄 Updating course settings:', settingsForm);
      
      const response = await fetch(`${BACKEND_URL}/instructor/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: settingsForm.title,
          description: settingsForm.description,
          price: parseFloat(settingsForm.price)
        })
      });

      const data = await response.json();
      console.log('📦 Update response:', data);
      
      if (data.success) {
        toast.success('Cập nhật thông tin khóa học thành công');
        await loadCourseData();
      } else {
        toast.error(data.message || 'Không thể cập nhật khóa học');
      }
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error('Có lỗi xảy ra khi cập nhật khóa học');
    }
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  const getContentTypeIcon = (type) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'assignment':
        return <FileText className="w-4 h-4" />;
      case 'reading':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'graded':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" /> Đã chấm</Badge>;
      case 'submitted':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Chờ chấm</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <InstructorLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4" />
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      </InstructorLayout>
    );
  }

  if (!course) {
    return (
      <InstructorLayout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không tìm thấy khóa học
              </h3>
              <Button onClick={() => navigate('/instructor/dashboard')}>
                Quay lại dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </InstructorLayout>
    );
  }

  return (
    <InstructorLayout>
      <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/instructor/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại dashboard
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {course.title}
            </h1>
            <p className="text-gray-600 mt-1">
              {course.description}
            </p>
            <div className="flex items-center gap-4 mt-3">
              <Badge variant={course.is_approved ? 'default' : 'secondary'}>
                {course.is_approved ? 'Đã duyệt' : 'Chờ duyệt'}
              </Badge>
              <Badge variant="outline">
                {moocs.length} MOOCs
              </Badge>
              <Badge variant="outline">
                {lessons.length} bài học
              </Badge>
            </div>
          </div>
          <Button onClick={() => navigate(`/course/${courseId}`)}>
            <Eye className="w-4 h-4 mr-2" />
            Xem khóa học
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(val) => navigate(`/instructor/courses/${courseId}?tab=${val}`)} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="content">Nội dung</TabsTrigger>
          <TabsTrigger value="assignments">
            Assignments
            {assignments.filter(a => a.status === 'submitted').length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {assignments.filter(a => a.status === 'submitted').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="students">Học viên</TabsTrigger>
          <TabsTrigger value="analytics">Thống kê</TabsTrigger>
          <TabsTrigger value="settings">Cài đặt</TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Quản lý nội dung khóa học</h2>
            <Button onClick={handleCreateMooc}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm MOOC mới
            </Button>
          </div>

          {moocs.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Chưa có MOOC nào
                </h3>
                <p className="text-gray-600 mb-4">
                  Tạo MOOC đầu tiên để bắt đầu thêm nội dung
                </p>
                <Button onClick={handleCreateMooc}>
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo MOOC đầu tiên
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {moocs.map((mooc) => {
                const moocLessons = lessons.filter(l => l.mooc_id === mooc.mooc_id);
                return (
                  <Card key={mooc.mooc_id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            Week {mooc.order_no}: {mooc.title}
                          </CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            {mooc.description || 'Chưa có mô tả'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/instructor/courses/${courseId}/question-bank?moocId=${mooc.mooc_id}&moocTitle=${encodeURIComponent('Week ' + mooc.order_no + ': ' + mooc.title)}`)}
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Câu hỏi
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCreateLesson(mooc.mooc_id)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Thêm bài học
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditMooc(mooc)}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDeleteItem({ type: 'mooc', id: mooc.mooc_id, name: mooc.title });
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {moocLessons.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Chưa có bài học nào</p>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => handleCreateLesson(mooc.mooc_id)}
                            className="mt-2"
                          >
                            Thêm bài học đầu tiên
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {moocLessons.map((lesson) => (
                            <div
                              key={lesson.lesson_id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                {getContentTypeIcon(lesson.content_type)}
                                <div>
                                  <div className="font-medium">{lesson.title}</div>
                                  <div className="text-xs text-gray-500">
                                    {lesson.content_type === 'video' && `${lesson.duration || 0} phút`}
                                    {lesson.content_type === 'assignment' && 'Bài tập'}
                                    {lesson.content_type === 'reading' && 'Tài liệu đọc'}
                                  </div>
                                </div>
                                {lesson.is_preview && (
                                  <Badge variant="secondary" className="ml-2">Preview</Badge>
                                )}
                              </div>
                              <div className="flex gap-2">
                                {lesson.content_type === 'assignment' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/instructor/courses/${courseId}/assignments/grade?lessonId=${lesson.lesson_id}`)}
                                  >
                                    <FileText className="w-4 h-4 mr-1" />
                                    Chấm điểm
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditLesson(lesson)}
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setDeleteItem({ type: 'lesson', id: lesson.lesson_id, name: lesson.title });
                                    setShowDeleteDialog(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Bài tập cần chấm điểm</h2>
            <div className="flex gap-2">
              <Badge variant="secondary">
                {assignments.filter(a => a.status === 'submitted').length} chưa chấm
              </Badge>
              <Badge variant="default">
                {assignments.filter(a => a.status === 'graded').length} đã chấm
              </Badge>
            </div>
          </div>

          {assignments.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Chưa có bài nộp nào
                </h3>
                <p className="text-gray-600">
                  Khi học viên nộp bài assignment, bạn sẽ thấy ở đây
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Học viên
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Bài tập
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Trạng thái
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Điểm
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Thời gian nộp
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {assignments.map((assignment) => (
                        <tr key={assignment.essay_submission_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {assignment.student_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {assignment.student_email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {assignment.lesson_title}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(assignment.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {assignment.score !== null ? (
                              <span className="font-bold">{assignment.score}/100</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(assignment.submitted_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Find the lesson_id for this assignment
                                const lesson = lessons.find(l => l.title === assignment.lesson_title);
                                if (lesson) {
                                  navigate(`/instructor/courses/${courseId}/assignments/grade?lessonId=${lesson.lesson_id}`);
                                }
                              }}
                            >
                              {assignment.status === 'submitted' ? 'Chấm điểm' : 'Xem chi tiết'}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Học viên đã đăng ký</h2>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Xuất danh sách CSV
            </Button>
          </div>

          {students.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Học viên
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ngày đăng ký
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tiến độ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((student) => (
                        <tr key={student.enrollment_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-teal-100 rounded-full flex items-center justify-center">
                                <span className="text-teal-600 font-medium">
                                  {student.full_name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {student.full_name || 'Unknown User'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{student.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {formatDate(student.enrolled_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-teal-600 h-2 rounded-full"
                                style={{ width: `${student.progress || 0}%` }}
                              />
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {Math.round(student.progress || 0)}%
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge 
                              variant={student.status === 'active' ? 'default' : 'secondary'}
                            >
                              {student.status === 'active' ? 'Đang học' : student.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Chưa có học viên nào
                </h3>
                <p className="text-gray-600">
                  Số học viên đã đăng ký: {course.enrolled_count || 0}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Thống kê khóa học</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">{course.enrolled_count || 0}</p>
                    <p className="text-sm text-gray-600">Học viên</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Award className="w-8 h-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">{course.rating || 0}</p>
                    <p className="text-sm text-gray-600">Đánh giá</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <FileText className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">{assignments.length}</p>
                    <p className="text-sm text-gray-600">Bài nộp</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Biểu đồ & Phân tích</CardTitle>
            </CardHeader>
            <CardContent className="p-8 text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Tính năng phân tích chi tiết đang được phát triển
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Cài đặt khóa học</h2>

          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tên khóa học <span className="text-red-500">*</span>
                </label>
                <Input 
                  value={settingsForm.title} 
                  onChange={(e) => setSettingsForm({ ...settingsForm, title: e.target.value })}
                  placeholder="Nhập tên khóa học"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Mô tả <span className="text-red-500">*</span>
                </label>
                <Textarea 
                  value={settingsForm.description || ''} 
                  onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                  rows={4} 
                  placeholder="Nhập mô tả khóa học"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Giá (USD) <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    type="number"
                    min="0"
                    step="0.01"
                    value={settingsForm.price || 0} 
                    onChange={(e) => setSettingsForm({ ...settingsForm, price: e.target.value })}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">Ví dụ: 99.99</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Trạng thái</label>
                  <div className="pt-2">
                    <Badge variant={course.is_approved ? 'default' : 'secondary'}>
                      {course.is_approved ? 'Đã duyệt' : 'Chờ duyệt'}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button onClick={handleUpdateCourseSettings}>
                <Save className="w-4 h-4 mr-2" />
                Lưu thay đổi
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cài đặt nâng cao</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Các tùy chọn cài đặt nâng cao đang được phát triển
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* MOOC Dialog */}
      <Dialog open={showMoocDialog} onOpenChange={setShowMoocDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Chỉnh sửa MOOC' : 'Tạo MOOC mới'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Tên MOOC <span className="text-red-500">*</span>
              </label>
              <Input
                value={moocForm.title}
                onChange={(e) => setMoocForm({ ...moocForm, title: e.target.value })}
                placeholder="Nhập tên MOOC"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Mô tả</label>
              <Textarea
                value={moocForm.description}
                onChange={(e) => setMoocForm({ ...moocForm, description: e.target.value })}
                placeholder="Nhập mô tả MOOC"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Thứ tự</label>
              <Input
                type="number"
                min="1"
                value={moocForm.order_no}
                onChange={(e) => setMoocForm({ ...moocForm, order_no: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMoocDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveMooc}>
              {editingItem ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog open={showLessonDialog} onOpenChange={setShowLessonDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Chỉnh sửa bài học' : 'Tạo bài học mới'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                MOOC <span className="text-red-500">*</span>
              </label>
              <Select
                value={lessonForm.mooc_id ? lessonForm.mooc_id.toString() : ''}
                onValueChange={(value) => setLessonForm({ ...lessonForm, mooc_id: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn MOOC">
                    {lessonForm.mooc_id && moocs.find(m => m.mooc_id === lessonForm.mooc_id) 
                      ? `Week ${moocs.find(m => m.mooc_id === lessonForm.mooc_id).order_no}: ${moocs.find(m => m.mooc_id === lessonForm.mooc_id).title}`
                      : 'Chọn MOOC'
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {moocs.map((mooc) => (
                    <SelectItem key={mooc.mooc_id} value={mooc.mooc_id.toString()}>
                      Week {mooc.order_no}: {mooc.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Tên bài học <span className="text-red-500">*</span>
              </label>
              <Input
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                placeholder="Nhập tên bài học"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Loại nội dung <span className="text-red-500">*</span>
              </label>
              <Select
                value={lessonForm.content_type}
                onValueChange={(value) => setLessonForm({ ...lessonForm, content_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại nội dung">
                    {lessonForm.content_type === 'video' && 'Video'}
                    {lessonForm.content_type === 'assignment' && 'Assignment (Bài tập)'}
                    {lessonForm.content_type === 'reading' && 'Reading (Tài liệu đọc)'}
                    {lessonForm.content_type === 'quiz' && 'Quiz (Bài kiểm tra)'}
                    {!lessonForm.content_type && 'Chọn loại nội dung'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="assignment">Assignment (Bài tập)</SelectItem>
                  <SelectItem value="reading">Reading (Tài liệu đọc)</SelectItem>
                  <SelectItem value="quiz">Quiz (Bài kiểm tra)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* URL field - chỉ hiển thị cho video và reading */}
            {lessonForm.content_type !== 'assignment' && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  {lessonForm.content_type === 'video' ? 'URL Video (YouTube/Vimeo)' : 'URL/Nội dung'}
                </label>
                <Input
                  value={lessonForm.content_url}
                  onChange={(e) => setLessonForm({ ...lessonForm, content_url: e.target.value })}
                  placeholder={
                    lessonForm.content_type === 'video' 
                      ? 'https://www.youtube.com/embed/...'
                      : 'Nhập URL hoặc nội dung'
                  }
                />
              </div>
            )}
            
            {/* Description field - chỉ cho assignment */}
            {lessonForm.content_type === 'assignment' && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Mô tả bài tập <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={lessonForm.description}
                  onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                  placeholder="Mô tả bài tập (yêu cầu, mục tiêu, ...) - Có thể viết text thường, không cần code HTML"
                  rows={3}
                />
              </div>
            )}

            {/* Instructions field - chỉ cho assignment */}
            {lessonForm.content_type === 'assignment' && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Hướng dẫn chi tiết <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={lessonForm.instructions}
                  onChange={(e) => setLessonForm({ ...lessonForm, instructions: e.target.value })}
                  placeholder="Hướng dẫn chi tiết cách làm bài tập, tiêu chí đánh giá, ..."
                  rows={4}
                />
              </div>
            )}

            {/* Quiz Config - chỉ cho quiz */}
            {lessonForm.content_type === 'quiz' && (
              <div className="space-y-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-sm text-purple-900">Cấu hình Quiz (Question Bank)</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Số câu hỏi <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={lessonForm.numQuestions || 5}
                      onChange={(e) => setLessonForm({ ...lessonForm, numQuestions: parseInt(e.target.value) || 5 })}
                      placeholder="5"
                    />
                    <p className="text-xs text-gray-600 mt-1">Random từ Question Bank</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Thời gian (phút) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="60"
                      value={lessonForm.timeLimit || 10}
                      onChange={(e) => setLessonForm({ ...lessonForm, timeLimit: parseInt(e.target.value) || 10 })}
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Điểm đạt (%) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={lessonForm.passingScore || 70}
                      onChange={(e) => setLessonForm({ ...lessonForm, passingScore: parseInt(e.target.value) || 70 })}
                      placeholder="70"
                    />
                  </div>
                </div>
                <p className="text-xs text-purple-700">
                  💡 Random <strong>{lessonForm.numQuestions || 5} câu</strong> từ Question Bank. Mỗi lần làm khác nhau.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Thứ tự</label>
                <Input
                  type="number"
                  min="1"
                  value={lessonForm.order_no}
                  onChange={(e) => setLessonForm({ ...lessonForm, order_no: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lessonForm.is_preview}
                    onChange={(e) => setLessonForm({ ...lessonForm, is_preview: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Preview miễn phí</span>
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLessonDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveLesson}>
              {editingItem ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">
              Bạn có chắc chắn muốn xóa{' '}
              <span className="font-bold">{deleteItem?.name}</span>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Hành động này không thể hoàn tác.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowDeleteDialog(false);
              setDeleteItem(null);
            }}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </InstructorLayout>
  );
};

export default InstructorCourseManagement;
