import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  Users, 
  BookOpen, 
  Play,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import LearnerNavbar from '../components/layout/LearnerNavbar';
import Footer from '../components/layout/Footer';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../hooks/useNavigation';

const CoursesPage = () => {
  const navigate = useNavigation();
  const { state } = useAuth();
  
  const goCourse = (courseId) => navigate(`/courses/${courseId}`);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadEnrolledCourses();
    loadCourses();
    loadCategories();
  }, []);

  useEffect(() => {
    if (courses.length > 0) {
      loadRecentCourses();
    }
  }, [courses]);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, selectedCategory]);

  const loadEnrolledCourses = async () => {
    try {
      if (!state.user) return;
      
      const response = await api.enrollments.getMyEnrollments();
      console.log('📚 My enrollments:', response);
      
      if (response.success && response.data) {
        const enrollments = response.data.enrollments || response.data || [];
        const enrolledIds = new Set(enrollments.map(e => e.course_id || e.courseId));
        console.log('✅ Enrolled course IDs:', Array.from(enrolledIds));
        setEnrolledCourseIds(enrolledIds);
      }
    } catch (error) {
      console.error('Error loading enrolled courses:', error);
    }
  };

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await api.courses.getCourses({ limit: 20 });
      console.log('API Response:', response);
      
      if (response.success && response.data) {
        // API trả về { data: { courses: [...] } }
        const coursesData = response.data.data || response.data.courses || [];
        console.log('Loaded courses data:', coursesData, 'isArray:', Array.isArray(coursesData));
        
        // Map fields để phù hợp với component expectations
        const mappedCourses = coursesData.map(course => ({
          ...course,
          course_id: course.id,
          category_id: course.categoryId,
          instructor_name: course.instructorName,
          image_url: course.thumbnail,
          enrolled_count: course.enrollmentCount,
          review_count: course.reviewCount
        }));
        
        setCourses(Array.isArray(mappedCourses) ? mappedCourses : []);
      } else {
        console.log('No courses data found');
        setCourses([]);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.courses.getCategories();
      console.log('Categories API Response:', response);
      
      if (response.success && response.data) {
        // API trả về { categories: [...] }, cần map sang format đúng
        const categoriesData = response.data.categories || response.data || [];
        const mappedCategories = categoriesData.map(cat => ({
          category_id: cat.id.toString(),
          name: cat.name,
          courseCount: cat.courseCount
        }));
        
        setCategories([
          { category_id: 'all', name: 'All Categories' },
          ...mappedCategories
        ]);
      } else {
        // Fallback categories
        setCategories([
          { category_id: 'all', name: 'All Categories' },
          { category_id: '1', name: 'Design' },
          { category_id: '2', name: 'Development' },
          { category_id: '3', name: 'Business' },
          { category_id: '4', name: 'Marketing' },
          { category_id: '5', name: 'Photography' },
          { category_id: '6', name: 'Acting' }
        ]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([
        { category_id: 'all', name: 'All Categories' },
        { category_id: '1', name: 'Design' },
        { category_id: '2', name: 'Development' },
        { category_id: '3', name: 'Business' }
      ]);
    }
  };

  const loadRecentCourses = async () => {
    try {
      // Use the first 3 courses from the main courses list
      if (Array.isArray(courses) && courses.length > 0) {
        setRecentCourses(courses.slice(0, 3));
      } else {
        setRecentCourses([]);
      }
    } catch (error) {
      console.error('Error loading recent courses:', error);
      setRecentCourses([]);
    }
  };

  const filterCourses = () => {
    if (!Array.isArray(courses)) {
      console.log('courses is not an array, setting filteredCourses to empty array');
      setFilteredCourses([]);
      return;
    }

    let filtered = [...courses]; // Create a copy of the array
    console.log('filterCourses debug:', { 
      courses, 
      coursesType: Array.isArray(courses),
      filteredLength: filtered.length
    });

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => 
        course.category_id?.toString() === selectedCategory.toString()
      );
    }

    console.log('Setting filteredCourses to:', filtered.length, 'courses, isArray:', Array.isArray(filtered));
    setFilteredCourses(filtered);
  };

  const formatCurrency = (price) => {
    if (!price || price === 0) return 'Miễn phí';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.category_id?.toString() === categoryId?.toString());
    return category ? category.name : 'Unknown';
  };

  const CourseCard = ({ course, showProgress = false }) => {
    const isEnrolled = enrolledCourseIds.has(course.course_id);
    
    return (
    <div 
      onClick={() => goCourse(course.course_id)}
      className="group hover:shadow-xl transition-all duration-300 bg-white rounded-2xl overflow-hidden border-0 shadow-md cursor-pointer"
    >
      <div className="relative">
        <img 
          src={course.image_url || `https://images.unsplash.com/photo-1551434678-efb963a3ee1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80`}
          alt={course.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              goCourse(course.course_id);
            }}
            className="bg-white text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Play className="w-4 h-4 mr-1 inline" />
            Preview
          </button>
        </div>
        {showProgress && (
          <div className="absolute top-3 left-3">
            <span className="bg-emerald-500 text-white font-medium px-2 py-1 rounded text-xs">Continue</span>
          </div>
        )}
        {isEnrolled && !showProgress && (
          <div className="absolute top-3 left-3">
            <span className="bg-blue-600 text-white font-medium px-2 py-1 rounded text-xs">Enrolled</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className="bg-white/95 text-gray-700 font-medium px-2 py-1 rounded text-xs">
            {course.level || 'Beginner'}
          </span>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full overflow-hidden">
            <img 
              src={`https://ui-avatars.com/api/?name=${course.instructor_name || 'Instructor'}&background=6366f1&color=fff`}
              alt="instructor"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-sm text-gray-600 font-medium">{course.instructor_name || 'Expert Instructor'}</span>
        </div>
        
        <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 text-lg leading-tight">
          {course.title}
        </h3>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{course.duration || '8h 15m'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{course.enrolled_count || '150'}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium text-gray-700">{course.rating || '4.8'}</span>
          </div>
        </div>
        
        {showProgress && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="text-gray-900 font-medium">65%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          {isEnrolled ? (
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-blue-600">
                Đã sở hữu
              </span>
              <span className="text-sm text-gray-500">
                Click để học tiếp
              </span>
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gray-900">
                {formatCurrency(course.price)}
              </span>
              {course.original_price && course.original_price > course.price && (
                <span className="text-sm text-gray-500 line-through">
                  {formatCurrency(course.original_price)}
                </span>
              )}
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isEnrolled) {
                navigate(`/learn/${course.course_id}`);
              } else {
                goCourse(course.course_id);
              }
            }}
            className={`font-medium px-6 py-2 rounded-lg transition-colors ${
              isEnrolled 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-teal-600 hover:bg-teal-700 text-white'
            }`}
          >
            {isEnrolled ? 'Học tiếp' : 'Đăng ký ngay'}
          </button>
        </div>
      </div>
    </div>
    );
  };

  const CategoryCard = ({ category, icon, color, count }) => (
    <div 
      className={`cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-white rounded-2xl hover:scale-105 ${
        selectedCategory === category.category_id ? 'ring-2 ring-teal-500 shadow-lg' : ''
      }`}
      onClick={() => setSelectedCategory(category.category_id)}
    >
      <div className="p-6 text-center">
        <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl`}>
          {icon}
        </div>
        <h3 className="font-bold text-gray-900 mb-2">{category.name}</h3>
        <p className="text-sm text-gray-500">{count || '24'} courses</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LearnerNavbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LearnerNavbar />
      
      {/* Hero Section */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Welcome back, ready for your next lesson?
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Continue your learning journey or discover new courses to expand your skills
            </p>
          </div>
        </div>
      </div>

      {/* Recent Courses Section */}
      {recentCourses.length > 0 && (
        <div className="bg-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentCourses.map((course, index) => (
                <div key={course.course_id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative">
                    <img
                      src={course.image_url || `https://images.unsplash.com/photo-${1551434678-efb963a3ee1d + index}?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80`}
                      alt={course.title}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                      <Play className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 truncate">{course.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{getCategoryName(course.category_id)}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{course.enrolled_count || 0}</span>
                      </div>
                      <span className="text-sm font-medium text-teal-600">{formatCurrency(course.price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.category_id} value={category.category_id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Choice favourite course from top category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(1, 9).map((category, index) => {  
              const colors = [
                'bg-teal-100',
                'bg-blue-100', 
                'bg-purple-100',
                'bg-green-100',
                'bg-orange-100',
                'bg-pink-100',
                'bg-indigo-100',
                'bg-yellow-100'
              ];
              const icons = ['🎨', '💻', '📊', '🚀', '📸', '🎭', '💼', '🔧'];
              const colorClass = colors[index % colors.length];
              const icon = icons[index % icons.length];

              return (
                <CategoryCard 
                  key={category.category_id}
                  category={category}
                  icon={icon}
                  color={colorClass}
                  count={Math.floor(Math.random() * 30) + 5}
                />
              );
            })}
          </div>
        </section>

        {/* Courses Sections */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recommended for you</h2>
            <button className="text-teal-600 hover:text-teal-700 font-medium">
              See all <ArrowRight className="w-4 h-4 ml-1 inline" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.isArray(filteredCourses) ? filteredCourses.slice(0, 4).map((course) => (
              <CourseCard key={`recommended-${course.course_id}`} course={course} />
            )) : null}
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Get choice of your course</h2>
            <button className="text-teal-600 hover:text-teal-700 font-medium">
              See all <ArrowRight className="w-4 h-4 ml-1 inline" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.isArray(filteredCourses) ? filteredCourses.slice(4, 8).map((course) => (
              <CourseCard key={`choice-${course.course_id}`} course={course} />
            )) : null}
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">The course in personal development</h2>
            <button className="text-teal-600 hover:text-teal-700 font-medium">
              See all <ArrowRight className="w-4 h-4 ml-1 inline" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.isArray(filteredCourses) ? filteredCourses.slice(8, 12).map((course) => (
              <CourseCard key={`personal-${course.course_id}`} course={course} />
            )) : null}
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Student are viewing</h2>
            <button className="text-teal-600 hover:text-teal-700 font-medium">
              See all <ArrowRight className="w-4 h-4 ml-1 inline" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.isArray(filteredCourses) ? filteredCourses.slice(12, 16).map((course) => (
              <CourseCard key={`viewing-${course.course_id}`} course={course} />
            )) : null}
          </div>
        </section>

        {/* Online Coaching CTA */}
        <section className="mb-12">
          <div className="bg-slate-800 rounded-lg p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Online coaching lessons for remote learning.</h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
              Ut enim ad minim veniam.
            </p>
            <button className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
              Start learning now
            </button>
          </div>
        </section>

        {/* Show "No courses found" message if filtered results are empty */}
        {(filteredCourses || []).length === 0 && !loading && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-500">Try adjusting your search or category filter</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CoursesPage;