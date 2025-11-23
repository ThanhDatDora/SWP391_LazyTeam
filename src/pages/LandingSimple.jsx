import React, { useState, useEffect } from 'react';
import { ArrowRight, Users, BookOpen, Trophy, Play, Star, Calendar, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import LearnerNavbar from '../components/layout/LearnerNavbar';
import Footer from '../components/layout/Footer';
import { COURSES } from '../data/mockData';
import { api } from '../services/api';
import { useNavigation } from '../hooks/useNavigation';
import { useAuth } from '../contexts/AuthContext';
import { useCourses } from '../hooks/useOptimizedFetch';

const LandingSimple = () => {
  const navigate = useNavigation();
  const { state } = useAuth();
  
  // Use optimized hooks
  const { data: coursesData, loading: coursesLoading } = useCourses({ limit: 8 });
  const { data: recentCoursesData, loading: recentLoading } = useCourses({ limit: 3 });
  
  const [courses, setCourses] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);
  const loading = coursesLoading || recentLoading;

  // Process courses data
  useEffect(() => {
    if (coursesData && coursesData.data) {
      const coursesArray = coursesData.data || [];
      const mappedCourses = (Array.isArray(coursesArray) ? coursesArray : []).map(course => ({
        ...course,
        course_id: course.id,
        category_id: course.categoryId,
        instructor: {
          name: course.instructorName || 'Instructor',
          avatar: `https://ui-avatars.com/api/?name=${course.instructorName || 'Instructor'}&background=6366f1&color=fff`
        },
        thumbnail: course.thumbnail || `https://picsum.photos/400/250?random=${course.id}`,
        students_count: course.enrollmentCount || 0,
        rating: course.rating || 4.5
      }));
      setCourses(mappedCourses);
    }
  }, [coursesData]);

  // Process recent courses
  useEffect(() => {
    if (recentCoursesData && recentCoursesData.data) {
      const coursesArray = recentCoursesData.data || [];
      const mappedRecentCourses = (Array.isArray(coursesArray) ? coursesArray : []).map(course => ({
        ...course,
        course_id: course.id,
        category_id: course.categoryId,
        instructor: {
          name: course.instructorName || 'Instructor',
          avatar: `https://ui-avatars.com/api/?name=${course.instructorName || 'Instructor'}&background=6366f1&color=fff`
        },
        thumbnail: course.thumbnail || `https://picsum.photos/400/250?random=${course.id}`,
        students_count: course.enrollmentCount || 0,
        rating: course.rating || 4.5,
        progress: Math.floor(Math.random() * 80) + 10
      }));
      setRecentCourses(mappedRecentCourses);
    }
  }, [recentCoursesData]);

  const formatCurrency = (price) => {
    if (!price || price === 0) return 'Free';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const CourseCard = ({ course, isRecent = false }) => (
    <Card 
      className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={() => navigate(`/courses/${course.id}`)}
    >
      <div className="relative">
        <img 
          src={course.thumbnail || `https://picsum.photos/400/250?random=${course.id}`}
          alt={course.title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        {isRecent && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-green-500 text-white">Continue</Badge>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-white/90 text-gray-700">
            {course.level || 'Beginner'}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
            <img 
              src={course.instructor?.avatar || `https://ui-avatars.com/api/?name=${course.instructor?.name || 'Instructor'}&background=random`}
              alt="instructor"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-sm text-gray-600">{course.instructor?.name || 'Unknown Instructor'}</span>
        </div>
        
        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
          {course.title}
        </h3>
        
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{course.duration || '8h 15m'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{course.students_count || 2847}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{course.rating || 4.8}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-blue-600">
            {course.price === 0 ? 'Free' : formatCurrency(course.price || 89)}
          </div>
          {isRecent && (
            <div className="flex items-center text-sm text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              <span>45% complete</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <LearnerNavbar />
      
      <main>
        {/* Welcome Back Section */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome back, ready for your next lesson?
              </h1>
              <p className="text-xl text-gray-600">
                Continue learning and achieve your goals with our expert-crafted courses.
              </p>
            </div>

            {/* Recent Courses */}
            {recentCourses.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Recent Courses</h2>
                  <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                    View History
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {(recentCourses || []).map(course => (
                    <CourseCard key={`recent-${course.id}`} course={course} isRecent={true} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Course Categories */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Choice favourite course from top category
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Explore courses across different categories and find what interests you most.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              {[
                { name: 'Design', icon: '🎨', color: 'bg-green-100 text-green-600', courses: 38 },
                { name: 'Development', icon: '💻', color: 'bg-blue-100 text-blue-600', courses: 52 },
                { name: 'Business', icon: '💼', color: 'bg-purple-100 text-purple-600', courses: 24 },
                { name: 'Marketing', icon: '📈', color: 'bg-orange-100 text-orange-600', courses: 31 },
                { name: 'Photography', icon: '📷', color: 'bg-pink-100 text-pink-600', courses: 19 },
                { name: 'Acting', icon: '🎭', color: 'bg-indigo-100 text-indigo-600', courses: 15 },
                { name: 'Business', icon: '💰', color: 'bg-teal-100 text-teal-600', courses: 28 },
                { name: 'Data Science', icon: '📊', color: 'bg-cyan-100 text-cyan-600', courses: 22 }
              ].map((category, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <span className="text-2xl">{category.icon}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.courses} Courses</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Recommended Courses */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Recommended for you</h2>
              <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                See all
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(courses || []).slice(0, 4).map(course => (
                <CourseCard key={`recommended-${course.id}`} course={course} />
              ))}
            </div>
          </div>
        </section>

        {/* Get choice of your course */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Get choice of your course</h2>
              <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                See all
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(courses || []).slice(4, 8).map(course => (
                <CourseCard key={`choice-${course.id}`} course={course} />
              ))}
            </div>
          </div>
        </section>

        {/* Online coaching section */}
        <section className="py-16 bg-gradient-to-r from-blue-900 to-purple-900 text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-4">Online coaching lessons for remote learning.</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Connect with expert instructors and learn from anywhere in the world with our interactive online platform.
            </p>
            <Button 
              size="lg"
              className="bg-white text-blue-900 hover:bg-gray-100 px-8 py-4 text-lg rounded-xl"
              onClick={() => navigate('/catalog')}
            >
              Start learning now
            </Button>
          </div>
        </section>

        {/* The course in personal development */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">The course in personal development</h2>
              <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                See all
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(courses || []).slice(0, 4).map(course => (
                <CourseCard key={`personal-${course.id}`} course={course} />
              ))}
            </div>
          </div>
        </section>

        {/* Student are viewing section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Student are viewing</h2>
              <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                See all
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(courses || []).slice(4, 8).map(course => (
                <CourseCard key={`viewing-${course.id}`} course={course} />
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default LandingSimple;