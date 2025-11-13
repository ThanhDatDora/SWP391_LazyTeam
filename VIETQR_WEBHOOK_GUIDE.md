# 🚀 VietQR Webhook Integration Guide

## 📋 Tổng quan

VietQR Webhook cho phép hệ thống **TẰ ĐỘNG** xác nhận thanh toán khi user chuyển khoản QR, **KHÔNG CẦN** user phải click "Kiểm tra thanh toán".

---

## ✅ LỢI ÍCH

1. ✅ **Tự động 100%**: User quét QR → Chuyển tiền → Tự động verified → Hiện nút "Hoàn tất"
2. ✅ **Real-time**: Xác nhận trong vòng 1-5 giây
3. ✅ **An toàn**: VietQR là dịch vụ chính thức, được ngân hàng hỗ trợ
4. ✅ **Miễn phí**: Không tính phí cho giao dịch nhỏ

---

## 🔒 BẢO MẬT

### **Thông tin VietQR KHÔNG GỬI:**
- ❌ Tên người chuyển
- ❌ Số tài khoản người chuyển  
- ❌ CMND/CCCD
- ❌ Thông tin cá nhân khác

### **Thông tin VietQR GỬI:**
- ✅ Số tiền (amount)
- ✅ Nội dung chuyển khoản (do BẠN tạo: "MINICOURSE-123")
- ✅ Thời gian giao dịch
- ✅ Mã giao dịch ngân hàng

→ **HOÀN TOÀN HỢP PHÁP** theo luật GDPR & PDPA Việt Nam

---

## 📝 HƯỚNG DẪN TRIỂN KHAI

### **BƯỚC 1: Đăng ký VietQR (5 phút)**

1. Truy cập: https://vietqr.io/
2. Click "Đăng ký" → Nhập email
3. Xác thực email
4. Thêm tài khoản ngân hàng: OCB - 0933027148
5. Lấy **API Key** và **Webhook Secret** từ Dashboard

### **BƯỚC 2: Cấu hình Backend (ĐÃ XONG)**

✅ File `backend/routes/webhook.js` đã tạo
✅ Đã register route `/api/webhook/vietqr`

**Cần làm:**
1. Mở file `backend/.env`
2. Thêm dòng:
```env
VIETQR_WEBHOOK_SECRET=your-secret-key-from-vietqr-dashboard
```

### **BƯỚC 3: Deploy Public URL**

VietQR cần gọi webhook đến server của bạn → **Server phải có public URL**.

#### **Option 1: Ngrok (TEST nhanh - 2 phút)**

```bash
# Cài ngrok
npm install -g ngrok

# Start backend
cd backend
npm start

# Trong terminal khác, tạo tunnel
ngrok http 3001
```

→ Ngrok sẽ cho URL: `https://abc123.ngrok.io`

→ Webhook URL: `https://abc123.ngrok.io/api/webhook/vietqr`

#### **Option 2: Deploy lên Render/Heroku (PRODUCTION)**

Deploy backend lên cloud → Có URL cố định như:
- `https://mini-coursera-api.onrender.com`
- Webhook URL: `https://mini-coursera-api.onrender.com/api/webhook/vietqr`

### **BƯỚC 4: Cấu hình Webhook trong VietQR Dashboard**

1. Vào VietQR Dashboard
2. Chọn "Webhooks" → "Add Webhook"
3. Nhập:
   - **URL**: `https://your-domain.com/api/webhook/vietqr`
   - **Events**: ✅ `transaction.success`
4. Save

### **BƯỚC 5: Test Webhook**

#### **Test với Postman/curl:**

```bash
curl -X POST http://localhost:3001/api/webhook/vietqr/test \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 13200,
    "description": "MINICOURSE-12345"
  }'
```

→ Check console backend, phải thấy:
```
🔔 VietQR Webhook received
✅ Payment verified successfully
```

#### **Test thật:**

1. Tạo order trong frontend → Lấy payment ID (ví dụ: 123)
2. Quét QR code trên app ngân hàng
3. Chuyển khoản với nội dung: `MINICOURSE-123`
4. Đợi 1-5 giây
5. Frontend tự động hiện "✅ Thanh toán thành công"

---

## 🔧 CÁCH HOẠT ĐỘNG

### **Flow đầy đủ:**

```
┌─────────────┐
│   User      │ 1. Quét QR Code
└─────┬───────┘
      │
      v
┌─────────────┐
│ Mobile Bank │ 2. Chuyển khoản 13,200 VND
│   App       │    Nội dung: MINICOURSE-123
└─────┬───────┘
      │
      v
┌─────────────┐
│   Ngân hàng │ 3. Xử lý giao dịch
│     OCB     │
└─────┬───────┘
      │
      v
┌─────────────┐
│   VietQR    │ 4. Nhận thông báo từ ngân hàng
│   Server    │ 5. Gọi webhook đến server của bạn
└─────┬───────┘
      │
      v  POST /api/webhook/vietqr
┌─────────────┐
│ Your Server │ 6. Verify signature
│  (Backend)  │ 7. Kiểm tra số tiền khớp
│             │ 8. Update DB: status = 'completed'
└─────┬───────┘
      │
      v
┌─────────────┐
│  Frontend   │ 9. Polling nhận được verified=true
│   (React)   │ 10. Hiện nút "Hoàn tất đơn hàng"
└─────────────┘
```

---

## 🧪 DEBUG

### **Nếu webhook không hoạt động:**

1. **Check ngrok running:**
```bash
curl https://abc123.ngrok.io/api/webhook/vietqr
# Phải trả về: "Cannot GET /api/webhook/vietqr"
```

2. **Check VietQR Dashboard:**
- Vào "Webhook Logs"
- Xem có request nào gửi đến không
- Check response code (phải là 200)

3. **Check backend logs:**
```bash
# Phải thấy:
🔔 VietQR Webhook received
💳 Transaction details: { amount: 13200, ... }
✅ Found matching payment: { payment_id: 123 }
```

4. **Check database:**
```sql
SELECT * FROM payments WHERE payment_id = 123
-- Status phải = 'completed'
```

---

## 💰 CHI PHÍ

| Giao dịch/tháng | Phí           |
|-----------------|---------------|
| < 1000          | **MIỄN PHÍ** |
| 1000 - 10,000   | 0.1%         |
| > 10,000        | Liên hệ      |

→ **Cho dự án học tập: MIỄN PHÍ 100%**

---

## 🚨 LƯU Ý

1. ✅ **Luôn verify signature** → Tránh fake request
2. ✅ **Check amount khớp** → Tránh sai số tiền
3. ✅ **Response trong 5s** → VietQR sẽ timeout
4. ✅ **Idempotency** → Webhook có thể gọi nhiều lần (cùng 1 transaction)

---

## 📚 TÀI LIỆU THAM KHẢO

- VietQR Docs: https://vietqr.io/docs
- API Reference: https://vietqr.io/api
- Support: support@vietqr.io

---

## ✅ CHECKLIST

- [ ] Đăng ký VietQR account
- [ ] Lấy API Key & Webhook Secret
- [ ] Thêm `VIETQR_WEBHOOK_SECRET` vào `.env`
- [ ] Start ngrok: `ngrok http 3001`
- [ ] Cấu hình webhook URL trong VietQR Dashboard
- [ ] Test với `/api/webhook/vietqr/test`
- [ ] Test thật: Quét QR → Chuyển tiền → Check log
- [ ] Deploy production (Render/Heroku)
- [ ] Update webhook URL production trong VietQR

---

**🎉 SAU KHI SETUP XONG:**

User chỉ cần:
1. Quét QR
2. Chuyển tiền
3. Đợi 1-5 giây → Tự động verified!
4. Click "Hoàn tất đơn hàng"

**KHÔNG CẦN** click "Kiểm tra thanh toán" nữa! 🚀
