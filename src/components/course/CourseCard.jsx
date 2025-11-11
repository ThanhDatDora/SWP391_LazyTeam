import React, { memo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CATEGORIES, TAGS } from '@/data/mockData';
import { formatCurrency } from '@/utils/formatters';
import { useNavigation } from '@/hooks/useNavigation';
import { usePerformanceMonitor, useIntersectionObserver } from '../../hooks/usePerformance';

const CourseCard = memo(({ course }) => {
  usePerformanceMonitor('CourseCard');
  
  const [ref, isVisible] = useIntersectionObserver();
  const { goCourse } = useNavigation();
  
  // Memoize expensive calculations
  const category = React.useMemo(() => 
    CATEGORIES.find(c => c.id === course.categoryId), [course.categoryId]
  );
  
  const tags = React.useMemo(() => 
    course.tagIds.map(id => TAGS.find(t => t.id === id)).filter(Boolean), 
  [course.tagIds]
  );
  
  const handleCourseClick = useCallback(() => {
    goCourse(course.id);
  }, [goCourse, course.id]);

  // Lazy render - only render if visible
  if (!isVisible) {
    return (
      <div ref={ref} className="h-80 bg-gray-100 animate-pulse rounded-lg">
        <div className="p-4 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <Card ref={ref} className="hover:shadow-md transition-shadow">
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
            onClick={handleCourseClick}
          >
            Xem khoá
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

export default CourseCard;