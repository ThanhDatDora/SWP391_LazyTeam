import React from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Eye, Clock, User, Share2, Facebook, Twitter, Linkedin, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BLOGS } from '@/data/mockData';

const BlogDetail = () => {
  const { slug } = useParams();
  const blog = BLOGS.find(b => b.slug === slug) || BLOGS[0];

  const relatedPosts = [
    {
      title: "Class adds $30 million to its balance sheet for a 'Zoom-friendly' edtech solution",
      author: "Lina",
      views: "251,232",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=500&auto=format&fit=crop",
      readTime: "3 min read"
    },
    {
      title: "Class adds $30 million to its balance sheet for a 'Zoom-friendly' edtech solution", 
      author: "Lina",
      views: "251,232",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=500&auto=format&fit=crop",
      readTime: "5 min read"
    }
  ];

  const readingList = [
    { 
      title: "UX/UI", 
      image: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?q=80&w=200&auto=format&fit=crop",
      bgColor: "bg-purple-500"
    },
    { 
      title: "React", 
      image: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?q=80&w=200&auto=format&fit=crop",
      bgColor: "bg-blue-500"
    },
    { 
      title: "PHP", 
      image: "https://images.unsplash.com/photo-1599507593499-a3f7d7d97667?q=80&w=200&auto=format&fit=crop",
      bgColor: "bg-indigo-500"
    },
    { 
      title: "Javascript", 
      image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=200&auto=format&fit=crop",
      bgColor: "bg-yellow-500"
    }
  ];

  const marketingArticles = [
    {
      title: "AWS Certified solutions Architect",
      category: "Design", 
      author: "Lina",
      price: "$80",
      duration: "3 Months",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=300&auto=format&fit=crop"
    },
    {
      title: "AWS Certified solutions Architect",
      category: "Design",
      author: "Lina", 
      price: "$80",
      duration: "3 Months",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=300&auto=format&fit=crop"
    },
    {
      title: "AWS Certified solutions Architect",
      category: "Design",
      author: "Lina",
      price: "$80", 
      duration: "3 Months",
      image: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?q=80&w=300&auto=format&fit=crop"
    },
    {
      title: "AWS Certified solutions Architect",
      category: "Design",
      author: "Lina",
      price: "$80",
      duration: "3 Months", 
      image: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?q=80&w=300&auto=format&fit=crop"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Header Image */}
      <div className="relative h-64 lg:h-96 rounded-2xl overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
          alt="Blog Header"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-12">
        {/* Left Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Article Header */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Badge>Inspiration</Badge>
              <span className="text-sm text-gray-500">By Themeadbrains in</span>
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              {blog.title}
            </h1>

            <div className="flex items-center gap-6 text-sm text-gray-600 mb-8">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>By {blog.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{blog.views.toLocaleString()} views</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>5 min read</span>
              </div>
            </div>

            <Button className="bg-teal-500 hover:bg-teal-600 mb-8">
              Start Learning Now
            </Button>
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              Lorem Ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua consequat.
            </p>

            <p className="text-gray-700 leading-relaxed mb-6">
              TOTC is a platform that allows educators to create online classes whereby they can store the course materials online; manage assignments, quizzes and exams; monitor due dates; grade results and provide students with feedback all in one place.
            </p>

            <p className="text-gray-700 leading-relaxed mb-6">
              TOTC is a platform that allows educators to create online classes whereby they can store the course materials online; manage assignments, quizzes and exams; monitor due dates; grade results and provide students with feedback all in one place.
            </p>

            <p className="text-gray-700 leading-relaxed">
              TOTC is a platform
            </p>
          </div>

          {/* Author Info */}
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
                <span className="text-white font-semibold text-xl">L</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Lina</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  TOTC is a platform that allows educators to create online classes whereby they can store the course materials online...
                </p>
              </div>
              <Button variant="outline" className="border-teal-500 text-teal-600 hover:bg-teal-50">
                Follow
              </Button>
            </div>
          </Card>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">#affordable</Badge>
            <Badge variant="outline">#Blended</Badge>
            <Badge variant="outline">#marketing</Badge>
            <Badge variant="outline">#implementacoes</Badge>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          {/* Share */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Share this article</h3>
            <div className="flex gap-3">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button size="sm" className="bg-sky-500 hover:bg-sky-600">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button size="sm" className="bg-blue-800 hover:bg-blue-900">
                <Linkedin className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Reading Blog List */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Reading blog list</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {readingList.map((item, index) => (
            <Card key={index} className="group cursor-pointer hover:shadow-lg transition-all">
              <div className="relative h-32 overflow-hidden rounded-t-lg">
                <img 
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className={`absolute inset-0 ${item.bgColor} opacity-80`}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white font-semibold text-lg">{item.title}</h3>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Related Blog */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Related Blog</h2>
          <Button variant="link" className="text-teal-600">See all</Button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {relatedPosts.map((post, index) => (
            <Card key={index} className="group cursor-pointer hover:shadow-lg transition-all">
              <div className="h-48 overflow-hidden rounded-t-lg">
                <img 
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3 leading-tight">
                  {post.title}
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">L</span>
                      </div>
                      <span>{post.author}</span>
                    </div>
                    <span>Read more</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Eye className="w-4 h-4" />
                    <span>{post.views}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-2 mt-8">
          <Button variant="outline" size="sm" className="w-10 h-10">1</Button>
          <Button size="sm" className="w-10 h-10 bg-teal-500 hover:bg-teal-600">2</Button>
        </div>
      </section>

      {/* Marketing Articles */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Marketing Articles</h2>
          <Button variant="link" className="text-teal-600">See all</Button>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {marketingArticles.map((article, index) => (
            <Card key={index} className="group cursor-pointer hover:shadow-lg transition-all">
              <div className="h-32 overflow-hidden rounded-t-lg">
                <img 
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <CardContent className="p-4">
                <Badge variant="secondary" className="mb-2 text-xs">
                  {article.category}
                </Badge>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm leading-tight">
                  {article.title}
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">L</span>
                    </div>
                    <span className="text-xs text-gray-600">{article.author}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-teal-600">{article.price}</div>
                    <div className="text-xs text-gray-500">{article.duration}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BlogDetail;