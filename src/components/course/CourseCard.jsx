import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CATEGORIES, TAGS } from '@/data/mockData';
import { formatCurrency } from '@/utils/formatters';
import { useNavigation } from '@/hooks/useNavigation';

const CourseCard = ({ course }) => {
  const category = CATEGORIES.find(c => c.id === course.categoryId);
  const tags = course.tagIds.map(id => TAGS.find(t => t.id === id)).filter(Boolean);
  const { goCourse } = useNavigation();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span className="line-clamp-2">{course.title}</span>
          <Badge className="bg-secondary shrink-0">
            {course.level}
          </Badge>
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {course.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            {category?.name}
          </Badge>
          {tags.slice(0, 4).map(tag => (
            <Badge key={tag.id} variant="secondary" className="text-xs">
              {tag.name}
            </Badge>
          ))}
        </div>
        
        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>⭐ {course.rating} • {course.learners} học viên</span>
          <span>{course.duration}</span>
        </div>

        {/* Price and Action */}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-lg">
            {formatCurrency(course.price)}
          </span>
          <Button 
            size="sm"
            onClick={() => goCourse(course.id)}
          >
            Xem khoá
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCard;