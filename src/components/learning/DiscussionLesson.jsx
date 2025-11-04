import React from 'react';
import { MessageSquare, ThumbsUp, Send, User, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Discussion Lesson Component
 * Forum-style discussion for peer interaction
 */
const DiscussionLesson = ({ lesson, onComplete }) => {
  const { state: authState } = useAuth();
  const [forumData, setForumData] = React.useState(null);
  const [posts, setPosts] = React.useState([]);
  const [newPost, setNewPost] = React.useState('');
  const [replyTo, setReplyTo] = React.useState(null);
  const [hasParticipated, setHasParticipated] = React.useState(false);
  const [parseError, setParseError] = React.useState(false);

  React.useEffect(() => {
    // Check if content_url is null or invalid
    if (!lesson.content_url || lesson.content_url === 'null' || lesson.content_url === 'N/A') {
      console.warn('⚠️ Discussion lesson has no content_url:', lesson);
      setParseError(true);
      return;
    }

    try {
      const parsed = JSON.parse(lesson.content_url);
      setForumData(parsed);
      
      // Load existing posts (mock data for now)
      setPosts([
        {
          id: 1,
          author: 'Nguyễn Văn A',
          avatar: null,
          content: 'Mình vừa hoàn thành project và muốn chia sẻ một số kinh nghiệm. Điều quan trọng nhất là phải hiểu rõ về composition và lighting!',
          likes: 12,
          replies: [
            {
              id: 101,
              author: 'Trần Thị B',
              avatar: null,
              content: 'Cảm ơn bạn đã chia sẻ! Mình cũng đang gặp khó khăn với lighting, bạn có thể chia sẻ thêm không?',
              likes: 3
            }
          ],
          timestamp: '2 giờ trước'
        },
        {
          id: 2,
          author: 'Lê Minh C',
          avatar: null,
          content: 'Portfolio của mình đây: [link]. Mong mọi người góp ý!',
          likes: 8,
          replies: [],
          timestamp: '5 giờ trước'
        }
      ]);
    } catch (error) {
      console.error('Failed to parse forum data:', error);
      setParseError(true);
    }
  }, [lesson.content_url]);

  const handlePostSubmit = () => {
    if (!newPost.trim()) return;

    const post = {
      id: Date.now(),
      author: authState.user?.full_name || 'Học viên',
      avatar: authState.user?.avatar_url,
      content: newPost,
      likes: 0,
      replies: [],
      timestamp: 'Vừa xong'
    };

    if (replyTo) {
      // Add as reply
      setPosts(posts.map(p => {
        if (p.id === replyTo) {
          return {
            ...p,
            replies: [...p.replies, { ...post, id: Date.now() + 1 }]
          };
        }
        return p;
      }));
      setReplyTo(null);
    } else {
      // Add as new post
      setPosts([post, ...posts]);
    }

    setNewPost('');
    setHasParticipated(true);
  };

  const handleLike = (postId, isReply = false, parentId = null) => {
    if (isReply) {
      setPosts(posts.map(p => {
        if (p.id === parentId) {
          return {
            ...p,
            replies: p.replies.map(r => 
              r.id === postId ? { ...r, likes: r.likes + 1 } : r
            )
          };
        }
        return p;
      }));
    } else {
      setPosts(posts.map(p => 
        p.id === postId ? { ...p, likes: p.likes + 1 } : p
      ));
    }
  };

  const handleComplete = () => {
    if (onComplete && !lesson.completed && hasParticipated) {
      onComplete();
    }
  };

  // Error UI if no valid forum data
  if (parseError || !forumData) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-blue-50">
        <div className="text-center p-8">
          <div className="w-20 h-20 rounded-full bg-orange-100 mx-auto mb-4 flex items-center justify-center">
            <MessageSquare className="h-10 w-10 text-orange-600" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">Thảo luận chưa có nội dung</h3>
          <p className="text-gray-600 mb-4">Diễn đàn này đang trong quá trình cập nhật</p>
          <p className="text-xs text-gray-500 font-mono bg-gray-100 p-3 rounded inline-block">
            content_url: {lesson.content_url || 'null'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-teal-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b px-8 py-6 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Diễn đàn thảo luận</p>
              <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
            </div>
          </div>

          {forumData.description && (
            <p className="text-gray-600 mb-4">{forumData.description}</p>
          )}

          {hasParticipated && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg w-fit">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Đã tham gia thảo luận</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* New Post Card */}
          <Card className="shadow-lg border-2 border-teal-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {authState.user?.avatar_url ? (
                    <img src={authState.user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder={replyTo ? "Viết câu trả lời..." : "Chia sẻ suy nghĩ của bạn..."}
                    className="w-full px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
                    rows={3}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-xs text-gray-500">
                      {replyTo && (
                        <Badge variant="secondary" className="mr-2">
                          Đang trả lời
                          <button onClick={() => setReplyTo(null)} className="ml-2">×</button>
                        </Badge>
                      )}
                    </div>
                    <Button
                      onClick={handlePostSubmit}
                      disabled={!newPost.trim()}
                      className="bg-gradient-to-r from-teal-500 to-blue-600"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {replyTo ? 'Trả lời' : 'Đăng'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Quy tắc diễn đàn</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Tôn trọng ý kiến của người khác</li>
                  <li>• Chia sẻ kinh nghiệm và học hỏi lẫn nhau</li>
                  <li>• Không spam hoặc quảng cáo</li>
                  <li>• Tham gia thảo luận để hoàn thành bài học</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">
              {posts.length} bài thảo luận
            </h3>

            {posts.map(post => (
              <Card key={post.id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* Post header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {post.avatar ? (
                        <img src={post.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900">{post.author}</h4>
                        <span className="text-xs text-gray-500">{post.timestamp}</span>
                      </div>
                      <p className="text-gray-700">{post.content}</p>
                    </div>
                  </div>

                  {/* Post actions */}
                  <div className="flex items-center gap-4 pt-3 border-t">
                    <button 
                      onClick={() => handleLike(post.id)}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600 transition-colors"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>{post.likes}</span>
                    </button>
                    <button 
                      onClick={() => setReplyTo(post.id)}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600 transition-colors"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Trả lời</span>
                    </button>
                  </div>

                  {/* Replies */}
                  {post.replies.length > 0 && (
                    <div className="mt-4 pl-14 space-y-3 border-l-2 border-gray-200">
                      {post.replies.map(reply => (
                        <div key={reply.id} className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {reply.avatar ? (
                              <img src={reply.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              reply.author[0]
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <h5 className="font-semibold text-sm text-gray-900 mb-1">{reply.author}</h5>
                              <p className="text-sm text-gray-700">{reply.content}</p>
                            </div>
                            <button 
                              onClick={() => handleLike(reply.id, true, post.id)}
                              className="flex items-center gap-1 text-xs text-gray-500 hover:text-teal-600 mt-2"
                            >
                              <ThumbsUp className="h-3 w-3" />
                              <span>{reply.likes}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {hasParticipated ? (
              <span className="text-green-600 font-medium">✓ Đã tham gia thảo luận</span>
            ) : (
              <span>Tham gia thảo luận để hoàn thành bài học</span>
            )}
          </div>
          
          <Button
            onClick={handleComplete}
            disabled={lesson.completed || !hasParticipated}
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

export default DiscussionLesson;
