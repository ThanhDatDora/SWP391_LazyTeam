import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, Maximize, Calendar, Clock, CheckCircle, Lock, ArrowLeft, Download, BookOpen, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useNavigation } from '../hooks/useNavigation';
import { useAuth } from '../contexts/AuthContext';
import { useParams } from 'react-router-dom';
import LearnerNavbar from '../components/layout/LearnerNavbar';
import Footer from '../components/layout/Footer';

const CoursePlayerPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigation();
  const { state } = useAuth();
  const [activeTab, setActiveTab] = useState('lessons');
  const [currentLesson, setCurrentLesson] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Mock course data
  const courseData = {
    id: courseId,
    title: 'Learn about Adobe XD & Prototyping',
    description: 'Complete course on Adobe XD from basics to advanced prototyping',
    instructor: 'John Anderson',
    duration: '9 lessons • 6h 30min',
    rating: 4.8,
    students: 1524,
    level: 'Intermediate',
    lessons: [
      { id: 1, title: 'Introduction about XD', duration: '30 mins', completed: true, locked: false },
      { id: 2, title: 'Introduction about XD', duration: '30 mins', completed: true, locked: false },
      { id: 3, title: 'Introduction about XD', duration: '30 mins', completed: false, locked: false },
      { id: 4, title: 'Introduction about XD', duration: '30 mins', completed: false, locked: false },
      { id: 5, title: 'Introduction about XD', duration: '30 mins', completed: false, locked: true },
      { id: 6, title: 'Introduction about XD', duration: '30 mins', completed: false, locked: true },
      { id: 7, title: 'Introduction about XD', duration: '30 mins', completed: false, locked: true },
      { id: 8, title: 'Introduction about XD', duration: '30 mins', completed: false, locked: true },
      { id: 9, title: 'Introduction about XD', duration: '30 mins', completed: false, locked: true }
    ],
    materials: [
      { id: 1, title: 'Course Slides.pdf', type: 'pdf', size: '2.3 MB' },
      { id: 2, title: 'Exercise Files.zip', type: 'zip', size: '15.7 MB' },
      { id: 3, title: 'Bonus Resources.pdf', type: 'pdf', size: '1.8 MB' }
    ]
  };

  const handleLessonClick = (lessonIndex) => {
    if (!courseData.lessons[lessonIndex].locked) {
      setCurrentLesson(lessonIndex);
    }
  };

  const markLessonComplete = () => {
    // Mark current lesson as completed
    courseData.lessons[currentLesson].completed = true;
    
    // Unlock next lesson if exists
    if (currentLesson + 1 < courseData.lessons.length) {
      courseData.lessons[currentLesson + 1].locked = false;
    }
    
    // Update progress
    const completedLessons = courseData.lessons.filter(lesson => lesson.completed).length;
    setProgress((completedLessons / courseData.lessons.length) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LearnerNavbar />
      
      <div className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <Button 
          variant="outline" 
          className="mb-6"
          onClick={() => navigate('/my-courses')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Courses
        </Button>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Course Content */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Content</CardTitle>
                <div className="text-sm text-gray-600">
                  {courseData.lessons.filter(l => l.completed).length} of {courseData.lessons.length} lessons completed
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {courseData.lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className={`flex items-center gap-3 p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                        currentLesson === index ? 'bg-teal-50 border-l-4 border-l-teal-500' : ''
                      } ${lesson.locked ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => handleLessonClick(index)}
                    >
                      <div className="flex-shrink-0">
                        {lesson.completed ? (
                          <CheckCircle className="w-5 h-5 text-teal-600" />
                        ) : lesson.locked ? (
                          <Lock className="w-5 h-5 text-gray-400" />
                        ) : (
                          <Play className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          Lesson {String(index + 1).padStart(2, '0')}: {lesson.title}
                        </h4>
                        <p className="text-xs text-gray-500">{lesson.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Course Materials */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Course Materials
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {courseData.materials.map(material => (
                    <div key={material.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          {material.type === 'pdf' ? '📄' : '📁'}
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-900">{material.title}</h5>
                          <p className="text-xs text-gray-500">{material.size}</p>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {/* Course Info Header */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{courseData.title}</h1>
                    <p className="text-gray-600">by {courseData.instructor}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-yellow-500">⭐ {courseData.rating}</span>
                      <span className="text-sm text-gray-500">({courseData.students} students)</span>
                    </div>
                    <Badge variant="secondary">{courseData.level}</Badge>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{courseData.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {courseData.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {courseData.students} students
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Self-paced
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Video Player */}
            <Card className="mb-6">
              <CardContent className="p-0">
                <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <Play className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        Lesson {currentLesson + 1}: {courseData.lessons[currentLesson]?.title}
                      </h3>
                      <p className="text-gray-300">
                        Duration: {courseData.lessons[currentLesson]?.duration}
                      </p>
                    </div>
                  </div>
                  
                  {/* Video Controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <div className="flex items-center gap-4 text-white">
                      <Button
                        size="sm"
                        className="bg-white/20 hover:bg-white/30 text-white"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <div className="flex-1 bg-white/20 rounded-full h-1">
                        <div className="bg-teal-500 h-1 rounded-full w-1/3" />
                      </div>
                      <Volume2 className="w-4 h-4" />
                      <Maximize className="w-4 h-4" />
                    </div>
                  </div>
                </div>
                
                {/* Lesson Navigation */}
                <div className="p-4 bg-white border-t">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentLesson === 0}
                      onClick={() => setCurrentLesson(Math.max(0, currentLesson - 1))}
                    >
                      Previous Lesson
                    </Button>
                    
                    <Button
                      size="sm"
                      className="bg-teal-600 hover:bg-teal-700"
                      onClick={markLessonComplete}
                    >
                      Mark Complete
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentLesson === courseData.lessons.length - 1}
                      onClick={() => setCurrentLesson(Math.min(courseData.lessons.length - 1, currentLesson + 1))}
                    >
                      Next Lesson
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                {[
                  { id: 'lessons', label: 'Lessons', icon: Play },
                  { id: 'calendar', label: 'Schedule', icon: Calendar },
                  { id: 'materials', label: 'Materials', icon: Download },
                  { id: 'discussions', label: 'Discussions', icon: Users }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-teal-500 text-teal-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === 'lessons' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Lesson Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">
                          Current Lesson: {courseData.lessons[currentLesson]?.title}
                        </h4>
                        <p className="text-blue-700 text-sm mb-3">
                          In this lesson, you'll learn the fundamentals of Adobe XD and how to create your first prototype. 
                          We'll cover the interface, basic tools, and design principles.
                        </p>
                        <div className="flex items-center gap-4 text-sm text-blue-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {courseData.lessons[currentLesson]?.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            Interactive content
                          </span>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 mb-3">Learning Objectives</h5>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                            Understand Adobe XD interface and navigation
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                            Create your first artboard and design elements
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                            Learn basic prototyping principles
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                            Export and share your prototype
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'calendar' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Course Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Calendar View */}
                    <div className="mb-6">
                      <div className="grid grid-cols-7 gap-1 mb-4">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                          <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                            {day}
                          </div>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-7 gap-1">
                        {/* Sample calendar dates */}
                        {Array.from({ length: 35 }, (_, i) => {
                          const date = i - 5; // Start from previous month
                          const isCurrentMonth = date > 0 && date <= 30;
                          const hasClass = isCurrentMonth && [5, 12, 19, 26].includes(date);
                          const isToday = date === 12;
                          
                          return (
                            <div
                              key={i}
                              className={`aspect-square p-2 text-center text-sm border rounded-lg transition-colors ${
                                !isCurrentMonth ? 'text-gray-400 bg-gray-50' :
                                  isToday ? 'bg-teal-600 text-white font-semibold' :
                                    hasClass ? 'bg-blue-100 text-blue-900 font-medium' :
                                      'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {isCurrentMonth ? date : ''}
                              {hasClass && isCurrentMonth && (
                                <div className="w-1 h-1 bg-blue-600 rounded-full mx-auto mt-1" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Upcoming Schedule */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Upcoming Schedule</h5>
                      <div className="space-y-3">
                        {[
                          { date: 'Sep 12, Monday', time: '3:00 PM', title: 'Adobe XD Live Class', type: 'live' },
                          { date: 'Sep 19, Monday', time: 'Deadline', title: 'Project Submission', type: 'deadline' },
                          { date: 'Sep 26, Monday', time: '3:00 PM', title: 'Final Review Session', type: 'review' }
                        ].map((event, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className={`w-3 h-3 rounded-full ${
                              event.type === 'live' ? 'bg-red-500' :
                                event.type === 'deadline' ? 'bg-orange-500' : 'bg-green-500'
                            }`} />
                            <div className="flex-1">
                              <h6 className="text-sm font-medium text-gray-900">{event.title}</h6>
                              <p className="text-xs text-gray-500">{event.date} • {event.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'materials' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="w-5 h-5" />
                      Downloadable Materials
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {courseData.materials.map(material => (
                        <div key={material.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-xl">
                              {material.type === 'pdf' ? '📄' : material.type === 'zip' ? '📁' : '📋'}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{material.title}</h4>
                              <p className="text-sm text-gray-500">{material.type.toUpperCase()} • {material.size}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'discussions' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Course Discussions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          id: 1,
                          user: 'Sarah Chen',
                          avatar: 'SC',
                          time: '2 hours ago',
                          title: 'Question about lesson 3 exercise',
                          content: "I'm having trouble with the prototyping exercise. Can someone help?",
                          replies: 3
                        },
                        {
                          id: 2,
                          user: 'Mike Johnson',
                          avatar: 'MJ',
                          time: '1 day ago',
                          title: 'Sharing my first prototype',
                          content: 'Just finished my first Adobe XD prototype! Really excited to share it with everyone.',
                          replies: 8
                        }
                      ].map(discussion => (
                        <div key={discussion.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                              {discussion.avatar}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-medium text-gray-900">{discussion.user}</h5>
                                <span className="text-xs text-gray-500">{discussion.time}</span>
                              </div>
                              <h6 className="font-medium text-gray-800 mb-2">{discussion.title}</h6>
                              <p className="text-sm text-gray-600 mb-2">{discussion.content}</p>
                              <div className="text-xs text-gray-500">
                                💬 {discussion.replies} replies
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-center mt-6">
                      <Button variant="outline">
                        View All Discussions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CoursePlayerPage;