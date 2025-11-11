# 🚀 Hướng dẫn Cấu hình Google OAuth và OTP Email

## 📋 Tổng quan tính năng đã thêm

✅ **Đăng nhập bằng Google OAuth**
✅ **Đăng ký với xác thực OTP qua email**
✅ **Gửi email OTP tự động**
✅ **Database migration hoàn tất**
✅ **Frontend UI hoàn chính**

## 🛠️ Cấu hình cần thiết

### 1. Google OAuth Setup

1. **Tạo Google Cloud Project:**
   - Truy cập [Google Cloud Console](https://console.cloud.google.com/)
   - Tạo project mới hoặc chọn project có sẵn
   - Bật Google+ API và Gmail API

2. **Tạo OAuth 2.0 Client:**
   - Vào APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Chọn "Web application"
   - Thêm Authorized redirect URIs:
     ```
     http://localhost:3001/api/auth/google/callback
     ```

3. **Cập nhật .env:**
   ```env
   GOOGLE_CLIENT_ID=your_actual_google_client_id
   GOOGLE_CLIENT_SECRET=your_actual_google_client_secret
   ```

### 2. Gmail SMTP Setup

1. **Bật 2-Step Verification:**
   - Vào Google Account Settings
   - Security > 2-Step Verification > Turn On

2. **Tạo App Password:**
   - Vào Security > App passwords
   - Chọn "Mail" và "Windows Computer"
   - Copy password được tạo

3. **Cập nhật .env:**
   ```env
   SMTP_EMAIL=your_gmail@gmail.com
   SMTP_PASSWORD=your_16_character_app_password
   ```

## 🎯 Cách sử dụng

### Đăng nhập bằng Google:
1. Vào `/auth`
2. Click "Đăng nhập bằng Google"
3. Hoàn tất OAuth flow
4. Tự động tạo tài khoản và đăng nhập

### Đăng ký với OTP:
1. Vào `/auth` > tab "Đăng ký"
2. Chọn "Đăng ký với OTP"
3. Nhập email > Click "Gửi mã OTP"
4. Kiểm tra email và nhập mã OTP
5. Hoàn tất thông tin và tạo tài khoản

## 🧪 Test tính năng

### Test trực tiếp:
- Frontend: http://localhost:5173/auth
- Backend Health: http://localhost:3001/api/health
- Google OAuth URL: http://localhost:3001/api/auth/google

### Demo accounts:
- **Admin:** admin@example.com / Admin@123
- **Instructor:** instructor@example.com / Instructor@123  
- **Learner:** learner@example.com / Learner@123

## 📊 Database Changes

✅ Đã thêm cột:
- `users.google_id` - Lưu Google ID
- `users.email_verified` - Trạng thái xác thực email
- `otp_codes` table - Lưu trữ OTP codes

✅ Index đã tạo:
- `IX_users_google_id` - Tối ưu tìm kiếm Google users
- `IX_otp_codes_email_purpose` - Tối ưu OTP lookup

## 🔧 Troubleshooting

### Lỗi Google OAuth:
- Kiểm tra GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET
- Đảm bảo redirect URI chính xác
- Kiểm tra APIs đã được bật

### Lỗi gửi email:
- Kiểm tra SMTP_EMAIL và SMTP_PASSWORD
- Đảm bảo App Password được tạo đúng cách
- Kiểm tra Less secure app access (nếu cần)

### Lỗi database:
- Chạy lại migration: `node migrations/add-google-oauth.js`
- Kiểm tra connection string trong .env

## 🚀 Deployment Notes

### Production setup:
1. Cập nhật redirect URI cho domain thật
2. Sử dụng environment variables an toàn
3. Cấu hình CORS cho domain production
4. Sử dụng Redis cho OTP storage thay vì memory

### Security checklist:
- [ ] JWT secret mạnh
- [ ] HTTPS cho production
- [ ] Rate limiting enabled
- [ ] Input validation complete
- [ ] Error messages không lộ thông tin nhạy cảm

## 📁 File structure

```
backend/
├── services/
│   ├── googleAuthService.js     # Google OAuth logic
│   └── otpService.js           # OTP email logic
├── migrations/
│   └── add-google-oauth.js     # Database migration
└── routes/
    └── auth.js                 # Updated auth routes

frontend/
├── pages/auth/
│   ├── AuthPage.jsx           # Updated with Google + OTP
│   └── AuthCallback.jsx       # OAuth callback handler
└── router/
    └── AppRouter.jsx          # Added callback route
```

## 🎉 Kết quả

Bây giờ bạn có:
- ✅ Đăng nhập truyền thống (email/password)
- ✅ Đăng nhập bằng Google OAuth
- ✅ Đăng ký với OTP xác thực qua email
- ✅ UI/UX hoàn chỉnh và thân thiện
- ✅ Database được cập nhật đầy đủ
- ✅ Backend API hoàn chỉnh với error handling

Hệ thống authentication hiện tại đã hoàn thiện và sẵn sàng cho production!