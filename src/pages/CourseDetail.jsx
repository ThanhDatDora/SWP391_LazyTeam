import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Play, 
  Star, 
  Users, 
  CheckCircle, 
  BookOpen,
  ChevronDown,
  ShoppingCart
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import LearnerNavbar from '../components/layout/LearnerNavbar';
import Footer from '../components/layout/Footer';
import OfflineIndicator from '../components/common/OfflineIndicator';
import { api } from '../services/api';
import { useNavigation } from '../hooks/useNavigation';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../hooks/useToast';
import { useCourse, useCourses } from '../hooks/useOptimizedFetch';

const CourseDetail = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigation();
  const { state } = useAuth();
  const { addToCart, isInCart } = useCart();
  const { toast } = useToast();
  
  // DEBUG: Log courseId
  console.log('🔍 CourseDetail - courseId from useParams:', courseId);
  
  // Use optimized hooks
  const { data: courseData, loading: courseLoading } = useCourse(courseId);
  const { data: relatedCoursesData, loading: relatedLoading } = useCourses({ limit: 4 });
  
  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isOffline] = useState(false);
  
  const loading = courseLoading || relatedLoading;

  useEffect(() => {
    if (courseId) {
      loadReviews();
    }
  }, [courseId]);

  // Process course data
  useEffect(() => {
    if (courseData) {
      console.log('📦 Raw courseData from API:', courseData);
      
      // Transform backend data to match frontend expectations
      const transformedCourse = {
        ...courseData,
        course_id: courseData.id,
        instructor: {
          name: courseData.instructorName || 'Instructor',
          avatar: `https://ui-avatars.com/api/?name=${courseData.instructorName || 'Instructor'}&background=6366f1&color=fff`,
          bio: `Expert instructor with years of experience`
        },
        rating: courseData.rating || 4.5,
        totalRatings: courseData.reviewCount || 100,
        studentsCount: courseData.enrollmentCount || 500,
        // Transform flat lessons array into curriculum structure
        curriculum: courseData.lessons && courseData.lessons.length > 0
          ? [
              {
                title: "Course Content",
                lessons: courseData.lessons.map(lesson => ({
                  title: lesson.title,
                  duration: lesson.duration || "15 mins",
                  isPreview: lesson.isPreview || false
                }))
              }
            ]
          : [
              {
                title: "Introduction to the Course",
                lessons: [
                  { title: "Course Overview", duration: "5:30", isPreview: true },
                  { title: "Getting Started", duration: "8:15" }
                ]
              }
            ],
        features: [
          "Access on all devices",
          "Certificate of completion", 
          "30 Money back guarantee"
        ],
        includes: [
          `${courseData.duration || "10 hours"} on-demand video`,
          `${courseData.lessons?.length || 0} lessons`,
          "Full lifetime access", 
          "Access on mobile and TV",
          "Certificate of completion"
        ]
      };
      
      console.log('✅ Transformed course:', transformedCourse);
      setCourse(transformedCourse);
    } else if (!courseLoading && courseId) {
      // If no course data from API, generate mock data
      loadCourseDetail();
    }
  }, [courseData, courseLoading, courseId]);

  // Process related courses
  useEffect(() => {
    if (relatedCoursesData && relatedCoursesData.data) {
      const coursesArray = relatedCoursesData.data || [];
      const mappedCourses = coursesArray.map(course => ({
        ...course,
        instructor: {
          name: course.instructorName || 'Instructor',
          avatar: `https://ui-avatars.com/api/?name=${course.instructorName || 'Instructor'}&background=6366f1&color=fff`
        },
        thumbnail: course.thumbnail || `https://picsum.photos/400/250?random=${course.id}`,
        students_count: course.enrollmentCount || 0,
        rating: course.rating || 4.8
      }));
      setRelatedCourses(mappedCourses);
    }
  }, [relatedCoursesData]);

  const loadCourseDetail = async () => {
    try {
      // Try to get real course data from API first
      try {
        const response = await api.courses.getCourses({ limit: 100 });
        if (response.success && response.data) {
          const coursesData = response.data.data || response.data.courses || [];
          const foundCourse = coursesData.find(c => c.id.toString() === courseId);
          
          if (foundCourse) {
            // Map API data to our expected format
            const mappedCourse = {
              ...foundCourse,
              course_id: foundCourse.id,
              instructor: {
                name: foundCourse.instructorName || 'Instructor',
                avatar: `https://ui-avatars.com/api/?name=${foundCourse.instructorName || 'Instructor'}&background=6366f1&color=fff`,
                bio: `Expert ${foundCourse.category || 'instructor'} with 10+ years experience`
              },
              thumbnail: foundCourse.thumbnail || `https://picsum.photos/800/450?random=${foundCourse.id}`,
              video: foundCourse.thumbnail || `https://picsum.photos/800/450?random=${foundCourse.id}`,
              rating: foundCourse.rating || 4.5,
              totalRatings: foundCourse.enrollmentCount || 2847,
              studentsCount: foundCourse.enrollmentCount || 15420,
              duration: "25 hours",
              lessons: 42,
              level: foundCourse.level || "Intermediate",
              language: "English",
              category: foundCourse.category || "General",
              features: [
                "Access on all devices",
                "Certificate of completion", 
                "30 Money back guarantee"
              ],
              includes: [
                "25 hours on-demand video",
                "42 downloadable resources",
                "Full lifetime access", 
                "Access on mobile and TV",
                "Certificate of completion"
              ],
              curriculum: [
                {
                  title: "Introduction to the Course",
                  lessons: [
                    { title: "Course Overview", duration: "5:30", isPreview: true },
                    { title: "Getting Started", duration: "8:15" },
                    { title: "Basic Concepts", duration: "12:45" }
                  ]
                },
                {
                  title: "Core Concepts",
                  lessons: [
                    { title: "Fundamentals", duration: "6:20" },
                    { title: "Advanced Topics", duration: "9:30" },
                    { title: "Best Practices", duration: "11:15" }
                  ]
                },
                {
                  title: "Practical Applications",
                  lessons: [
                    { title: "Real-world Examples", duration: "15:45" },
                    { title: "Case Studies", duration: "8:30" },
                    { title: "Final Project", duration: "12:20" }
                  ]
                }
              ]
            };
            setCourse(mappedCourse);
            return;
          }
        }
      } catch (apiError) {
        console.log('API error, falling back to mock data:', apiError);
      }
      
      // Fallback to mock data if API fails or course not found
      const mockCourse = {
        id: courseId,
        title: "AWS Certified solutions Architect",
        description: "Learn more about as a result voluptate labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.",
        price: 49.65,
        originalPrice: 99.99,
        discount: 50,
        instructor: {
          name: "John Doe",
          avatar: "https://ui-avatars.com/api/?name=John+Doe&background=6366f1&color=fff",
          bio: "Expert AWS Solutions Architect with 10+ years experience"
        },
        thumbnail: "https://picsum.photos/800/450?random=1",
        video: "https://picsum.photos/800/450?random=1",
        rating: 4.5,
        totalRatings: 2847,
        studentsCount: 15420,
        duration: "25 hours",
        lessons: 42,
        level: "Intermediate",
        language: "English",
        category: "Cloud Computing",
        features: [
          "Access on all devices",
          "Certificate of completion",
          "30 Money back guarantee"
        ],
        includes: [
          "25 hours on-demand video",
          "42 downloadable resources", 
          "Full lifetime access",
          "Access on mobile and TV",
          "Certificate of completion"
        ],
        curriculum: [
          {
            title: "Introduction to AWS",
            lessons: [
              { title: "What is AWS?", duration: "5:30", isPreview: true },
              { title: "AWS Global Infrastructure", duration: "8:15" },
              { title: "AWS Services Overview", duration: "12:45" }
            ]
          },
          {
            title: "Identity and Access Management",
            lessons: [
              { title: "IAM Basics", duration: "6:20" },
              { title: "Users, Groups, and Roles", duration: "9:30" },
              { title: "Policies and Permissions", duration: "11:15" }
            ]
          },
          {
            title: "Compute Services",
            lessons: [
              { title: "EC2 Fundamentals", duration: "15:45" },
              { title: "Instance Types and Pricing", duration: "8:30" },
              { title: "Auto Scaling", duration: "12:20" }
            ]
          }
        ]
      };
      setCourse(mockCourse);
    } catch (error) {
      console.error('Error loading course detail:', error);
    }
  };

  const loadReviews = async () => {
    // Mock reviews data
    const mockReviews = [
      {
        id: 1,
        user: { name: "Alice", avatar: "https://ui-avatars.com/api/?name=Alice&background=random" },
        rating: 5,
        comment: "Class launched less than a year ago by the Steward on Founder Michaek Chassen. Impress accountery.",
        date: "2 days ago"
      },
      {
        id: 2,
        user: { name: "Bob", avatar: "https://ui-avatars.com/api/?name=Bob&background=random" },
        rating: 4,
        comment: "Class launched less than a year ago by the Steward on Founder Michaek Chassen. Impress accountery.",
        date: "1 week ago"
      }
    ];
    setReviews(mockReviews);
  };

  const formatCurrency = (price) => {
    if (!price || price === 0) return 'Free';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleEnrollNow = async () => {
    if (!state.isAuthenticated) {
      toast.error('Vui lòng đăng nhập để ghi danh khóa học');
      navigate('/login');
      return;
    }

    // Navigate to checkout with enroll now flag
    navigate(`/checkout?courseId=${courseId}&enrollNow=true`);
  };

  const handleAddToCart = () => {
    console.log('🛒 === ADD TO CART DEBUG ===');
    console.log('🔐 isAuthenticated:', state.isAuthenticated);
    console.log('📦 course:', course);
    console.log('🆔 courseId (from params):', courseId, 'type:', typeof courseId);
    console.log('🆔 parseInt(courseId):', parseInt(courseId));
    
    if (!state.isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      navigate('/login');
      return;
    }

    const isAlreadyInCart = isInCart(parseInt(courseId));
    console.log('✅ isInCart check:', isAlreadyInCart);
    
    if (isAlreadyInCart) {
      toast.info('Khóa học đã có trong giỏ hàng');
      return;
    }

    const cartItem = {
      id: parseInt(courseId),
      title: course.title,
      price: course.price,
      instructorName: course.instructor?.name || course.instructorName,
      thumbnail: course.thumbnail,
      level: course.level,
      duration: course.duration
    };
    
    console.log('📦 Adding to cart:', cartItem);
    addToCart(cartItem);
    console.log('✅ addToCart called');
  };

  const handleEnroll = () => {
    // Redirect to old handler
    handleEnrollNow();
  };

  const ReviewCard = ({ review }) => (
    <div className="flex gap-4 p-4 border-b border-gray-100 last:border-b-0">
      <img 
        src={review.user.avatar} 
        alt={review.user.name}
        className="w-10 h-10 rounded-full"
      />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-gray-900">{review.user.name}</h4>
          <span className="text-sm text-gray-500">{review.date}</span>
        </div>
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
            />
          ))}
        </div>
        <p className="text-gray-600 text-sm">{review.comment}</p>
      </div>
    </div>
  );

  const CourseCard = ({ course }) => (
    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
      <div className="relative">
        <img 
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-40 object-cover rounded-t-lg"
        />
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-white/90 text-gray-700">
            {course.level || 'Beginner'}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <img 
            src={course.instructor?.avatar}
            alt="instructor"
            className="w-6 h-6 rounded-full"
          />
          <span className="text-xs text-gray-600">{course.instructor?.name}</span>
        </div>
        
        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 text-sm">
          {course.title}
        </h3>
        
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-blue-600">
            {formatCurrency(course.price)}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>{course.rating}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h2>
          <Button onClick={() => navigate('/courses')}>Back to Courses</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LearnerNavbar />
      
      <main className="container mx-auto px-6 py-8">
        {/* Offline Indicator */}
        <OfflineIndicator isOffline={isOffline} />
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2">
            {/* Course Video/Thumbnail */}
            <div className="relative mb-6">
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative group cursor-pointer">
                <img 
                  src={course.video} 
                  alt={course.title}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-70 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>
                <div className="absolute top-4 left-4">
                  <Badge className="bg-blue-600 text-white">Preview</Badge>
                </div>
              </div>
            </div>

            {/* Course Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">About this course</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {course.description}
                    </p>
                    
                    <h4 className="font-semibold text-gray-900 mb-3">What you'll learn:</h4>
                    <ul className="grid md:grid-cols-2 gap-2">
                      {[
                        "Master AWS Core Services",
                        "Design scalable architectures", 
                        "Implement security best practices",
                        "Optimize costs and performance",
                        "Prepare for AWS certification",
                        "Real-world project experience"
                      ].map((item, index) => (
                        <li key={index} className="flex items-center gap-2 text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="curriculum" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">Course curriculum</h3>
                      <div className="text-sm text-gray-600">
                        {course.lessons} lessons • {course.duration}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {course.curriculum.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="border border-gray-200 rounded-lg">
                          <div className="p-4 bg-gray-50 rounded-t-lg border-b">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-gray-900">{section.title}</h4>
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            </div>
                          </div>
                          <div className="divide-y divide-gray-100">
                            {section.lessons.map((lesson, lessonIndex) => (
                              <div key={lessonIndex} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                  <Play className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-700">{lesson.title}</span>
                                  {lesson.isPreview && (
                                    <Badge variant="outline" className="text-xs">Preview</Badge>
                                  )}
                                </div>
                                <span className="text-sm text-gray-500">{lesson.duration}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="instructor" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <img 
                        src={course.instructor.avatar} 
                        alt={course.instructor.name}
                        className="w-20 h-20 rounded-full"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{course.instructor.name}</h3>
                        <p className="text-gray-600 mb-4">{course.instructor.bio}</p>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span>4.9 instructor rating</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>15,420 students</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            <span>8 courses</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">Student feedback</h3>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold text-lg">{course.rating}</span>
                        </div>
                        <span className="text-gray-500">({course.totalRatings} ratings)</span>
                      </div>
                    </div>
                    
                    {/* Rating breakdown */}
                    <div className="mb-6 space-y-2">
                      {[5, 4, 3, 2, 1].map((stars) => (
                        <div key={stars} className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-12">
                            <span className="text-sm">{stars}</span>
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-yellow-400 h-2 rounded-full" 
                              style={{ width: `${stars === 5 ? 70 : stars === 4 ? 20 : stars === 3 ? 7 : stars === 2 ? 2 : 1}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500 w-10">{stars === 5 ? '70%' : stars === 4 ? '20%' : stars === 3 ? '7%' : stars === 2 ? '2%' : '1%'}</span>
                        </div>
                      ))}
                    </div>

                    {/* Reviews */}
                    <div className="space-y-0">
                      {reviews.map(review => (
                        <ReviewCard key={review.id} review={review} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            {/* Course Info Card */}
            <Card className="sticky top-6 mb-8">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-3xl font-bold text-blue-600">{formatCurrency(course.price)}</span>
                    {course.originalPrice && course.originalPrice > course.price && (
                      <span className="text-lg text-gray-500 line-through">{formatCurrency(course.originalPrice)}</span>
                    )}
                  </div>
                  {course.discount && (
                    <Badge className="bg-red-100 text-red-600 mb-4">{course.discount}% OFF</Badge>
                  )}
                  <p className="text-sm text-gray-600 mb-4">Ưu đãi có hạn!</p>
                  
                  <Button 
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white mb-3"
                    onClick={handleEnrollNow}
                  >
                    Ghi danh ngay
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full mb-3"
                    onClick={handleAddToCart}
                    disabled={isInCart(parseInt(courseId))}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {isInCart(parseInt(courseId)) ? 'Đã có trong giỏ' : 'Thêm vào giỏ hàng'}
                  </Button>
                  
                  <p className="text-xs text-gray-500">Đảm bảo hoàn tiền trong 30 ngày</p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">This Course Included</h4>
                  <ul className="space-y-3">
                    {course.includes.map((item, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold text-gray-900 mb-3">Training 5 or more people?</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Get your team access to over 8,000+ top courses, hands-on labs, and learning paths.
                  </p>
                  <Button variant="outline" className="w-full">
                    Try Team Plan
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold text-gray-900 mb-3">Share this course</h4>
                  <div className="flex gap-2">
                    {[
                      { icon: '📘', color: 'bg-blue-600' },
                      { icon: '🐦', color: 'bg-sky-500' },
                      { icon: '📧', color: 'bg-gray-600' },
                      { icon: '💬', color: 'bg-green-500' },
                      { icon: '📱', color: 'bg-purple-600' },
                      { icon: '🔗', color: 'bg-gray-800' }
                    ].map((social, index) => (
                      <button 
                        key={index}
                        className={`w-8 h-8 ${social.color} text-white rounded text-sm hover:opacity-80 transition-opacity`}
                      >
                        {social.icon}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Articles Section */}
        <section className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Marketing Articles</h2>
            <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
              See all
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>

        {/* TOTC School Management Section */}
        <section className="mt-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl p-8 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Everything you can do in a physical classroom, 
                <span className="text-yellow-300"> you can do with TOTC</span>
              </h2>
              <p className="text-green-100 mb-6">
                TOTC's school management software helps traditional and online schools manage scheduling, attendance, 
                payments and virtual classrooms all in one secure cloud-based system.
              </p>
              <Button className="bg-white text-green-600 hover:bg-gray-100">
                Learn more
              </Button>
            </div>
            <div className="relative">
              <img 
                src="https://picsum.photos/500/300?random=classroom" 
                alt="Classroom"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </section>

        {/* Offers Section */}
        <section className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Top Education offers and deals are listed here</h2>
            <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
              See all
            </Button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((index) => (
              <Card key={index} className="relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all">
                <div className="relative">
                  <img 
                    src={`https://picsum.photos/400/250?random=${index + 10}`}
                    alt="Offer"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-red-500 text-white">50% OFF</Badge>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <Badge className="bg-white/20 text-white mb-2">FOR INSTRUCTORS</Badge>
                    <h3 className="font-bold">TOTC's school management software helps traditional and online schools manage scheduling.</h3>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default CourseDetail;