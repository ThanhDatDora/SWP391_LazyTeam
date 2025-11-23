# PayOS Auto Webhook Testing Guide

## 🎯 Luồng Tự Động (Real Production Flow)

```
User quét QR → Chuyển khoản → PayOS webhook → Backend tự động xử lý → Frontend auto complete
```

**Không cần** click nút "Simulate Success" nữa!

---

## 🚀 Quick Start (5 phút)

### Bước 1: Setup Ngrok (Chỉ làm 1 lần)

```powershell
# Cài ngrok (script sẽ tự động cài nếu chưa có)
# Đăng ký tài khoản miễn phí: https://ngrok.com

# Lấy authtoken từ: https://dashboard.ngrok.com/get-started/your-authtoken
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

### Bước 2: Chạy với Auto Ngrok

```powershell
# Chạy script tự động
.\start-with-ngrok.ps1
```

Script sẽ:
- ✅ Tự động start backend
- ✅ Tự động start ngrok
- ✅ Tự động lấy webhook URL
- ✅ Copy URL vào clipboard
- ✅ Hiển thị hướng dẫn configure PayOS

### Bước 3: Configure PayOS Dashboard

1. Mở: https://my.payos.vn/developers/webhooks
2. Click **"Add Webhook"**
3. Paste webhook URL (đã copy sẵn trong clipboard)
4. Chọn event: **"Payment Success"**
5. Click **"Save"**

### Bước 4: Test Thanh Toán Tự Động

1. **Frontend**: http://localhost:5173
   - Add khóa học vào cart
   - Checkout → Chọn **PayOS QR**
   - Màn hình hiện QR code

2. **Quét QR và chuyển khoản**
   - Dùng app ngân hàng quét QR
   - Chuyển khoản đúng số tiền
   - Đợi bank xác nhận (~5-10 giây)

3. **Tự động complete! 🎉**
   - PayOS nhận tiền → Gửi webhook → Backend
   - Backend update DB → Create enrollment
   - Frontend polling detect → Auto redirect!
   - **Không cần làm gì thêm!**

---

## 🔍 Monitoring Webhook

### Xem Ngrok Dashboard
```
http://localhost:4040
```

- **Requests**: Xem các webhook PayOS gửi đến
- **Response**: Kiểm tra backend có nhận đúng không
- **Status**: 200 = thành công, 4xx/5xx = lỗi

### Backend Logs (Console Window)
Khi webhook nhận được, sẽ thấy:
```
POST /api/payment/payos/webhook
✅ Webhook verified successfully
✅ Payment status: PAID (code: 00)
✅ Payment updated to paid: ORDER123456789
✅ Enrollment created for user: 5
```

### Frontend Console (Browser F12)
```javascript
// Polling log mỗi 5 giây
Checking PayOS payment status: ORDER123456789
Payment status: PAID
✅ Payment verified! Auto-completing...
```

---

## ⚠️ Quan Trọng

### Webhook URL Thay Đổi Khi Restart
- Mỗi lần chạy `start-with-ngrok.ps1` → Ngrok tạo URL mới
- **Phải update lại** webhook URL trong PayOS dashboard
- Script sẽ tự động:
  - Copy URL mới vào clipboard
  - Hiển thị hướng dẫn
  - Show URL trong console

### Testing Tips

**Test với số tiền nhỏ:**
```
Khóa học $1 → 24,000 VND
Khóa học $2 → 48,000 VND
```

**Check webhook logs:**
- Ngrok dashboard: `http://localhost:4040`
- Backend console: Xem logs real-time
- PayOS dashboard: Transaction history

---

## 🔄 Quy Trình Development

### Mỗi lần làm việc:

```powershell
# 1. Start servers với ngrok
.\start-with-ngrok.ps1

# 2. Copy webhook URL (auto copied)

# 3. Update PayOS dashboard
# https://my.payos.vn/developers/webhooks

# 4. Test payment flow
# Frontend → Create payment → Scan QR → Auto complete
```

### Nếu restart:

```powershell
# Stop (Ctrl+C trong script window)

# Start lại
.\start-with-ngrok.ps1

# Update webhook URL mới trong PayOS dashboard
```

---

## 🆚 So Sánh: Dev Tool vs Ngrok

| Feature | Dev Tool (Manual) | Ngrok (Auto Webhook) |
|---------|-------------------|----------------------|
| **Tự động** | ❌ Phải click button | ✅ Hoàn toàn tự động |
| **Giống production** | ⚠️ 80% | ✅ 100% giống |
| **Setup** | ✅ Không cần setup | ⚠️ Cần config webhook URL |
| **Restart** | ✅ Không ảnh hưởng | ⚠️ Phải update URL |
| **Test thật** | ❌ Không test được | ✅ Quét QR thật |
| **Webhook verification** | ❌ Không test | ✅ Test được signature |
| **Speed** | ✅ Instant | ⏳ 5-10s (đợi bank) |

**Khi nào dùng gì:**

- 🧪 **Dev Tool**: Debug code, test logic nhanh
- 🚀 **Ngrok**: Test flow thật, demo, UAT

---

## 🎯 Verification Checklist

Sau khi thanh toán thành công, check:

### 1. Database
```sql
-- Payment record
SELECT * FROM payments 
WHERE txn_ref = 'ORDER123456789'
AND provider = 'payos'
AND status = 'paid';
-- Should return 1 row với paid_at != NULL

-- Enrollment created
SELECT * FROM enrollments
WHERE user_id = 5 
AND course_id = 2
AND status = 'active';
-- Should return 1 row với enrolled_at recent
```

### 2. Frontend
- ✅ QR screen auto close
- ✅ Success animation hiện
- ✅ Redirect về My Learning
- ✅ Course xuất hiện trong "Đang học"
- ✅ Progress bar = 0%
- ✅ Nút "Tiếp tục học" active

### 3. Backend Logs
```
POST /api/payment/payos/webhook 200 - 245ms
✅ Webhook verified
✅ Payment updated: paid
✅ Enrollment created: 123
```

### 4. Ngrok Dashboard
```
http://localhost:4040/inspect/http
- Request: POST /api/payment/payos/webhook
- Status: 200 OK
- Response time: < 500ms
- Body: { success: true, ... }
```

---

## 🐛 Troubleshooting

### Webhook không nhận được

**Check 1**: Ngrok có chạy không?
```powershell
curl http://localhost:4040/api/tunnels
```

**Check 2**: Webhook URL đúng chưa?
```
PayOS Dashboard → Webhooks → Check URL format
Should be: https://xxxx.ngrok-free.app/api/payment/payos/webhook
```

**Check 3**: Backend có lỗi không?
- Xem backend console window
- Check ngrok dashboard → inspect requests

### Polling không detect được

**Check**: Frontend console có log không?
```javascript
// Should see every 5 seconds:
Checking PayOS payment status: ORDER...
```

**Fix**: Hard refresh browser (Ctrl+Shift+R)

### Payment success nhưng không tạo enrollment

**Check backend logs**:
```
❌ Error creating enrollment: ...
```

**Common issues**:
- User đã enroll rồi → Check DB
- Database connection lỗi → Restart backend
- Course ID không tồn tại → Check cart data

---

## 📚 API Reference

### Webhook Endpoint
```
POST /api/payment/payos/webhook
Content-Type: application/json

Headers:
- x-client-id: PayOS client ID
- x-signature: HMAC signature

Body: {
  "code": "00",
  "desc": "success",
  "data": {
    "orderCode": 123456789012,
    "amount": 24000,
    "description": "...",
    "accountNumber": "...",
    "reference": "...",
    "transactionDateTime": "...",
    "paymentLinkId": "...",
    "code": "00",
    "desc": "Thành công",
    "counterAccountBankId": "...",
    "counterAccountBankName": "...",
    "counterAccountName": "...",
    "counterAccountNumber": "...",
    "virtualAccountName": null,
    "virtualAccountNumber": null
  },
  "signature": "..."
}

Response 200:
{
  "success": true,
  "message": "Webhook processed successfully",
  "enrollment": {
    "id": 123,
    "userId": 5,
    "courseId": 2,
    "status": "active"
  }
}
```

### Status Check Endpoint
```
GET /api/payment/payos/status/:orderCode
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "status": "PAID",
  "localStatus": "paid",
  "payment": { ... },
  "enrollment": { ... }
}
```

---

## 🚀 Production Deployment

Khi deploy lên production server (VPS/Cloud):

1. **Không cần ngrok** - Dùng domain thật
2. **Configure webhook** trong PayOS dashboard:
   ```
   https://api.yourdomain.com/api/payment/payos/webhook
   ```
3. **Environment variables** (.env production):
   ```
   NODE_ENV=production
   PAYOS_CLIENT_ID=...
   PAYOS_API_KEY=...
   PAYOS_CHECKSUM_KEY=...
   PAYOS_RETURN_URL=https://yourdomain.com/payment/success
   PAYOS_CANCEL_URL=https://yourdomain.com/payment/cancel
   ```
4. **SSL Certificate** - HTTPS required cho webhook
5. **Test** với thanh toán thật

---

## 📞 Support

### PayOS Documentation
- Dashboard: https://my.payos.vn
- API Docs: https://payos.vn/docs
- Webhook Guide: https://payos.vn/docs/webhooks

### Ngrok Documentation
- Dashboard: https://dashboard.ngrok.com
- Docs: https://ngrok.com/docs
- Inspector: http://localhost:4040

### Debug Commands
```powershell
# Check backend running
netstat -ano | findstr :3001

# Check ngrok running
curl http://localhost:4040/api/tunnels

# View backend logs
# (Xem console window script mở)

# Test webhook manually
curl -X POST http://localhost:3001/api/payment/payos/webhook `
  -H "Content-Type: application/json" `
  -d '{"code":"00","data":{...}}'
```

---

## ✅ Summary

**Luồng tự động hoàn chỉnh:**
1. ✅ User quét QR PayOS
2. ✅ Chuyển khoản qua app bank
3. ✅ PayOS nhận tiền → Gửi webhook
4. ✅ Ngrok forward → Backend nhận webhook
5. ✅ Backend verify signature → Update DB
6. ✅ Frontend polling detect → Auto complete
7. ✅ User redirect → Start learning!

**Không cần:**
- ❌ Click button "Simulate Success"
- ❌ Manual database update
- ❌ Copy/paste order code

**Hoàn toàn tự động như production! 🎉**
