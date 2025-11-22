import React from 'react';
import { BookOpen, Lightbulb, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';

/**
 * Reading Content Component
 * For displaying article/text-based lessons
 */
const ReadingLesson = ({ lesson, onComplete }) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = React.useState(false);
  const [parseError, setParseError] = React.useState(false);
  const contentRef = React.useRef(null);

  // Parse content from JSON
  const content = React.useMemo(() => {
    // Check if content_url is null or invalid
    if (!lesson.content_url || lesson.content_url === 'null' || lesson.content_url === 'N/A') {
      console.warn('⚠️ Reading lesson has no content_url:', lesson);
      setParseError(true);
      return null;
    }

    try {
      const parsed = JSON.parse(lesson.content_url);
      return parsed;
    } catch {
      // If not JSON, treat as plain text
      return { type: 'article', content: lesson.content_url };
    }
  }, [lesson.content_url]);

  const handleScroll = (e) => {
    const element = e.target;
    const scrolledToBottom = 
      element.scrollHeight - element.scrollTop <= element.clientHeight + 100; // More forgiving threshold
    
    if (scrolledToBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
      console.log('✓ Đã cuộn đến cuối bài đọc');
    }
  };

  const handleComplete = () => {
    if (onComplete && !lesson.completed && hasScrolledToBottom) {
      onComplete();
    }
  };

  // Auto-check if content is short and already visible
  React.useEffect(() => {
    if (contentRef.current) {
      const checkIfFullyVisible = () => {
        const element = contentRef.current;
        if (!element) return;
        
        // If content height is less than viewport, consider it fully read
        if (element.scrollHeight <= element.clientHeight + 50) {
          console.log('✓ Nội dung ngắn - tự động đánh dấu đã đọc');
          setHasScrolledToBottom(true);
        }
      };
      
      // Check after a short delay to ensure content is rendered
      const timer = setTimeout(checkIfFullyVisible, 500);
      return () => clearTimeout(timer);
    }
  }, [content]);

  // Error UI if no valid content
  if (parseError || !content) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center p-8">
          <div className="w-20 h-20 rounded-full bg-orange-100 mx-auto mb-4 flex items-center justify-center">
            <BookOpen className="h-10 w-10 text-orange-600" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">Bài đọc chưa có nội dung</h3>
          <p className="text-gray-600 mb-4">Bài đọc này đang trong quá trình cập nhật</p>
          <p className="text-xs text-gray-500 font-mono bg-gray-100 p-3 rounded inline-block">
            content_url: {lesson.content_url || 'null'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b px-8 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Bài đọc</p>
              <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
            </div>
          </div>
          
          {lesson.completed && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg w-fit">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Đã hoàn thành</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div 
        ref={contentRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-8 py-8"
      >
        <Card className="max-w-4xl mx-auto shadow-lg">
          <CardContent className="p-8">
            {/* Reading content with rich formatting */}
            <article 
              className="prose prose-lg max-w-none
                prose-headings:text-gray-900 prose-headings:font-bold
                prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
                prose-li:text-gray-700 prose-li:mb-2
                prose-strong:text-gray-900 prose-strong:font-semibold
                prose-blockquote:border-l-4 prose-blockquote:border-teal-500 
                prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
                prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: content.content }}
            />

            {/* Reading Tips */}
            <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Mẹo học tập</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Đọc kỹ và ghi chú những điểm quan trọng</li>
                    <li>• Cuộn xuống hết bài để đánh dấu hoàn thành</li>
                    <li>• Áp dụng kiến thức vào thực tế</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Actions */}
      <div className="bg-white border-t px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {hasScrolledToBottom ? (
              <span className="text-green-600 font-medium">✓ Đã đọc hết bài</span>
            ) : (
              <span>Cuộn xuống để đọc toàn bộ nội dung</span>
            )}
          </div>
          
          <Button
            onClick={handleComplete}
            disabled={lesson.completed || !hasScrolledToBottom}
            className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700"
          >
            {lesson.completed ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Đã hoàn thành
              </>
            ) : (
              'Hoàn thành bài học'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReadingLesson;
