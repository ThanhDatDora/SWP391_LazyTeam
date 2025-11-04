import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Clock, Play, Award, Search, Filter, Grid, List } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../hooks/useNavigation';
import LearnerNavbar from '../components/layout/LearnerNavbar';
import Footer from '../components/layout/Footer';
import { api } from '../services/api';

const MyCoursesPage = () => {
  const { state } = useAuth();
  const navigate = useNavigation();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'in-progress', 'completed'
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 MyCoursesPage: User changed, reloading courses...', {
      hasUser: !!state.user,
      userEmail: state.user?.email,
      userId: state.user?.userId
    });
    
    // Clear existing courses when user changes
    setEnrolledCourses([]);
    
    // Only load courses if user is logged in
    if (state.user) {
      loadMyCourses();
    } else {
      setLoading(false);
    }
  }, [state.user]); // Re-fetch when user changes

  const loadMyCourses = async () => {
    try {
      setLoading(true);
      console.log('📡 Fetching my courses for user:', state.user?.email);
      const response = await api.courses.getMyCourses();
      console.log('📚 My Courses API response:', response);
      
      if (response.success && response.data) {
        // Transform data to match component expectations
        const transformedCourses = response.data.map(course => ({
          ...course,
          lastAccessed: course.lastAccessed ? new Date(course.lastAccessed) : new Date(),
          nextLesson: course.nextLesson || 'Start Learning'
        }));
        
        console.log('✅ Transformed courses:', transformedCourses);
        setEnrolledCourses(transformedCourses);
      } else {
        console.error('❌ Failed to load my courses:', response.message);
        
        // Use mock data for testing if API fails
        console.log('🔧 Loading mock data for testing...');
        const mockCourses = [
          {
            id: 1,
            title: 'Complete Web Development Bootcamp',
            instructor: 'John Doe',
            description: 'Learn web development from scratch',
            duration: '10',
            progress: 35,
            status: 'in-progress',
            totalLessons: 42,
            completedLessons: 15,
            lastAccessed: new Date(),
            nextLesson: 'Introduction to JavaScript',
            category: 'Web Development',
            thumbnail: 'https://picsum.photos/400/250',
            certificate: false
          },
          {
            id: 2,
            title: 'Python for Data Science',
            instructor: 'Jane Smith',
            description: 'Master Python programming for data analysis',
            duration: '8',
            progress: 75,
            status: 'in-progress',
            totalLessons: 30,
            completedLessons: 22,
            lastAccessed: new Date(Date.now() - 86400000), // 1 day ago
            nextLesson: 'Machine Learning Basics',
            category: 'Data Science',
            thumbnail: 'https://picsum.photos/400/250',
            certificate: false
          },
          {
            id: 3,
            title: 'React Masterclass',
            instructor: 'Mike Johnson',
            description: 'Build modern web apps with React',
            duration: '12',
            progress: 100,
            status: 'completed',
            totalLessons: 50,
            completedLessons: 50,
            lastAccessed: new Date(Date.now() - 172800000), // 2 days ago
            nextLesson: null,
            category: 'Frontend Development',
            thumbnail: 'https://picsum.photos/400/250',
            certificate: true
          }
        ];
        setEnrolledCourses(mockCourses);
      }
    } catch (error) {
      console.error('❌ Error loading my courses:', error);
      
      // Use mock data on error for testing
      console.log('🔧 Loading mock data due to error...');
      const mockCourses = [
        {
          id: 1,
          title: 'Complete Web Development Bootcamp',
          instructor: 'John Doe',
          description: 'Learn web development from scratch',
          duration: '10',
          progress: 35,
          status: 'in-progress',
          totalLessons: 42,
          completedLessons: 15,
          lastAccessed: new Date(),
          nextLesson: 'Introduction to JavaScript',
          category: 'Web Development',
          thumbnail: 'https://picsum.photos/400/250',
          certificate: false
        },
        {
          id: 2,
          title: 'Python for Data Science',
          instructor: 'Jane Smith',
          description: 'Master Python programming for data analysis',
          duration: '8',
          progress: 75,
          status: 'in-progress',
          totalLessons: 30,
          completedLessons: 22,
          lastAccessed: new Date(Date.now() - 86400000),
          nextLesson: 'Machine Learning Basics',
          category: 'Data Science',
          thumbnail: 'https://picsum.photos/400/250',
          certificate: false
        },
        {
          id: 3,
          title: 'React Masterclass',
          instructor: 'Mike Johnson',
          description: 'Build modern web apps with React',
          duration: '12',
          progress: 100,
          status: 'completed',
          totalLessons: 50,
          completedLessons: 50,
          lastAccessed: new Date(Date.now() - 172800000),
          nextLesson: null,
          category: 'Frontend Development',
          thumbnail: 'https://picsum.photos/400/250',
          certificate: true
        }
      ];
      setEnrolledCourses(mockCourses);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = enrolledCourses.filter(course => {
    const matchesSearch = searchTerm === '' || 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || course.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: enrolledCourses.length,
    inProgress: enrolledCourses.filter(c => c.status === 'in-progress').length,
    completed: enrolledCourses.filter(c => c.status === 'completed').length,
    totalHours: enrolledCourses.reduce((total, course) => total + parseInt(course.duration), 0)
  };

  const formatProgress = (progress) => {
    return `${progress}%`;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LearnerNavbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
          <p className="text-gray-600">
            Track your learning progress and continue where you left off
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-teal-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Courses</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Play className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.inProgress}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalHours}h</div>
              <div className="text-sm text-gray-600">Learning Time</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search your courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Courses</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            
            <div className="flex items-center border border-gray-300 rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none border-r"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Courses Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredCourses.map(course => (
              <Card 
                key={course.id} 
                className={`hover:shadow-lg transition-shadow cursor-pointer ${
                  viewMode === 'list' ? 'md:flex md:items-center' : ''
                }`}
                onClick={() => navigate(`/learn/${course.id}`)}
              >
                <CardContent className="p-0">
                  {viewMode === 'grid' ? (
                    <>
                      {/* Grid View */}
                      <div className="aspect-video bg-gradient-to-br from-teal-400 to-blue-500 rounded-t-lg flex items-center justify-center relative">
                        <BookOpen className="w-12 h-12 text-white" />
                        {course.status === 'completed' && (
                          <div className="absolute top-3 right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <Award className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={course.status === 'completed' ? 'success' : 'secondary'}>
                            {course.status === 'completed' ? 'Completed' : 'In Progress'}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {formatProgress(course.progress)}
                          </span>
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {course.title}
                        </h3>
                        
                        <p className="text-sm text-gray-600 mb-3">by {course.instructor}</p>
                        
                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>{course.completedLessons} of {course.totalLessons} lessons</span>
                            <span>{formatProgress(course.progress)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                course.status === 'completed' ? 'bg-green-500' : 'bg-teal-500'
                              }`}
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-500 mb-4">
                          Last accessed: {formatDate(course.lastAccessed)}
                        </div>
                        
                        <Button 
                          className="w-full" 
                          variant={course.status === 'completed' ? 'outline' : 'default'}
                        >
                          {course.status === 'completed' ? 'Review Course' : 'Continue Learning'}
                        </Button>
                      </div>
                    </>
                  ) : (
                    /* List View */
                    <div className="flex items-center gap-6 p-6">
                      <div className="w-32 h-20 bg-gradient-to-br from-teal-400 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 relative">
                        <BookOpen className="w-8 h-8 text-white" />
                        {course.status === 'completed' && (
                          <div className="absolute top-1 right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Award className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 truncate">{course.title}</h3>
                          <Badge variant={course.status === 'completed' ? 'success' : 'secondary'}>
                            {course.status === 'completed' ? 'Completed' : 'In Progress'}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">by {course.instructor}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                          <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                          <span>Last accessed: {formatDate(course.lastAccessed)}</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{formatProgress(course.progress)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                course.status === 'completed' ? 'bg-green-500' : 'bg-teal-500'
                              }`}
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant={course.status === 'completed' ? 'outline' : 'default'}
                          size="sm"
                        >
                          {course.status === 'completed' ? 'Review' : 'Continue'}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No courses found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Try adjusting your search term' : 'You haven\'t enrolled in any courses yet'}
            </p>
            <Button onClick={() => navigate('/courses')}>
              Browse Courses
            </Button>
          </div>
        )}

        {/* Continue Learning Section */}
        {enrolledCourses.filter(c => c.status === 'in-progress').length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Continue Learning</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {enrolledCourses
                .filter(c => c.status === 'in-progress')
                .slice(0, 2)
                .map(course => (
                  <Card 
                    key={`continue-${course.id}`}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/learn/${course.id}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-12 bg-gradient-to-br from-teal-400 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Play className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">Next: {course.nextLesson}</p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div 
                              className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatProgress(course.progress)} complete
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* Completed Courses with Certificates */}
        {enrolledCourses.filter(c => c.status === 'completed').length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Completed Courses</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses
                .filter(c => c.status === 'completed')
                .map(course => (
                  <Card key={`completed-${course.id}`} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Award className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Completed on {formatDate(course.lastAccessed)}
                        </p>
                        <div className="space-y-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => navigate(`/learn/${course.id}`)}
                          >
                            Review Course
                          </Button>
                          {course.certificate && (
                            <Button 
                              size="sm" 
                              className="w-full bg-green-600 hover:bg-green-700"
                            >
                              <Award className="w-4 h-4 mr-2" />
                              Download Certificate
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default MyCoursesPage;