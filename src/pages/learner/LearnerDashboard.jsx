import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { BookOpen, Users, Clock, Star, ArrowRight, Calendar, TrendingUp } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../hooks/useNavigation';
import AppLayout from '../../components/layout/AppLayout';

const LearnerDashboard = () => {
  const navigate = useNavigation();
  const { state: authState } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLearnerData();
  }, []);

  const loadLearnerData = async () => {
    try {
      setLoading(true);
      
      // Mock enrolled courses
      setEnrolledCourses([
        {
          id: 1,
          title: 'AWS Certified solutions Architect',
          category: 'AWS Certificate',
          progress: 25
        },
        {
          id: 2,
          title: 'AWS Certified solutions Architect',
          category: 'AWS Certificate', 
          progress: 65
        },
        {
          id: 3,
          title: 'AWS Certified solutions Architect',
          category: 'AWS Certificate',
          progress: 90
        }
      ]);

      // Mock recommended courses
      setRecommendedCourses([
        {
          id: 1,
          title: 'AWS Certified solutions Architect',
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt'
        },
        {
          id: 2,
          title: 'AWS Certified solutions Architect',
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt'
        },
        {
          id: 3,
          title: 'AWS Certified solutions Architect', 
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt'
        },
        {
          id: 4,
          title: 'AWS Certified solutions Architect',
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt'
        }
      ]);

      // Load categories
      setCategories([
        { name: 'Design', icon: '✏️', color: 'bg-green-100 text-green-600' },
        { name: 'Development', icon: '💻', color: 'bg-blue-100 text-blue-600' },
        { name: 'Development', icon: '�', color: 'bg-blue-100 text-blue-600' },
        { name: 'Business', icon: '💼', color: 'bg-teal-100 text-teal-600' },
        { name: 'Marketing', icon: '📢', color: 'bg-yellow-100 text-yellow-600' },
        { name: 'Photography', icon: '📸', color: 'bg-red-100 text-red-600' },
        { name: 'Acting', icon: '🎭', color: 'bg-purple-100 text-purple-600' },
        { name: 'Business', icon: '💼', color: 'bg-teal-100 text-teal-600' }
      ]);

    } catch (error) {
      console.error('Error loading learner data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout user={authState.user}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4" />
            <p className="text-gray-600">Đang tải...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout user={authState.user}>
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-12">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">
              Welcome back, ready for your next lesson?
            </h1>
            <Button 
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3" 
              onClick={() => navigate('/progress')}
            >
              View History
            </Button>
          </div>

          {/* Current Courses - only show if user has enrolled courses */}
          {enrolledCourses.length > 0 && (
            <section>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {enrolledCourses.map((course, index) => (
                  <Card key={course.id} className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden">
                    <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-500" />
                    <CardContent className="p-6">
                      <Badge className="mb-3 bg-teal-100 text-teal-700">{course.category || 'AWS Certified solutions Architect'}</Badge>
                      <h3 className="font-semibold text-gray-900 mb-3 text-lg">{course.title || 'AWS Certified solutions Architect'}</h3>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <span>Week {index + 1} of 12</span>
                        <span>{course.progress || '25'}% Complete</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                        <div 
                          className="bg-teal-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${course.progress || 25}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            U
                          </div>
                          <span className="text-sm text-gray-700 font-medium">Una</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm line-through text-gray-400">$99</span>
                          <span className="text-xl font-bold text-teal-600 ml-2">$69</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Choice Categories */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Choice favourite course from top category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-8 text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-xl ${category.color} flex items-center justify-center text-3xl font-bold shadow-sm`}>
                      {category.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-2">{category.name}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmodolm</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Recommended Courses */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Recommended for you</h2>
              <Button 
                variant="outline" 
                className="border-teal-600 text-teal-600 hover:bg-teal-50"
                onClick={() => navigate('/catalog')}
              >
                See all
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedCourses.map((course, index) => (
                <Card key={course.id} className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-teal-400 to-blue-500" />
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-3 text-lg">{course.title || 'AWS Certified solutions Architect'}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">{course.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt'}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          U
                        </div>
                        <span className="text-sm text-gray-700 font-medium">Una</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm line-through text-gray-400">$99</span>
                        <span className="text-xl font-bold text-teal-600 ml-2">$69</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Personal Development Section */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Get choice of your course</h2>
              <Button variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50">See all</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedCourses.map((course, index) => (
                <Card key={`personal-${course.id}`} className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-green-400 to-teal-500" />
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-3 text-lg">{course.title || 'AWS Certified solutions Architect'}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">{course.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt'}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          U
                        </div>
                        <span className="text-sm text-gray-700 font-medium">Una</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm line-through text-gray-400">$99</span>
                        <span className="text-xl font-bold text-teal-600 ml-2">$69</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Student Viewing Section */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Student are viewing</h2>
              <Button variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50">See all</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedCourses.map((course, index) => (
                <Card key={`viewing-${course.id}`} className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-purple-400 to-pink-500" />
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-3 text-lg">{course.title || 'AWS Certified solutions Architect'}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">{course.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt'}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          U
                        </div>
                        <span className="text-sm text-gray-700 font-medium">Una</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm line-through text-gray-400">$99</span>
                        <span className="text-xl font-bold text-teal-600 ml-2">$69</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Online Coaching CTA */}
          <section className="bg-gradient-to-r from-teal-500 to-blue-600 text-white p-12 rounded-2xl text-center shadow-xl">
            <h2 className="text-3xl font-bold mb-6">Online coaching lessons for remote learning.</h2>
            <p className="text-teal-100 mb-8 text-lg max-w-3xl mx-auto leading-relaxed">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.</p>
            <Button className="bg-white text-teal-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold shadow-lg">
              Start learning now!
            </Button>
          </section>
        </div>
      </main>
    </AppLayout>
  );
};

export default LearnerDashboard;