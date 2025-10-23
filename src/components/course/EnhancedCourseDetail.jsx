import React, { useState } from 'react';
import { Play, CheckCircle2, Clock, Users, Award, Star, BookOpen, Download, Share2, Heart, Globe, Calendar, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { COURSES, MOOCS, CATEGORIES, TAGS } from '../../data/mockData';
import { formatCurrency } from '../../utils/formatters';
import { useNavigation } from '../../hooks/useNavigation';
import { useAuth } from '../../contexts/AuthContext';
import AppLayout from '../layout/AppLayout';

const EnhancedCourseDetail = ({ courseId }) => {
  const navigate = useNavigation();
  const { state } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedLesson, setSelectedLesson] = useState(0);

  // In real app, this would come from props or API
  const course = COURSES.find(c => c.id === parseInt(courseId)) || COURSES[0];
  const moocs = MOOCS.filter(m => m.courseId === course.id);
  const category = CATEGORIES.find(c => c.id === course.categoryId);
  const tags = course.tagIds.map(id => TAGS.find(t => t.id === id)).filter(Boolean);

  const curriculum = [
    {
      id: 1,
      title: 'Getting Started with React',
      duration: '15:30',
      type: 'video',
      completed: true,
      preview: true
    },
    {
      id: 2,
      title: 'Components and Props',
      duration: '22:45',
      type: 'video', 
      completed: true,
      preview: false
    },
    {
      id: 3,
      title: 'State and Lifecycle',
      duration: '18:20',
      type: 'video',
      completed: false,
      preview: false
    },
    {
      id: 4,
      title: 'Handling Events',
      duration: '12:15',
      type: 'video',
      completed: false,
      preview: false
    },
    {
      id: 5,
      title: 'Quiz: React Fundamentals',
      duration: '10 questions',
      type: 'quiz',
      completed: false,
      preview: false
    },
    {
      id: 6,
      title: 'Building Your First App',
      duration: '35:50',
      type: 'project',
      completed: false,
      preview: false
    }
  ];

  const instructor = {
    name: 'Sarah Johnson',
    title: 'Senior Frontend Engineer at Google',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=150&auto=format&fit=crop',
    rating: 4.9,
    students: '50,000+',
    courses: 12,
    bio: 'Sarah is a passionate educator with over 8 years of experience in web development. She has worked at top tech companies and loves sharing her knowledge with students worldwide.'
  };

  const reviews = [
    {
      id: 1,
      name: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop',
      rating: 5,
      date: '2 weeks ago',
      comment: "Excellent course! Very well structured and easy to follow. Sarah's teaching style is amazing."
    },
    {
      id: 2,
      name: 'Emily Chen',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop', 
      rating: 5,
      date: '1 month ago',
      comment: 'This course transformed my understanding of React. The projects are practical and relevant.'
    },
    {
      id: 3,
      name: 'Mike Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
      rating: 4,
      date: '1 month ago',  
      comment: 'Great content and well-paced lessons. Would definitely recommend to anyone learning React.'
    }
  ];

  const relatedCourses = [
    {
      id: 101,
      title: 'Advanced React Patterns',
      instructor: 'John Smith',
      rating: 4.8,
      price: 79,
      image: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?q=80&w=300&auto=format&fit=crop'
    },
    {
      id: 102,
      title: 'Node.js Backend Development',
      instructor: 'Lisa Wang',
      rating: 4.7,
      price: 89,
      image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=300&auto=format&fit=crop'
    },
    {
      id: 103,
      title: 'Full Stack JavaScript',
      instructor: 'David Kim',
      rating: 4.9,
      price: 129,
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=300&auto=format&fit=crop'
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'curriculum', label: 'Curriculum' },
    { id: 'instructor', label: 'Instructor' },
    { id: 'reviews', label: 'Reviews' }
  ];

  return (
    <AppLayout user={state.user}>
      <div className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <Button 
          variant="outline" 
          className="mb-6"
          onClick={() => navigate('/catalog')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Video Player */}
            <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?q=80&w=1200&auto=format&fit=crop"
                alt="Course Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Button size="lg" className="rounded-full w-16 h-16 bg-white/20 hover:bg-white/30 backdrop-blur-sm">
                  <Play className="w-6 h-6 text-white ml-1" />
                </Button>
              </div>
              <div className="absolute bottom-4 left-4 text-white">
                <Badge className="bg-teal-500">Preview Available</Badge>
              </div>
            </div>

            {/* Course Header */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{category?.name}</Badge>
                {tags.map(tag => (
                  <Badge key={tag.id} variant="secondary">
                    {tag.name}
                  </Badge>
                ))}
              </div>
          
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">{course.title}</h1>
              <p className="text-lg text-gray-600">{course.description}</p>

              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{course.rating}</span>
                  <span>({course.learners} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{course.learners.toLocaleString()} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  <span>{course.language === 'vi' ? 'Vietnamese' : 'English'}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button 
                  className="bg-teal-500 hover:bg-teal-600" 
                  size="lg"
                  onClick={() => navigate(`/checkout?course=${course.id}`)}
                >
              Enroll Now - {formatCurrency(course.price)}
                </Button>
                <Button variant="outline" size="lg">
                  <Heart className="w-4 h-4 mr-2" />
              Save
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="w-4 h-4 mr-2" />
              Share
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex gap-8">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-teal-500 text-teal-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-96">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>What you'll learn</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Build modern React applications from scratch</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Master React hooks and state management</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Implement responsive designs with CSS</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Deploy applications to production</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Best practices for component architecture</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Testing React applications</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Requirements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Basic knowledge of HTML, CSS, and JavaScript</li>
                        <li>• Familiarity with ES6+ features</li>
                        <li>• Node.js installed on your machine</li>
                        <li>• Code editor (VS Code recommended)</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Course Description</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-sm max-w-none">
                      <p>
                    This comprehensive React course will take you from beginner to advanced level. You'll learn how to build modern, 
                    responsive web applications using React and its ecosystem.
                      </p>
                      <p>
                    Throughout the course, you'll work on real-world projects that will help you build a strong portfolio. 
                    We'll cover everything from basic components to advanced patterns and best practices.
                      </p>
                      <p>
                    By the end of this course, you'll have the skills and confidence to build professional React applications 
                    and land your dream job as a frontend developer.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'curriculum' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Course Content</CardTitle>
                    <CardDescription>
                      {curriculum.length} lectures • {curriculum.reduce((acc, item) => acc + (item.duration.includes(':') ? parseInt(item.duration.split(':')[0]) : 0), 0)} hours total
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {curriculum.map((lesson, index) => (
                        <div 
                          key={lesson.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 ${
                            selectedLesson === index ? 'bg-teal-50 border-teal-200' : 'border-gray-200'
                          }`}
                          onClick={() => setSelectedLesson(index)}
                        >
                          <div className="flex items-center gap-2">
                            {lesson.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-teal-500" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                            )}
                            {lesson.type === 'video' && <Play className="w-4 h-4 text-gray-500" />}
                            {lesson.type === 'quiz' && <Award className="w-4 h-4 text-gray-500" />}
                            {lesson.type === 'project' && <BookOpen className="w-4 h-4 text-gray-500" />}
                          </div>
                      
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                          </div>
                      
                          <div className="flex items-center gap-2">
                            {lesson.preview && (
                              <Badge variant="outline" className="text-xs">Preview</Badge>
                            )}
                            <span className="text-sm text-gray-500">{lesson.duration}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'instructor' && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                      <img 
                        src={instructor.image}
                        alt={instructor.name}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{instructor.name}</h3>
                        <p className="text-gray-600 mb-3">{instructor.title}</p>
                    
                        <div className="flex items-center gap-6 mb-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span>{instructor.rating} instructor rating</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{instructor.students} students</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            <span>{instructor.courses} courses</span>
                          </div>
                        </div>
                    
                        <p className="text-gray-700">{instructor.bio}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900">{course.rating}</div>
                      <div className="flex items-center gap-1 justify-center mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">Course Rating</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {reviews.map(review => (
                      <Card key={review.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <img 
                              src={review.avatar}
                              alt={review.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-medium text-gray-900">{review.name}</h4>
                                <div className="flex items-center gap-1">
                                  {[...Array(review.rating)].map((_, i) => (
                                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500">{review.date}</span>
                              </div>
                              <p className="text-gray-700">{review.comment}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Info Card */}
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {formatCurrency(course.price)}
                  </div>
                  <div className="text-sm text-gray-500 line-through mb-4">
                    {formatCurrency(course.price * 1.5)}
                  </div>
                </div>

                <Button 
                  className="w-full bg-teal-500 hover:bg-teal-600 mb-4" 
                  size="lg"
                  onClick={() => navigate(`/checkout?course=${course.id}`)}
                >
              Enroll Now
                </Button>
            
                <Button 
                  variant="outline" 
                  className="w-full mb-6"
                  onClick={() => navigate(`/checkout?course=${course.id}`)}
                >
              Add to Cart
                </Button>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{course.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Level:</span>
                    <span className="font-medium">{course.level}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Language:</span>
                    <span className="font-medium">{course.language === 'vi' ? 'Vietnamese' : 'English'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Certificate:</span>
                    <span className="font-medium">Yes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Access:</span>
                    <span className="font-medium">Lifetime</span>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium text-gray-900 mb-3">This course includes:</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      <span>25 hours on-demand video</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>15 articles</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      <span>Downloadable resources</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      <span>Certificate of completion</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Courses */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Related Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {relatedCourses.map(relatedCourse => (
                    <div key={relatedCourse.id} className="flex gap-3">
                      <img 
                        src={relatedCourse.image}
                        alt={relatedCourse.title}
                        className="w-16 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                          {relatedCourse.title}
                        </h4>
                        <p className="text-xs text-gray-500 mb-1">{relatedCourse.instructor}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">{relatedCourse.rating}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                        ${relatedCourse.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default EnhancedCourseDetail;