import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { LESSONS } from '@/data/mockData';

const CoursePlayer = ({ moocId }) => {
  const lessons = LESSONS.filter(l => l.moocId === parseInt(moocId));
  const currentLesson = lessons[0]; // In real app, this would be managed by state

  return (
    <div className="grid lg:grid-cols-12 gap-6">
      {/* Video Player Area */}
      <div className="lg:col-span-8">
        <Card>
          <CardHeader>
            <CardTitle>{currentLesson?.title}</CardTitle>
            <CardDescription>
              {currentLesson?.contentType.toUpperCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video w-full rounded-xl bg-slate-200 flex items-center justify-center text-slate-500">
              {currentLesson?.contentType === 'video' ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 5v10l8-5-8-5z"/>
                    </svg>
                  </div>
                  <p>Video Player</p>
                  <p className="text-sm">Nội dung: {currentLesson?.title}</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/>
                    </svg>
                  </div>
                  <p>PDF Document</p>
                  <p className="text-sm">Tài liệu: {currentLesson?.title}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lessons Sidebar */}
      <div className="lg:col-span-4">
        <Card>
          <CardHeader>
            <CardTitle>Danh sách bài học</CardTitle>
            <CardDescription>
              {lessons.length} bài học
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {lessons.map((lesson, index) => (
              <div 
                key={lesson.id} 
                className={`px-3 py-3 rounded-xl border cursor-pointer transition-colors ${
                  lesson.id === currentLesson?.id 
                    ? 'bg-primary/10 border-primary' 
                    : 'hover:bg-muted'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">
                      {index + 1}. {lesson.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-1 bg-secondary rounded">
                        {lesson.contentType}
                      </span>
                      {lesson.isPreview && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                          Preview
                        </span>
                      )}
                    </div>
                  </div>
                  {lesson.id === currentLesson?.id && (
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CoursePlayer;