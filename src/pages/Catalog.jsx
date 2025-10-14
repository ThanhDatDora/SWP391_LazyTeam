import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CourseCard from '@/components/course/CourseCard';
import { COURSES, CATEGORIES, TAGS } from '../data/mockData';

const Catalog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const filteredCourses = COURSES.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || course.categoryId === parseInt(selectedCategory);
    const matchesTag = !selectedTag || course.tagIds.includes(parseInt(selectedTag));
    
    return matchesSearch && matchesCategory && matchesTag;
  });

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedTag('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Catalog Khoá học</CardTitle>
          <CardDescription>
            Tìm kiếm và khám phá hàng ngàn khoá học chất lượng cao
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex gap-2">
            <Input
              placeholder="Tìm kiếm khoá học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button variant="secondary" onClick={resetFilters}>
              Xoá bộ lọc
            </Button>
          </div>

          {/* Category and Tag filters */}
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Danh mục:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="">Tất cả danh mục</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Thẻ:</label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="">Tất cả thẻ</option>
                {TAGS.map(tag => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active filters */}
          {(searchTerm || selectedCategory || selectedTag) && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Bộ lọc đang áp dụng:</span>
              {searchTerm && (
                <Badge variant="secondary">
                  Tìm kiếm: "{searchTerm}"
                </Badge>
              )}
              {selectedCategory && (
                <Badge variant="secondary">
                  Danh mục: {CATEGORIES.find(c => c.id === parseInt(selectedCategory))?.name}
                </Badge>
              )}
              {selectedTag && (
                <Badge variant="secondary">
                  Thẻ: {TAGS.find(t => t.id === parseInt(selectedTag))?.name}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>
            Kết quả ({filteredCourses.length} khoá học)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCourses.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Không tìm thấy khoá học nào phù hợp với bộ lọc của bạn.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Catalog;