# AI Chatbot - Gemini Integration

## Tổng quan
AI Chatbot sử dụng Google Gemini API để cung cấp trợ lý ảo 24/7 cho learner và guest.

## Tính năng

### 1. **Trợ lý thông minh**
- Trả lời câu hỏi về khóa học
- Gợi ý khóa học phù hợp với mục tiêu học tập
- Hướng dẫn sử dụng tính năng nền tảng
- Trả lời FAQ thường gặp

### 2. **Giao diện thân thiện**
- Floating button gradient (tím) ở góc trái màn hình
- Chat window responsive với dark mode support
- Typing animation khi AI đang suy nghĩ
- Lịch sử chat tự động lưu

### 3. **Tính năng nâng cao**
- **Lưu lịch sử:** Tự động lưu vào localStorage
- **Xóa lịch sử:** Nút clear chat trong header
- **Auto-scroll:** Tự động cuộn xuống tin nhắn mới
- **Auto-focus:** Focus input sau khi gửi tin nhắn
- **Responsive:** Hoạt động tốt trên mọi thiết bị

## Cấu hình

### API Key
```javascript
const GEMINI_API_KEY = 'AIzaSyD7tyKqjZE17xudVXMjPnP-LEJ9SgQ173o';
```

### Model
- **Model:** `gemini-pro`
- **Temperature:** 0.7 (cân bằng giữa sáng tạo và chính xác)
- **Max Tokens:** 1024 (đủ cho câu trả lời chi tiết)

### System Prompt
AI được training với context:
- Nền tảng học trực tuyến (LMS)
- Hỗ trợ tiếng Việt
- Chuyên nghiệp, thân thiện
- Đề xuất liên hệ support nếu không chắc chắn

## Tích hợp

### Components đã tích hợp:
1. **LearnerDashboard** (`src/pages/learner/LearnerDashboard.jsx`)
2. **Landing Page** (`src/pages/Landing.jsx`) - Guest
3. **CoursesPage** (`src/pages/CoursesPage.jsx`) - Guest/Learner

### Cách sử dụng:
```jsx
import AIChatbot from '../components/chat/AIChatbot';

function MyComponent() {
  return (
    <div>
      {/* Your content */}
      <AIChatbot />
    </div>
  );
}
```

## Phân quyền

### Hiển thị cho:
- ✅ **Learner** (role_id === 3)
- ✅ **Guest** (chưa đăng nhập)

### KHÔNG hiển thị cho:
- ❌ **Admin** (role_id === 1)
- ❌ **Instructor** (role_id === 2)

## Vị trí UI

### Floating Button
- **Vị trí:** Góc dưới bên TRÁI màn hình
- **Màu sắc:** Gradient tím (`#667eea` → `#764ba2`)
- **Icon:** Sparkles ✨
- **Z-index:** 9998 (thấp hơn chat instructor 9999)

### Chat Window
- **Kích thước:** 400px × 600px
- **Vị trí:** Bottom-left
- **Responsive:** Auto-adjust trên mobile
- **Animation:** Smooth transitions

## Cấu trúc dữ liệu

### Message Format
```javascript
{
  id: number,
  role: 'user' | 'assistant',
  content: string,
  timestamp: ISO 8601 string
}
```

### LocalStorage Key
```javascript
localStorage.getItem('ai_chat_history')
```

## Ví dụ sử dụng

### Câu hỏi mẫu:
1. "Tôi muốn học lập trình web, nên bắt đầu từ đâu?"
2. "Làm thế nào để xem tiến độ học tập của tôi?"
3. "Khóa học nào phù hợp với người mới bắt đầu?"
4. "Tôi có thể hoàn tiền không?"
5. "Làm sao để liên hệ với giảng viên?"

### Trả lời mẫu:
AI sẽ phản hồi với:
- Thông tin chi tiết, có cấu trúc
- Danh sách gạch đầu dòng
- Gợi ý các bước tiếp theo
- Link đến tài liệu/trang hỗ trợ (nếu cần)

## Giới hạn

### API Quota:
- **Free tier:** 60 requests/minute
- **Nên:** Implement rate limiting nếu có nhiều user

### Content Safety:
- Gemini tự động filter nội dung không phù hợp
- Không trả lời câu hỏi nhạy cảm/vi phạm chính sách

## Debugging

### Console Logs:
```javascript
console.log('Gemini API Error:', error); // Lỗi API
console.log('📬 Chat history loaded'); // Load lịch sử
```

### Error Handling:
- API lỗi → Hiển thị thông báo lỗi thân thiện
- Network timeout → Retry với exponential backoff
- Invalid response → Fallback message

## Best Practices

### 1. **Performance**
- Lazy load component khi cần
- Debounce typing indicator (nếu implement)
- Limit chat history trong localStorage (max 50 messages)

### 2. **Security**
- ⚠️ **Không** commit API key vào git
- Nên chuyển sang environment variable:
  ```javascript
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  ```

### 3. **UX**
- Loading state rõ ràng
- Error messages dễ hiểu
- Placeholder text gợi ý

## Roadmap

### Tính năng tương lai:
- [ ] Voice input/output
- [ ] Multi-language support
- [ ] Context-aware (biết user đang ở trang nào)
- [ ] Gợi ý câu hỏi quick replies
- [ ] Integration với course data thực tế
- [ ] Analytics (track most asked questions)

## Troubleshooting

### Chatbot không hiển thị?
1. Check role_id (chỉ learner/guest)
2. Xem console có lỗi import không
3. Verify component đã được thêm vào page

### API không hoạt động?
1. Check API key còn valid không
2. Verify network request trong DevTools
3. Check quota limit

### Lịch sử không lưu?
1. Check localStorage có enabled không
2. Verify JSON parse/stringify không lỗi
3. Clear cache và thử lại

## Support

Nếu gặp vấn đề, liên hệ:
- **Frontend Team:** Chat component issues
- **Backend Team:** API integration issues
- **DevOps:** Deployment, environment variables

---

**Version:** 1.0.0  
**Last Updated:** November 22, 2025  
**Maintained by:** Frontend Team
