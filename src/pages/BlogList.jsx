import React from 'react';
import { BLOGS } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import GuestHeader from '@/components/layout/GuestHeader';
import Footer from '@/components/layout/Footer';
import { useNavigation } from '@/hooks/useNavigation';

const BlogList = () => {
  const { to } = useNavigation();
  return (
    <div className="min-h-screen flex flex-col">
      <GuestHeader />
      
      <main className="flex-1 bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Blog & Insights
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Khám phá các bài viết chuyên sâu về công nghệ, lập trình và những xu hướng mới nhất trong ngành IT
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BLOGS.map(blog => (
              <Card 
                key={blog.id} 
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => to(`/blog/${blog.slug || blog.id}`)}
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{blog.category}</Badge>
                    <span className="text-sm text-gray-500">{blog.readTime}</span>
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {blog.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">
                    {blog.excerpt}
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>{blog.author}</span>
                    <span className="mx-2">•</span>
                    <span>{blog.publishDate}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogList;