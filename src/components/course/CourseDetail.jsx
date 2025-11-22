import React from 'react';
import { Play, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { COURSES, MOOCS, CATEGORIES, TAGS } from '@/data/mockData';
import { formatCurrency } from '@/utils/formatters';

const CourseDetail = ({ courseId }) => {
  // In real app, this would come from props or API
  const course = COURSES.find(c => c.id === parseInt(courseId)) || COURSES[0];
  const moocs = MOOCS.filter(m => m.courseId === course.id);
  const category = CATEGORIES.find(c => c.id === course.categoryId);
  const tags = course.tagIds.map(id => TAGS.find(t => t.id === id)).filter(Boolean);

  return (
    <div className="grid gap-6">
      {/* Main Course Info */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="outline">{category?.name}</Badge>
            {tags.map(tag => (
              <Badge key={tag.id} variant="secondary">
                {tag.name}
              </Badge>
            ))}
          </div>
          <CardTitle className="text-2xl">{course.title}</CardTitle>
          <CardDescription className="text-base">
            {course.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Course Stats */}
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1">
              ⭐ <strong>{course.rating}</strong> ({course.learners} đánh giá)
            </span>
            <span className="flex items-center gap-1">
              🕒 <strong>{course.duration}</strong>
            </span>
            <span className="flex items-center gap-1">
              📚 <strong>{course.level}</strong>
            </span>
            <span className="flex items-center gap-1">
              🌐 <strong>{course.language === 'vi' ? 'Tiếng Việt' : 'English'}</strong>
            </span>
          </div>

          {/* Price */}
          <div className="flex items-end gap-3">
            <div className="text-3xl font-bold text-primary">
              {formatCurrency(course.price)}
            </div>
            <Badge variant="secondary">{course.status}</Badge>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <a href={`/player/${moocs[0]?.id || 0}`}>
              <Button size="lg">
                <Play className="w-4 h-4 mr-2" />
                Bắt đầu học
              </Button>
            </a>
            <a href={`/exam/${moocs[0]?.id || 0}`}>
              <Button variant="secondary" size="lg">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Làm bài thi
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Course Modules */}
      {moocs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Nội dung khoá học</CardTitle>
            <CardDescription>
              {moocs.length} chương học
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {moocs.map((mooc, index) => (
                <div key={mooc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">
                      {index + 1}. {mooc.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Điểm qua môn: {mooc.passMark}%
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <a href={`/player/${mooc.id}`}>
                      <Button variant="outline" size="sm">
                        Học
                      </Button>
                    </a>
                    <a href={`/exam/${mooc.id}`}>
                      <Button variant="secondary" size="sm">
                        Thi
                      </Button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CourseDetail;