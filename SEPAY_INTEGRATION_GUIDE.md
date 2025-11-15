# 🏦 HƯỚNG DẪN TÍCH HỢP SEPAY - THANH TOÁN TỰ ĐỘNG QUA QR CODE

## 📋 Tổng quan

SePay là giải pháp thanh toán tự động qua QR Code ngân hàng Việt Nam. Khi khách hàng quét mã QR và chuyển khoản, hệ thống **TỰ ĐỘNG** xác nhận thanh toán mà không cần admin xác nhận thủ công.

## ✨ Ưu điểm của SePay

✅ **Tự động 100%** - Không cần admin xác nhận  
✅ **Thời gian thực** - Webhook nhận thông báo ngay lập tức  
✅ **QR Code chuẩn VietQR** - Tương thích mọi ngân hàng Việt Nam  
✅ **Miễn phí** - Không phí giao dịch từ SePay  
✅ **An toàn** - Chỉ cần tài khoản ngân hàng, không cần API Key ngân hàng  

## 🎯 Luồng hoạt động

```
[Learner] → Chọn khóa học → Checkout
    ↓
[Frontend] → Gọi API /api/payment/sepay/create
    ↓
[Backend] → Tạo payment record → Generate QR Code (VietQR API)
    ↓
[Frontend] → Hiển thị QR Code → Learner quét mã → Chuyển khoản
    ↓
[Ngân hàng] → Xác nhận giao dịch → Gửi webhook đến SePay
    ↓
[SePay] → Nhận webhook → Forward đến /api/payment/sepay/webhook
    ↓
[Backend] → Verify signature → Update payment status → Create enrollments
    ↓
[Frontend] → Auto-refresh (5s interval) → Redirect to My Learning
```

## 📁 Cấu trúc files đã tạo

### Backend (✅ Đã tạo xong)

```
backend/
├── config/
│   └── sepay.config.js         # Cấu hình SePay (API Key, Bank Info, Webhook)
├── services/
│   └── sepay.service.js        # Service xử lý QR Code, check transaction
└── routes/
    └── sepay.routes.js         # API endpoints cho SePay

server.js (đã cập nhật)          # Đăng ký route /api/payment/sepay
```

### Frontend (✅ Đã tạo xong)

```
src/
└── pages/
    └── SepayPaymentPage.jsx    # Trang hiển thị QR Code + Auto-check status
```

## 🔧 Các bước cài đặt

### Bước 1: Đăng ký tài khoản SePay (FREE)

1. Truy cập: https://my.sepay.vn/register
2. Đăng ký tài khoản (email + phone)
3. Đăng nhập vào Dashboard
4. Thêm tài khoản ngân hàng của bạn (MB Bank, VCB, TCB, etc.)
5. Lấy API Key: Dashboard → Cài đặt → API Key

### Bước 2: Cấu hình Backend

Cập nhật file `.env` trong thư mục `backend/`:

```env
# SePay Configuration
SEPAY_API_KEY=your_sepay_api_key_here
SEPAY_API_URL=https://my.sepay.vn/userapi

# Bank Account (Tài khoản nhận tiền)
BANK_CODE=MB                    # MB Bank, VCB, TCB, ACB, ...
BANK_NAME=MB Bank
BANK_ACCOUNT_NUMBER=0123456789  # Số tài khoản của bạn
BANK_ACCOUNT_NAME=MINI COURSERA # Tên chủ tài khoản (IN HOA)

# Webhook
SEPAY_WEBHOOK_URL=https://yourdomain.com/api/payment/sepay/webhook
SEPAY_WEBHOOK_SECRET=your_random_secret_key_here_123456
```

**Lưu ý**: 
- `BANK_ACCOUNT_NAME` phải viết **IN HOA** và **KHÔNG DẤU**
- `SEPAY_WEBHOOK_SECRET` tạo ngẫu nhiên bằng cách: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Bước 3: Cấu hình Webhook trên SePay Dashboard

1. Đăng nhập SePay Dashboard: https://my.sepay.vn
2. Vào **Cài đặt** → **Webhook**
3. Nhập URL: `https://yourdomain.com/api/payment/sepay/webhook`
4. Nhập Secret Key (giống `SEPAY_WEBHOOK_SECRET` trong `.env`)
5. Lưu cấu hình

**Lưu ý để development (localhost)**:
- SePay webhook không thể gọi đến `localhost`
- Cần deploy backend lên server hoặc dùng **ngrok**:
  ```bash
  ngrok http 3001
  ```
  Sau đó dùng URL ngrok làm webhook URL

### Bước 4: Cập nhật Frontend Checkout Page

Thêm option "SePay" vào payment methods trong `src/pages/Checkout.jsx`:

**Tìm dòng** (~line 666):
```jsx
<div className="grid md:grid-cols-3 gap-4">
  {[
    { id: 'vnpay', name: 'VNPay (ATM/Visa/QR)', icon: '💳', recommended: true },
    { id: 'qr', name: 'Chuyển khoản QR Code', icon: '📱' },
    { id: 'card', name: 'Thẻ tín dụng/Ghi nợ', icon: '💵' }
  ].map(method => (
```

**Thay bằng**:
```jsx
<div className="grid md:grid-cols-4 gap-4">
  {[
    { id: 'sepay', name: 'SePay (QR Tự động)', icon: '🚀', recommended: true, badge: 'TỰ ĐỘNG' },
    { id: 'vnpay', name: 'VNPay (ATM/Visa/QR)', icon: '💳' },
    { id: 'qr', name: 'Chuyển khoản QR Code', icon: '📱' },
    { id: 'card', name: 'Thẻ tín dụng/Ghi nợ', icon: '💵' }
  ].map(method => (
```

**Sau đó thêm section hiển thị badge** (~line 679):
```jsx
onClick={() => setPaymentInfo(prev => ({...prev, paymentMethod: method.id}))}
>
  {method.recommended && (
    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
      Khuyến nghị
    </div>
  )}
  {method.badge && (
    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
      {method.badge}
    </div>
  )}
  <div className="text-2xl mb-2">{method.icon}</div>
  <div className="font-medium">{method.name}</div>
</div>
```

**Thêm handler cho SePay** (tìm `handlePaymentSubmit`, ~line 400):
```jsx
const handlePaymentSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // ... existing validation code ...

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

    // ... existing code for other payment methods ...
  }
```

### Bước 5: Thêm Route cho SePay Payment Page

Trong `src/router/AppRouter.jsx`, thêm route:

```jsx
import SepayPaymentPage from '../pages/SepayPaymentPage';

// Trong routes array:
{
  path: '/payment/sepay',
  element: (
    <ProtectedRoute>
      <SepayPaymentPage />
    </ProtectedRoute>
  ),
},
```

### Bước 6: Cài đặt dependencies

Backend đã có sẵn tất cả dependencies (axios, express, etc.)

Frontend cần đảm bảo có:
```bash
npm install axios react-router-dom
```

## 🧪 Testing

### Test 1: Generate QR Code

```bash
# Start backend
cd backend
npm run dev

# Test create payment
curl -X POST http://localhost:3001/api/payment/sepay/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "courses": [
      { "courseId": 1 }
    ],
    "billingInfo": {
      "firstName": "Test",
      "lastName": "User",
      "email": "test@example.com"
    }
  }'
```

Response sẽ có:
- `qrCode`: Base64 image của QR code
- `transactionRef`: Mã giao dịch (MCOURSE12345ABC)
- `bankInfo`: Thông tin ngân hàng
- `expiresAt`: Thời gian hết hạn (15 phút)

### Test 2: Check Payment Status

```bash
curl -X POST http://localhost:3001/api/payment/sepay/check-status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "paymentId": 1
  }'
```

### Test 3: Webhook (Simulate)

```bash
curl -X POST http://localhost:3001/api/payment/sepay/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_content": "MCOURSE 1 NGUYEN VAN A",
    "amount_in": "100000",
    "gateway_transaction_id": "FT21123456789",
    "transaction_date": "2024-01-15 10:30:00"
  }'
```

## 📱 Hướng dẫn Learner sử dụng

### Cách 1: Quét QR Code (Khuyến nghị)

1. Click "Thanh toán" trên giỏ hàng
2. Chọn "SePay (QR Tự động)"
3. Click "Tiếp tục thanh toán"
4. Mở app ngân hàng trên điện thoại
5. Chọn "Quét mã QR"
6. Quét mã QR hiển thị trên màn hình
7. Xác nhận thanh toán
8. Chờ 5-10 giây → Hệ thống tự động xác nhận

### Cách 2: Chuyển khoản thủ công

1. Làm theo bước 1-3 ở trên
2. Sao chép thông tin:
   - Ngân hàng: MB Bank
   - Số tài khoản: 0123456789
   - Tên: MINI COURSERA
   - Số tiền: 100,000 VND
   - Nội dung: **MCOURSE 123 (QUAN TRỌNG!)**
3. Mở app ngân hàng → Chuyển khoản
4. Điền thông tin và **NHẬP ĐÚNG NỘI DUNG**
5. Xác nhận chuyển khoản
6. Quay lại trang thanh toán → Click "Kiểm tra thanh toán"

## 🔐 Bảo mật

### Webhook Signature Verification

Backend tự động verify signature từ SePay webhook:

```javascript
// Trong sepay.routes.js
const signature = req.headers['x-sepay-signature'];
if (!sepayService.verifyWebhookSignature(payload, signature)) {
  return res.status(401).json({ error: 'Invalid signature' });
}
```

### Amount Verification

```javascript
// Kiểm tra số tiền khớp
const expectedAmount = payment.amount_cents / 100;
if (parseFloat(amount_in) !== expectedAmount) {
  return res.json({ message: 'Amount mismatch' });
}
```

### Transaction Reference Verification

```javascript
// Chỉ xử lý transaction với nội dung đúng format
const match = transaction_content.match(/MCOURSE\s*(\d+)/);
if (!match) {
  return res.json({ message: 'Invalid content format' });
}
```

## 🐛 Troubleshooting

### Lỗi: "Không thể tạo mã QR"

**Nguyên nhân**: VietQR API không phản hồi

**Giải pháp**:
1. Kiểm tra kết nối internet
2. Kiểm tra bank code trong `.env` (MB, VCB, TCB, ...)
3. Kiểm tra account number chính xác

### Lỗi: "Webhook không nhận được"

**Nguyên nhân**: 
- Localhost không accessible từ internet
- URL webhook sai
- Secret key không khớp

**Giải pháp**:
1. Dùng ngrok expose localhost:
   ```bash
   ngrok http 3001
   ```
2. Cập nhật webhook URL trong SePay Dashboard
3. Kiểm tra secret key trong `.env` và SePay Dashboard

### Lỗi: "Payment không tự động confirm"

**Nguyên nhân**:
- Nội dung chuyển khoản sai
- Payment đã expired (> 15 phút)
- Số tiền không khớp

**Giải pháp**:
1. Kiểm tra nội dung chuyển khoản có format: `MCOURSE [PaymentID]`
2. Tạo payment mới nếu đã hết hạn
3. Đảm bảo chuyển đúng số tiền

## 📊 Database Schema

SePay sử dụng bảng `payments` hiện có:

```sql
-- Không cần tạo bảng mới, dùng bảng payments existing
SELECT * FROM payments 
WHERE provider = 'sepay' 
AND status = 'completed';
```

Các trường quan trọng:
- `txn_ref`: Mã giao dịch (MCOURSE12345ABC)
- `provider`: 'sepay'
- `amount_cents`: Số tiền (VND * 100)
- `status`: 'pending' | 'completed' | 'expired'
- `metadata`: JSON chứa `gatewayTransactionId`, `customerName`, etc.

## 🎓 So sánh SePay vs VNPay vs QR thủ công

| Tính năng | SePay | VNPay | QR thủ công |
|-----------|-------|-------|-------------|
| **Tự động xác nhận** | ✅ Tự động 100% | ✅ Tự động | ❌ Admin phải xác nhận |
| **Thời gian xác nhận** | 5-10 giây | Ngay lập tức | 1-24 giờ |
| **Phí giao dịch** | ❌ Miễn phí | ✅ 1-3% | ❌ Miễn phí |
| **Đăng ký** | ✅ Free | ✅ Cần doanh nghiệp | ❌ Không cần |
| **QR Code** | ✅ VietQR | ✅ VietQR | ✅ VietQR |
| **Webhook** | ✅ Có | ✅ Có | ❌ Không |
| **Khuyến nghị** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |

**Khuyến nghị**: Dùng **SePay** cho development và MVP, chuyển sang **VNPay** khi scale lớn (cần đăng ký doanh nghiệp).

## 📞 Support

- SePay Documentation: https://docs.sepay.vn
- VietQR API: https://www.vietqr.io/danh-sach-api
- GitHub Issues: [Your repo issues]

---

✅ **Hoàn tất!** Bây giờ hệ thống đã có thanh toán QR tự động hoàn toàn FREE!
