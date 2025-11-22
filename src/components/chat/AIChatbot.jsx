/**
 * AI Chatbot Component - Gemini AI Assistant
 * Hỗ trợ learner và guest với AI chatbot
 * 
 * Features:
 * - Trả lời câu hỏi về khóa học, nền tảng
 * - Gợi ý khóa học phù hợp
 * - Hỗ trợ 24/7 tự động
 * - Lưu lịch sử chat (localStorage)
 * - Dark mode support
 */

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Send, X, MessageCircle, Loader2, Sparkles, Trash2, RotateCcw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const GEMINI_API_KEY = 'AIzaSyD7tyKqjZE17xudVXMjPnP-LEJ9SgQ173o';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * AIChatbot Component
 * @param {string} className - Additional CSS classes
 */
export function AIChatbot({ className = '' }) {
  console.log('🚀 AIChatbot component rendering...');
  
  const { state: authState } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState('light');
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Theme detection
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 
                       localStorage.getItem('learnerTheme') || 
                       'light';
    setTheme(savedTheme);

    const handleThemeChange = (e) => {
      const newTheme = e.detail?.theme || localStorage.getItem('theme') || 'light';
      setTheme(newTheme);
    };

    window.addEventListener('themeChanged', handleThemeChange);
    window.addEventListener('learnerThemeChanged', handleThemeChange);

    return () => {
      window.removeEventListener('themeChanged', handleThemeChange);
      window.removeEventListener('learnerThemeChanged', handleThemeChange);
    };
  }, []);

  // Load chat history from localStorage
  useEffect(() => {
    if (isOpen) {
      const savedMessages = localStorage.getItem('ai_chat_history');
      if (savedMessages) {
        try {
          setMessages(JSON.parse(savedMessages));
        } catch (error) {
          console.error('Error loading chat history:', error);
        }
      } else {
        // Welcome message
        setMessages([{
          id: Date.now(),
          role: 'assistant',
          content: 'Xin chào! 👋 Tôi là trợ lý AI của nền tảng. Tôi có thể giúp bạn:\n\n• Tìm hiểu về các khóa học\n• Gợi ý khóa học phù hợp\n• Hướng dẫn sử dụng nền tảng\n• Trả lời câu hỏi thường gặp\n\nBạn cần tôi giúp gì?',
          timestamp: new Date().toISOString()
        }]);
      }
    }
  }, [isOpen]);

  // Save chat history to localStorage
  useEffect(() => {
    if (messages.length > 1) { // Skip saving just welcome message
      localStorage.setItem('ai_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Fetch courses context for AI
  const fetchCoursesContext = async () => {
    try {
      console.log('📡 Fetching courses from backend...');
      const response = await fetch('http://localhost:3001/api/ai-chatbot/courses-context');
      console.log('📡 Backend response status:', response.status);
      
      const data = await response.json();
      console.log('📡 Backend response data:', data);
      
      if (data.success) {
        console.log('✅ Courses fetched successfully:', data.data.length, 'courses');
        console.log('📋 Sample course:', data.data[0]);
        return data.data;
      }
      console.warn('⚠️ Backend returned success=false');
      return [];
    } catch (error) {
      console.error('❌ Error fetching courses context:', error);
      console.error('❌ Error details:', error.message);
      return [];
    }
  };

  // Call Gemini API
  const callGeminiAPI = async (prompt, coursesData = []) => {
    try {
      console.log('🔵 Calling Gemini API with prompt:', prompt);
      console.log('📚 Courses data available:', coursesData.length);
      
      // Build context with courses data
      let systemPrompt = `Bạn là trợ lý AI chuyên nghiệp cho nền tảng học trực tuyến "Mini Coursera". 

NHIỆM VỤ CHÍNH:
- Tư vấn và giới thiệu các khóa học THỰC TẾ có sẵn trên nền tảng
- Trả lời câu hỏi về giá, thời lượng, nội dung khóa học
- Gợi ý khóa học phù hợp theo nhu cầu học viên
- Hướng dẫn sử dụng các tính năng của nền tảng

QUY TẮC TRẢ LỜI:
✅ CHỈ giới thiệu các khóa học CÓ TRONG DANH SÁCH thực tế
✅ Dùng tên khóa học CHÍNH XÁC từ database
✅ Trích dẫn đúng giá, cấp độ, danh mục từ dữ liệu
✅ Trả lời bằng tiếng Việt, thân thiện, chuyên nghiệp
❌ KHÔNG bịa đặt tên khóa học không tồn tại
❌ KHÔNG đưa ra thông tin sai lệch về giá/nội dung
`;

      // Add courses data if available
      if (coursesData && coursesData.length > 0) {
        console.log('✅ Adding courses context to AI prompt');
        
        // Nhóm theo category
        const categorizedCourses = {};
        coursesData.forEach(course => {
          const cat = course.category || 'Khác';
          if (!categorizedCourses[cat]) categorizedCourses[cat] = [];
          categorizedCourses[cat].push(course);
        });
        
        systemPrompt += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 DANH SÁCH ${coursesData.length} KHÓA HỌC THỰC TẾ TRÊN NỀN TẢNG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        
        Object.keys(categorizedCourses).forEach(category => {
          systemPrompt += `\n🏷️ **${category.toUpperCase()}** (${categorizedCourses[category].length} khóa):\n`;
          categorizedCourses[category].forEach((course, idx) => {
            systemPrompt += `
${idx + 1}. 📖 "${course.title}"
   💰 Giá: ${course.price ? course.price.toLocaleString('vi-VN') + ' VNĐ' : 'Miễn phí'}
   📊 Cấp độ: ${course.level || 'Tất cả trình độ'}
   👨‍🏫 Giảng viên: ${course.instructor || 'Đang cập nhật'}
   ⏱️ Thời lượng: ${course.duration || 'Linh hoạt'} tuần
   🌐 Ngôn ngữ: ${course.language || 'Tiếng Việt'}
   📝 Mô tả: ${course.description?.substring(0, 120) || 'Khóa học chất lượng'}...
`;
          });
        });
        
        systemPrompt += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 HƯỚNG DẪN TRẢ LỜI CỤ THỂ:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ Khi hỏi "có khóa học gì" / "tư vấn khóa học":
   → Liệt kê 3-5 khóa phù hợp NHẤT từ danh sách trên
   → Nhóm theo danh mục để dễ đọc
   → Ghi rõ: Tên + Giá + Cấp độ

2️⃣ Khi hỏi về danh mục cụ thể (VD: "khóa lập trình"):
   → Liệt kê TẤT CẢ khóa học trong danh mục đó
   → Sắp xếp theo cấp độ (Beginner → Advanced)

3️⃣ Khi hỏi về giá:
   → Dùng CHÍNH XÁC số tiền từ danh sách
   → Gợi ý các khóa trong tầm giá

4️⃣ Khi hỏi "tất cả khóa học":
   → Tóm tắt theo danh mục
   → Đưa số lượng từng danh mục
   → Highlight 2-3 khóa nổi bật

VÍ DỤ TRẢ LỜI TỐT:
"Hiện nền tảng có ${coursesData.length} khóa học thuộc ${Object.keys(categorizedCourses).length} lĩnh vực. Dưới đây là một số khóa nổi bật:

🎯 **${Object.keys(categorizedCourses)[0]}:**
${categorizedCourses[Object.keys(categorizedCourses)[0]].slice(0, 2).map(c => `- ${c.title} (${c.price?.toLocaleString('vi-VN')} VNĐ)`).join('\n')}
..."
`;
      } else {
        console.warn('⚠️ No courses data available for AI');
        systemPrompt += `\n\n⚠️ LƯU Ý: Hiện không lấy được dữ liệu khóa học từ hệ thống.
Hãy xin lỗi người dùng và đề xuất họ:
- Làm mới trang và thử lại
- Hoặc liên hệ bộ phận hỗ trợ: support@minicoursera.com`;
      }

      systemPrompt += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❓ CÂU HỎI CỦA NGƯỜI DÙNG:
${prompt}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
      
      console.log('📝 System prompt length:', systemPrompt.length, 'characters');
      
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: systemPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      console.log('🔵 Gemini API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Gemini API Error Response:', errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('🔵 Gemini API response data:', data);
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const aiResponse = data.candidates[0].content.parts[0].text;
        console.log('✅ Gemini AI Response:', aiResponse);
        return aiResponse;
      } else {
        console.error('❌ Invalid response format:', data);
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Gemini API Error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack
      });
      return 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ.';
    }
  };

  // Handle send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: newMessage.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    try {
      // Fetch courses data first
      const coursesData = await fetchCoursesContext();
      console.log('📚 Fetched courses:', coursesData.length);
      
      // Call Gemini with courses context
      const aiResponse = await callGeminiAPI(userMessage.content, coursesData);
      
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // Clear chat history
  const handleClearChat = () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử chat?')) {
      localStorage.removeItem('ai_chat_history');
      setMessages([{
        id: Date.now(),
        role: 'assistant',
        content: 'Lịch sử chat đã được xóa. Tôi có thể giúp gì cho bạn?',
        timestamp: new Date().toISOString()
      }]);
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Theme colors
  const colors = {
    background: theme === 'dark' ? '#0f172a' : '#f8fafc',
    card: theme === 'dark' ? '#1e293b' : '#ffffff',
    border: theme === 'dark' ? '#334155' : '#e2e8f0',
    text: theme === 'dark' ? '#f1f5f9' : '#1e293b',
    textSecondary: theme === 'dark' ? '#94a3b8' : '#64748b',
    userMessage: theme === 'dark' ? '#4f46e5' : '#6366f1',
    assistantMessage: theme === 'dark' ? '#1e293b' : '#f1f5f9',
    assistantText: theme === 'dark' ? '#e2e8f0' : '#334155'
  };

  // Debug: Check auth state
  useEffect(() => {
    console.log('🤖 AIChatbot - Auth State:', {
      hasAuthState: !!authState,
      hasUser: !!authState?.user,
      user: authState?.user,
      roleId: authState?.user?.role_id,
      role: authState?.user?.role
    });
  }, [authState]);

  // Only show for learners (role_id === 3 or role === 'learner') and guests (no auth)
  const isLearnerOrGuest = !authState?.user || 
                           authState.user.role_id === 3 || 
                           authState.user.role === 'learner';
  
  console.log('🤖 AIChatbot - isLearnerOrGuest:', isLearnerOrGuest);
  console.log('🤖 AIChatbot - Will render:', isLearnerOrGuest ? 'YES ✅' : 'NO ❌');
  
  if (!isLearnerOrGuest) {
    console.log('🚫 AIChatbot - Hidden for role:', authState?.user?.role_id, authState?.user?.role);
    return null; // Don't show for instructors/admins
  }

  console.log('✅ AIChatbot - Rendering floating button and chat window');

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && createPortal(
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-2xl ${className}`}
          style={{
            position: 'fixed',
            bottom: 'max(10rem, calc(env(safe-area-inset-bottom) + 9rem))',
            right: 'max(1.5rem, env(safe-area-inset-right))',
            width: 'clamp(52px, 4.5vw, 64px)',
            height: 'clamp(52px, 4.5vw, 64px)',
            borderRadius: '50%',
            border: 'none',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#ffffff',
            zIndex: 100000,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
          }}
          title="AI Chatbot - Trợ lý ảo"
        >
          <Sparkles style={{ width: 'clamp(24px, 3.5vw, 28px)', height: 'clamp(24px, 3.5vw, 28px)' }} />
        </button>,
        document.body
      )}

      {/* Chat Window */}
      {isOpen && createPortal(
        <div
          className="fixed z-[100000] rounded-lg shadow-2xl flex flex-col"
          style={{
            bottom: 'max(10rem, calc(env(safe-area-inset-bottom) + 9rem))',
            right: 'max(1.5rem, env(safe-area-inset-right))',
            width: '400px',
            height: '600px',
            maxWidth: 'calc(100vw - 3rem)',
            maxHeight: 'calc(100vh - 12rem)',
            backgroundColor: colors.card,
            border: `1px solid ${colors.border}`
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-4 border-b rounded-t-lg"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderColor: colors.border,
              color: '#ffffff'
            }}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Sparkles className="w-6 h-6" />
                <div 
                  className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
                  title="AI Online"
                />
              </div>
              <div>
                <h3 className="font-semibold text-base">AI Assistant</h3>
                <p className="text-xs opacity-90">Trợ lý ảo 24/7</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleClearChat}
                className="hover:bg-white hover:bg-opacity-20 p-1.5 rounded transition-colors"
                title="Xóa lịch sử chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white hover:bg-opacity-20 p-1.5 rounded transition-colors"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{ backgroundColor: colors.background }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === 'user' ? 'rounded-br-none' : 'rounded-bl-none'
                  }`}
                  style={{
                    backgroundColor: msg.role === 'user' ? colors.userMessage : colors.assistantMessage,
                    color: msg.role === 'user' ? '#ffffff' : colors.assistantText
                  }}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2 opacity-80">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">AI Assistant</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  <p
                    className="text-xs mt-2 opacity-70"
                    style={{ fontSize: '11px' }}
                  >
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div
                  className="max-w-[80%] rounded-lg rounded-bl-none p-3 flex items-center gap-2"
                  style={{
                    backgroundColor: colors.assistantMessage,
                    color: colors.assistantText
                  }}
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Đang suy nghĩ...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border
            }}
          >
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Nhắn tin với AI..."
                className="flex-1 px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                style={{
                  backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                  borderColor: colors.border,
                  color: colors.text
                }}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || isLoading}
                className="px-4 py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#ffffff'
                }}
                title="Gửi tin nhắn"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-xs mt-2 opacity-60" style={{ color: colors.textSecondary }}>
              AI có thể mắc lỗi. Kiểm tra thông tin quan trọng.
            </p>
          </form>
        </div>,
        document.body
      )}
    </>
  );
}

export default AIChatbot;
