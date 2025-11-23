# 🎉 SEPAY PAYMENT INTEGRATION - QUICK START

## ✅ Đã hoàn thành

### 1. Backend (100% Complete)
- ✅ `backend/config/sepay.config.js` - Cấu hình SePay
- ✅ `backend/services/sepay.service.js` - Service xử lý QR Code
- ✅ `backend/routes/sepay.routes.js` - API endpoints
- ✅ `backend/server.js` - Đã đăng ký route `/api/payment/sepay`

### 2. Frontend (100% Complete)
- ✅ `src/pages/SepayPaymentPage.jsx` - UI hiển thị QR Code + Auto-check

### 3. Documentation (100% Complete)
- ✅ `SEPAY_INTEGRATION_GUIDE.md` - Hướng dẫn đầy đủ

## 🚀 Cách sử dụng ngay (3 bước)

### Bước 1: Cấu hình `.env`

Tạo/cập nhật file `backend/.env`:

```env
# SePay - Thanh toán QR tự động
SEPAY_API_KEY=                        # Lấy từ https://my.sepay.vn (optional cho dev)
BANK_CODE=MB                          # Mã ngân hàng (MB, VCB, TCB, ACB...)
BANK_NAME=MB Bank                     # Tên ngân hàng
BANK_ACCOUNT_NUMBER=0123456789        # SỐ TÀI KHOẢN CỦA BẠN
BANK_ACCOUNT_NAME=MINI COURSERA       # TÊN CHỦ TÀI KHOẢN (IN HOA, KHÔNG DẤU)
SEPAY_WEBHOOK_SECRET=your_secret_key  # Tạo ngẫu nhiên: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Bước 2: Thêm SePay vào Checkout

Mở file `src/pages/Checkout.jsx`:

**Tìm dòng 666** (payment methods array):
```jsx
{ id: 'vnpay', name: 'VNPay (ATM/Visa/QR)', icon: '💳', recommended: true },
```

**Thêm SePay vào đầu array**:
```jsx
{ id: 'sepay', name: 'SePay QR (Tự động)', icon: '🚀', recommended: true, badge: 'TỰ ĐỘNG' },
{ id: 'vnpay', name: 'VNPay (ATM/Visa/QR)', icon: '💳' },
```

**Tìm hàm `handlePaymentSubmit`** (~line 400), thêm vào đầu try block:
```jsx
// If SePay selected, redirect to SePay payment page
if (paymentInfo.paymentMethod === 'sepay') {
  navigate('/payment/sepay', {
    state: {
      cartData: {
        courses: cartItems,
        billingInfo,
      }
    }
  });
  return;
}
```

### Bước 3: Thêm Route

Mở `src/router/AppRouter.jsx`, thêm:

```jsx
import SepayPaymentPage from '../pages/SepayPaymentPage';

// Trong routes array, thêm route:
{
  path: '/payment/sepay',
  element: (
    <ProtectedRoute>
      <SepayPaymentPage />
    </ProtectedRoute>
  ),
},
```

## 🎬 Test ngay!

```bash
# 1. Start backend
cd backend
npm run dev

# 2. Start frontend (terminal mới)
cd ..
npm run dev

# 3. Mở browser
# http://localhost:5173
# → Đăng nhập → Thêm khóa học vào giỏ → Checkout → Chọn "SePay QR"
```

Bạn sẽ thấy:
- ✅ QR Code để quét
- ✅ Thông tin chuyển khoản thủ công
- ✅ Countdown timer (15 phút)
- ✅ Auto-check status mỗi 5 giây
- ✅ Tự động redirect khi thanh toán thành công

## 🏦 Test với số tài khoản thật

**Option 1: Không cần SePay account (Miễn phí)**
- Chỉ cần điền số tài khoản ngân hàng của bạn vào `.env`
- QR Code sẽ được tạo bằng VietQR API (free)
- **Hạn chế**: Không có auto-confirm (phải click "Kiểm tra thanh toán")

**Option 2: Có SePay account (Khuyến nghị)**
- Đăng ký tại: https://my.sepay.vn (FREE)
- Lấy API Key từ Dashboard
- Điền `SEPAY_API_KEY` vào `.env`
- **Lợi ích**: Auto-confirm thông qua webhook (100% tự động)

## 📱 Demo Flow

```
1. Learner chọn khóa học → Checkout
2. Chọn "SePay QR (Tự động)" → Click "Tiếp tục"
3. Hiển thị QR Code + Thông tin chuyển khoản
4. Learner mở app ngân hàng → Quét QR → Chuyển khoản
5. Hệ thống auto-check mỗi 5s → Detect thanh toán → Redirect
6. Learner vào "My Learning" → Thấy khóa học đã ghi danh
```

## 🎯 Production Checklist

Khi deploy production, cần:

- [ ] Đăng ký SePay account thật
- [ ] Cập nhật `SEPAY_API_KEY` thật
- [ ] Deploy backend lên server (để nhận webhook)
- [ ] Cấu hình webhook URL trên SePay Dashboard
- [ ] Cập nhật `BANK_ACCOUNT_NUMBER` và `BANK_ACCOUNT_NAME` thật
- [ ] Test với giao dịch thật (số tiền nhỏ)

## 📞 Hỗ trợ

Xem file `SEPAY_INTEGRATION_GUIDE.md` để biết:
- Cách hoạt động chi tiết
- Troubleshooting
- Security best practices
- Database schema
- API documentation

---

🎉 **Hoàn tất!** Bạn đã có hệ thống thanh toán QR tự động!
