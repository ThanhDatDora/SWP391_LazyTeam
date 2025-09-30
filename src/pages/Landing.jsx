import React from 'react';
import { ArrowRight, Users, BookOpen, Trophy, Play } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CourseCard from '@/components/course/CourseCard';
import GuestHeader from '@/components/layout/GuestHeader';
import Footer from '@/components/layout/Footer';
import { COURSES } from '@/data/mockData';
import { formatCurrency } from '@/utils/formatters';
import { useNavigation } from '@/hooks/useNavigation';

const Landing = () => {
  const navigate = useNavigation();
  const stats = [
    { value: '15K+', label: 'Students', icon: Users },
    { value: '75%', label: 'Success Rate', icon: Trophy },
    { value: '35', label: 'Courses', icon: BookOpen },
    { value: '26', label: 'Instructors', icon: Users },
    { value: '16', label: 'Awards Won', icon: Trophy }
  ];

  const features = [
    {
      title: 'Online Billing, Invoicing & Contracts',
      description: 'Simple and secure control of your organization\'s financial and legal transactions. Send customized invoices and contracts',
      color: 'bg-blue-50 text-blue-600',
      icon: '💳'
    },
    {
      title: 'Easy Scheduling & Attendance Tracking',
      description: 'Schedule and reserve classrooms at one school or multiple campuses. Keep detailed records of student attendance',
      color: 'bg-teal-50 text-teal-600',
      icon: '📅'
    },
    {
      title: 'Customer Tracking',
      description: 'Automate and track emails to individuals or groups. Skilline\'s built-in system helps organize your organization',
      color: 'bg-purple-50 text-purple-600',
      icon: '👥'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <GuestHeader />
      
      <main className="container mx-auto px-4 space-y-16 py-8">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 rounded-3xl p-8 lg:p-16 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-teal-600">
                🎓 <span>Trusted by 15,000+ students worldwide</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                <span className="text-teal-600">Studying</span> Online is now
                <span className="block text-transparent bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text">
                  much easier
                </span>
              </h1>
              
              <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                Skilline is an interesting platform that will teach you in more an interactive way
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-teal-600 hover:bg-teal-700" onClick={() => navigate("/auth")}>
                  Join for free
                </Button>
                <Button size="lg" variant="outline" className="gap-2" onClick={() => navigate("/auth")}>
                  <Play className="h-4 w-4" />
                  Watch how it works
                </Button>
              </div>
            </div>
            
            {/* Right Content - Image/Illustration */}
            <div className="relative">
              <div className="bg-gradient-to-br from-teal-400 to-blue-500 rounded-3xl p-8 text-white">
                <div className="text-center space-y-4">
                  <div className="text-6xl">🎓</div>
                  <h3 className="text-2xl font-bold">Learn from anywhere</h3>
                  <p className="text-teal-100">Access quality education from the comfort of your home</p>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 text-xl">
                    📊
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">250k</div>
                    <div className="text-xs text-gray-500">Assisted Student</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 text-xl">
                    🏆
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Congratulations</div>
                    <div className="text-xs text-gray-500">Your admission completed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Our Success
          </h2>
          <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
            Ornare id fames interdum porttitor nulla turpis etiam. Diam vitae sollicitudin at nec nam et pharetra gravida. Adipiscing a quis ultrices eu ornare tristique vel nisl orci.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 text-teal-600 rounded-2xl mb-4">
                    <IconComponent className="h-8 w-8" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Features Section */}
        <section>
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              All-In-One <span className="text-teal-600">Cloud Software</span>
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Skilline is one powerful online software suite that combines all the tools needed to run a successful school or office.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-0">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 text-2xl ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Popular Courses Section */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Popular Courses
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our most popular courses taught by expert instructors
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {COURSES.slice(0, 6).map((course) => (
              <div key={course.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate("/auth")}>
                <div className="h-48 bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-4xl">
                  📚
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-teal-600 font-medium">{course.category}</span>
                    <span className="text-sm text-gray-500">{course.duration}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-teal-600 font-semibold">
                      {course.price > 0 ? `${course.price.toLocaleString('vi-VN')}đ` : 'Miễn phí'}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {course.level}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-3xl p-8 lg:p-16 text-center text-white">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Start Learning Today
          </h2>
          <p className="text-lg text-teal-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students already learning on our platform.
            Get access to quality education from anywhere in the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100" onClick={() => navigate("/auth")}>
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-teal-600" onClick={() => navigate("/auth")}>
              Tham gia ngay
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Landing;