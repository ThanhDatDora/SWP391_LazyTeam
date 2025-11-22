import React from 'react';
import { useParams } from 'react-router-dom';
import { BLOGS } from '../data/mockData';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import GuestHeader from '../components/layout/GuestHeader';
import Footer from '../components/layout/Footer';
import { useNavigation } from '../hooks/useNavigation';
import { ArrowLeft, Clock, User, Calendar, Share2, BookOpen } from 'lucide-react';

const BlogDetail = () => {
  const { slug } = useParams();
  const { back, to } = useNavigation();
  
  // Find blog by slug or id
  const blog = BLOGS.find(b => b.slug === slug || b.id.toString() === slug);
  
  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col">
        <GuestHeader />
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Không tìm thấy bài viết
            </h1>
            <p className="text-gray-600 mb-6">
              Bài viết bạn đang tìm không tồn tại hoặc đã bị xóa.
            </p>
            <Button onClick={() => to('/blog')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại danh sách blog
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const relatedBlogs = BLOGS.filter(b => 
    b.id !== blog.id && b.category === blog.category
  ).slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <GuestHeader />
      
      <main className="flex-1 bg-gray-50">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-teal-500 to-blue-600 text-white">
          <div className="max-w-4xl mx-auto px-4 py-16">
            <div className="flex items-center gap-2 mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={back}
                className="text-white border-white hover:bg-white hover:text-teal-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {blog.category}
              </Badge>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              {blog.title}
            </h1>
            
            <div className="flex items-center gap-6 text-teal-100">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {blog.author}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {blog.publishDate}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {blog.readTime}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-8">
                  {/* Featured Image */}
                  <div className="aspect-video mb-8 overflow-hidden rounded-lg">
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Article Content */}
                  <div className="prose prose-lg prose-teal max-w-none">
                    <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                      {blog.excerpt}
                    </p>

                    {/* Sample content - In real app, this would come from backend */}
                    <h2>Giới thiệu</h2>
                    <p>
                      Trong thời đại công nghệ số hiện nay, việc học tập trực tuyến đã trở thành xu hướng 
                      phổ biến và cần thiết. Với sự phát triển mạnh mẽ của internet và các công nghệ mới, 
                      chúng ta có thể tiếp cận kiến thức từ bất kỳ đâu, bất kỳ lúc nào.
                    </p>

                    <h2>Lợi ích của học trực tuyến</h2>
                    <ul>
                      <li><strong>Linh hoạt về thời gian:</strong> Học theo lịch trình cá nhân</li>
                      <li><strong>Tiết kiệm chi phí:</strong> Không cần di chuyển, giảm chi phí học tập</li>
                      <li><strong>Đa dạng khóa học:</strong> Tiếp cận hàng nghìn khóa học từ khắp nơi</li>
                      <li><strong>Tương tác cao:</strong> Học tập với công nghệ hiện đại</li>
                    </ul>

                    <h2>Thách thức và giải pháp</h2>
                    <p>
                      Mặc dù có nhiều ưu điểm, học trực tuyến cũng đặt ra những thách thức như việc 
                      duy trì động lực, tương tác với giảng viên và bạn học. Tuy nhiên, với các nền tảng 
                      học tập hiện đại như Mini Coursera, những thách thức này đang được giải quyết 
                      thông qua các tính năng tương tác, cộng đồng học tập và hệ thống theo dõi tiến độ.
                    </p>

                    <blockquote>
                      "Giáo dục là vũ khí mạnh mẽ nhất mà bạn có thể sử dụng để thay đổi thế giới." 
                      - Nelson Mandela
                    </blockquote>

                    <h2>Kết luận</h2>
                    <p>
                      Học trực tuyến không chỉ là xu hướng mà đã trở thành một phần không thể thiếu 
                      trong hệ thống giáo dục hiện đại. Với sự đầu tư đúng đắn vào công nghệ và 
                      phương pháp giảng dạy, chúng ta có thể tạo ra những trải nghiệm học tập 
                      tuyệt vời cho mọi người.
                    </p>
                  </div>

                  {/* Article Footer */}
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                          <span className="text-teal-600 font-semibold">
                            {blog.author.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{blog.author}</p>
                          <p className="text-sm text-gray-600">Content Writer & Tech Enthusiast</p>
                        </div>
                      </div>
                      
                      <Button variant="outline" className="flex items-center gap-2">
                        <Share2 className="w-4 h-4" />
                        Chia sẻ
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Table of Contents */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Mục lục
                  </h3>
                  <nav className="space-y-2">
                    <a href="#intro" className="block text-sm text-teal-600 hover:text-teal-700">
                      1. Giới thiệu
                    </a>
                    <a href="#benefits" className="block text-sm text-teal-600 hover:text-teal-700">
                      2. Lợi ích của học trực tuyến
                    </a>
                    <a href="#challenges" className="block text-sm text-teal-600 hover:text-teal-700">
                      3. Thách thức và giải pháp
                    </a>
                    <a href="#conclusion" className="block text-sm text-teal-600 hover:text-teal-700">
                      4. Kết luận
                    </a>
                  </nav>
                </CardContent>
              </Card>

              {/* Related Articles */}
              {relatedBlogs.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Bài viết liên quan
                    </h3>
                    <div className="space-y-4">
                      {relatedBlogs.map(relatedBlog => (
                        <div 
                          key={relatedBlog.id}
                          className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                          onClick={() => to(`/blog/${relatedBlog.slug || relatedBlog.id}`)}
                        >
                          <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">
                            {relatedBlog.title}
                          </h4>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {relatedBlog.excerpt}
                          </p>
                          <div className="flex items-center text-xs text-gray-500">
                            <span>{relatedBlog.readTime}</span>
                            <span className="mx-2">•</span>
                            <span>{relatedBlog.publishDate}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Newsletter Signup */}
              <Card>
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Đăng ký nhận tin tức
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Nhận thông báo về các bài viết mới và cập nhật từ Mini Coursera
                  </p>
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="Email của bạn"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <Button className="w-full">
                      Đăng ký
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BlogDetail;