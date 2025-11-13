# 🏦 VNPay Payment Integration Guide

## 📋 Tổng quan

Hệ thống Mini Coursera đã tích hợp **VNPay Payment Gateway** để hỗ trợ thanh toán trực tuyến an toàn và tiện lợi.

### ✅ Các phương thức thanh toán được hỗ trợ:
- 💳 **Thẻ ATM nội địa** (tất cả ngân hàng Việt Nam)
- 💰 **Thẻ Visa/MasterCard/JCB**
- 📱 **QR Code** (VNPay QR)
- 👛 **Ví điện tử** (Momo, ZaloPay, ViettelPay...)

---

## 🎯 Cấu hình hiện tại (Sandbox)

File `.env` đã được cấu hình với tài khoản **VNPay Demo**:

```env
VNPAY_TMN_CODE=DEMOV210
VNPAY_HASH_SECRET=RAOEXHYVSDDIIENYWSLDIIZTANXUXZFJ
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:5173/checkout/vnpay-return
VNPAY_VERSION=2.1.0
```

---

## 🧪 Test thanh toán với VNPay Sandbox

### **Thẻ test NCB (Ngân hàng NCB):**

```
Ngân hàng: NCB
Số thẻ: 9704198526191432198
Tên chủ thẻ: NGUYEN VAN A
Ngày phát hành: 07/15
Mật khẩu OTP: 123456
```

### **Các thẻ test khác:**

#### Thẻ nội địa thành công:
- **Vietcombank**: `9704060000000001` | Tên: `NGUYEN VAN A` | Ngày: `03/07` | OTP: `123456`
- **Techcombank**: `9704030000000001` | Tên: `NGUYEN VAN A` | Ngày: `03/07` | OTP: `123456`
- **Sacombank**: `9704050000000001` | Tên: `NGUYEN VAN A` | Ngày: `03/07` | OTP: `123456`

#### Thẻ quốc tế thành công:
- **Visa**: `4111111111111111` | Tên: `NGUYEN VAN A` | Ngày: `12/25` | CVV: `123`

#### Thẻ thất bại (để test error):
- **Không đủ tiền**: `9704061111111111`
- **Thẻ bị khóa**: `9704062222222222`

---

## 🚀 Hướng dẫn test thanh toán

### **Bước 1: Khởi động servers**

```powershell
# Terminal 1: Start backend
cd backend
npm start

# Terminal 2: Start frontend
cd ..
npm run dev
```

### **Bước 2: Thêm khóa học vào giỏ hàng**

1. Vào trang Catalog: `http://localhost:5173/catalog`
2. Chọn khóa học và click "Add to Cart"
3. Click icon giỏ hàng → "Checkout"

### **Bước 3: Thanh toán với VNPay**

1. Ở trang Checkout, chọn **"VNPay (ATM/Visa/QR)"**
2. Click **"Tiếp tục thanh toán"**
3. Bạn sẽ được redirect đến trang VNPay Sandbox
4. Chọn phương thức thanh toán (ATM, Visa, QR...)
5. Nhập thông tin thẻ test (xem bên trên)
6. Nhấn "Thanh toán"
7. Nhập mã OTP: `123456`
8. Sau khi thành công, bạn sẽ tự động quay về trang xác nhận

### **Bước 4: Kiểm tra kết quả**

✅ **Thanh toán thành công:**
- Hiển thị màn hình "Thanh toán thành công"
- Có nút "Bắt đầu học"
- Check database: `payments` table → `status = 'completed'`

❌ **Thanh toán thất bại:**
- Hiển thị màn hình "Thanh toán thất bại" với lỗi cụ thể
- Có nút "Thử lại"
- Check database: `payments` table → `status = 'failed'`

---

## 🔍 Kiểm tra logs

### **Backend logs:**

```bash
# Tạo payment URL
🔵 VNPay create payment URL called: { paymentId: 123, amount: 0.55 }
✅ VNPay payment URL created: { paymentId: 123, orderId: 'MC123...', amountVND: 13200 }

# Nhận return callback
🔵 VNPay return callback: { vnp_ResponseCode: '00', ... }
💳 VNPay transaction result: { success: true }
✅ Payment completed successfully: 123
```

### **Frontend logs:**

```bash
🏦 VNPay Payment path selected
✅ VNPay URL created, redirecting...
🔵 VNPay Return: { status: 'success', paymentId: '123' }
```

---

## 📊 Flow thanh toán VNPay

```
┌──────────┐
│  User    │ Click "Tiếp tục thanh toán"
└────┬─────┘
     │
     v
┌────────────────────────────────┐
│  Frontend (Checkout.jsx)       │
│  - Call api.vnpay.createURL()  │
└────┬───────────────────────────┘
     │
     v
┌────────────────────────────────┐
│  Backend (/api/vnpay/create)   │
│  - Create order ID             │
│  - Build secure URL + signature│
│  - Return payment URL          │
└────┬───────────────────────────┘
     │
     v
┌────────────────────────────────┐
│  User redirected to VNPay      │
│  sandbox.vnpayment.vn          │
│  - Choose payment method       │
│  - Enter card info             │
│  - Enter OTP                   │
└────┬───────────────────────────┘
     │
     v
┌────────────────────────────────┐
│  VNPay processes payment       │
│  - Verify card                 │
│  - Deduct money (sandbox=fake) │
│  - Generate response           │
└────┬───────────────────────────┘
     │
     v
┌────────────────────────────────┐
│  Backend (/api/vnpay/return)   │
│  - Verify signature            │
│  - Update payment status       │
│  - Redirect to frontend        │
└────┬───────────────────────────┘
     │
     v
┌────────────────────────────────┐
│  Frontend (VNPayReturn.jsx)    │
│  - Show success/failure        │
│  - Navigate to My Learning     │
└────────────────────────────────┘
```

---

## 🔐 Bảo mật

### **HMAC-SHA512 Signature Verification:**

VNPay sử dụng HMAC-SHA512 để xác thực mọi request/response:

```javascript
// Backend tạo signature khi build URL
const signData = querystring.stringify(params);
const hmac = crypto.createHmac('sha512', HASH_SECRET);
const signature = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

// Backend verify signature khi nhận return
const receivedSignature = req.query.vnp_SecureHash;
const calculatedSignature = crypto.createHmac('sha512', HASH_SECRET)
  .update(signData)
  .digest('hex');

if (receivedSignature !== calculatedSignature) {
  // Reject! Không hợp lệ
}
```

### **Ngăn chặn giả mạo:**
- ✅ Mọi response từ VNPay đều có signature
- ✅ Backend verify signature trước khi update DB
- ✅ Không thể fake success response
- ✅ Frontend không thể tự update payment status

---

## 🔄 Chuyển từ Sandbox sang Production

Khi deploy thật, bạn cần:

### **1. Đăng ký VNPay Business:**

- Truy cập: https://vnpay.vn/
- Liên hệ sales: sales@vnpay.vn hoặc 1900 5555 88
- Chuẩn bị giấy tờ:
  - Giấy phép kinh doanh
  - Thông tin doanh nghiệp
  - Website đã deploy

### **2. Nhận thông tin Production:**

Sau khi đăng ký, VNPay sẽ cung cấp:
- ✅ `TMN Code` (mã merchant)
- ✅ `Hash Secret` (key bảo mật)
- ✅ Production URL

### **3. Cập nhật .env:**

```env
# Production VNPay
VNPAY_TMN_CODE=YOUR_REAL_TMN_CODE
VNPAY_HASH_SECRET=YOUR_REAL_HASH_SECRET
VNPAY_URL=https://pay.vnpay.vn/vpcpay.html
VNPAY_RETURN_URL=https://your-domain.com/checkout/vnpay-return
VNPAY_VERSION=2.1.0
```

### **4. Deploy backend:**

- Backend phải có **public URL** (Render, Heroku, Railway...)
- Update `VNPAY_RETURN_URL` với domain thật
- Đăng ký `IPN URL` với VNPay: `https://your-domain.com/api/vnpay/vnpay-ipn`

---

## ⚠️ Lưu ý quan trọng

### **Sandbox vs Production:**

| Tính năng | Sandbox | Production |
|-----------|---------|------------|
| URL | sandbox.vnpayment.vn | pay.vnpay.vn |
| TMN Code | DEMOV210 (public) | YOUR_CODE (private) |
| Hash Secret | RAOEXHYVS... (public) | YOUR_SECRET (private) |
| Thẻ test | Sử dụng được | **KHÔNG** sử dụng được |
| Tiền thật | Không | **CÓ** (thật) |
| Phí giao dịch | Miễn phí | 1.5% - 3% |

### **Bảo mật Hash Secret:**

```env
# ❌ KHÔNG COMMIT file .env vào Git!
# ✅ Chỉ commit .env.example (không chứa secret thật)
# ✅ Add .env vào .gitignore
```

### **Xử lý IPN (Instant Payment Notification):**

IPN là webhook từ VNPay, gọi ngay khi thanh toán thành công (real-time hơn return URL).

**Endpoint:** `GET /api/vnpay/vnpay-ipn`

VNPay sẽ gọi IPN **ngay cả khi user đóng trình duyệt**, đảm bảo payment được update.

---

## 📞 Hỗ trợ

### **VNPay Support:**
- Hotline: 1900 5555 88
- Email: support@vnpay.vn
- Tài liệu: https://sandbox.vnpayment.vn/apis/docs/

### **Testing Issues:**

Nếu thanh toán test không hoạt động:

1. **Check backend logs** → Có nhận được return callback không?
2. **Check signature** → Có lỗi "Invalid signature" không?
3. **Check database** → Payment status có update không?
4. **Check frontend console** → Có redirect đúng URL không?
5. **Xóa cache browser** → Ctrl+Shift+Delete

---

## 🎉 Kết luận

VNPay đã được tích hợp hoàn chỉnh! Bạn có thể:

✅ Test thanh toán với thẻ demo
✅ Xử lý success/failure flow
✅ Auto-update payment status
✅ Redirect user sau thanh toán
✅ Sẵn sàng deploy production

**Chúc bạn test thành công! 🚀**
