import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { BookOpen, Users, Clock, Star, Search, Filter, ChevronDown } from 'lucide-react';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/hooks/useNavigation';

const CatalogPage = () => {
  const { goCourse } = useNavigation();
  const { state: authState } = useAuth();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, selectedCategory, selectedLevel, selectedPrice]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await api.courses.getCourses();
      setCourses(response.data);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter (based on course title keywords)
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => {
        const title = course.title.toLowerCase();
        switch (selectedCategory) {
          case 'programming':
            return title.includes('java') || title.includes('javascript') || title.includes('python') || title.includes('react');
          case 'web':
            return title.includes('web') || title.includes('html') || title.includes('css') || title.includes('react');
          case 'backend':
            return title.includes('java') || title.includes('spring') || title.includes('servlet') || title.includes('database');
          case 'frontend':
            return title.includes('react') || title.includes('angular') || title.includes('vue') || title.includes('javascript');
          default:
            return true;
        }
      });
    }

    // Level filter
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(course => 
        (course.level || 'beginner').toLowerCase() === selectedLevel
      );
    }

    // Price filter
    if (selectedPrice !== 'all') {
      filtered = filtered.filter(course => {
        if (selectedPrice === 'free') return course.is_free;
        if (selectedPrice === 'paid') return !course.is_free;
        return true;
      });
    }

    setFilteredCourses(filtered);
  };

  const enrollInCourse = async (courseId) => {
    try {
      await api.enrollments.enrollInCourse(courseId);
      // Refresh courses to update enrollment status
      loadCourses();
    } catch (error) {
      console.error('Error enrolling in course:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getCourseLevel = (level) => {
    const levels = {
      'beginner': 'Cơ bản',
      'intermediate': 'Trung cấp',
      'advanced': 'Nâng cao'
    };
    return levels[level] || 'Cơ bản';
  };

  const categories = [
    { value: 'all', label: 'Tất cả' },
    { value: 'programming', label: 'Lập trình' },
    { value: 'web', label: 'Phát triển Web' },
    { value: 'backend', label: 'Backend' },
    { value: 'frontend', label: 'Frontend' }
  ];

  const levels = [
    { value: 'all', label: 'Tất cả' },
    { value: 'beginner', label: 'Cơ bản' },
    { value: 'intermediate', label: 'Trung cấp' },
    { value: 'advanced', label: 'Nâng cao' }
  ];

  const priceOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'free', label: 'Miễn phí' },
    { value: 'paid', label: 'Có phí' }
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh mục khóa học...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Danh mục khóa học</h1>
        <p className="text-gray-600">
          Khám phá {courses.length} khóa học chất lượng cao với các chủ đề đa dạng
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Tìm kiếm khóa học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Bộ lọc
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
          <div className="text-sm text-gray-600">
            Hiển thị {filteredCourses.length} khóa học
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cấp độ</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {levels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giá</label>
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {priceOptions.map(price => (
                  <option key={price.value} value={price.value}>
                    {price.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Course Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <Card key={course.course_id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                {/* Course Image */}
                <div className="aspect-video bg-gradient-to-br from-teal-400 to-blue-500 rounded-t-lg flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-white" />
                </div>

                <div className="p-6">
                  {/* Course Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {course.title}
                  </h3>

                  {/* Course Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {course.description}
                  </p>

                  {/* Course Meta */}
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="secondary" className="text-xs">
                      {getCourseLevel(course.level)}
                    </Badge>
                    <div className="flex items-center text-xs text-gray-500">
                      <Users className="w-3 h-3 mr-1" />
                      {course.enrolled_count || 0} học viên
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {course.duration_hours || 8}h
                    </div>
                  </div>

                  {/* Instructor */}
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                      <span className="text-xs font-medium text-gray-600">
                        {course.instructor?.full_name?.[0] || 'I'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {course.instructor?.full_name || 'Instructor'}
                      </p>
                      <div className="flex items-center">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-500 ml-1">
                          {course.rating || 4.5} ({course.review_count || 0} đánh giá)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price and Enroll */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold text-teal-600">
                        {course.is_free ? 'Miễn phí' : formatPrice(course.price)}
                      </span>
                      {course.original_price && course.original_price > course.price && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          {formatPrice(course.original_price)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Button
                      className="w-full"
                      onClick={() => goCourse(course.course_id)}
                    >
                      Xem chi tiết
                    </Button>
                    
                    {!course.is_enrolled && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => enrollInCourse(course.course_id)}
                      >
                        Đăng ký ngay
                      </Button>
                    )}
                    
                    {course.is_enrolled && (
                      <Button
                        variant="secondary"
                        className="w-full"
                        disabled
                      >
                        Đã đăng ký
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Không tìm thấy khóa học nào
          </h3>
          <p className="text-gray-600 mb-4">
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem thêm kết quả
          </p>
          <Button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedLevel('all');
              setSelectedPrice('all');
            }}
          >
            Xóa bộ lọc
          </Button>
        </div>
      )}

      {/* Load More (if needed) */}
      {filteredCourses.length > 0 && filteredCourses.length === courses.length && courses.length >= 10 && (
        <div className="text-center mt-8">
          <Button variant="outline">
            Tải thêm khóa học
          </Button>
        </div>
      )}
    </div>
  );
};

export default CatalogPage;