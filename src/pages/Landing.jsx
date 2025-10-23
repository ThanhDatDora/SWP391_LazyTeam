import React, { useState, useEffect } from 'react';
import { ArrowRight, Users, BookOpen, Trophy, Play, Star, Check, ChevronRight, Globe, Award, Clock, MessageCircle, Heart, Share2 } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import CourseCard from '../components/course/CourseCard';
import GuestHeader from '../components/layout/GuestHeader';
import AppLayout from '../components/layout/AppLayout';
import Footer from '../components/layout/Footer';
import { COURSES } from '../data/mockData';
import { api } from '../services/api';
import { useNavigation } from '../hooks/useNavigation';
import { useAuth } from '../contexts/AuthContext';

const Landing = () => {
  const navigate = useNavigation();
  const { isAuthenticated, state } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Debug log to check authentication state
  console.log('Landing - isAuthenticated:', isAuthenticated);
  console.log('Landing - state:', state);
  console.log('Landing - user:', state.user);
  console.log('Landing - state.isAuthenticated:', state.isAuthenticated);
  
  useEffect(() => {
    loadCourses();
  }, []);
  
  // Also log when auth state changes
  useEffect(() => {
    console.log('🔄 Auth state changed:', { isAuthenticated, user: state.user });
  }, [isAuthenticated, state.user]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await api.courses.getCourses({ limit: 3 });
      if (response.success && response.data) {
        setCourses(response.data);
      } else {
        setCourses(COURSES.slice(0, 3));
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      setCourses(COURSES.slice(0, 3));
    } finally {
      setLoading(false);
    }
  };
  
  const stats = [
    { value: '15K+', label: 'Students', icon: Users },
    { value: '75%', label: 'Success Rate', icon: Trophy },
    { value: '35', label: 'Courses', icon: BookOpen },
    { value: '26', label: 'Languages', icon: Globe },
    { value: '16', label: 'Countries', icon: Award }
  ];

  const features = [
    {
      icon: '📚',
      title: 'Online Billing, Invoicing, & Contracts',
      description: 'Simple and secure control of your organization financial and legal transactions. Send customized invoices and contracts.',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      icon: '📊', 
      title: 'Easy Scheduling & Attendance Tracking',
      description: 'Schedule and reserve classrooms at one campus or multiple campuses. Keep detailed records of student attendance.',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: '🎓',
      title: 'Customer Tracking',
      description: 'Automate and track emails to individuals or groups. Skilline built-in system helps organize your organization.',
      color: 'bg-green-100 text-green-600'
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Marketing Manager',
      company: 'Tech Corp',
      image: '👩‍💼',
      rating: 5,
      content: 'The courses here are fantastic! I have learned so much and it has really helped advance my career. The instructors are knowledgeable and supportive.'
    },
    {
      id: 2, 
      name: 'Mike Chen',
      role: 'Software Developer',
      company: 'StartupXYZ',
      image: '👨‍💻',
      rating: 5,
      content: 'Great platform with high-quality content. The interactive lessons and practical projects made learning enjoyable and effective.'
    },
    {
      id: 3,
      name: 'Emily Davis',
      role: 'UX Designer', 
      company: 'Design Studio',
      image: '👩‍🎨',
      rating: 5,
      content: 'I love the flexibility of learning at my own pace. The course materials are well-structured and the community support is amazing.'
    }
  ];

  const popularCourses = [
    {
      id: 1,
      title: 'Complete React Development Course',
      instructor: 'John Doe',
      rating: 4.8,
      students: 2547,
      price: 899000,
      originalPrice: 1299000,
      duration: '42 hours',
      lessons: 156,
      level: 'Beginner',
      category: 'Web Development',
      image: '⚛️',
      badge: 'Bestseller'
    },
    {
      id: 2,
      title: 'Advanced JavaScript & ES6+',
      instructor: 'Jane Smith',
      rating: 4.9,
      students: 1832,
      price: 799000,
      originalPrice: 1199000, 
      duration: '28 hours',
      lessons: 89,
      level: 'Advanced',
      category: 'Programming',
      image: '🟨',
      badge: 'Hot'
    },
    {
      id: 3,
      title: 'UI/UX Design Masterclass',
      instructor: 'Alex Wilson',
      rating: 4.7,
      students: 3241,
      price: 699000,
      originalPrice: 999000,
      duration: '35 hours', 
      lessons: 124,
      level: 'Intermediate',
      category: 'Design',
      image: '🎨',
      badge: 'Popular'
    }
  ];

  // Render cho guest users (chưa đăng nhập)
  if (!isAuthenticated) {
    return (
      <div className='min-h-screen bg-white'>
        <GuestHeader />
        
        <main className='overflow-hidden'>
          {/* Hero Section */}
          <section className='relative bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 py-20'>
            <div className='container mx-auto px-6'>
              <div className='grid lg:grid-cols-2 gap-12 items-center'>
                <div className='space-y-8'>
                  <div className='inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-teal-600 shadow-sm'>
                    <Trophy className='w-4 h-4' />
                    <span>Trusted by 15,000+ students worldwide</span>
                  </div>
                  
                  <div className='space-y-6'>
                    <h1 className='text-5xl lg:text-7xl font-bold text-gray-900 leading-tight'>
                      Studying{' '}
                      <span className='text-transparent bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text'>
                        Online is now
                      </span>{' '}
                      <span className='text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text'>
                        much easier
                      </span>
                    </h1>
                    
                    <p className='text-xl text-gray-600 max-w-lg leading-relaxed'>
                      Skilline is an interesting platform that will teach you in more an interactive way
                    </p>
                  </div>

                  <div className='flex flex-col sm:flex-row gap-4'>
                    <Button 
                      onClick={() => navigate('/auth')}
                      size='lg'
                      className='bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all'
                    >
                      Join for free
                      <ArrowRight className='ml-2 w-5 h-5' />
                    </Button>
                    <Button 
                      variant='outline' 
                      size='lg'
                      className='border-2 border-gray-300 hover:border-teal-500 px-8 py-4 text-lg rounded-xl group'
                    >
                      <Play className='w-5 h-5 mr-2 group-hover:text-teal-600' />
                      Watch how it works
                    </Button>
                  </div>

                  {/* Trust indicators */}
                  <div className='flex items-center gap-6 pt-4'>
                    <div className='flex -space-x-2'>
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className='w-10 h-10 rounded-full bg-gradient-to-r from-teal-400 to-blue-500 border-2 border-white flex items-center justify-center text-white font-semibold'>
                          {String.fromCharCode(64 + i)}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className='flex items-center gap-1 text-yellow-400'>
                        {[1,2,3,4,5].map(i => <Star key={i} className='w-4 h-4 fill-current' />)}
                      </div>
                      <p className='text-sm text-gray-600'>4.9/5 from 2,000+ reviews</p>
                    </div>
                  </div>
                </div>

                {/* Right side illustration */}
                <div className='relative'>
                  <div className='relative bg-gradient-to-br from-teal-400 to-blue-500 rounded-3xl p-8 text-white shadow-2xl'>
                    <div className='text-center space-y-6'>
                      <div className='text-8xl'>👩‍🎓</div>
                      <h3 className='text-3xl font-bold'>Start Learning Today</h3>
                      <p className='text-teal-100 text-lg'>Join thousands of successful students</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className='py-16 bg-white'>
            <div className='container mx-auto px-6'>
              <div className='text-center mb-12'>
                <h2 className='text-4xl font-bold text-gray-900 mb-4'>Our Success</h2>
                <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
                  Ornare id fames interdum porttitor nulla turpis etiam. Diam vitae sollicitudin at nec nam et pharetra gravida.
                </p>
              </div>
              
              <div className='grid grid-cols-2 md:grid-cols-5 gap-8'>
                {stats.map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <div key={index} className='text-center group hover:scale-105 transition-transform'>
                      <div className='inline-flex items-center justify-center w-16 h-16 bg-teal-100 text-teal-600 rounded-2xl mb-4 group-hover:bg-teal-200 transition-colors'>
                        <IconComponent className='h-8 w-8' />
                      </div>
                      <div className='text-4xl font-bold text-gray-900 mb-2'>{stat.value}</div>
                      <div className='text-gray-600 font-medium'>{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Popular Courses */}
          <section className='py-20 bg-white'>
            <div className='container mx-auto px-6'>
              <div className='text-center mb-16'>
                <h2 className='text-4xl lg:text-5xl font-bold text-gray-900 mb-6'>
                  Explore Course
                </h2>
                <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
                  Ut sed eros finibus, placerat orci id, dapibus mauris. Vestibulum consequat, diam et bibendum molestie dolor lorem.
                </p>
              </div>
              
              <div className='grid lg:grid-cols-3 gap-8'>
                {popularCourses.map((course) => (
                  <Card key={course.id} className='group hover:shadow-2xl transition-all duration-300 border-0 overflow-hidden'>
                    <div className='relative'>
                      <div className='h-48 bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-6xl text-white'>
                        {course.image}
                      </div>
                      {course.badge && (
                        <Badge className='absolute top-4 left-4 bg-orange-500 hover:bg-orange-600'>
                          {course.badge}
                        </Badge>
                      )}
                      <Button size='sm' variant='secondary' className='absolute top-4 right-4 rounded-full w-10 h-10 p-0'>
                        <Heart className='w-4 h-4' />
                      </Button>
                    </div>
                    <CardContent className='p-6'>
                      <div className='flex items-center justify-between mb-3'>
                        <Badge variant='secondary' className='text-teal-600 bg-teal-50'>
                          {course.category}
                        </Badge>
                        <div className='flex items-center gap-1 text-yellow-400'>
                          <Star className='w-4 h-4 fill-current' />
                          <span className='text-sm font-medium text-gray-700'>{course.rating}</span>
                        </div>
                      </div>
                      
                      <h3 className='text-xl font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors'>
                        {course.title}
                      </h3>
                      
                      <p className='text-gray-600 mb-4'>By {course.instructor}</p>
                      
                      <div className='flex items-center gap-4 text-sm text-gray-500 mb-4'>
                        <div className='flex items-center gap-1'>
                          <Clock className='w-4 h-4' />
                          <span>{course.duration}</span>
                        </div>
                        <div className='flex items-center gap-1'>
                          <BookOpen className='w-4 h-4' />
                          <span>{course.lessons} lessons</span>
                        </div>
                        <Badge variant='outline' className='text-xs'>
                          {course.level}
                        </Badge>
                      </div>
                      
                      <div className='flex items-center justify-between'>
                        <div>
                          <div className='flex items-center gap-2'>
                            <span className='text-2xl font-bold text-teal-600'>
                              {course.price.toLocaleString('vi-VN')}đ
                            </span>
                            <span className='text-lg text-gray-400 line-through'>
                              {course.originalPrice.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                          <p className='text-sm text-gray-500'>{course.students} students</p>
                        </div>
                        <Button className='bg-teal-600 hover:bg-teal-700' onClick={() => navigate('/auth')}>
                          Enroll
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className='text-center mt-12'>
                <Button 
                  onClick={() => navigate('/auth')}
                  size='lg' 
                  className='bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 px-8 py-4 text-lg rounded-xl'
                >
                  Explore all courses
                  <ArrowRight className='ml-2 w-5 h-5' />
                </Button>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    );
  }

  // Dashboard cho authenticated users
  return (
    <AppLayout user={state.user}>
      <div className='bg-gray-50 min-h-screen -m-6'>
        {/* Welcome Header */}
        <section className='bg-gradient-to-r from-teal-500 to-blue-600 text-white py-12'>
          <div className='container mx-auto px-6'>
            <div className='grid lg:grid-cols-2 gap-8 items-center'>
              <div>
                <h1 className='text-4xl lg:text-5xl font-bold mb-4'>
                  Welcome back, {state.user?.full_name || state.user?.name || 'Student'}! 
                </h1>
                <p className='text-xl text-teal-100 mb-6'>
                  Ready to continue your learning journey? You have 3 courses in progress.
                </p>
                <div className='flex flex-col sm:flex-row gap-4'>
                  <Button 
                    size='lg' 
                    className='bg-white text-teal-600 hover:bg-gray-100 px-8 py-3'
                    onClick={() => navigate('/my-courses')}
                  >
                    Continue Learning
                    <ArrowRight className='ml-2 w-5 h-5' />
                  </Button>
                  <Button 
                    size='lg' 
                    variant='outline' 
                    className='border-2 border-white text-white hover:bg-white hover:text-teal-600 px-8 py-3'
                    onClick={() => navigate('/catalog')}
                  >
                    Browse Courses
                  </Button>
                </div>
              </div>
              
              {/* Progress Overview */}
              <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-6'>
                <h3 className='text-xl font-bold mb-4'>Your Progress</h3>
                <div className='space-y-4'>
                  <div className='flex justify-between items-center'>
                    <span>Courses Completed</span>
                    <span className='font-bold'>8/12</span>
                  </div>
                  <div className='w-full bg-white/20 rounded-full h-2'>
                    <div className='bg-white rounded-full h-2 w-2/3' />
                  </div>
                  <div className='grid grid-cols-3 gap-4 mt-6'>
                    <div className='text-center'>
                      <div className='text-2xl font-bold'>147</div>
                      <div className='text-teal-100 text-sm'>Hours Learned</div>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-bold'>23</div>
                      <div className='text-teal-100 text-sm'>Certificates</div>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-bold'>4.8</div>
                      <div className='text-teal-100 text-sm'>Avg Score</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className='py-8'>
          <div className='container mx-auto px-6'>
            <div className='grid md:grid-cols-4 gap-6'>
              <Card className='hover:shadow-lg transition-shadow cursor-pointer' onClick={() => navigate('/my-courses')}>
                <CardContent className='p-6 text-center'>
                  <div className='w-12 h-12 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4'>
                    <BookOpen className='w-6 h-6' />
                  </div>
                  <h3 className='font-bold text-gray-900'>My Courses</h3>
                  <p className='text-gray-600 text-sm'>Continue learning</p>
                </CardContent>
              </Card>
              
              <Card className='hover:shadow-lg transition-shadow cursor-pointer' onClick={() => navigate('/progress')}>
                <CardContent className='p-6 text-center'>
                  <div className='w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4'>
                    <Trophy className='w-6 h-6' />
                  </div>
                  <h3 className='font-bold text-gray-900'>Progress</h3>
                  <p className='text-gray-600 text-sm'>Track achievements</p>
                </CardContent>
              </Card>
              
              <Card className='hover:shadow-lg transition-shadow cursor-pointer' onClick={() => navigate('/certificates')}>
                <CardContent className='p-6 text-center'>
                  <div className='w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mx-auto mb-4'>
                    <Award className='w-6 h-6' />
                  </div>
                  <h3 className='font-bold text-gray-900'>Certificates</h3>
                  <p className='text-gray-600 text-sm'>View achievements</p>
                </CardContent>
              </Card>
              
              <Card className='hover:shadow-lg transition-shadow cursor-pointer' onClick={() => navigate('/catalog')}>
                <CardContent className='p-6 text-center'>
                  <div className='w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4'>
                    <Star className='w-6 h-6' />
                  </div>
                  <h3 className='font-bold text-gray-900'>Explore</h3>
                  <p className='text-gray-600 text-sm'>Find new courses</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Recent Activity */}
        <section className='py-8'>
          <div className='container mx-auto px-6'>
            <div className='grid lg:grid-cols-3 gap-8'>
              {/* Continue Learning */}
              <div className='lg:col-span-2'>
                <div className='flex items-center justify-between mb-6'>
                  <h2 className='text-2xl font-bold text-gray-900'>Continue Learning</h2>
                  <Button variant='ghost' onClick={() => navigate('/my-courses')}>
                    View all <ChevronRight className='ml-1 w-4 h-4' />
                  </Button>
                </div>
                
                <div className='space-y-4'>
                  {[1,2,3].map((i) => (
                    <Card key={i} className='hover:shadow-lg transition-shadow'>
                      <CardContent className='p-6'>
                        <div className='flex items-center gap-4'>
                          <div className='w-16 h-16 bg-gradient-to-r from-teal-400 to-blue-500 rounded-xl flex items-center justify-center text-white text-2xl'>
                            📚
                          </div>
                          <div className='flex-1'>
                            <h3 className='font-bold text-gray-900 mb-1'>
                              React Development Course {i}
                            </h3>
                            <p className='text-gray-600 text-sm mb-2'>
                              Chapter {i + 2}: Advanced Concepts
                            </p>
                            <div className='flex items-center gap-4'>
                              <div className='flex-1 bg-gray-200 rounded-full h-2'>
                                <div 
                                  className='bg-teal-500 rounded-full h-2' 
                                  style={{width: `${60 + (i * 10)}%`}}
                                />
                              </div>
                              <span className='text-sm text-gray-600'>{60 + (i * 10)}%</span>
                            </div>
                          </div>
                          <Button size='sm' onClick={() => navigate(`/course/${i}`)}>
                            Continue
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              {/* Sidebar */}
              <div className='space-y-6'>
                {/* Achievements */}
                <Card>
                  <CardContent className='p-6'>
                    <h3 className='font-bold text-gray-900 mb-4'>Recent Achievements</h3>
                    <div className='space-y-3'>
                      {[
                        { icon: '🏆', title: 'Course Master', desc: 'Completed 5 courses' },
                        { icon: '⚡', title: 'Quick Learner', desc: '10 lessons in one day' },
                        { icon: '🎯', title: 'Perfect Score', desc: '100% on final exam' }
                      ].map((achievement, i) => (
                        <div key={i} className='flex items-center gap-3'>
                          <div className='text-2xl'>{achievement.icon}</div>
                          <div>
                            <div className='font-medium text-gray-900'>{achievement.title}</div>
                            <div className='text-sm text-gray-600'>{achievement.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Study Streak */}
                <Card>
                  <CardContent className='p-6'>
                    <h3 className='font-bold text-gray-900 mb-4'>Study Streak</h3>
                    <div className='text-center'>
                      <div className='text-4xl font-bold text-teal-600'>15</div>
                      <div className='text-gray-600'>days in a row</div>
                      <div className='text-6xl my-4'>🔥</div>
                      <p className='text-sm text-gray-600'>
                        Keep it up! You are on fire!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Recommended Courses */}
        <section className='py-8'>
          <div className='container mx-auto px-6'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-2xl font-bold text-gray-900'>Recommended for You</h2>
              <Button variant='ghost' onClick={() => navigate('/catalog')}>
                View all <ChevronRight className='ml-1 w-4 h-4' />
              </Button>
            </div>
            
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {popularCourses.slice(0, 3).map((course) => (
                <Card key={course.id} className='group hover:shadow-xl transition-all duration-300 border-0 overflow-hidden'>
                  <div className='relative'>
                    <div className='h-48 bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-6xl text-white'>
                      {course.image}
                    </div>
                    {course.badge && (
                      <Badge className='absolute top-4 left-4 bg-orange-500 hover:bg-orange-600'>
                        {course.badge}
                      </Badge>
                    )}
                  </div>
                  <CardContent className='p-6'>
                    <div className='flex items-center justify-between mb-3'>
                      <Badge variant='secondary' className='text-teal-600 bg-teal-50'>
                        {course.category}
                      </Badge>
                      <div className='flex items-center gap-1 text-yellow-400'>
                        <Star className='w-4 h-4 fill-current' />
                        <span className='text-sm font-medium text-gray-700'>{course.rating}</span>
                      </div>
                    </div>
                    
                    <h3 className='text-xl font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors'>
                      {course.title}
                    </h3>
                    
                    <p className='text-gray-600 mb-4'>By {course.instructor}</p>
                    
                    <div className='flex items-center justify-between'>
                      <div>
                        <span className='text-2xl font-bold text-teal-600'>
                          {course.price.toLocaleString('vi-VN')}đ
                        </span>
                        <p className='text-sm text-gray-500'>{course.students} students</p>
                      </div>
                      <Button className='bg-teal-600 hover:bg-teal-700' onClick={() => navigate(`/course/${course.id}`)}>
                        Enroll
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default Landing;
