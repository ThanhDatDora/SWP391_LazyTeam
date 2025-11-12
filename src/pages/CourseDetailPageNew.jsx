import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Play, 
  Star, 
  Users, 
  Clock,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Award,
  Globe,
  Download,
  Share2,
  Heart,
  ShoppingCart,
  PlayCircle,
  FileText,
  Video,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import LearnerNavbar from '../components/layout/LearnerNavbar';
import Footer from '../components/layout/Footer';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../components/ui/Toast';

const CourseDetailPageNew = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const { addToCart, isInCart } = useCart();
  const toast = useToast();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({});
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    if (courseId) {
      checkEnrollment();
      loadCourseDetail();
      loadRelatedCourses();
    }
  }, [courseId]);

  const checkEnrollment = async () => {
    try {
      if (!authState.user) {
        setIsEnrolled(false);
        return;
      }
      
      const response = await api.enrollments.getMyEnrollments();
      if (response.success && response.data) {
        const enrollments = response.data.enrollments || response.data || [];
        const enrolled = enrollments.some(e => 
          String(e.course_id) === String(courseId) || String(e.courseId) === String(courseId)
        );
        console.log('✅ Enrollment check:', { courseId, enrolled, enrollments });
        setIsEnrolled(enrolled);
      }
    } catch (error) {
      console.error('Error checking enrollment:', error);
      setIsEnrolled(false);
    }
  };

  const loadCourseDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/courses/${courseId}`);
      const data = await response.json();
      
      if (data.success && data.course) {
        console.log('📦 Course data from API:', data.course);
        
        // Enhance course data with default values if missing
        const enhancedCourse = {
          ...data.course,
          rating: data.course.rating || 4.5,
          reviewCount: data.course.reviewCount || Math.floor(Math.random() * 1000) + 100,
          enrollmentCount: data.course.enrollmentCount || Math.floor(Math.random() * 5000) + 500,
          totalLessons: data.course.totalLessons || 34,
          language: data.course.language || 'Tiếng Việt',
          
          // What you'll learn
          whatYouWillLearn: data.course.whatYouWillLearn || [
            'Nắm vững các khái niệm cơ bản và nâng cao của khóa học',
            'Áp dụng kiến thức vào các dự án thực tế',
            'Phát triển kỹ năng giải quyết vấn đề một cách chuyên nghiệp',
            'Xây dựng portfolio ấn tượng với các dự án hoàn chỉnh',
            'Hiểu rõ best practices và coding standards trong ngành',
            'Sẵn sàng cho các vị trí công việc trong lĩnh vực này'
          ],
          
          // Requirements
          requirements: data.course.requirements || [
            'Không yêu cầu kiến thức nền tảng - phù hợp cho người mới bắt đầu',
            'Máy tính có kết nối internet',
            'Tinh thần học hỏi và sẵn sàng thực hành',
            'Cam kết dành thời gian học tập đều đặn'
          ],
          
          // Curriculum
          curriculum: data.course.curriculum || generateDefaultCurriculum(data.course.level),
          
          // Instructor info
          instructorBio: data.course.instructorBio || 'Giảng viên có nhiều năm kinh nghiệm trong lĩnh vực giảng dạy và thực tế.',
          instructorCourses: data.course.instructorCourses || Math.floor(Math.random() * 10) + 3,
          instructorStudents: data.course.instructorStudents || Math.floor(Math.random() * 50000) + 10000
        };
        
        setCourse(enhancedCourse);
        setExpandedSections({ 0: true });
      } else {
        toast.error('Không tìm thấy khóa học');
        setTimeout(() => navigate('/courses'), 2000);
      }
    } catch (error) {
      console.error('Error loading course:', error);
      toast.error('Không thể tải thông tin khóa học');
    } finally {
      setLoading(false);
    }
  };

  // Generate default curriculum based on course level
  const generateDefaultCurriculum = (level) => {
    const beginner = [
      {
        title: 'Giới thiệu và Cài đặt',
        lessons: [
          { title: 'Giới thiệu khóa học', duration: '00:05:30', contentType: 'video', isPreview: true },
          { title: 'Cài đặt môi trường phát triển', duration: '00:15:45', contentType: 'video', isPreview: true },
          { title: 'Hello World - Chương trình đầu tiên', duration: '00:10:20', contentType: 'video', isPreview: false }
        ]
      },
      {
        title: 'Kiến thức cơ bản',
        lessons: [
          { title: 'Biến và kiểu dữ liệu', duration: '00:20:15', contentType: 'video', isPreview: false },
          { title: 'Toán tử và biểu thức', duration: '00:18:30', contentType: 'video', isPreview: false },
          { title: 'Cấu trúc điều khiển', duration: '00:25:00', contentType: 'video', isPreview: false },
          { title: 'Bài tập thực hành', duration: '00:30:00', contentType: 'exercise', isPreview: false }
        ]
      },
      {
        title: 'Lập trình nâng cao',
        lessons: [
          { title: 'Hàm và tham số', duration: '00:22:45', contentType: 'video', isPreview: false },
          { title: 'Mảng và Collections', duration: '00:28:30', contentType: 'video', isPreview: false },
          { title: 'Xử lý ngoại lệ', duration: '00:19:15', contentType: 'video', isPreview: false }
        ]
      },
      {
        title: 'Dự án thực hành',
        lessons: [
          { title: 'Phân tích yêu cầu dự án', duration: '00:15:00', contentType: 'video', isPreview: false },
          { title: 'Xây dựng dự án từng bước', duration: '01:30:00', contentType: 'video', isPreview: false },
          { title: 'Review code và tối ưu hóa', duration: '00:45:00', contentType: 'video', isPreview: false }
        ]
      }
    ];

    const intermediate = [
      ...beginner,
      {
        title: 'Design Patterns',
        lessons: [
          { title: 'Singleton Pattern', duration: '00:20:00', contentType: 'video', isPreview: false },
          { title: 'Factory Pattern', duration: '00:22:30', contentType: 'video', isPreview: false },
          { title: 'Observer Pattern', duration: '00:25:15', contentType: 'video', isPreview: false }
        ]
      }
    ];

    return level === 'Beginner' ? beginner : intermediate;
  };

  const loadRelatedCourses = async () => {
    try {
      const response = await api.courses.getCourses({ limit: 4 });
      if (response.success && response.data) {
        const coursesData = response.data.data || response.data.courses || [];
        setRelatedCourses(coursesData.slice(0, 4));
      }
    } catch (error) {
      console.error('Error loading related courses:', error);
    }
  };

  const toggleSection = (index) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleEnroll = () => {
    if (!authState.user) {
      toast.error('Vui lòng đăng nhập để ghi danh');
      navigate('/login');
      return;
    }

    // Add to cart or enroll logic
    toast.success('Đã thêm vào giỏ hàng!');
  };

  const handleAddToCart = () => {
    console.log('🛒 === CourseDetailPageNew: ADD TO CART ===');
    console.log('🔐 isAuthenticated:', authState.user);
    console.log('📦 course:', course);
    console.log('🆔 courseId:', courseId, 'type:', typeof courseId);
    
    if (!authState.user) {
      toast.error('Vui lòng đăng nhập');
      navigate('/login');
      return;
    }

    // Check if already in cart using CartContext
    const courseIdNum = parseInt(courseId);
    console.log('🆔 courseIdNum:', courseIdNum);
    console.log('✅ isInCart check:', isInCart(courseIdNum));
    
    if (isInCart(courseIdNum)) {
      toast.info('Khóa học đã có trong giỏ hàng');
      return;
    }

    // Use CartContext to add item
    const cartItem = {
      id: courseIdNum,
      title: course.title,
      price: course.price,
      thumbnail: course.thumbnail,
      instructorName: course.instructorName,
      level: course.level,
      duration: course.duration
    };

    console.log('📦 Adding to cart via CartContext:', cartItem);
    addToCart(cartItem);
    console.log('✅ addToCart called');
    toast.success('Đã thêm vào giỏ hàng!');
  };

  const formatCurrency = (price) => {
    if (!price || price === 0) return 'Miễn phí';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDuration = (duration) => {
    if (!duration) return '0:00';
    // Duration is in HH:MM:SS format
    const parts = duration.split(':');
    if (parts[0] === '00') {
      return `${parseInt(parts[1])}:${parts[2]}`;
    }
    return `${parseInt(parts[0])}:${parts[1]}:${parts[2]}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LearnerNavbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin khóa học...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LearnerNavbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy khóa học</h2>
            <button
              onClick={() => navigate('/courses')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Quay lại danh sách khóa học
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LearnerNavbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Course Info */}
            <div className="lg:col-span-2">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm mb-4 text-gray-300">
                <span 
                  onClick={() => navigate('/courses')}
                  className="hover:text-white cursor-pointer"
                >
                  Khóa học
                </span>
                <ChevronDown className="w-4 h-4 -rotate-90" />
                <span>{course.categoryName || 'Danh mục'}</span>
                <ChevronDown className="w-4 h-4 -rotate-90" />
                <span className="text-white">{course.title}</span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-gray-300 text-lg mb-6">{course.description}</p>

              {/* Course Meta */}
              <div className="flex flex-wrap items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(course.rating || 4.5)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold">{course.rating || '4.5'}</span>
                  <span className="text-gray-300">({course.reviewCount || 0} đánh giá)</span>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{course.enrollmentCount || 0} học viên</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{course.duration || '10h 0m'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  <span>{course.totalLessons || 0} bài học</span>
                </div>

                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  <span>{course.language || 'Tiếng Việt'}</span>
                </div>
              </div>

              {/* Instructor Info */}
              <div className="flex items-center gap-4 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                <img
                  src={course.instructorAvatar || `https://ui-avatars.com/api/?name=${course.instructorName}&background=6366f1&color=fff`}
                  alt={course.instructorName}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="text-sm text-gray-300">Giảng viên</p>
                  <p className="font-semibold text-lg">{course.instructorName || 'Instructor'}</p>
                </div>
              </div>
            </div>

            {/* Right Column - Course Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-xl overflow-hidden sticky top-4">
                {/* Course Thumbnail */}
                <div className="relative">
                  <img
                    src={course.thumbnail || 'https://picsum.photos/400/225'}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <button className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors group">
                    <PlayCircle className="w-16 h-16 text-white group-hover:scale-110 transition-transform" />
                  </button>
                </div>

                <div className="p-6">
                  {/* Price */}
                  <div className="mb-6">
                    {isEnrolled ? (
                      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-green-700 font-semibold mb-1">
                          <CheckCircle className="w-5 h-5" />
                          Bạn đã sở hữu khóa học này
                        </div>
                        <p className="text-sm text-green-600">
                          Click "Bắt đầu học" để tiếp tục học tập
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="text-3xl font-bold text-gray-900 mb-2">
                          {formatCurrency(course.price)}
                        </div>
                        {course.price > 0 && (
                          <p className="text-sm text-gray-500">
                            <Clock className="w-4 h-4 inline mr-1" />
                            Khuyến mãi có hạn
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 mb-6">
                    {isEnrolled ? (
                      <button
                        onClick={() => navigate(`/learn/${courseId}`)}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <BookOpen className="w-5 h-5" />
                        Bắt đầu học
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleEnroll}
                          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                        >
                          Ghi danh ngay
                        </button>
                        <button
                          onClick={handleAddToCart}
                          className="w-full py-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-900 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <ShoppingCart className="w-5 h-5" />
                          Thêm vào giỏ hàng
                        </button>
                      </>
                    )}
                  </div>

                  {/* Course Includes */}
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Khóa học bao gồm:</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-sm text-gray-700">
                        <Video className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>{course.duration || '10h 0m'} video theo yêu cầu</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-gray-700">
                        <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>{course.totalLessons || 0} bài học</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-gray-700">
                        <Download className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>Tài liệu có thể tải xuống</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-gray-700">
                        <Award className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>Chứng chỉ hoàn thành</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-gray-700">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>Truy cập trọn đời</span>
                      </li>
                    </ul>
                  </div>

                  {/* Share & Wishlist */}
                  <div className="border-t mt-6 pt-6 flex gap-3">
                    <button className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-gray-700">
                      <Share2 className="w-4 h-4" />
                      Chia sẻ
                    </button>
                    <button className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-gray-700">
                      <Heart className="w-4 h-4" />
                      Yêu thích
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Course Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-6 py-4 font-medium transition-colors ${
                      activeTab === 'overview'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Tổng quan
                  </button>
                  <button
                    onClick={() => setActiveTab('curriculum')}
                    className={`px-6 py-4 font-medium transition-colors ${
                      activeTab === 'curriculum'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Nội dung khóa học
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`px-6 py-4 font-medium transition-colors ${
                      activeTab === 'reviews'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Đánh giá
                  </button>
                  <button
                    onClick={() => setActiveTab('instructor')}
                    className={`px-6 py-4 font-medium transition-colors ${
                      activeTab === 'instructor'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Giảng viên
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    {/* What You'll Learn */}
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Bạn sẽ học được gì</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(course.whatYouWillLearn || []).map((item, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Mô tả khóa học</h2>
                      <div className="prose max-w-none text-gray-700">
                        <p>{course.description}</p>
                      </div>
                    </div>

                    {/* Requirements */}
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Yêu cầu</h2>
                      <ul className="space-y-2">
                        {(course.requirements || []).map((req, index) => (
                          <li key={index} className="flex items-start gap-3 text-gray-700">
                            <span className="text-blue-600 font-bold mt-1">•</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Curriculum Tab */}
                {activeTab === 'curriculum' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Nội dung khóa học</h2>
                      <div className="text-sm text-gray-600">
                        <span className="font-semibold">{course.curriculum?.length || 0}</span> chương •{' '}
                        <span className="font-semibold">{course.totalLessons || 0}</span> bài học •{' '}
                        <span className="font-semibold">{course.duration || '10h 0m'}</span>
                      </div>
                    </div>

                    {course.curriculum && course.curriculum.length > 0 ? (
                      course.curriculum.map((section, sectionIndex) => (
                        <div
                          key={sectionIndex}
                          className="border border-gray-200 rounded-lg overflow-hidden"
                        >
                          <button
                            onClick={() => toggleSection(sectionIndex)}
                            className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              {expandedSections[sectionIndex] ? (
                                <ChevronUp className="w-5 h-5 text-gray-600" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-600" />
                              )}
                              <div className="text-left">
                                <h3 className="font-semibold text-gray-900">
                                  Chương {sectionIndex + 1}: {section.title}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  {section.lessons?.length || 0} bài học
                                </p>
                              </div>
                            </div>
                          </button>

                          {expandedSections[sectionIndex] && (
                            <div className="bg-white">
                              {section.lessons && section.lessons.map((lesson, lessonIndex) => (
                                <div
                                  key={lessonIndex}
                                  className="px-6 py-4 border-t border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                      {lesson.contentType === 'video' ? (
                                        <Play className="w-4 h-4 text-blue-600" />
                                      ) : (
                                        <FileText className="w-4 h-4 text-blue-600" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900">{lesson.title}</p>
                                      {lesson.isPreview && (
                                        <span className="text-xs text-blue-600 font-medium">
                                          Xem trước miễn phí
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-600">
                                      {formatDuration(lesson.duration)}
                                    </span>
                                    {lesson.isPreview && (
                                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                        Xem trước
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p>Nội dung khóa học đang được cập nhật</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Đánh giá của học viên</h2>
                    </div>

                    {/* Rating Overview */}
                    <div className="flex items-center gap-8 p-6 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-gray-900 mb-2">
                          {course.rating || '4.5'}
                        </div>
                        <div className="flex items-center justify-center mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.floor(course.rating || 4.5)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">{course.reviewCount || 0} đánh giá</p>
                      </div>

                      <div className="flex-1">
                        {[5, 4, 3, 2, 1].map((stars) => {
                          const percentage = stars === 5 ? 70 : stars === 4 ? 20 : stars === 3 ? 8 : stars === 2 ? 2 : 0;
                          return (
                            <div key={stars} className="flex items-center gap-3 mb-2">
                              <div className="flex items-center gap-1 w-20">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm text-gray-700">{stars} sao</span>
                              </div>
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-yellow-400"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 w-12 text-right">
                                {percentage}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-6">
                      {course.reviews && course.reviews.length > 0 ? (
                        course.reviews.map((review, index) => (
                          <div key={index} className="border-b border-gray-200 pb-6 last:border-0">
                            <div className="flex items-start gap-4">
                              <img
                                src={review.studentAvatar || `https://ui-avatars.com/api/?name=${review.studentName}&background=random`}
                                alt={review.studentName}
                                className="w-12 h-12 rounded-full"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <h4 className="font-semibold text-gray-900">{review.studentName}</h4>
                                    <p className="text-sm text-gray-500">
                                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-4 h-4 ${
                                          i < review.rating
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-gray-700">{review.comment}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                          <p>Chưa có đánh giá nào</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Instructor Tab */}
                {activeTab === 'instructor' && (
                  <div className="space-y-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Về giảng viên</h2>
                    
                    {/* Instructor Profile */}
                    <div className="flex items-start gap-6 p-6 bg-gray-50 rounded-lg">
                      <img
                        src={course.instructorAvatar || `https://ui-avatars.com/api/?name=${course.instructorName}&background=6366f1&color=fff&size=200`}
                        alt={course.instructorName}
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {course.instructorName}
                        </h3>
                        <p className="text-lg text-blue-600 mb-3">
                          Chuyên gia {course.categoryName || 'Công nghệ'}
                        </p>
                        <p className="text-gray-700 leading-relaxed mb-4">
                          {course.instructorBio || 'Giảng viên có hơn 10 năm kinh nghiệm giảng dạy và thực tế trong lĩnh vực. Đã đào tạo hàng nghìn học viên thành công và giúp họ phát triển sự nghiệp.'}
                        </p>
                        
                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-4 mt-6">
                          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                            <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                            <div className="text-2xl font-bold text-gray-900 mb-1">
                              {(course.instructorStudents || course.enrollmentCount || 0).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">Học viên</div>
                          </div>
                          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                            <Star className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                            <div className="text-2xl font-bold text-gray-900 mb-1">
                              {course.rating || '4.5'}
                            </div>
                            <div className="text-sm text-gray-600">Đánh giá TB</div>
                          </div>
                          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                            <BookOpen className="w-6 h-6 mx-auto mb-2 text-green-600" />
                            <div className="text-2xl font-bold text-gray-900 mb-1">
                              {course.instructorCourses || 1}
                            </div>
                            <div className="text-sm text-gray-600">Khóa học</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Instructor Highlights */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Điểm nổi bật</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                          <Award className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Chứng chỉ & Bằng cấp</h4>
                            <p className="text-sm text-gray-600">
                              Thạc sĩ chuyên ngành, chứng chỉ quốc tế uy tín
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                          <BarChart3 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Kinh nghiệm thực tế</h4>
                            <p className="text-sm text-gray-600">
                              Hơn 10 năm làm việc tại các công ty hàng đầu
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                          <MessageSquare className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Phương pháp giảng dạy</h4>
                            <p className="text-sm text-gray-600">
                              Kết hợp lý thuyết và thực hành, dễ hiểu, dễ áp dụng
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                          <CheckCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Hỗ trợ tận tình</h4>
                            <p className="text-sm text-gray-600">
                              Luôn sẵn sàng giải đáp thắc mắc của học viên
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Student Testimonials about Instructor */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Học viên nói gì</h3>
                      <div className="space-y-4">
                        {[
                          {
                            name: 'Nguyễn Văn A',
                            comment: 'Giảng viên giải thích rất dễ hiểu, tận tâm và nhiệt tình. Khóa học rất bổ ích!',
                            rating: 5
                          },
                          {
                            name: 'Trần Thị B',
                            comment: 'Cách giảng dạy thực tế, có nhiều ví dụ cụ thể. Rất đáng để học!',
                            rating: 5
                          },
                          {
                            name: 'Lê Minh C',
                            comment: 'Nội dung chi tiết, giảng viên support nhanh. Recommend cho mọi người!',
                            rating: 4
                          }
                        ].map((testimonial, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <img
                                  src={`https://ui-avatars.com/api/?name=${testimonial.name}&background=random`}
                                  alt={testimonial.name}
                                  className="w-10 h-10 rounded-full"
                                />
                                <div>
                                  <h5 className="font-semibold text-gray-900">{testimonial.name}</h5>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-700 text-sm italic">"{testimonial.comment}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Related Courses */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Khóa học liên quan</h3>
              <div className="space-y-4">
                {relatedCourses.map((relatedCourse) => (
                  <div
                    key={relatedCourse.id}
                    onClick={() => navigate(`/courses/${relatedCourse.id}`)}
                    className="flex gap-4 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                  >
                    <img
                      src={relatedCourse.thumbnail || 'https://picsum.photos/120/80'}
                      alt={relatedCourse.title}
                      className="w-24 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2">
                        {relatedCourse.title}
                      </h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-600">{relatedCourse.rating || '4.5'}</span>
                        </div>
                        <span className="text-sm font-bold text-blue-600">
                          {formatCurrency(relatedCourse.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CourseDetailPageNew;
